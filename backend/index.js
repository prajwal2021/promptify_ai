// Import necessary packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');

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

// Test GET route for /api/generate
app.get('/api/generate', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'GET request received. Please use POST for actual requests.',
    example: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userText: 'your text here', action: 'improve' })
    }
  });
});

// Simple local model for text generation
const generateLocalResponse = (userText) => {
  // This is a simple template-based response generator
  // In a real app, you'd want to use a proper local model
  const responses = [
    `["Write a professional email to schedule a meeting about ${userText}. Include 2-3 time slots and ask for confirmation.",
     "Draft a friendly but concise message to set up a call regarding ${userText}. Mention your availability and ask for theirs."]`,
    
    `["Compose a formal appointment request email for ${userText}. Include the purpose, expected duration, and your availability.",
     "Create a brief message to schedule a video call about ${userText}. Suggest a few time slots and ask for confirmation."]`
  ];
  
  // Return a random response from the template
  return responses[Math.floor(Math.random() * responses.length)];
};

// AI Generation Route
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

    console.log('   - 🚀 Generating response with local model...');
    const generatedText = generateLocalResponse(userText);
    console.log('   - ✅ Generated response:', generatedText);
    
    // Parse the JSON response
    let promptsArray;
    try {
      promptsArray = JSON.parse(generatedText);
      if (!Array.isArray(promptsArray) || promptsArray.length !== 2) {
        throw new Error('Generated text is not a valid JSON array of two strings.');
      }
    } catch (parseError) {
      console.error('   - ❌ Error parsing response:', parseError);
      promptsArray = [
        `Generate a professional email about: ${userText}`,
        `Create a message regarding: ${userText}`
      ];
    }

    console.log('   - ⬅️ Sending success response back to extension.');
    res.status(200).json(promptsArray);

  } catch (error) {
    console.error('   - ❌❌❌ ERROR:', error.message);
    return res.status(500).json({
      error: 'Failed to generate text',
      details: error.message
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});