const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const { extractTextFromPDF } = require('../utils/pdf');
const { generateQuizFromText } = require('../utils/ai');
const crypto = require('crypto');

// Helper to generate unique short IDs
const generateShortId = () => crypto.randomBytes(4).toString('hex');

exports.generateQuiz = async (req, res) => {
  try {
    const file = req.file;
    const { topic, mode, numQuestions: numQReq, title: titleReq } = req.body;
    
    let textContent = '';
    let finalTitle = titleReq || 'Generated Quiz';

    if (mode === 'topic' && topic) {
      textContent = topic;
      if (!titleReq) finalTitle = topic.length > 30 ? topic.substring(0, 30) + '...' : topic;
    } else if (file) {
      if (file.mimetype !== 'application/pdf') {
        return res.status(400).json({ msg: 'Only PDF files are supported' });
      }

      const fs = require('fs');
      try {
        const dataBuffer = fs.readFileSync(file.path);
        textContent = await extractTextFromPDF(dataBuffer);
        fs.unlinkSync(file.path);
      } catch (readErr) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(500).json({ msg: 'Failed to read uploaded file' });
      }
      
      if (!titleReq) finalTitle = file.originalname.replace('.pdf', '');
    } else {
      return res.status(400).json({ msg: 'Please provide a PDF file or a topic' });
    }

    if (!textContent || textContent.trim().length === 0) {
      return res.status(400).json({ msg: 'No content found to generate quiz from' });
    }

    // 2. Generate questions via AI
    const numQuestions = parseInt(numQReq) || 5;
    const questions = await generateQuizFromText(textContent, numQuestions, mode === 'topic');

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ msg: 'Failed to generate quiz questions' });
    }

    // 3. Save to DB
    const shortId = generateShortId();
    const title = finalTitle;
    
    // req.user might be null if guest, which is handled correctly by the schema default
    const quiz = new Quiz({
      title,
      shortId,
      creator: req.user ? req.user.id : null,
      questions
    });

    await quiz.save();
    
    res.json({ msg: 'Quiz generated successfully', quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error during quiz generation', error: err.message });
  }
};

exports.getQuizByShortId = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shortId: req.params.shortId });
    if (!quiz) {
      return res.status(404).json({ msg: 'Quiz not found' });
    }
    
    // We can choose to hide correctAnswers when fetching to take the quiz, 
    // but the system says "instant score and right/wrong answers". 
    // Sending answers to frontend is fine for MVP to handle logic easily.
    res.json(quiz);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const { score, totalQuestions, responses, timeTakenMs, guestId } = req.body;
    const shortId = req.params.shortId;

    const quiz = await Quiz.findOne({ shortId });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

    const attempt = new Attempt({
      quiz: quiz._id,
      user: req.user ? req.user.id : null,
      guestId: req.user ? null : (guestId || 'anonymous_guest'),
      score,
      totalQuestions,
      responses,
      timeTakenMs
    });

    await attempt.save();
    
    res.json({ msg: 'Attempt saved successfully', attemptId: attempt._id });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.getUserQuizzes = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    // Sort descending by creation date
    const quizzes = await Quiz.find({ creator: req.user.id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.getQuizAttempts = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ shortId: req.params.shortId });
    if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
    
    // Sort attempts from newest to oldest
    const attempts = await Attempt.find({ quiz: quiz._id }).populate('user', 'name email').sort({ completedAt: -1 });
    res.json({ quizTitle: quiz.title, attempts });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};
