import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const listener = (changes, area) => {
      if (area === 'local' && changes.lastResponse?.newValue) {
        const { result, error } = changes.lastResponse.newValue;
        if (error) {
          setResponse(`Error: ${error}`);
        } else {
          setResponse(result || 'No response text received.');
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
          setResponse(`Error: ${error}`);
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
    setResponse('');
    chrome.storage.local.remove('lastResponse'); // Clear previous response

    chrome.runtime.sendMessage({
      action: "processText",
      selectedText: inputText
    });
  };

  return (
    <div className="container">
      <h1>Promptify AI</h1>
      <p>Enter your prompt idea and copy the generated ideal prompt.</p>

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

      {response && (
        <div className="responseContainer">
          <h2>Suggested Improvement:</h2>
          <p className="responseText">{response}</p>
        </div>
      )}
    </div>
  );
}

export default App;
