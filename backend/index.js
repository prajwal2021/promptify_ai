// Import necessary packages
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios');
const natural = require('natural');
const { Spellchecker } = require('spellchecker');

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

// AI API Integration (Ready for Gemini, OpenAI, etc.)
// This function uses the structured prompt engineering approach with AI APIs
const generateWithAI = async (userText) => {
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

// Structured Prompt Engineering System
// This function generates high-quality, structured prompts following best practices
const generateStructuredPrompts = async (userText) => {
  // Correct spelling mistakes in user input first
  const correctedText = correctSpelling(userText);
  if (correctedText !== userText) {
    console.log(`   - ✏️ Spelling corrected: "${userText}" → "${correctedText}"`);
  }
  
  // Try AI API first if available (use corrected text)
  try {
    const aiResult = await generateWithAI(correctedText);
    if (aiResult && Array.isArray(aiResult) && aiResult.length === 2) {
      return JSON.stringify(aiResult);
    }
  } catch (error) {
    console.log('   - ⚠️ AI API not available, using template-based generation');
  }
  
  // Fallback to template-based generation
  // Analyze user input to determine context and generate appropriate prompts
  // Use corrected text for keyword detection but original for display if needed
  const lowerText = correctedText.toLowerCase();
  
  // Determine prompt type based on keywords (check technical first since it's more specific)
  let promptType = 'general';
  if (lowerText.includes('code') || lowerText.includes('program') || lowerText.includes('function') || lowerText.includes('algorithm') || lowerText.includes('api')) {
    promptType = 'technical';
  } else if (lowerText.includes('email') || lowerText.includes('message') || lowerText.includes('send')) {
    promptType = 'communication';
  } else if (lowerText.includes('write') || lowerText.includes('create') || lowerText.includes('generate')) {
    promptType = 'content';
  } else if (lowerText.includes('meeting') || lowerText.includes('schedule') || lowerText.includes('call')) {
    promptType = 'scheduling';
  }
  
  console.log(`   - 📊 Detected prompt type: ${promptType} for input: "${correctedText}"`);
  
  // Generate two distinct structured prompts based on type (use corrected text)
  const prompts = generatePromptPair(correctedText, promptType);
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
    const { userText, action } = req.body;
    console.log(`   - User Text: ${userText}`);
    console.log(`   - Action: ${action}`);

    if (!userText || !action) {
      console.log('   - ❌ Error: Missing userText or action.');
      return res.status(400).json({ error: 'userText and action are required.' });
    }

    console.log('   - 🚀 Generating structured prompts...');
    const generatedText = await generateStructuredPrompts(userText);
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