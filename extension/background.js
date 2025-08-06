chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Check if the message is the one we expect
    if (request.action === "processText") {
      console.log("✅ Background script received text:", request.selectedText);
  
      // Call our backend API
      fetch('https://promptify-ai10-prajwals-projects-3a25af74.vercel.app/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userText: request.selectedText,
          action: "improve" // Hardcoding the action for now
        })
      })
      .then(response => {
        console.log("Received response from server with status:", response.status);
        if (!response.ok) {
          // Try to get more detailed error info from the response body
          return response.text().then(text => {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("🤖 AI Response:", data);
        chrome.storage.local.set({ lastResponse: data });
      })
      .catch(error => {
        console.error('❌ Error calling backend:', error.message);
        chrome.storage.local.set({ lastResponse: { error: error.message } });
      });
    }
  });
