# 🧠 Prompt Generation Logic - Technical Deep Dive

## Overview

This document explains how the system structures and "promptifies" user input into AI-ready prompts. The current implementation uses a **template-based approach** that can be easily extended with real AI APIs.

---

## 📊 Complete Data Flow

```
User Input (Text)
    ↓
Extension UI (Popup/Floating Icon)
    ↓
Background Script (background.js)
    ↓
HTTP POST Request
    ↓
Backend API (/api/generate)
    ↓
Prompt Generation Logic
    ↓
JSON Array Response
    ↓
Chrome Storage
    ↓
UI Display
```

---

## 🔄 Step-by-Step Logic Flow

### **Step 1: User Input Collection**

**Location:** `extension/content.js` or `ui-builder/src/App.jsx`

```javascript
// User types text in textarea
const inputText = textarea.value.trim();

// Example input: "meeting with client"
```

**What happens:**
- User enters text in the extension popup or floating icon
- Text is trimmed (removes whitespace)
- Validation: Checks if text is not empty

---

### **Step 2: Message Passing to Background Script**

**Location:** `extension/background.js` (line 40-50)

```javascript
chrome.runtime.sendMessage({
  action: "processText",
  selectedText: inputText  // "meeting with client"
});
```

**What happens:**
- Extension UI sends message to background script
- Message contains: `{ action: "processText", selectedText: "meeting with client" }`
- Background script receives this via `chrome.runtime.onMessage.addListener`

---

### **Step 3: API Request Preparation**

**Location:** `extension/background.js` (line 44-52)

```javascript
fetch(`${API_URL}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userText: request.selectedText,  // "meeting with client"
    action: "improve"                // Hardcoded action
  })
})
```

**Request Structure:**
```json
{
  "userText": "meeting with client",
  "action": "improve"
}
```

**What happens:**
- Background script creates HTTP POST request
- Sends user text and action to backend
- Includes proper headers for JSON communication

---

### **Step 4: Backend Receives Request**

**Location:** `backend/index.js` (line 56-66)

```javascript
app.post('/api/generate', async (req, res) => {
  const { userText, action } = req.body;
  // userText = "meeting with client"
  // action = "improve"
  
  // Validation
  if (!userText || !action) {
    return res.status(400).json({ error: 'userText and action are required.' });
  }
```

**What happens:**
- Express receives POST request
- Extracts `userText` and `action` from request body
- Validates that both fields are present
- Returns 400 error if validation fails

---

### **Step 5: Prompt Generation Logic** ⭐ **CORE LOGIC**

**Location:** `backend/index.js` (line 40-53, 68-85)

#### **Current Implementation: Template-Based**

```javascript
const generateLocalResponse = (userText) => {
  // Template array with 2 different prompt styles
  const responses = [
    // Template 1: Professional & Friendly
    `["Write a professional email to schedule a meeting about ${userText}. Include 2-3 time slots and ask for confirmation.",
     "Draft a friendly but concise message to set up a call regarding ${userText}. Mention your availability and ask for theirs."]`,
    
    // Template 2: Formal & Brief
    `["Compose a formal appointment request email for ${userText}. Include the purpose, expected duration, and your availability.",
     "Create a brief message to schedule a video call about ${userText}. Suggest a few time slots and ask for confirmation."]`
  ];
  
  // Randomly select one template set
  return responses[Math.floor(Math.random() * responses.length)];
};
```

**How It Works:**

1. **Template Selection:**
   - System has 2 pre-defined template sets
   - Each template set contains 2 prompt variations
   - Randomly selects one template set

2. **String Interpolation:**
   - User input (`userText`) is inserted into template using `${userText}`
   - Example: If `userText = "meeting with client"`
   - Result: `"Write a professional email to schedule a meeting about meeting with client..."`

3. **Output Format:**
   - Returns a **JSON array string** with exactly 2 prompts
   - Format: `["Prompt 1", "Prompt 2"]`

**Example Transformation:**

**Input:** `"meeting with client"`

**Template 1 Output:**
```json
[
  "Write a professional email to schedule a meeting about meeting with client. Include 2-3 time slots and ask for confirmation.",
  "Draft a friendly but concise message to set up a call regarding meeting with client. Mention your availability and ask for theirs."
]
```

**Template 2 Output:**
```json
[
  "Compose a formal appointment request email for meeting with client. Include the purpose, expected duration, and your availability.",
  "Create a brief message to schedule a video call about meeting with client. Suggest a few time slots and ask for confirmation."
]
```

---

### **Step 6: Response Parsing & Validation**

**Location:** `backend/index.js` (line 72-85)

```javascript
// Parse the JSON string into actual array
let promptsArray;
try {
  promptsArray = JSON.parse(generatedText);
  
  // Validate structure
  if (!Array.isArray(promptsArray) || promptsArray.length !== 2) {
    throw new Error('Generated text is not a valid JSON array of two strings.');
  }
} catch (parseError) {
  // Fallback if parsing fails
  promptsArray = [
    `Generate a professional email about: ${userText}`,
    `Create a message regarding: ${userText}`
  ];
}
```

**What happens:**
- Parses JSON string into JavaScript array
- Validates:
  - Is it an array?
  - Does it have exactly 2 elements?
- If validation fails, uses fallback prompts

**Fallback Logic:**
- If parsing fails, creates simple prompts
- Ensures user always gets a response
- Prevents crashes from malformed JSON

---

### **Step 7: Response Sent to Extension**

**Location:** `backend/index.js` (line 88)

```javascript
res.status(200).json(promptsArray);
```

**Response Format:**
```json
[
  "Write a professional email to schedule a meeting about meeting with client. Include 2-3 time slots and ask for confirmation.",
  "Draft a friendly but concise message to set up a call regarding meeting with client. Mention your availability and ask for theirs."
]
```

**What happens:**
- Backend sends HTTP 200 response
- Body contains JSON array of 2 prompts
- Extension receives this response

---

### **Step 8: Extension Processes Response**

**Location:** `extension/background.js` (line 73-81)

```javascript
.then(data => {
  // data = ["Prompt 1", "Prompt 2"]
  
  // Store in chrome.storage for popup to listen
  chrome.storage.local.set({ 
    lastResponse: { 
      result: Array.isArray(data) ? data : [data],
      error: null 
    } 
  });
  
  // Also send direct response
  sendResponse({ success: true, prompts: data });
})
```

**What happens:**
- Receives array of prompts from backend
- Stores in Chrome storage with structure: `{ result: [...], error: null }`
- Sends response back to content script/popup

**Storage Structure:**
```javascript
{
  lastResponse: {
    result: ["Prompt 1", "Prompt 2"],
    error: null
  }
}
```

---

### **Step 9: UI Updates with Prompts**

**Location:** `extension/content.js` (line 167-197) or `ui-builder/src/App.jsx` (line 9-34)

```javascript
// Listen for storage changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.lastResponse?.newValue) {
    const { result, error } = changes.lastResponse.newValue;
    if (error) {
      // Show error
    } else {
      // Display prompts
      setResponse(Array.isArray(result) ? result : [result]);
    }
  }
});
```

**What happens:**
- UI listens to Chrome storage changes
- When `lastResponse` updates, extracts `result` array
- Updates React state or DOM to display prompts
- Shows each prompt with copy button

---

## 🎯 Prompt Structuring Strategy

### **Current Approach: Template-Based**

**Advantages:**
- ✅ Fast (no API calls needed)
- ✅ Predictable output
- ✅ No API costs
- ✅ Works offline

**Limitations:**
- ❌ Limited variety (only 2 template sets)
- ❌ Not truly "AI-generated"
- ❌ Doesn't adapt to different input types
- ❌ Simple string interpolation

### **Template Design Pattern:**

1. **Two Prompt Variations:**
   - Each template set provides 2 different styles
   - One more formal/professional
   - One more friendly/casual

2. **User Input Integration:**
   - User text is inserted into template
   - Maintains context while adding structure

3. **Consistent Output:**
   - Always returns exactly 2 prompts
   - JSON array format for easy parsing

---

## 🔮 Future: AI-Powered Generation

The code structure is ready for AI integration. Here's how it would work:

### **Option 1: Gemini API Integration**

```javascript
const generateAIResponse = async (userText) => {
  const prompt = `You are a world-class prompt engineer. 
  Generate two distinct, high-quality prompts based on: ${userText}
  Return ONLY a JSON array with exactly 2 strings.`;
  
  const response = await axios.post(GEMINI_API_URL, {
    contents: [{ parts: [{ text: prompt }] }],
  });
  
  return response.data.candidates[0].content.parts[0].text;
};
```

### **Option 2: OpenAI API Integration**

```javascript
const generateAIResponse = async (userText) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{
      role: "system",
      content: "Generate 2 distinct prompts as JSON array"
    }, {
      role: "user",
      content: userText
    }]
  });
  
  return response.choices[0].message.content;
};
```

---

## 📝 Key Design Decisions

### **1. Why Two Prompts?**
- Gives users options
- Shows different approaches/styles
- Better user experience

### **2. Why JSON Array Format?**
- Easy to parse
- Consistent structure
- Works with any frontend framework

### **3. Why Template-Based Currently?**
- No external dependencies
- Fast response time
- Works without internet (after initial load)
- Easy to understand and modify

### **4. Why Fallback Prompts?**
- Ensures user always gets response
- Prevents crashes from parsing errors
- Better error handling

---

## 🔍 Code Locations Summary

| Component | File | Key Function | Line Range |
|-----------|------|--------------|------------|
| **Input Collection** | `extension/content.js` | Form submission | 114-164 |
| **Message Passing** | `extension/background.js` | `onMessage.addListener` | 25-133 |
| **API Request** | `extension/background.js` | `fetch()` call | 44-52 |
| **Request Handler** | `backend/index.js` | `app.post('/api/generate')` | 56-97 |
| **Prompt Generation** | `backend/index.js` | `generateLocalResponse()` | 40-53 |
| **Response Parsing** | `backend/index.js` | JSON parsing & validation | 72-85 |
| **Storage Update** | `extension/background.js` | `chrome.storage.local.set()` | 76-81 |
| **UI Display** | `extension/content.js` | `displayResponse()` | 167-197 |

---

## 🧪 Example Walkthrough

### **Input:** `"project deadline"`

**Step 1:** User types "project deadline" in extension

**Step 2:** Background script receives: `{ action: "processText", selectedText: "project deadline" }`

**Step 3:** API request sent:
```json
POST /api/generate
{
  "userText": "project deadline",
  "action": "improve"
}
```

**Step 4:** Backend calls `generateLocalResponse("project deadline")`

**Step 5:** Template selected (randomly), userText inserted:
```json
[
  "Write a professional email to schedule a meeting about project deadline. Include 2-3 time slots and ask for confirmation.",
  "Draft a friendly but concise message to set up a call regarding project deadline. Mention your availability and ask for theirs."
]
```

**Step 6:** JSON parsed and validated ✓

**Step 7:** Response sent to extension

**Step 8:** Extension stores in Chrome storage

**Step 9:** UI displays both prompts with copy buttons

---

## 🛠️ How to Extend the Logic

### **Add More Templates:**

```javascript
const responses = [
  // Existing templates...
  `["New template prompt 1 about ${userText}...",
   "New template prompt 2 about ${userText}..."]`,
];
```

### **Add Context-Aware Logic:**

```javascript
const generateLocalResponse = (userText, action) => {
  if (action === "email") {
    return emailTemplates(userText);
  } else if (action === "meeting") {
    return meetingTemplates(userText);
  }
  // ... more conditions
};
```

### **Integrate Real AI:**

Replace `generateLocalResponse()` with AI API call (see "Future: AI-Powered Generation" above).

---

## 📊 Data Structures

### **Request Structure:**
```typescript
{
  userText: string;    // User's input text
  action: string;      // Action type (currently "improve")
}
```

### **Response Structure:**
```typescript
[
  string,  // First prompt
  string   // Second prompt
]
```

### **Storage Structure:**
```typescript
{
  lastResponse: {
    result: string[];  // Array of prompts
    error: string | null;
    isFallback?: boolean;
  }
}
```

---

## 🎓 Key Concepts

1. **Template Interpolation:** User input inserted into pre-defined templates
2. **Random Selection:** Adds variety by randomly choosing template sets
3. **Validation:** Ensures output is always valid JSON array
4. **Fallback Strategy:** Provides default prompts if generation fails
5. **Async Flow:** Uses promises/async-await for API calls
6. **Storage Pattern:** Chrome storage used for cross-component communication

---

This is the complete logic flow for how your system structures and promptifies user messages! 🚀

