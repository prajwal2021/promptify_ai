// API configuration
// Production: Uses Vercel deployment URL
const API_URL = 'https://promptify-ai-three.vercel.app';

// For local development: Comment out the Vercel URL above and uncomment the localhost line below
// const API_URL = 'http://localhost:8000';

// Helper function to log to both console and storage
const logError = async (message, details = {}) => {
  const timestamp = new Date().toISOString();
  const errorLog = { timestamp, message, details };
  
  // Format details for console output
  const detailsStr = typeof details === 'object' && details !== null
    ? JSON.stringify(details, null, 2)
    : String(details);
  
  console.error(`[${timestamp}] ${message}`, detailsStr);
  
  // Save the last 5 errors
  const result = await chrome.storage.local.get({ errorLogs: [] });
  const errorLogs = [errorLog, ...result.errorLogs].slice(0, 5);
  await chrome.storage.local.set({ errorLogs, lastError: errorLog });
  return errorLog;
};

// Handle incoming messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Keep the message channel open for async response
  let isResponseSent = false;
  
  // Set a timeout for the response
  const responseTimeout = setTimeout(() => {
    if (!isResponseSent) {
      const error = new Error('Request timed out after 30 seconds');
      logError('Request timeout', { action: request.action, error: error.message });
      sendResponse({ error: 'Request timed out' });
      isResponseSent = true;
    }
  }, 30000);

  // Handle the message
  if (request.action === "processText") {
    console.log("📨 Background script received text:", request.selectedText);
    const actionType = request.actionType || "prompt";
    const context = request.context || null;
    const text1 = request.text1 || null;
    const text2 = request.text2 || null;
    console.log("📨 Action type:", actionType);
    if (context) {
      console.log("📨 Context provided:", context);
    }
    if (text1 && text2) {
      console.log("📨 Compare mode - Text1:", text1);
      console.log("📨 Compare mode - Text2:", text2);
    }
    
    // For compare action, combine both texts
    let userText = request.selectedText;
    if (actionType === 'compare' && text1 && text2) {
      userText = `TEXT 1: "${text1}"\n\nTEXT 2: "${text2}"`;
    }
    
    // Call our backend API
    fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userText: userText,
        action: actionType,
        context: context,
        text1: text1,
        text2: text2
      }),
      credentials: 'include'  // Important for cookies, if any
    })
    .then(async (response) => {
      console.log("🔍 Response status:", response.status);
      
      // Clone the response to read it multiple times if needed
      const responseClone = response.clone();
      const responseText = await responseClone.text();
      
      console.log("📄 Raw response:", responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
      }
      
      try {
        return JSON.parse(responseText);
      } catch (e) {
        console.warn("⚠️ Response is not valid JSON, returning as text");
        return { rawResponse: responseText };
      }
    })
    .then(data => {
      console.log("✅ AI Response received:", data);
      // Store in chrome.storage for popup to listen
      chrome.storage.local.set({ 
        lastResponse: { 
          result: data, // Store as-is (could be array of prompts or AI response object)
          error: null 
        } 
      });
      
      if (!isResponseSent) {
        // Also send response for content script if needed
        if (data && typeof data === 'object' && data.type === 'ai-response') {
          sendResponse({ success: true, aiResponse: data });
        } else {
          sendResponse({ success: true, prompts: Array.isArray(data) ? data : [data] });
        }
        isResponseSent = true;
      }
    })
    .catch(async (error) => {
      console.error('❌ Error in fetch:', error);
      const errorLog = await logError('API request failed', { 
        action: request.action, 
        error: error.message,
        stack: error.stack,
        url: API_URL,
        request: request
      });
      
      if (!isResponseSent) {
        // Provide a fallback response if the API fails
        const actionType = request.actionType || "prompt";
        
        // For non-prompt actions, show error message instead of fallback prompts
        if (actionType !== 'prompt') {
          const errorMessage = `Failed to get AI response. Please ensure the backend is running and GEMINI_API_KEY is configured.`;
          
          chrome.storage.local.set({ 
            lastResponse: { 
              result: null,
              error: errorMessage,
              isFallback: false
            } 
          });
          
          sendResponse({ 
            success: false,
            error: errorMessage
          });
          isResponseSent = true;
          return;
        }
        
        // Only generate fallback prompts for 'prompt' action
        const fallbackPrompts = [
          `Create a professional email about: ${request.selectedText}`,
          `Draft a message regarding: ${request.selectedText}`
        ];
        
        // Store fallback in chrome.storage for popup
        chrome.storage.local.set({ 
          lastResponse: { 
            result: fallbackPrompts,
            error: null,
            isFallback: true
          } 
        });
        
        sendResponse({ 
          success: true, // Still mark as success to show the fallback
          prompts: fallbackPrompts,
          isFallback: true
        });
        isResponseSent = true;
      }
    })
    .finally(() => {
      clearTimeout(responseTimeout);
    });
    
    // Return true to indicate we'll respond asynchronously
    return true;
  }
  
  // For any other actions, return false to close the message channel
  return false;
});
