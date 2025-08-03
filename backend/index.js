// Import necessary packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB.'))
  .catch(err => console.error('❌ Connection error', err));

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running.' });
});

// AI Generation Route
const axios = require('axios');
// Replace it with this NEW line:
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;

app.post('/api/generate', async (req, res) => {
  console.log('➡️ Received request for /api/generate');
  try {
    const { userText, action } = req.body;
    console.log(`   - User Text: ${userText}`);
    console.log(`   - Action: ${action}`);

    if (!userText || !action) {
      console.log('   - ❌ Error: Missing userText or action.');
      return res.status(400).json({ error: 'userText and action are required.' });
    }

    const prompt = `As an expert writer, ${action} the following text: "${userText}"`;
    console.log('   - 📝 Generated Prompt:', prompt);

    console.log('   - 🚀 Sending request to Gemini API...');
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    console.log('   - ✅ Received response from Gemini API.');

    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('   - 🤖 Extracted Text:', generatedText);

    console.log('   - ⬅️ Sending success response back to extension.');
    res.status(200).json({ result: generatedText });

  } catch (error) {
    console.error('   - ❌❌❌ FATAL ERROR calling Gemini API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('   - Error Data:', error.response.data);
      console.error('   - Error Status:', error.response.status);
      console.error('   - Error Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('   - No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('   - Error Message:', error.message);
    }
    res.status(500).json({ error: 'Failed to generate text from AI.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
