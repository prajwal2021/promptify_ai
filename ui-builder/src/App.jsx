import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const listener = (changes, area) => {
      if (area === 'local' && changes.lastResponse?.newValue) {
        const { result, error } = changes.lastResponse.newValue;
        if (error) {
          setResponse([`Error: ${error}`]);
        } else {
          setResponse(Array.isArray(result) ? result : (result ? [result] : []));
        }
        setIsLoading(false);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    // Check for a response when the popup opens
    chrome.storage.local.get('lastResponse', (data) => {
      if (data.lastResponse) {
        const { result, error } = data.lastResponse;
        if (error) {
          setResponse([`Error: ${error}`]);
        } else if (result) {
          setResponse(Array.isArray(result) ? result : [result]);
        }
      }
    });

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText || isLoading) return;

    setIsLoading(true);
    setResponse([]);
    chrome.storage.local.remove('lastResponse'); // Clear previous response

    chrome.runtime.sendMessage({
      action: "processText",
      selectedText: inputText
    }, (response) => {
      // Handle direct response (for content scripts)
      if (chrome.runtime.lastError) {
        console.error('Error:', chrome.runtime.lastError);
        setIsLoading(false);
        return;
      }
      // If we get a direct response, also store it
      if (response && response.success && response.prompts) {
        chrome.storage.local.set({ 
          lastResponse: { 
            result: response.prompts,
            error: null 
          } 
        });
      }
    });
  };

  return (
    <div className="container">
      <h1>Promptify AI</h1>
      <p>Turn your ideas into prompts.</p>
      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={5}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Generate Prompt'}
        </button>
      </form>
      {response.length > 0 && (
        <div className="responseContainer">
          <h2>Generated Prompts:</h2>
          {response.map((prompt, index) => (
            <div key={index} className="prompt-card">
              <div className="prompt-header">
                <div className="prompt-number">{index + 1}</div>
                <button 
                  className="copy-button" 
                  onClick={() => {
                    navigator.clipboard.writeText(prompt).then(() => {
                      const btn = document.querySelectorAll('.copy-button')[index];
                      const text = btn.querySelector('.copy-text');
                      const originalText = text.textContent;
                      text.textContent = 'Copied!';
                      btn.classList.add('copied');
                      setTimeout(() => {
                        text.textContent = originalText;
                        btn.classList.remove('copied');
                      }, 2000);
                    });
                  }}
                  title="Copy prompt"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                  </svg>
                  <span className="copy-text">Copy</span>
                </button>
              </div>
              <div className="prompt-text">{prompt}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
