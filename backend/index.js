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

    const promptTemplate = `You are a world-class prompt engineer acting as a 'Prompt Enhancer'. Your task is to take a user's potentially vague idea and generate two distinct, high-quality prompts.

Your internal thought process should be:

Analyze the user's input to understand their core intent.

Flesh out the idea with relevant details, considering context, style, and potential use cases (e.g., for image generation, for a chatbot, for a story).

Based on this enhanced understanding, construct two separate, detailed prompts.

The user's input is:

{{USER_INPUT_HERE}}

Your final output MUST ONLY be a valid JSON array containing exactly two strings, representing the two generated prompts. Do not include your internal thought process or any other commentary in the final output.

Example Final Output: ["First generated prompt...", "Second generated prompt..."]`;

    const prompt = promptTemplate.replace('{{USER_INPUT_HERE}}', userText);
    console.log('   - 📝 Generated Prompt:', prompt);

    console.log('   - 🚀 Sending request to Gemini API...');
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });
    console.log('   - ✅ Received response from Gemini API.');

    const generatedText = response.data.candidates[0].content.parts[0].text;
    console.log('   - 🤖 Extracted Text:', generatedText);
    
    // Attempt to parse the string response into a JSON array
    let promptsArray;
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = generatedText.trim().replace(/^```json\s*|```\s*$/g, '');
      promptsArray = JSON.parse(cleanedText);
      if (!Array.isArray(promptsArray) || promptsArray.length !== 2 || !promptsArray.every(item => typeof item === 'string')) {
        throw new Error('Invalid format: Expected a JSON array of two strings.');
      }
    } catch (parseError) {
      console.error('   - ❌ Error parsing AI response:', parseError.message);
      // Fallback: return the raw text if parsing fails
      promptsArray = [generatedText, "Could not generate a second prompt due to a formatting issue."];
    }

    console.log('   - ⬅️ Sending success response back to extension.');
    res.status(200).json({ result: promptsArray });

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
