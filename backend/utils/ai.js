const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateQuizFromText = async (text, numQuestions = 5, isTopic = false) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    let allQuestions = [];
    const batchSize = 50;
    let remaining = numQuestions;

    while (remaining > 0) {
      const currentBatch = Math.min(remaining, batchSize);
      
      const previousQuestionsContext = allQuestions.length > 0 
        ? `\n\nALREADY GENERATED QUESTIONS (DO NOT REPEAT THESE):\n${allQuestions.map((q, i) => `${i + 1}. ${q.questionText}`).join('\n')}`
        : '';

      const roleDescription = isTopic 
        ? `You are an expert educator. Your task is to create a high-quality, professional quiz on the topic: "${text}". 
           If the topic is a brief keyword (e.g., "Math", "Science"), use your extensive internal knowledge to generate a balanced and comprehensive quiz covering various fundamental and advanced aspects of that field.
           If a detailed description is provided, focus the questions on the specific sub-topics or nuances mentioned.`
        : `You are an expert quiz generator. Analyze the following text content and generate questions strictly based on its details: "${text.substring(0, 30000)}"`;

      const prompt = `
        ${roleDescription}
        
        Generate exactly ${currentBatch} multiple-choice questions. 
        ${previousQuestionsContext}
        
        CRITICAL INSTRUCTIONS:
        - Output strictly an array of JSON objects matching this format:
        [
          {
            "questionText": "The question string here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
          }
        ]
        - For TOPICS: Ensure questions are accurate, non-repetitive, and range from fundamental concepts to practical applications. Provide a diverse mix of difficulty levels.
        - For TEXT/PDF: Only use information provided in the source text.
        - DO NOT repeat or rephrase any of the "ALREADY GENERATED QUESTIONS" listed above. Each question must be unique and cover new ground.
        - Ensure all options are plausible but only one is clearly correct.
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const parsed = JSON.parse(responseText);
        allQuestions = allQuestions.concat(parsed);
      } catch (parseOrGenError) {
        console.error('Batch generation error:', parseOrGenError);
        // If it's the first batch and it fails, we should probably know
        if (allQuestions.length === 0) throw parseOrGenError;
        break;
      }
      
      remaining -= currentBatch;
    }

    // Return exactly the amount requested or whatever successfully generated
    return allQuestions.slice(0, numQuestions);
  } catch (err) {
    console.error('Error generating quiz from AI:', err);
    throw err;
  }
};

module.exports = { generateQuizFromText };
