// API configuration
const API_URL = 'http://localhost:8000';

// Helper function to log to both console and storage
const logError = async (message, details = {}) => {
  const timestamp = new Date().toISOString();
  const errorLog = { timestamp, message, details };
  console.error(`[${timestamp}]`, message, details);
  
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
    
    // Call our backend API
    fetch(`${API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userText: request.selectedText,
        action: "improve"
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
          result: Array.isArray(data) ? data : [data],
          error: null 
        } 
      });
      
      if (!isResponseSent) {
        // Also send response for content script if needed
        sendResponse({ success: true, prompts: data });
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
