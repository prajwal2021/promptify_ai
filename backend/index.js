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
    const { userText } = req.body;
    console.log(`   - User Text: ${userText}`);

    if (!userText) {
      console.log('   - ❌ Error: Missing userText.');
      return res.status(400).json({ error: 'userText is required.' });
    }

    const systemPrompt = `You are a world-class prompt engineer. Your task is to take the user's raw input and transform it into two distinct, clear, and effective prompts that another AI could execute flawlessly. The user's input is:

---
${userText}
---

Your response MUST be a valid JSON array containing exactly two strings, with no other text, commentary, or formatting.

Example Response Format:
["First generated prompt...", "Second generated prompt..."]`;

    console.log('   - 📝 Generated System Prompt for Gemini.');
    console.log('   - 🚀 Sending request to Gemini API...');
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: systemPrompt }] }],
    });
    console.log('   - ✅ Received response from Gemini API.');

    // Extract the text, which should be a JSON string
    const rawResponse = response.data.candidates[0].content.parts[0].text;
    console.log('   - 🤖 Raw AI Response:', rawResponse);

    // More robustly find the JSON array within the raw response string
    const jsonMatch = rawResponse.match(/\[.*\]/s);
    if (!jsonMatch) {
      throw new Error("Could not find a valid JSON array in the AI's response.");
    }
    
    const jsonString = jsonMatch[0];
    console.log('   - 🎯 Extracted JSON String:', jsonString);

    // Parse the JSON string into an array
    const generatedPrompts = JSON.parse(jsonString);
    console.log('   - ✨ Parsed Prompts:', generatedPrompts);

    console.log('   - ⬅️ Sending success response back to extension.');
    res.status(200).json({ results: generatedPrompts });

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
