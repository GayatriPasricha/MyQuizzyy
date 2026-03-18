require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('API Key:', apiKey ? 'FOUND' : 'MISSING');
    console.log('Key length:', apiKey ? apiKey.length : 0);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
    
    const prompt = "Say 'Hello World' if you are working.";
    const result = await model.generateContent(prompt);
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('GEMINI TEST ERROR:', err);
  }
}

testGemini();
