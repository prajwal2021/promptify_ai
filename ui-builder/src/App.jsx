import { useState, useEffect } from 'react';
import './App.css';

// A simple SVG icon for the copy functionality
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="copy-icon"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

function App() {
  const [inputText, setInputText] = useState('');
  const [responses, setResponses] = useState([]); // State now holds an array of strings
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(null); // To show feedback when text is copied

  useEffect(() => {
    const listener = (changes, area) => {
      if (area === 'local' && changes.lastResponse?.newValue) {
        const { results, error } = changes.lastResponse.newValue;
        if (error) {
          // Handle potential errors by setting a single error message in the array
          setResponses([`Error: ${error}`]);
        } else {
          setResponses(results || []);
        }
        setIsLoading(false);
      }
    };

    chrome.storage.onChanged.addListener(listener);

    return () => {
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const handleCopyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000); // Reset after 2 seconds
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText || isLoading) return;

    setIsLoading(true);
    setResponses([]);
    chrome.storage.local.remove('lastResponse');

    // The 'action' property is no longer needed
    chrome.runtime.sendMessage({
      action: "processText",
      selectedText: inputText
    });
  };

  return (
    <div className="container">
      <h1>Promptify AI</h1>
      <p>Enter a rough idea, and get two refined prompts for any AI.</p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g., a logo for a cat-themed coffee shop"
          rows={5}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Prompts'}
        </button>
      </form>

      {responses.length > 0 && (
        <div className="responses-grid">
          {responses.map((prompt, index) => (
            <div key={index} className="responseContainer">
              <div className="response-header">
                <h2>Generated Prompt #{index + 1}</h2>
                <button
                  className="copy-button"
                  onClick={() => handleCopyToClipboard(prompt, index)}
                  title="Copy prompt"
                >
                  {copied === index ? 'Copied!' : <CopyIcon />}
                </button>
              </div>
              <p className="responseText">{prompt}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
