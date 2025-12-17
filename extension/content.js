// Floating Icon and Popup Manager
(function() {
  'use strict';

  // Wait for DOM to be ready
  function init() {
    // Check if already injected
    if (document.getElementById('promptify-floating-container')) {
      console.log('Promptify: Already injected, skipping');
      return;
    }

    console.log('Promptify: Initializing floating icon...');

    try {
      // Create floating container
      const container = document.createElement('div');
      container.id = 'promptify-floating-container';
      container.innerHTML = `
        <div id="promptify-floating-icon" class="promptify-icon" title="Promptify AI">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
            <path d="M19 15L19.5 17.5L22 18L19.5 18.5L19 21L18.5 18.5L16 18L18.5 17.5L19 15Z" fill="currentColor"/>
            <path d="M5 17L5.5 18.5L7 19L5.5 19.5L5 21L4.5 19.5L3 19L4.5 18.5L5 17Z" fill="currentColor"/>
          </svg>
        </div>
        <div id="promptify-popup-overlay" class="promptify-overlay">
          <div id="promptify-popup" class="promptify-popup">
            <div class="promptify-popup-header">
              <h2>Promptify AI</h2>
              <button id="promptify-close-btn" class="promptify-close-btn">×</button>
            </div>
            <div class="promptify-popup-content">
              <p class="promptify-subtitle">Turn your ideas into prompts.</p>
              <form id="promptify-form">
                <textarea
                  id="promptify-textarea"
                  placeholder="Type or paste your text here..."
                  rows="5"
                ></textarea>
                <button type="submit" id="promptify-submit-btn">
                  Generate Prompt
                </button>
              </form>
              <div id="promptify-response" class="promptify-response"></div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(container);
      console.log('Promptify: Container added to DOM');

      // Get elements
      const icon = document.getElementById('promptify-floating-icon');
      const overlay = document.getElementById('promptify-popup-overlay');
      const popup = document.getElementById('promptify-popup');
      const closeBtn = document.getElementById('promptify-close-btn');
      const form = document.getElementById('promptify-form');
      const textarea = document.getElementById('promptify-textarea');
      const submitBtn = document.getElementById('promptify-submit-btn');
      const responseDiv = document.getElementById('promptify-response');

      if (!icon || !overlay || !popup) {
        console.error('Promptify: Failed to find required elements');
        return;
      }

      let isLoading = false;

      // Show popup
      function showPopup() {
        overlay.classList.add('active');
        icon.classList.add('active');
        // Focus textarea when opened
        setTimeout(() => textarea.focus(), 100);
      }

      // Hide popup
      function hidePopup() {
        overlay.classList.remove('active');
        icon.classList.remove('active');
      }

      // Icon click - toggle popup
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        if (overlay.classList.contains('active')) {
          hidePopup();
        } else {
          showPopup();
        }
      });

      // Close button
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        hidePopup();
      });

      // Click outside popup to close
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          hidePopup();
        }
      });

      // Prevent popup clicks from closing
      popup.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      // Handle form submission
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputText = textarea.value.trim();
        
        if (!inputText || isLoading) return;

        isLoading = true;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Thinking...';
        responseDiv.innerHTML = '';

        try {
          // Send message to background script
          chrome.runtime.sendMessage({
            action: "processText",
            selectedText: inputText
          }, (response) => {
            isLoading = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Prompt';

            if (chrome.runtime.lastError) {
              responseDiv.innerHTML = `<div class="promptify-error">Error: ${chrome.runtime.lastError.message}</div>`;
              return;
            }

            if (response && response.success && response.prompts) {
              displayResponse(response.prompts);
            } else {
              // Wait for storage update
              setTimeout(() => {
                chrome.storage.local.get('lastResponse', (data) => {
                  if (data.lastResponse) {
                    const { result, error } = data.lastResponse;
                    if (error) {
                      responseDiv.innerHTML = `<div class="promptify-error">Error: ${error}</div>`;
                    } else if (result) {
                      displayResponse(Array.isArray(result) ? result : [result]);
                    }
                  }
                });
              }, 500);
            }
          });
        } catch (error) {
          isLoading = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Generate Prompt';
          responseDiv.innerHTML = `<div class="promptify-error">Error: ${error.message}</div>`;
        }
      });

      // Display response
      function displayResponse(prompts) {
        if (!Array.isArray(prompts) || prompts.length === 0) {
          responseDiv.innerHTML = '<div class="promptify-error">No prompts generated</div>';
          return;
        }

        let html = '<div class="promptify-prompts"><h3>Generated Prompts:</h3>';
        prompts.forEach((prompt, index) => {
          html += `<div class="promptify-prompt-item">
            <div class="promptify-prompt-number">${index + 1}</div>
            <div class="promptify-prompt-text">${escapeHtml(prompt)}</div>
            <button class="promptify-copy-btn" data-prompt="${escapeHtml(prompt)}">Copy</button>
          </div>`;
        });
        html += '</div>';
        responseDiv.innerHTML = html;

        // Add copy button listeners
        responseDiv.querySelectorAll('.promptify-copy-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const prompt = e.target.getAttribute('data-prompt');
            navigator.clipboard.writeText(prompt).then(() => {
              const originalText = e.target.textContent;
              e.target.textContent = 'Copied!';
              setTimeout(() => {
                e.target.textContent = originalText;
              }, 2000);
            });
          });
        });
      }

      // Escape HTML
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      // Listen for storage changes (in case background updates)
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local' && changes.lastResponse?.newValue) {
          const { result, error } = changes.lastResponse.newValue;
          if (error) {
            responseDiv.innerHTML = `<div class="promptify-error">Error: ${error}</div>`;
          } else if (result) {
            displayResponse(Array.isArray(result) ? result : [result]);
          }
        }
      });

      // Handle text selection (existing functionality)
      document.addEventListener('mouseup', (event) => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
          console.log("Found selected text:", selectedText);
          // Auto-fill textarea if popup is open
          if (overlay.classList.contains('active')) {
            textarea.value = selectedText;
          }
          // Send to background script
          chrome.runtime.sendMessage({
            action: "processText",
            selectedText: selectedText
          });
        }
      });

      console.log('Promptify: Initialization complete!');
    } catch (error) {
      console.error('Promptify: Error during initialization:', error);
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM is already ready
    init();
  }

  // Also try after a short delay in case body isn't ready
  setTimeout(() => {
    if (!document.getElementById('promptify-floating-container') && document.body) {
      init();
    }
  }, 100);

})();
