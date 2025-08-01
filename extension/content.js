document.addEventListener('mouseup', (event) => {
    const selectedText = window.getSelection().toString().trim();
  
    if (selectedText) {
      console.log("Found selected text:", selectedText);
      // Send the selected text to our background script
      chrome.runtime.sendMessage({
        action: "processText",
        selectedText: selectedText
      });
    }
  });