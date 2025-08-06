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
          setResponse(result || []);
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
          setResponse(result);
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
    });
  };

  return (
    <div className="container">
      <div className="header-icons">
        <div className="icon-group">
          <div className="sidebar-icon">
            {/* Profile Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="white"/>
            </svg>
          </div>
          <div className="sidebar-icon">
            {/* Settings Icon SVG */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.43 12.98C19.47 12.67 19.5 12.34 19.5 12C19.5 11.66 19.47 11.33 19.43 11.02L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.96 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.5 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.5 2.42L9.13 5.07C8.52 5.32 7.96 5.65 7.44 6.05L4.95 5.05C4.73 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11.02C4.53 11.33 4.5 11.66 4.5 12C4.5 12.34 4.53 12.67 4.57 12.98L2.46 14.63C2.27 14.78 2.21 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.04 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.5 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.5 21.58L14.87 18.93C15.48 18.68 16.04 18.35 16.56 17.95L19.05 18.95C19.27 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.98ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" fill="white"/>
            </svg>
          </div>
        </div>
      </div>
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
            <p key={index} className="responseText">{prompt}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
