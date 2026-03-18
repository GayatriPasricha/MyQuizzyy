const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateQuizFromText = async (text, numQuestions = 5, isTopic = false) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    let allQuestions = [];
    const batchSize = 10;
    let remaining = numQuestions;

    while (remaining > 0) {
      const currentBatch = Math.min(remaining, batchSize);
      
      const roleDescription = isTopic 
        ? `You are an expert educator. Create a comprehensive quiz about the following topic: "${text}".`
        : `You are an expert quiz generator. Analyze the following text content and generate questions based on its details: "${text.substring(0, 30000)}"`;

      const prompt = `
        ${roleDescription}
        
        Generate exactly ${currentBatch} multiple-choice questions.
        
        CRITICAL INSTRUCTIONS:
        - Output strictly in this JSON format without any markdown wrappers or comments:
        [
          {
            "questionText": "The question string here",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswer": "Option A"
          }
        ]
        - Ensure questions are accurate, challenging, and clear.
        - For TOPICS: Ensure questions cover various aspects of the subject.
        - For TEXT: Only use information provided in the text.
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        let jsonStr = responseText.trim();
        // More aggressive cleaning of response text
        const jsonMatch = jsonStr.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          jsonStr = jsonMatch[0];
        } else if (jsonStr.startsWith('```')) {
          jsonStr = jsonStr.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        
        const parsed = JSON.parse(jsonStr);
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
