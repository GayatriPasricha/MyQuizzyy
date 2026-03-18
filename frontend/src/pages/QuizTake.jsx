import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Trophy, ArrowRight, Home } from 'lucide-react';

const QuizTake = () => {
  const { shortId } = useParams();
  const { user } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const [score, setScore] = useState(0);
  const [responses, setResponses] = useState([]);
  const [startTime, setStartTime] = useState(null);
  
  const [isFinished, setIsFinished] = useState(false);
  const [timeTaken, setTimeTaken] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quiz/${shortId}`);
        setQuiz(res.data);
        setStartTime(Date.now());
      } catch (err) {
        setError('Quiz not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [shortId]);

  const handleOptionSelect = (option) => {
    if (isAnswered) return;
    
    setSelectedOption(option);
    setIsAnswered(true);
    
    const isCorrect = option === quiz.questions[currentIndex].correctAnswer;
    if (isCorrect) setScore(s => s + 1);
    
    setResponses(prev => [
      ...prev, 
      {
        questionId: quiz.questions[currentIndex]._id,
        selectedOption: option,
        isCorrect
      }
    ]);
  };

  const handleNext = () => {
    if (currentIndex < quiz.questions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    setTimeTaken(duration);
    setIsFinished(true);

    try {
      const guestId = localStorage.getItem('guestId') || Math.random().toString(36).substring(7);
      if (!user && !localStorage.getItem('guestId')) {
        localStorage.setItem('guestId', guestId);
      }

      await api.post(`/quiz/${shortId}/attempt`, {
        score: responses.length > 0 ? responses.filter(r => r.isCorrect).length : 0, 
        totalQuestions: quiz.questions.length,
        responses,
        timeTakenMs: duration,
        guestId: user ? null : guestId
      });
    } catch (err) {
      console.error('Failed to save attempt', err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );

  if (error) return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl max-w-md text-center border border-red-100 shadow-sm">
        <XCircle className="w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="font-medium">{error}</p>
        <Link to="/" className="mt-6 inline-block bg-white text-slate-700 font-semibold px-6 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Go Home</Link>
      </div>
    </div>
  );

  if (isFinished) {
    const finalScore = responses.filter(r => r.isCorrect).length;

    return (
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-8 bg-slate-50">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="w-full max-w-3xl bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-primary-500/30">
              <Trophy className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-black text-slate-800 mb-2">Quiz Completed!</h2>
            <p className="text-slate-500 font-medium text-lg">{quiz.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
              <p className="text-slate-500 font-semibold mb-1">Final Score</p>
              <p className="text-4xl font-black text-primary-600">{finalScore} <span className="text-2xl text-slate-400">/ {quiz.questions.length}</span></p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-100">
              <p className="text-slate-500 font-semibold mb-1">Time Taken</p>
              <p className="text-4xl font-black text-slate-700 flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 text-slate-400" />
                {Math.floor(timeTaken / 1000)}s
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Review Questions</h3>
            <div className="space-y-6">
              {quiz.questions.map((q, i) => {
                const response = responses.find(r => r.questionId === q._id) || {};
                return (
                  <div key={i} className={`p-6 rounded-2xl border ${response.isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <div className="flex items-start gap-4">
                      {response.isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-1" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                      )}
                      <div>
                        <p className="font-bold text-slate-800 text-lg mb-3">{i+1}. {q.questionText}</p>
                        <div className="space-y-2">
                           <div className="flex items-center gap-2 text-sm font-medium">
                             <span className="text-slate-500 w-16">Your Answer:</span>
                             <span className={response.isCorrect ? "text-green-700 font-bold" : "text-red-600 font-bold"}>
                               {response.selectedOption}
                             </span>
                           </div>
                           {!response.isCorrect && (
                             <div className="flex items-center gap-2 text-sm font-medium">
                               <span className="text-slate-500 w-16">Correct:</span>
                               <span className="text-primary-700 font-bold bg-primary-100 px-2 py-0.5 rounded">
                                 {q.correctAnswer}
                               </span>
                             </div>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10 flex gap-4">
            <Link to="/" className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-4 text-lg font-bold rounded-xl hover:bg-slate-200 transition-colors">
              <Home className="w-5 h-5" /> Home
            </Link>
            {!user && (
              <Link to="/register" className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-4 text-lg font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
                Save Progress
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  const currentQState = quiz.questions[currentIndex];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 bg-slate-50">
      <div className="max-w-3xl w-full mx-auto">
        
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 line-clamp-1">{quiz.title}</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Question {currentIndex + 1} of {quiz.questions.length}</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
             <div className="flex items-center gap-1.5 text-slate-600 font-bold">
               <Trophy className="w-4 h-4 text-yellow-500" />
               {score}
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 h-2.5 rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-primary-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-8 leading-snug">
              {currentQState.questionText}
            </h3>

            <div className="space-y-4">
              {currentQState.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                const isCorrectOption = option === currentQState.correctAnswer;
                
                let btnStyle = "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700";
                
                if (isAnswered) {
                  if (isSelected && isCorrectOption) {
                    btnStyle = "bg-green-100 border-green-500 text-green-800 ring-2 ring-green-500/50";
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = "bg-red-100 border-red-500 text-red-800 ring-2 ring-red-500/50";
                  } else if (!isSelected && isCorrectOption) {
                    btnStyle = "bg-green-50 border-green-300 text-green-700";
                  } else {
                     btnStyle = "bg-slate-50 border-slate-200 text-slate-400 opacity-50";
                  }
                } else if (isSelected) {
                   btnStyle = "bg-primary-50 border-primary-400 text-primary-700 shadow-md";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(option)}
                    disabled={isAnswered}
                    className={`w-full text-left p-5 border-2 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswered && isSelected && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />}
                    {isAnswered && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-600 shrink-0" />}
                    {isAnswered && !isSelected && isCorrectOption && <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 flex justify-end"
              >
                <button
                  onClick={handleNext}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 active:scale-95"
                >
                  {currentIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
};

export default QuizTake;
