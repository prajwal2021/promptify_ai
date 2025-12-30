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
      // Create floating container (icon is hidden, only popup overlay is created)
      const container = document.createElement('div');
      container.id = 'promptify-floating-container';
      container.innerHTML = `
        <div id="promptify-floating-icon" class="promptify-icon" title="Promptify AI" style="display: none !important;">
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
            <!-- Auth Screen -->
            <div id="promptify-auth-screen" class="promptify-auth-screen">
              <div id="promptify-signup-view" class="promptify-auth-view">
                <h3>Sign Up</h3>
                <form id="promptify-signup-form">
                  <input type="text" id="promptify-signup-username" placeholder="Username (optional)" />
                  <input type="email" id="promptify-signup-email" placeholder="Email" required />
                  <input type="password" id="promptify-signup-password" placeholder="Password" required />
                  <button type="submit" id="promptify-signup-btn">Sign Up</button>
                </form>
                <div class="promptify-auth-divider">
                  <span>or</span>
                </div>
                <button id="promptify-google-signup-btn" class="promptify-google-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                <p class="promptify-auth-switch">
                  Already have an account? <a href="#" id="promptify-switch-to-login">Sign In</a>
                </p>
              </div>
              <div id="promptify-login-view" class="promptify-auth-view" style="display: none;">
                <h3>Sign In</h3>
                <form id="promptify-login-form">
                  <input type="email" id="promptify-login-email" placeholder="Email" required />
                  <input type="password" id="promptify-login-password" placeholder="Password" required />
                  <button type="submit" id="promptify-login-btn">Sign In</button>
                </form>
                <div class="promptify-auth-divider">
                  <span>or</span>
                </div>
                <button id="promptify-google-login-btn" class="promptify-google-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </button>
                <p class="promptify-auth-switch">
                  Don't have an account? <a href="#" id="promptify-switch-to-signup">Sign Up</a>
                </p>
              </div>
              <div id="promptify-auth-error" class="promptify-auth-error" style="display: none;"></div>
            </div>
            <!-- Main Content Screen (hidden until authenticated) -->
            <div id="promptify-main-content" class="promptify-main-content" style="display: none;">
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

      // Get elements (icon is hidden, so we don't need to reference it)
      const overlay = document.getElementById('promptify-popup-overlay');
      const popup = document.getElementById('promptify-popup');
      const closeBtn = document.getElementById('promptify-close-btn');
      
      // Auth elements
      const authScreen = document.getElementById('promptify-auth-screen');
      const signupView = document.getElementById('promptify-signup-view');
      const loginView = document.getElementById('promptify-login-view');
      const signupForm = document.getElementById('promptify-signup-form');
      const loginForm = document.getElementById('promptify-login-form');
      const switchToLogin = document.getElementById('promptify-switch-to-login');
      const switchToSignup = document.getElementById('promptify-switch-to-signup');
      const googleSignupBtn = document.getElementById('promptify-google-signup-btn');
      const googleLoginBtn = document.getElementById('promptify-google-login-btn');
      const authError = document.getElementById('promptify-auth-error');
      
      // Main content elements
      const mainContent = document.getElementById('promptify-main-content');
      const form = document.getElementById('promptify-form');
      const textarea = document.getElementById('promptify-textarea');
      const submitBtn = document.getElementById('promptify-submit-btn');
      const responseDiv = document.getElementById('promptify-response');

      if (!overlay || !popup) {
        console.error('Promptify: Failed to find required elements');
        return;
      }

      let isLoading = false;
      // Production: Uses Vercel deployment URL
      const API_URL = 'https://promptify-ai-three.vercel.app';
      
      // For local development: Comment out the Vercel URL above and uncomment the localhost line below
      // const API_URL = 'http://localhost:8000';

      // Check authentication state
      async function checkAuthState() {
        return new Promise((resolve) => {
          try {
            chrome.storage.local.get(['authToken'], (data) => {
              if (chrome.runtime.lastError) {
                console.error('Error checking auth state:', chrome.runtime.lastError);
                resolve(false);
                return;
              }
              resolve(!!data.authToken);
            });
          } catch (error) {
            console.error('Error checking auth state:', error);
            resolve(false);
          }
        });
      }

      // Show appropriate screen based on auth state
      async function updateUIForAuthState() {
        const isAuthenticated = await checkAuthState();
        if (isAuthenticated) {
          authScreen.style.display = 'none';
          mainContent.style.display = 'block';
        } else {
          authScreen.style.display = 'block';
          mainContent.style.display = 'none';
        }
      }

      // Show error message
      function showAuthError(message) {
        authError.textContent = message;
        authError.style.display = 'block';
        setTimeout(() => {
          authError.style.display = 'none';
        }, 5000);
      }

      // Sign up handler
      signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('promptify-signup-email').value;
        const username = document.getElementById('promptify-signup-username').value;
        const password = document.getElementById('promptify-signup-password').value;

        try {
          const response = await fetch(`${API_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password })
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            const text = await response.text();
            showAuthError(`Server error: ${response.status} ${response.statusText}. ${text}`);
            return;
          }

          if (response.ok && data.success) {
            chrome.storage.local.set({ 
              authToken: data.token,
              userInfo: data.user || { email: email, username: username }
            }, () => {
              updateUIForAuthState();
            });
          } else {
            showAuthError(data.error || data.message || 'Sign up failed');
          }
        } catch (error) {
          console.error('Signup error:', error);
          showAuthError(`Failed to connect to server: ${error.message}. Please check if the backend is running at ${API_URL}`);
        }
      });

      // Login handler
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('promptify-login-email').value;
        const password = document.getElementById('promptify-login-password').value;

        try {
          const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          let data;
          try {
            data = await response.json();
          } catch (parseError) {
            const text = await response.text();
            showAuthError(`Server error: ${response.status} ${response.statusText}. ${text}`);
            return;
          }

          if (response.ok && data.success) {
            chrome.storage.local.set({ 
              authToken: data.token,
              userInfo: data.user || { email: email }
            }, () => {
              updateUIForAuthState();
            });
          } else {
            showAuthError(data.error || data.message || 'Login failed');
          }
        } catch (error) {
          console.error('Login error:', error);
          showAuthError(`Failed to connect to server: ${error.message}. Please check if the backend is running at ${API_URL}`);
        }
      });

      // Google OAuth handler (simplified - you'll need to implement actual Google OAuth flow)
      async function handleGoogleAuth() {
        // For now, this is a placeholder. You'll need to integrate Google OAuth properly
        // This requires additional setup with Google Cloud Console
        showAuthError('Google OAuth is not yet fully implemented. Please use email/password for now.');
      }

      googleSignupBtn.addEventListener('click', handleGoogleAuth);
      googleLoginBtn.addEventListener('click', handleGoogleAuth);

      // Switch between signup and login views
      switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.style.display = 'none';
        loginView.style.display = 'block';
      });

      switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        signupView.style.display = 'block';
      });

      // Initialize UI based on auth state
      updateUIForAuthState();

      // Show popup (accessible globally for keyboard shortcut)
      async function showPopup() {
        overlay.classList.add('active');
        await updateUIForAuthState();
        // Focus textarea when opened and authenticated
        if (await checkAuthState()) {
          setTimeout(() => textarea.focus(), 100);
        }
      }

      // Hide popup
      function hidePopup() {
        overlay.classList.remove('active');
      }

      // Store showPopup function globally for keyboard shortcut access
      window.promptifyShowPopup = showPopup;

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
          // Check if chrome.runtime is available
          if (typeof chrome === 'undefined' || !chrome || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
            isLoading = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Prompt';
            responseDiv.innerHTML = '<div class="promptify-error">Error: Extension API not available. Please reload the page.</div>';
            return;
          }

          // Send message to background script
          chrome.runtime.sendMessage({
            action: "processText",
            selectedText: inputText
          }, (response) => {
            isLoading = false;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Generate Prompt';

            if (chrome.runtime && chrome.runtime.lastError) {
              const error = chrome.runtime.lastError;
              if (error.message && error.message.includes('Extension context invalidated')) {
                responseDiv.innerHTML = '<div class="promptify-error">Extension was reloaded. Please refresh this page to continue using Promptify AI.</div>';
              } else {
                responseDiv.innerHTML = `<div class="promptify-error">Error: ${error.message}</div>`;
              }
              return;
            }

            if (response && response.success) {
              if (response.aiResponse) {
                displayResponse(response.aiResponse);
              } else if (response.prompts) {
                displayResponse(response.prompts);
              } else {
                // Wait for storage update
                setTimeout(() => {
                  if (typeof chrome !== 'undefined' && chrome.storage) {
                    try {
                      chrome.storage.local.get('lastResponse', (data) => {
                        if (data.lastResponse) {
                          const { result, error } = data.lastResponse;
                          if (error) {
                            responseDiv.innerHTML = `<div class="promptify-error">Error: ${error}</div>`;
                          } else if (result) {
                            displayResponse(result);
                          }
                        }
                      });
                    } catch (error) {
                      console.error('Error accessing storage:', error);
                    }
                  }
                }, 500);
              }
            } else {
              // Wait for storage update
              setTimeout(() => {
                if (typeof chrome !== 'undefined' && chrome.storage) {
                  try {
                    chrome.storage.local.get('lastResponse', (data) => {
                      if (data.lastResponse) {
                        const { result, error } = data.lastResponse;
                        if (error) {
                          responseDiv.innerHTML = `<div class="promptify-error">Error: ${error}</div>`;
                        } else if (result) {
                          displayResponse(result);
                        }
                      }
                    });
                  } catch (error) {
                    console.error('Error accessing storage:', error);
                  }
                }
              }, 500);
            }
          });
        } catch (error) {
          isLoading = false;
          submitBtn.disabled = false;
          submitBtn.textContent = 'Generate Prompt';
          let errorMessage = error.message || 'Unknown error';
          if (errorMessage.includes('Extension context invalidated') || errorMessage.includes('context invalidated')) {
            errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
          }
          responseDiv.innerHTML = `<div class="promptify-error">Error: ${errorMessage}</div>`;
        }
      });

      // Display response (handles both prompts and AI responses)
      function displayResponse(data) {
        // Check if it's an AI response object
        if (data && typeof data === 'object' && data.type === 'ai-response') {
          const actionLabels = {
            'explain': 'Explanation',
            'summarize': 'Summary',
            'example': 'Examples',
            'compare': 'Comparison',
            'add-context': 'Enhanced Content'
          };
          const label = actionLabels[data.action] || 'Response';
          
          let html = `<div class="promptify-ai-response">
            <div class="promptify-ai-response-header">
              <h3>${label}</h3>
              <button class="promptify-copy-btn" data-text="${escapeHtml(data.response)}" title="Copy response">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            </div>
            <div class="promptify-ai-response-text">${formatMarkdown(data.response)}</div>
          </div>`;
          responseDiv.innerHTML = html;

          // Add copy button listener
          const copyBtn = responseDiv.querySelector('.promptify-copy-btn');
          if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
              const text = copyBtn.getAttribute('data-text');
              navigator.clipboard.writeText(text).then(() => {
                const copyText = copyBtn.querySelector('.copy-text');
                const originalText = copyText.textContent;
                copyText.textContent = 'Copied!';
                copyBtn.classList.add('copied');
                setTimeout(() => {
                  copyText.textContent = originalText;
                  copyBtn.classList.remove('copied');
                }, 2000);
              }).catch(err => {
                console.error('Failed to copy:', err);
              });
            });
          }
          return;
        }

        // Handle array of prompts (existing behavior)
        const prompts = Array.isArray(data) ? data : (data && data.prompts ? data.prompts : []);
        if (prompts.length === 0) {
          responseDiv.innerHTML = '<div class="promptify-error">No response generated</div>';
          return;
        }

        let html = '<div class="promptify-prompts"><h3>Generated Prompts:</h3>';
        prompts.forEach((prompt, index) => {
          html += `<div class="promptify-prompt-card">
            <div class="promptify-prompt-header">
              <div class="promptify-prompt-number">${index + 1}</div>
              <button class="promptify-copy-btn" data-prompt="${escapeHtml(prompt)}" title="Copy prompt">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                </svg>
                <span class="copy-text">Copy</span>
              </button>
            </div>
            <div class="promptify-prompt-text">${escapeHtml(prompt)}</div>
          </div>`;
        });
        html += '</div>';
        responseDiv.innerHTML = html;

        // Add copy button listeners
        responseDiv.querySelectorAll('.promptify-copy-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const prompt = e.target.closest('.promptify-copy-btn').getAttribute('data-prompt');
            navigator.clipboard.writeText(prompt).then(() => {
              const copyText = btn.querySelector('.copy-text');
              const originalText = copyText.textContent;
              copyText.textContent = 'Copied!';
              btn.classList.add('copied');
              setTimeout(() => {
                copyText.textContent = originalText;
                btn.classList.remove('copied');
              }, 2000);
            }).catch(err => {
              console.error('Failed to copy:', err);
            });
          });
        });
      }

      // Simple markdown formatting helper
      function formatMarkdown(text) {
        if (!text) return '';
        // Escape HTML first
        let formatted = escapeHtml(text);
        // Convert markdown-style formatting to HTML
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        // Convert line breaks to <br>
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
      }

      // Escape HTML
      function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      }

      // Listen for storage changes (for floating icon popup only, not for selection toolbar)
      if (typeof chrome !== 'undefined' && chrome.storage) {
        try {
          chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.lastResponse?.newValue) {
              // Only handle if the popup overlay is open (for floating icon functionality)
              if (overlay.classList.contains('active') && responseDiv) {
                const { result, error } = changes.lastResponse.newValue;
                if (error) {
                  responseDiv.innerHTML = `<div class="promptify-error">Error: ${error}</div>`;
                } else if (result) {
                  displayResponse(result);
                }
              }
            }
          });
        } catch (error) {
          console.error('Error setting up storage listener:', error);
        }
      }

      // Selection Toolbar Management
      let selectionToolbar = null;
      let currentSelection = null;
      let isWaitingForCompare = false;
      let firstCompareText = null;

      function hideSelectionToolbar() {
        if (selectionToolbar) {
          selectionToolbar.remove();
          selectionToolbar = null;
          currentSelection = null;
        }
      }

      async function showSelectionToolbar(selectedText, range) {
        // Check authentication before showing toolbar
        const authenticated = await checkAuthState();
        if (!authenticated) {
          // Open popup to show auth screen
          if (typeof window.promptifyShowPopup === 'function') {
            window.promptifyShowPopup();
          }
          return;
        }

        // Remove existing toolbar if any
        hideSelectionToolbar();

        // Create toolbar
        selectionToolbar = document.createElement('div');
        selectionToolbar.id = 'promptify-selection-toolbar';
        selectionToolbar.className = 'promptify-selection-toolbar';
        
        const actions = [
          { id: 'explain', label: 'Explain' },
          { id: 'summarize', label: 'Summarize' },
          { id: 'example', label: 'Give Example' },
          { id: 'compare', label: 'Compare' },
          { id: 'add-context', label: 'Add Context' },
          { id: 'prompt', label: 'Prompt' }
        ];

        const buttonsHtml = actions.map(action => 
          `<button class="promptify-toolbar-btn" data-action="${action.id}">${action.label}</button>`
        ).join('');

        selectionToolbar.innerHTML = buttonsHtml;

        // Position toolbar below selection
        const rect = range.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        document.body.appendChild(selectionToolbar);

        // Calculate position (below selection, centered)
        const toolbarWidth = selectionToolbar.offsetWidth;
        const toolbarHeight = selectionToolbar.offsetHeight;
        let left = rect.left + scrollLeft + (rect.width / 2) - (toolbarWidth / 2);
        let top = rect.bottom + scrollTop + 8; // 8px gap below selection

        // Adjust if toolbar would go off-screen
        if (left < scrollLeft + 10) left = scrollLeft + 10;
        if (left + toolbarWidth > scrollLeft + window.innerWidth - 10) {
          left = scrollLeft + window.innerWidth - toolbarWidth - 10;
        }
        if (top + toolbarHeight > scrollTop + window.innerHeight - 10) {
          // Show above selection if no room below
          top = rect.top + scrollTop - toolbarHeight - 8;
        }

        selectionToolbar.style.left = `${left}px`;
        selectionToolbar.style.top = `${top}px`;
        selectionToolbar.style.display = 'flex';

        currentSelection = selectedText;

        // Add click handlers for buttons
        selectionToolbar.querySelectorAll('.promptify-toolbar-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const actionType = btn.getAttribute('data-action');
            handleAction(actionType, selectedText, range);
            hideSelectionToolbar();
          });
        });

        // Hide toolbar when clicking outside
        setTimeout(() => {
          document.addEventListener('click', function hideToolbarOnClick(e) {
            if (selectionToolbar && !selectionToolbar.contains(e.target)) {
              hideSelectionToolbar();
              document.removeEventListener('click', hideToolbarOnClick);
            }
          }, { once: true });
        }, 100);
      }

      // Create result panel for displaying AI responses (similar to reference.txt)
      function createResultPanel(actionType, position) {
        // Remove existing result panel if any
        const existing = document.getElementById('promptify-result-panel');
        if (existing) {
          existing.remove();
        }

        const panel = document.createElement('div');
        panel.id = 'promptify-result-panel';
        panel.style.cssText = `
          position: absolute !important;
          left: ${position.left}px !important;
          top: ${position.top}px !important;
          width: 90% !important;
          max-width: 600px !important;
          max-height: 80vh !important;
          overflow-y: auto !important;
          background: linear-gradient(to top right, rgb(157, 32, 247), rgb(36, 132, 177)) !important;
          border: 1px solid #ddd !important;
          border-radius: 12px !important;
          color: white !important;
          box-shadow: 0 8px 30px rgba(0,0,0,0.2) !important;
          z-index: 10000 !important;
          padding: 20px !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        `;

        const closeButton = document.createElement('button');
        closeButton.textContent = '✖';
        closeButton.style.cssText = `
          position: absolute !important;
          top: 10px !important;
          right: 10px !important;
          background: none !important;
          border: none !important;
          font-size: 20px !important;
          cursor: pointer !important;
          color: #ded9d9ff !important;
        `;
        closeButton.onclick = () => panel.remove();
        panel.appendChild(closeButton);

        const contentDiv = document.createElement('div');
        contentDiv.id = 'promptify-result-content';
        contentDiv.innerHTML = '<p style="color:white; text-align:center !important;">Generating response...</p>';
        panel.appendChild(contentDiv);
        
        document.body.appendChild(panel);

        return contentDiv;
      }

      // Display action result in the panel
      function displayActionResult(container, actionType, response) {
        const actionLabels = {
          'explain': 'Explain',
          'summarize': 'Summarize',
          'example': 'Examples',
          'compare': 'Compare',
          'add-context': 'Add Context',
          'prompt': 'Prompt'
        };

        const label = actionLabels[actionType] || actionType;
        let content = '';

        // Handle AI response (string)
        if (typeof response === 'string') {
          // Format markdown-like text
          content = response
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italics
            .replace(/(\r\n|\n|\r)/g, '<br>'); // Newlines
        } 
        // Handle array of prompts
        else if (Array.isArray(response)) {
          content = response.map((item, index) => {
            const formatted = String(item)
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/(\r\n|\n|\r)/g, '<br>');
            return `<div style="margin-bottom: 20px;"><strong>Prompt ${index + 1}:</strong><br>${formatted}</div>`;
          }).join('');
        }

        container.innerHTML = `
          <div style="margin-top: 0; font-size: 24px; font-weight: 500;">${label}:</div>
          <hr style="border: 1px solid rgba(255,255,255,0.3); margin: 10px 0;">
          <div style="line-height: 1.6;">${content}</div>
        `;
      }

      // Show status message (similar to reference.txt)
      function showStatusMessage(message, duration = 3000) {
        const existing = document.getElementById('promptify-status-message');
        if (existing) {
          existing.remove();
        }

        const statusDiv = document.createElement('div');
        statusDiv.id = 'promptify-status-message';
        statusDiv.textContent = message;
        
        // Get position from current selection or use default
        const selection = window.getSelection();
        let x = 100;
        let y = 100;
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          x = rect.left + scrollLeft + 15;
          y = rect.bottom + scrollTop + 10;
        }
        
        statusDiv.style.cssText = `
          position: absolute !important;
          left: ${x}px !important;
          top: ${y}px !important;
          background: linear-gradient(to top right, rgb(157, 32, 247), rgb(36, 132, 177)) !important;
          color: white !important;
          padding: 20px !important;
          border: 1px solid #ccc !important;
          border-radius: 8px !important;
          z-index: 10001 !important;
          font-size: 14px !important;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important;
          text-align: center !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        `;
        
        document.body.appendChild(statusDiv);
        setTimeout(() => {
          const toRemove = document.getElementById('promptify-status-message');
          if (toRemove) {
            toRemove.remove();
          }
        }, duration);
      }

      function handleAction(actionType, selectedText, range) {
        // Special handling for "Add Context" action
        if (actionType === 'add-context') {
          // Save context to chrome.storage.local
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ savedContext: selectedText }, () => {
              showStatusMessage('Context added');
              hideSelectionToolbar();
            });
          } else {
            showStatusMessage('Error: Cannot save context. Please reload the page.');
          }
          return;
        }

        // Special handling for "Compare" action - two-step process
        if (actionType === 'compare') {
          isWaitingForCompare = true;
          firstCompareText = selectedText;
          showStatusMessage('Please select the second piece of text to compare.');
          hideSelectionToolbar();
          return;
        }

        // Get position for result panel (below selection)
        const rect = range.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        const position = {
          left: Math.max(10, Math.min(rect.left + scrollLeft, scrollLeft + window.innerWidth - 620)),
          top: rect.bottom + scrollTop + 10
        };

        // Create result panel (don't open the popup)
        const resultContainer = createResultPanel(actionType, position);
        
        // Check if chrome.runtime is available
        if (typeof chrome === 'undefined' || !chrome || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
          console.error('Chrome runtime API is not available');
          resultContainer.innerHTML = '<p style="color:red; font-weight:bold !important;">Error:</p><p>Extension API not available. Please reload the page.</p>';
          return;
        }
        
        // Retrieve saved context from storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get('savedContext', (data) => {
            const context = data.savedContext || null;
            
            try {
              // Send to background script with action type and context
              chrome.runtime.sendMessage({
                action: "processText",
                selectedText: selectedText,
                actionType: actionType,
                context: context
              }, (response) => {
            // Check for extension context invalidation
            if (chrome.runtime && chrome.runtime.lastError) {
              const error = chrome.runtime.lastError;
              console.error('Error:', error);
              let errorMessage = error.message || 'Unknown error';
              if (errorMessage.includes('Extension context invalidated')) {
                errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
              }
              resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
              return;
            }

            // Handle response immediately if available
            if (response && response.success) {
              if (response.aiResponse) {
                displayActionResult(resultContainer, actionType, response.aiResponse.response);
              } else if (response.prompts) {
                displayActionResult(resultContainer, actionType, response.prompts);
              }
            }

            // Also wait for storage update as fallback
            setTimeout(() => {
              chrome.storage.local.get('lastResponse', (data) => {
                if (data.lastResponse && document.getElementById('promptify-result-content')) {
                  const { result, error } = data.lastResponse;
                  if (error) {
                    resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${error}</p>`;
                  } else if (result) {
                    if (result.type === 'ai-response') {
                      displayActionResult(resultContainer, result.action || actionType, result.response);
                    } else if (Array.isArray(result)) {
                      displayActionResult(resultContainer, actionType, result);
                    }
                  }
                }
              });
            }, 500);
          });
            } catch (error) {
              console.error('Error sending message:', error);
              let errorMessage = error.message || 'Unknown error';
              if (errorMessage.includes('Extension context invalidated')) {
                errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
              }
              resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
            }
          });
        } else {
          // If storage is not available, send without context
          try {
            chrome.runtime.sendMessage({
              action: "processText",
              selectedText: selectedText,
              actionType: actionType,
              context: null
            }, (response) => {
              // Check for extension context invalidation
              if (chrome.runtime && chrome.runtime.lastError) {
                const error = chrome.runtime.lastError;
                console.error('Error:', error);
                let errorMessage = error.message || 'Unknown error';
                if (errorMessage.includes('Extension context invalidated')) {
                  errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
                }
                resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
                return;
              }

              // Handle response immediately if available
              if (response && response.success) {
                if (response.aiResponse) {
                  displayActionResult(resultContainer, actionType, response.aiResponse.response);
                } else if (response.prompts) {
                  displayActionResult(resultContainer, actionType, response.prompts);
                }
              }

              // Also wait for storage update as fallback
              setTimeout(() => {
                chrome.storage.local.get('lastResponse', (data) => {
                  if (data.lastResponse && document.getElementById('promptify-result-content')) {
                    const { result, error } = data.lastResponse;
                    if (error) {
                      resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${error}</p>`;
                    } else if (result) {
                      if (result.type === 'ai-response') {
                        displayActionResult(resultContainer, result.action || actionType, result.response);
                      } else if (Array.isArray(result)) {
                        displayActionResult(resultContainer, actionType, result);
                      }
                    }
                  }
                });
              }, 500);
            });
          } catch (error) {
            console.error('Error sending message:', error);
            let errorMessage = error.message || 'Unknown error';
            if (errorMessage.includes('Extension context invalidated')) {
              errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
            }
            resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
          }
        }
      }

      // Handle text selection (only for compare mode - toolbar opening moved to Shift+O)
      document.addEventListener('mouseup', (event) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();
        
        // Handle compare mode - user has selected second text
        if (isWaitingForCompare && selectedText && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          isWaitingForCompare = false;
          
          // Get position for result panel (below selection)
          const rect = range.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          const position = {
            left: Math.max(10, Math.min(rect.left + scrollLeft, scrollLeft + window.innerWidth - 620)),
            top: rect.bottom + scrollTop + 10
          };

          // Create result panel
          const resultContainer = createResultPanel('compare', position);
          
          // Check if chrome.runtime is available
          if (typeof chrome === 'undefined' || !chrome || !chrome.runtime || typeof chrome.runtime.sendMessage !== 'function') {
            console.error('Chrome runtime API is not available');
            resultContainer.innerHTML = '<p style="color:red; font-weight:bold !important;">Error:</p><p>Extension API not available. Please reload the page.</p>';
            firstCompareText = null;
            return;
          }
          
          // Retrieve saved context from storage and send compare request
          if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get('savedContext', (data) => {
              const context = data.savedContext || null;
              
              try {
                // Send to background script with both texts for compare
                chrome.runtime.sendMessage({
                  action: "processText",
                  selectedText: selectedText, // second text
                  actionType: 'compare',
                  context: context,
                  text1: firstCompareText, // first text
                  text2: selectedText // second text
                }, (response) => {
                  // Check for extension context invalidation
                  if (chrome.runtime && chrome.runtime.lastError) {
                    const error = chrome.runtime.lastError;
                    console.error('Error:', error);
                    let errorMessage = error.message || 'Unknown error';
                    if (errorMessage.includes('Extension context invalidated')) {
                      errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
                    }
                    resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
                    firstCompareText = null;
                    return;
                  }

                  // Handle response immediately if available
                  if (response && response.success) {
                    if (response.aiResponse) {
                      displayActionResult(resultContainer, 'compare', response.aiResponse.response);
                    } else if (response.prompts) {
                      displayActionResult(resultContainer, 'compare', response.prompts);
                    }
                  }

                  // Also wait for storage update as fallback
                  setTimeout(() => {
                    chrome.storage.local.get('lastResponse', (data) => {
                      if (data.lastResponse && document.getElementById('promptify-result-content')) {
                        const { result, error } = data.lastResponse;
                        if (error) {
                          resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${error}</p>`;
                        } else if (result) {
                          if (result.type === 'ai-response') {
                            displayActionResult(resultContainer, result.action || 'compare', result.response);
                          } else if (Array.isArray(result)) {
                            displayActionResult(resultContainer, 'compare', result);
                          }
                        }
                      }
                    });
                  }, 500);
                  
                  // Reset compare state
                  firstCompareText = null;
                });
              } catch (error) {
                console.error('Error sending message:', error);
                let errorMessage = error.message || 'Unknown error';
                if (errorMessage.includes('Extension context invalidated')) {
                  errorMessage = 'Extension was reloaded. Please refresh this page to continue using Promptify AI.';
                }
                resultContainer.innerHTML = `<p style="color:red; font-weight:bold !important;">Error:</p><p>${errorMessage}</p>`;
                firstCompareText = null;
              }
            });
          }
          
          return;
        }
        
        // No longer automatically showing toolbar on selection
        // Toolbar will be shown via Shift+O keyboard shortcut
      });

      // Handle keyboard shortcut (x key) to show toolbar
      document.addEventListener('keydown', (event) => {
        // Only trigger if x key is pressed and text is selected
        if (event.key === 'x' || event.key === 'X') {
          const selection = window.getSelection();
          const selectedText = selection.toString().trim();
          
          if (selectedText && selection.rangeCount > 0 && !selectionToolbar) {
            const range = selection.getRangeAt(0);
            event.preventDefault();
            showSelectionToolbar(selectedText, range);
          }
        }
      });

      // Handle keyboard shortcut (Shift+O) to show toolbar if text is selected, or open Promptify popup
      document.addEventListener('keydown', async (event) => {
        // Check if Shift+O is pressed (O key with Shift modifier)
        if (event.key === 'O' && event.shiftKey) {
          // Don't trigger if user is typing in an input/textarea
          const activeElement = document.activeElement;
          const isInputFocused = activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.isContentEditable
          );
          
          if (!isInputFocused) {
            event.preventDefault();
            
            // Check authentication first
            const authenticated = await checkAuthState();
            if (!authenticated) {
              // Open popup to show auth screen
              if (typeof window.promptifyShowPopup === 'function') {
                window.promptifyShowPopup();
              }
              return;
            }
            
            // Check if text is selected - if yes, show toolbar; if no, open popup
            const selection = window.getSelection();
            const selectedText = selection.toString().trim();
            
            if (selectedText && selection.rangeCount > 0) {
              // Text is selected - show toolbar
              const range = selection.getRangeAt(0);
              showSelectionToolbar(selectedText, range);
            } else {
              // No text selected - open Promptify popup
              if (typeof window.promptifyShowPopup === 'function') {
                window.promptifyShowPopup();
              }
            }
          }
        }
      });

      // Hide toolbar on scroll
      window.addEventListener('scroll', () => {
        hideSelectionToolbar();
      }, true);

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
