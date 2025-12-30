// Import necessary packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');
const natural = require('natural');
const { Spellchecker } = require('spellchecker');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Import User model
const User = require('./models/userModel');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB (optional - only if MONGODB_URI is provided)
// For serverless environments like Vercel, we need to handle reconnection
async function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ MONGODB_URI not set, MongoDB connection skipped');
    return;
  }

  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    console.log('✅ MongoDB already connected');
    return;
  }

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    // Hide password in logs for security
    const uriForLog = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@');
    console.log('📍 Connection URI:', uriForLog);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
    });
    console.log('✅ Successfully connected to MongoDB.');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('❌ Error details:', err);
    // Don't throw - let the routes handle the connection state
  }
}

// Connect on startup (for local development)
connectDB();

// For serverless: reconnect if disconnected
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected, will reconnect on next request');
});

// Simple test route
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running.' });
});

// Diagnostic route to check MongoDB connection and environment variables
app.get('/api/health', async (req, res) => {
  const hasMongoUri = !!process.env.MONGODB_URI;
  const mongoState = mongoose.connection.readyState;
  const stateNames = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  // Try to connect if not connected
  if (!hasMongoUri) {
    return res.status(503).json({
      status: 'error',
      message: 'MONGODB_URI environment variable is not set',
      mongoState: stateNames[mongoState] || 'unknown',
      hasMongoUri: false
    });
  }
  
  if (mongoState !== 1) {
    await connectDB();
  }
  
  const finalState = mongoose.connection.readyState;
  
  res.status(finalState === 1 ? 200 : 503).json({
    status: finalState === 1 ? 'ok' : 'error',
    message: finalState === 1 ? 'MongoDB is connected' : 'MongoDB connection failed',
    mongoState: stateNames[finalState] || 'unknown',
    mongoStateCode: finalState,
    hasMongoUri: true,
    uriPrefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) + '...' : 'not set'
  });
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes

// Sign Up Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    // Ensure MongoDB is connected (important for serverless)
    await connectDB();
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'Please configure MONGODB_URI in your .env file. See AUTHENTICATION_SETUP.md for instructions.' 
      });
    }

    const { email, username, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      username: username || email.split('@')[0],
      password: hashedPassword
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

// Sign In Route
app.post('/api/auth/login', async (req, res) => {
  try {
    // Ensure MongoDB is connected (important for serverless)
    await connectDB();
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'Please configure MONGODB_URI in your .env file. See AUTHENTICATION_SETUP.md for instructions.' 
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has password (not Google OAuth only)
    if (!user.password) {
      return res.status(401).json({ error: 'Please sign in with Google' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login', details: error.message });
  }
});

// Google OAuth Sign Up/Sign In Route
app.post('/api/auth/google', async (req, res) => {
  try {
    // Ensure MongoDB is connected (important for serverless)
    await connectDB();
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'Please configure MONGODB_URI in your .env file. See AUTHENTICATION_SETUP.md for instructions.' 
      });
    }

    const { googleId, email, username, name } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ error: 'Google ID and email are required' });
    }

    // Check if user exists with Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with email (might have signed up with email/password)
      user = await User.findOne({ email: email.toLowerCase() });
      
      if (user) {
        // Update existing user with Google ID
        user.googleId = googleId;
        await user.save();
      } else {
        // Create new user
        user = new User({
          email: email.toLowerCase(),
          username: username || name || email.split('@')[0],
          googleId: googleId
        });
        await user.save();
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(500).json({ error: 'Failed to authenticate with Google', details: error.message });
  }
});

// Verify Token Route
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
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

// Helper function to fix double-letter mistakes (e.g., "misttake" -> "mistake", "dooctor" -> "doctor")
const fixDoubleLetterMistakes = (word) => {
  // Pattern 1: Remove triple+ letters (e.g., "ttt" -> "tt")
  let fixed = word.replace(/(.)\1{2,}/g, '$1$1');
  
  // Pattern 2: Fix common double-letter mistakes by trying to remove one of the doubles
  // Try removing one letter from common double-letter patterns
  const doubleLetterFixes = [
    { pattern: /mistt/g, replacement: 'mist' },
    { pattern: /dooct/g, replacement: 'doct' },
    { pattern: /presccrip/g, replacement: 'prescrip' },
    { pattern: /patieent/g, replacement: 'patien' },
    { pattern: /accoom/g, replacement: 'accom' },
    { pattern: /neccess/g, replacement: 'necess' },
    { pattern: /recieev/g, replacement: 'receiv' }
  ];
  
  doubleLetterFixes.forEach(({ pattern, replacement }) => {
    fixed = fixed.replace(pattern, replacement);
  });
  
  // Pattern 3: General double-letter removal for common words
  // If word has unusual double letters, try removing one
  // This is a heuristic: if a word has double letters that aren't common in English,
  // try removing one letter and check if it makes sense
  const commonDoubleLetters = ['ll', 'ss', 'ff', 'oo', 'ee', 'tt', 'nn', 'mm', 'pp', 'rr'];
  const hasUnusualDouble = /(.)\1/.test(fixed) && 
    !commonDoubleLetters.some(pair => fixed.toLowerCase().includes(pair));
  
  // For now, we'll rely on the spellchecker to catch these after fixing obvious patterns
  return fixed;
};

// Spell Correction Function
// Corrects spelling mistakes in user input before using it in prompts
const correctSpelling = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  try {
    const spellchecker = new Spellchecker();
    
    // Split text into words while preserving word boundaries
    let correctedText = text;
    
    // Process each word
    const wordRegex = /\b([a-zA-Z]+)\b/g;
    let match;
    const processedWords = new Set(); // Track processed words to avoid duplicate replacements
    
    while ((match = wordRegex.exec(text)) !== null) {
      const originalWord = match[1];
      const lowerWord = originalWord.toLowerCase();
      
      // Skip very short words (likely abbreviations or valid)
      if (lowerWord.length <= 2) continue;
      
      // Skip if already processed
      const wordKey = originalWord.toLowerCase();
      if (processedWords.has(wordKey)) continue;
      processedWords.add(wordKey);
      
      let corrected = null;
      let needsCorrection = false;
      
      // First, try to fix obvious double-letter mistakes
      const doubleLetterFixed = fixDoubleLetterMistakes(lowerWord);
      if (doubleLetterFixed !== lowerWord) {
        // Check if the fixed version is correct
        if (!spellchecker.isMisspelled(doubleLetterFixed)) {
          corrected = doubleLetterFixed;
          needsCorrection = true;
        } else {
          // Fixed version still wrong, use spellchecker on it
          const corrections = spellchecker.getCorrectionsForMisspelling(doubleLetterFixed);
          if (corrections && corrections.length > 0) {
            corrected = corrections[0];
            needsCorrection = true;
          }
        }
      }
      
      // If no double-letter fix worked, check original word
      if (!needsCorrection && spellchecker.isMisspelled(lowerWord)) {
        const corrections = spellchecker.getCorrectionsForMisspelling(lowerWord);
        if (corrections && corrections.length > 0) {
          corrected = corrections[0];
          needsCorrection = true;
        }
      }
      
      // Apply correction if found
      if (needsCorrection && corrected) {
        // Preserve original capitalization
        let replacement = corrected;
        if (originalWord[0] === originalWord[0].toUpperCase()) {
          replacement = corrected.charAt(0).toUpperCase() + corrected.slice(1);
        }
        
        // Replace the word (case-insensitive word boundary match)
        correctedText = correctedText.replace(new RegExp(`\\b${originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), (matched) => {
          // Preserve the case pattern of the matched word
          if (matched[0] === matched[0].toUpperCase()) {
            return corrected.charAt(0).toUpperCase() + corrected.slice(1);
          }
          return corrected;
        });
      }
    }
    
    return correctedText;
  } catch (error) {
    // If spellchecker fails, fall back to basic corrections
    console.log('   - ⚠️ Spellchecker error, using fallback:', error.message);
    return correctSpellingFallback(text);
  }
};

// Fallback spell correction using common mistakes dictionary
const correctSpellingFallback = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  // Extended common spelling mistakes dictionary
  const commonCorrections = {
    'maade': 'made',
    'misttake': 'mistake',
    'dooctor': 'doctor',
    'recieve': 'receive',
    'seperate': 'separate',
    'occured': 'occurred',
    'begining': 'beginning',
    'definately': 'definitely',
    'accomodate': 'accommodate',
    'seige': 'siege',
    'acheive': 'achieve',
    'existance': 'existence',
    'occassion': 'occasion',
    'neccessary': 'necessary',
    'accomodation': 'accommodation',
    'recieved': 'received',
    'seperated': 'separated',
    'occuring': 'occurring',
    'thier': 'their',
    'teh': 'the',
    'adn': 'and',
    'taht': 'that',
    'hte': 'the',
    'nad': 'and',
    'prescripion': 'prescription',
    'patinet': 'patient',
    'senoir': 'senior',
    'doctr': 'doctor',
    'mistke': 'mistake'
  };
  
  let correctedText = text;
  
  // First apply double-letter fixes
  correctedText = fixDoubleLetterMistakes(correctedText);
  
  // Then apply dictionary corrections
  const wordRegex = /\b([a-zA-Z]+)\b/g;
  let match;
  
  while ((match = wordRegex.exec(correctedText)) !== null) {
    const originalWord = match[1];
    const lowerWord = originalWord.toLowerCase();
    
    if (commonCorrections[lowerWord]) {
      const corrected = commonCorrections[lowerWord];
      let replacement = corrected;
      if (originalWord[0] === originalWord[0].toUpperCase()) {
        replacement = corrected.charAt(0).toUpperCase() + corrected.slice(1);
      }
      correctedText = correctedText.replace(new RegExp(`\\b${originalWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), replacement);
    }
  }
  
  return correctedText;
};

// Call AI API directly to get response (for explain, summarize, etc.)
const callAIDirectly = async (userText, actionType, context = null, text1 = null, text2 = null) => {
  if (!process.env.GEMINI_API_KEY) {
    console.log('   - ⚠️ GEMINI_API_KEY not set, cannot call AI API');
    return null;
  }

  // Build the prompt based on action type
  let prompt = '';
  
  // Include context if provided
  if (context) {
    prompt += `Here is the context of the following question: "${context}"\n\n---\n\n`;
  }
  
  switch (actionType) {
    case 'explain':
      prompt += `TASK: Explain the following text in a easy-to-understand way.\n\nTEXT: "${userText}"`;
      break;
    case 'summarize':
      prompt += `TASK: Summarize the key points of the following text.\n\nTEXT: "${userText}"`;
      break;
    case 'example':
      prompt += `TASK: Provide 2-3 clear and simple examples of the concept in the following text.\n\nTEXT: "${userText}"`;
      break;
    case 'compare':
      // For compare, use text1 and text2 if provided (two-step compare), otherwise use userText
      if (text1 && text2) {
        prompt += `TASK: Compare and contrast the following two texts. Explain their similarities and differences.\n\nTEXT 1: "${text1}"\nTEXT 2: "${text2}"`;
      } else {
        prompt += `TASK: Compare and contrast the following two texts. Explain their similarities and differences.\n\n${userText}`;
      }
      break;
    case 'add-context':
      prompt += `TASK: Add relevant context, background information, and supporting details to enrich understanding of the following.\n\nTEXT: "${userText}"`;
      break;
    default:
      prompt += `Please help with the following:\n\n${userText}`;
  }

  try {
    // Use gemini-2.5-flash model
    const modelName = 'gemini-2.5-flash';
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${process.env.GEMINI_API_KEY}`;
    
    console.log('   - 🔗 Calling Gemini API...');
    console.log('   - 📝 Prompt length:', prompt.length);
    console.log('   - 📋 Prompt content:', prompt.substring(0, 200) + (prompt.length > 200 ? '...' : ''));
    
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('   - ✅ Gemini API response received');
    
    if (response.data && response.data.candidates && response.data.candidates[0]) {
      const generatedText = response.data.candidates[0].content.parts[0].text;
      console.log('   - 📄 Response length:', generatedText.length);
      return generatedText.trim();
    }
    
    throw new Error('Invalid response format from Gemini API');
  } catch (error) {
    console.error('   - ❌ AI API Error:', error.message);
    if (error.response) {
      console.error('   - 📋 API Response Status:', error.response.status);
      console.error('   - 📋 API Response Data:', JSON.stringify(error.response.data, null, 2));
      
      // Provide more helpful error messages
      if (error.response.status === 404) {
        throw new Error('Gemini API endpoint not found. Please check if the model name is correct or if your API key has access to this model.');
      } else if (error.response.status === 401 || error.response.status === 403) {
        throw new Error('Invalid or unauthorized API key. Please check your GEMINI_API_KEY.');
      } else if (error.response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Gemini API error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
      }
    } else if (error.request) {
      throw new Error('No response from Gemini API. Please check your internet connection.');
    } else {
      throw error;
    }
  }
};

// AI API Integration (Ready for Gemini, OpenAI, etc.)
// This function uses the structured prompt engineering approach with AI APIs
const generateWithAI = async (userText, actionType = 'prompt') => {
  // System message defining the prompt engineer role
  const systemMessage = {
    role: "system",
    content: `You are an expert Prompt Engineer. Your task is to take a user's unstructured, vague, or messy input and rewrite it into a high-quality, structured EXECUTABLE prompt that any Large Language Model (LLM) will act on directly to provide solutions, not create another prompt.

IMPORTANT: The prompts you generate should directly ask the LLM to PERFORM THE TASK, not create another prompt. For example:
- Instead of "Create a prompt for writing an email" → "Write a professional email about..."
- Instead of "Generate a prompt for solving this problem" → "Solve this problem and provide..."

Follow these structural rules:
1. **Role**: Assign the AI a specific persona (e.g., 'Act as a Senior Developer').
2. **Task**: Clearly define what the AI should DO (not what prompt to create).
3. **Context/Constraints**: Include any necessary background info or limitations provided by the user.
4. **Format**: Specify the desired output format (e.g., Markdown, Bullet points, JSON).
5. **Goal**: State the ultimate objective - what the AI should deliver.

Use clear headings and delimiters. The prompt should be EXECUTABLE - when an LLM reads it, it should perform the task directly, not create another prompt.

Generate TWO distinct, high-quality EXECUTABLE prompts based on the user input. Return ONLY a valid JSON array with exactly 2 strings, each containing a complete structured prompt.`
  };

  // User message with the actual input
  const userMessage = {
    role: "user",
    content: `Create executable structured prompts that will make an LLM directly perform the task for: ${userText}`
  };

  // TODO: Uncomment and configure when AI API is available
  /*
  try {
    // Option 1: Gemini API
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const response = await axios.post(GEMINI_API_URL, {
      contents: [{
        parts: [{
          text: `${systemMessage.content}\n\n${userMessage.content}`
        }]
      }]
    });
    
    const generatedText = response.data.candidates[0].content.parts[0].text;
    // Clean and parse the response
    const cleanedText = generatedText.trim().replace(/^```json\s*|```\s*$/g, '');
    return JSON.parse(cleanedText);
    
    // Option 2: OpenAI API
    // const response = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   messages: [systemMessage, userMessage],
    //   response_format: { type: "json_object" }
    // });
    // return JSON.parse(response.choices[0].message.content);
    
  } catch (error) {
    console.error('AI API Error:', error);
    throw error;
  }
  */
  
  // Fallback to template-based generation if AI not configured
  return null;
};

// Generate prompts based on action type
const generateActionPrompts = (userText, actionType, context = null) => {
  // Build context prefix if context is provided
  let contextPrefix = '';
  if (context) {
    contextPrefix = `Here is the context of the following question: "${context}"\n\n---\n\n`;
  }
  const correctedText = correctSpelling(userText);
  if (correctedText !== userText) {
    console.log(`   - ✏️ Spelling corrected: "${userText}" → "${correctedText}"`);
  }

  switch (actionType) {
    case 'explain':
      return [
        `${contextPrefix}Act as an Expert Educator and Technical Writer.

**Task**: Provide a clear, comprehensive explanation of the following concept, topic, or statement.

**Context**: ${correctedText}

**Constraints**:
- Break down complex ideas into understandable parts
- Use clear, simple language
- Include relevant examples when helpful
- Address the "why" and "how" behind the concept
- Structure the explanation logically

**Format**: Provide a detailed explanation with clear sections, examples, and key takeaways.

**Goal**: Deliver an explanation that makes the concept accessible and easy to understand for someone learning about it.`,

        `${contextPrefix}You are a Knowledge Specialist and Communication Expert.

**Task**: Explain the following in a way that is both accurate and accessible.

**User Input**: ${correctedText}

**Context/Constraints**:
- Be thorough but not overwhelming
- Use analogies when appropriate
- Highlight key points and important details
- Address potential questions or confusions
- Maintain accuracy and precision

**Format**: Deliver a comprehensive explanation that covers the topic from multiple angles with clear organization.

**Goal**: Provide an explanation that educates and clarifies, leaving the reader with a solid understanding.`
      ];

    case 'summarize':
      return [
        `${contextPrefix}Act as a Professional Summarizer and Information Analyst.

**Task**: Create a concise, comprehensive summary of the following content.

**Context**: ${correctedText}

**Constraints**:
- Capture the essential points and main ideas
- Maintain accuracy of key information
- Be concise yet complete
- Highlight important details and conclusions
- Preserve the original meaning

**Format**: Provide a well-structured summary with key points, main ideas, and important conclusions.

**Goal**: Deliver a summary that efficiently conveys the core information and insights from the original content.`,

        `${contextPrefix}You are an Expert in Information Synthesis and Communication.

**Task**: Summarize the following content, distilling it to its most important elements.

**User Input**: ${correctedText}

**Context/Constraints**:
- Focus on the main message and key takeaways
- Eliminate redundancy while preserving meaning
- Organize information logically
- Include critical details and findings
- Keep the summary clear and actionable

**Format**: Deliver a concise summary that captures the essence and important details in an organized format.

**Goal**: Provide a summary that gives readers a complete understanding of the content without reading the full original.`
      ];

    case 'example':
      return [
        `${contextPrefix}Act as a Practical Examples Specialist and Educational Content Creator.

**Task**: Provide concrete, relevant examples that illustrate the following concept, topic, or idea.

**Context**: ${correctedText}

**Constraints**:
- Use clear, relatable examples
- Cover different scenarios or use cases
- Make examples practical and applicable
- Include both simple and more complex examples when appropriate
- Ensure examples accurately represent the concept

**Format**: Provide multiple well-explained examples with context, demonstrating how the concept applies in practice.

**Goal**: Deliver examples that clarify and demonstrate the concept effectively, making it easier to understand and apply.`,

        `${contextPrefix}You are an Expert at Creating Illustrative Examples and Use Cases.

**Task**: Generate practical examples that demonstrate the following concept or idea.

**User Input**: ${correctedText}

**Context/Constraints**:
- Provide diverse, realistic examples
- Explain how each example relates to the concept
- Use scenarios that are easy to understand
- Include step-by-step breakdowns when helpful
- Make examples actionable and relevant

**Format**: Deliver a collection of examples with explanations, showing different ways the concept can be applied or understood.

**Goal**: Provide examples that bring the concept to life and make it tangible and easier to grasp.`
      ];

    case 'compare':
      return [
        `${contextPrefix}Act as a Comparative Analysis Expert and Research Analyst.

**Task**: Create a detailed comparison of the following items, concepts, or ideas.

**Context**: ${correctedText}

**Constraints**:
- Identify key similarities and differences
- Evaluate strengths and weaknesses
- Provide balanced, objective analysis
- Consider multiple dimensions (features, use cases, advantages, limitations)
- Draw meaningful conclusions

**Format**: Provide a structured comparison with clear sections covering similarities, differences, and recommendations.

**Goal**: Deliver a comparison that helps readers understand the relative merits, differences, and best use cases for each option.`,

        `${contextPrefix}You are a Professional Comparative Analyst and Decision Support Specialist.

**Task**: Perform a comprehensive comparison of the following items or concepts.

**User Input**: ${correctedText}

**Context/Constraints**:
- Analyze each item systematically
- Highlight important distinctions
- Consider practical implications
- Provide insights and recommendations
- Be thorough and objective

**Format**: Deliver a well-organized comparison with analysis, key differences, and actionable insights.

**Goal**: Provide a comparison that enables informed decision-making by clearly presenting the relative advantages and trade-offs.`
      ];

    case 'add-context':
      return [
        `Act as a Contextual Information Specialist and Background Researcher.

**Task**: Add relevant context, background information, and additional details to enrich understanding of the following.

**Context**: ${correctedText}

**Constraints**:
- Provide relevant historical or background context
- Include related information that enhances understanding
- Connect to broader themes or concepts
- Add supporting details and explanations
- Maintain relevance and accuracy

**Format**: Provide the original content enhanced with contextual information, background details, and relevant connections.

**Goal**: Deliver content that is enriched with context, making it more meaningful and easier to understand within a broader framework.`,

        `You are an Expert at Adding Context and Enriching Information.

**Task**: Enhance the following content with relevant context, background, and supporting information.

**User Input**: ${correctedText}

**Context/Constraints**:
- Add meaningful background information
- Include relevant connections and relationships
- Provide additional details that add value
- Connect to related concepts or examples
- Ensure all additions are accurate and relevant

**Format**: Deliver the content with integrated contextual information, background details, and enhanced explanations.

**Goal**: Provide enriched content that gives readers a deeper, more comprehensive understanding with proper context and background.`
      ];

    case 'prompt':
    default:
      // Use the existing generateStructuredPrompts logic
      return generatePromptPair(correctedText, detectPromptType(correctedText));
  }
};

// Detect prompt type based on keywords
const detectPromptType = (text) => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('code') || lowerText.includes('program') || lowerText.includes('function') || lowerText.includes('algorithm') || lowerText.includes('api')) {
    return 'technical';
  } else if (lowerText.includes('email') || lowerText.includes('message') || lowerText.includes('send')) {
    return 'communication';
  } else if (lowerText.includes('write') || lowerText.includes('create') || lowerText.includes('generate')) {
    return 'content';
  } else if (lowerText.includes('meeting') || lowerText.includes('schedule') || lowerText.includes('call')) {
    return 'scheduling';
  }
  return 'general';
};

// Structured Prompt Engineering System
// This function generates high-quality, structured prompts following best practices
const generateStructuredPrompts = async (userText, actionType = 'prompt', context = null) => {
  // Correct spelling mistakes in user input first
  const correctedText = correctSpelling(userText);
  if (correctedText !== userText) {
    console.log(`   - ✏️ Spelling corrected: "${userText}" → "${correctedText}"`);
  }
  
  // Try AI API first if available (use corrected text)
  try {
    const aiResult = await generateWithAI(correctedText, actionType);
    if (aiResult && Array.isArray(aiResult) && aiResult.length === 2) {
      return JSON.stringify(aiResult);
    }
  } catch (error) {
    console.log('   - ⚠️ AI API not available, using template-based generation');
  }
  
  // Fallback to template-based generation
  console.log(`   - 📊 Using action type: ${actionType} for input: "${correctedText}"`);
  
  // Generate prompts based on action type
  const prompts = generateActionPrompts(correctedText, actionType, context);
  console.log(`   - ✅ Generated ${prompts.length} prompts`);
  
  // Return as JSON array string
  const jsonString = JSON.stringify(prompts);
  console.log(`   - 📝 JSON string length: ${jsonString.length}`);
  return jsonString;
};

// Generate a pair of structured prompts following the Role-Task-Context-Format-Goal structure
// These are EXECUTABLE prompts that the LLM will act on directly, not meta-prompts
const generatePromptPair = (userText, type) => {
  const templates = {
    communication: [
      `Act as a Senior Communication Specialist.

**Task**: Help me write a professional, clear, and actionable communication based on the following situation.

**Context**: ${userText}

**Constraints**: 
- Maintain professional tone
- Ensure clarity and conciseness
- Include specific action items
- Be direct and solution-oriented

**Format**: Provide the complete communication (email/message) ready to send, with clear sections and a professional structure.

**Goal**: Deliver a communication that effectively conveys the message and prompts the desired response.`,

      `You are an Expert Email and Message Composer.

**Task**: Write an effective professional communication addressing the following situation.

**User Input**: ${userText}

**Context/Constraints**: 
- Professional yet approachable tone
- Include all relevant details
- Clear call-to-action
- Be concise but comprehensive

**Format**: Provide the complete written communication in a clear, well-structured format.

**Goal**: Deliver a communication that is clear, engaging, and actionable.`
    ],
    
    technical: [
      `Act as a Senior Software Engineer and Technical Architect.

**Task**: Help me with the following technical requirement. Provide code, implementation guidance, or technical documentation as needed.

**Context**: ${userText}

**Constraints**:
- Follow best practices and coding standards
- Include error handling considerations
- Specify technology stack if relevant
- Provide working, production-ready solutions

**Format**: Provide complete code examples, technical specifications, or documentation with clear explanations.

**Goal**: Deliver high-quality, maintainable technical solutions that I can use directly.`,

      `You are a Technical Documentation Expert.

**Task**: Address the following technical request with comprehensive solutions and documentation.

**User Input**: ${userText}

**Context/Constraints**:
- Technical accuracy is paramount
- Include complete implementation details
- Consider scalability and performance
- Provide working examples

**Format**: Deliver complete technical solutions with code, documentation, and explanations.

**Goal**: Provide well-documented, production-ready technical outputs that I can implement immediately.`
    ],
    
    content: [
      `Act as a Professional Content Strategist and Writer.

**Task**: Create high-quality content based on the following idea or request.

**Context**: ${userText}

**Constraints**:
- Engaging and reader-friendly
- SEO considerations if applicable
- Appropriate tone for target audience
- Original and compelling

**Format**: Provide the complete content (article, post, etc.) with proper structure, engaging writing, and clear messaging.

**Goal**: Deliver high-quality, engaging content that meets the specified objectives and is ready to publish.`,

      `You are a Creative Content Director.

**Task**: Write compelling content addressing the following request.

**User Input**: ${userText}

**Context/Constraints**:
- Creative and original approach
- Consistent brand voice
- Clear messaging hierarchy
- Engaging storytelling

**Format**: Deliver the complete content in the appropriate format with creative flair and professional polish.

**Goal**: Provide compelling, on-brand content that resonates with the audience and is ready to use.`
    ],
    
    scheduling: [
      `Act as a Professional Scheduling Coordinator.

**Task**: Help me coordinate and schedule based on the following request. Provide a complete scheduling solution or communication.

**Context**: ${userText}

**Constraints**:
- Professional and courteous tone
- Include time zone considerations
- Provide multiple options when possible
- Be clear and actionable

**Format**: Provide the complete scheduling communication, calendar proposal, or coordination plan with clear time slots and agenda.

**Goal**: Deliver effective scheduling communications that facilitate smooth coordination and are ready to send.`,

      `You are an Executive Assistant specializing in Calendar Management.

**Task**: Handle the following scheduling request and provide a complete solution.

**User Input**: ${userText}

**Context/Constraints**:
- Clear availability windows
- Respectful of others' time
- Include meeting purpose and duration
- Professional and efficient

**Format**: Deliver the complete scheduling message, calendar invite text, or coordination plan with all necessary details.

**Goal**: Provide scheduling communications that are clear, professional, and easy to respond to, ready to use immediately.`
    ],
    
    general: [
      `Act as an Expert Consultant and Problem Solver.

**Task**: Help me address the following request or situation. Provide comprehensive, actionable guidance.

**Context**: ${userText}

**Constraints**:
- Clear and specific solutions
- Include necessary background information
- Provide actionable steps
- Be comprehensive yet practical

**Format**: Deliver a complete response with clear sections, actionable steps, and practical solutions.

**Goal**: Provide precise, high-quality guidance that directly addresses the request and is ready to implement.`,

      `You are a Senior Advisor and Strategic Consultant.

**Task**: Address the following request with comprehensive, well-structured guidance.

**User Input**: ${userText}

**Context/Constraints**:
- Comprehensive yet concise
- Include all relevant context
- Specify clear action items
- Provide practical solutions

**Format**: Deliver a complete response with clear structure, actionable recommendations, and ready-to-use solutions.

**Goal**: Provide accurate, contextually appropriate, and well-formatted guidance that directly solves the problem.`
    ]
  };
  
  // Get templates for the determined type, or use general
  const selectedTemplates = templates[type] || templates.general;
  
  // Return the two prompts
  return selectedTemplates;
};

// AI Generation Route
app.post('/api/generate', async (req, res) => {
  console.log('➡️ Received request for /api/generate');
  try {
    const { userText, action, context, text1, text2 } = req.body;
    console.log(`   - User Text: ${userText}`);
    console.log(`   - Action: ${action}`);
    if (context) {
      console.log(`   - Context: ${context}`);
    }
    if (text1 && text2) {
      console.log(`   - Compare mode - Text1: ${text1}`);
      console.log(`   - Compare mode - Text2: ${text2}`);
    }

    if (!userText) {
      console.log('   - ❌ Error: Missing userText.');
      return res.status(400).json({ error: 'userText is required.' });
    }

    // Default action is 'prompt' if not provided
    const actionType = action || 'prompt';
    
    // Normalize action type to handle variations
    const normalizedAction = actionType.toLowerCase().replace(/[^a-z-]/g, '');
    const validActions = ['explain', 'summarize', 'example', 'compare', 'add-context', 'prompt'];
    const finalAction = validActions.includes(normalizedAction) ? normalizedAction : 'prompt';

    // If action is 'prompt', generate prompts. Otherwise, call AI directly for response
    if (finalAction === 'prompt') {
      console.log('   - 🚀 Generating structured prompts...');
      const generatedText = await generateStructuredPrompts(userText, finalAction, context || null);
      console.log('   - ✅ Generated response (type:', typeof generatedText, '):', generatedText.substring(0, 200) + '...');
    
    // Parse the JSON response
    let promptsArray;
    try {
      promptsArray = JSON.parse(generatedText);
        console.log('   - ✅ Parsed successfully, array length:', promptsArray.length);
        if (!Array.isArray(promptsArray)) {
          console.error('   - ❌ Parsed result is not an array:', typeof promptsArray);
          throw new Error('Generated text is not a valid JSON array.');
        }
        if (promptsArray.length !== 2) {
          console.error('   - ❌ Array length is not 2:', promptsArray.length);
        throw new Error('Generated text is not a valid JSON array of two strings.');
      }
        console.log('   - ✅ Validation passed, prompts ready');
    } catch (parseError) {
        console.error('   - ❌ Error parsing response:', parseError.message);
        console.error('   - Raw generated text:', generatedText);
        // Fallback: Generate basic structured prompts
      promptsArray = [
          `Act as an Expert Prompt Engineer.\n\n**Task**: Transform this input into a structured prompt.\n\n**Context**: ${userText}\n\n**Format**: Structured prompt with clear sections\n\n**Goal**: Generate high-quality, actionable outputs.`,
          `You are a Professional AI Prompt Specialist.\n\n**Task**: Restructure this input into an executable prompt.\n\n**User Input**: ${userText}\n\n**Context/Constraints**: Include necessary background and format requirements\n\n**Goal**: Create a prompt that produces precise, well-formatted results.`
        ];
        console.log('   - ⚠️ Using fallback prompts');
      }

      console.log('   - ⬅️ Sending prompts back to extension.');
      return res.status(200).json(promptsArray);
    } else {
      // Call AI directly to get response
      console.log(`   - 🚀 Calling AI API directly for action: ${finalAction}...`);
      try {
        const aiResponse = await callAIDirectly(userText, finalAction, context || null, text1 || null, text2 || null);
        if (aiResponse) {
          console.log('   - ✅ AI response received');
          // Return as a single response object
          return res.status(200).json({ 
            type: 'ai-response',
            action: finalAction,
            response: aiResponse 
          });
        } else {
          // Fallback if AI API not available
          throw new Error('AI API not configured or unavailable');
        }
      } catch (error) {
        console.error('   - ❌ Error calling AI:', error.message);
        // Return error response
        return res.status(500).json({
          error: 'Failed to get AI response',
          details: error.message,
          suggestion: 'Please ensure GEMINI_API_KEY is set in your environment variables'
        });
      }
    }

  } catch (error) {
    console.error('   - ❌❌❌ ERROR:', error.message);
    return res.status(500).json({
      error: 'Failed to generate text',
      details: error.message
    });
  }
});

// If running locally, start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless functions
// Vercel serverless functions need to export the handler
module.exports = app;