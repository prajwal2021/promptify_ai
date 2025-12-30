// Popup script to handle authentication and display user info
(function() {
  'use strict';

  // Production: Uses Vercel deployment URL
  const API_URL = 'https://promptify-ai-three.vercel.app';
  
  // For local development: Comment out the Vercel URL above and uncomment the localhost line below
  // const API_URL = 'http://localhost:8000';

  // Get DOM elements
  const loggedInContent = document.getElementById('logged-in-content');
  const notLoggedInContent = document.getElementById('not-logged-in-content');
  const userInfoDiv = document.getElementById('user-info');
  const usernameDisplay = document.getElementById('username-display');
  const signupView = document.getElementById('signup-view');
  const loginView = document.getElementById('login-view');
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const switchToLogin = document.getElementById('switch-to-login');
  const switchToSignup = document.getElementById('switch-to-signup');
  const googleSignupBtn = document.getElementById('google-signup-btn');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const authError = document.getElementById('auth-error');
  const logoutBtn = document.getElementById('logout-btn');

  // Show error message
  function showError(message) {
    authError.textContent = message;
    authError.classList.add('show');
    setTimeout(() => {
      authError.classList.remove('show');
    }, 5000);
  }

  // Hide error message
  function hideError() {
    authError.classList.remove('show');
  }

  // Check authentication state and update UI
  function checkAuthAndUpdateUI() {
    chrome.storage.local.get(['authToken', 'userInfo'], (data) => {
      const isAuthenticated = !!data.authToken;
      const userInfo = data.userInfo || null;

      if (isAuthenticated && userInfo) {
        // User is logged in
        loggedInContent.style.display = 'block';
        notLoggedInContent.style.display = 'none';
        userInfoDiv.style.display = 'flex';
        
        // Display username (fallback to email if username not available)
        const displayName = userInfo.username || userInfo.email || 'User';
        usernameDisplay.textContent = displayName;
      } else {
        // User is not logged in
        loggedInContent.style.display = 'none';
        notLoggedInContent.style.display = 'block';
        userInfoDiv.style.display = 'none';
      }
    });
  }

  // Switch between signup and login views
  switchToLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupView.classList.remove('active');
    loginView.classList.add('active');
    hideError();
  });

  switchToSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginView.classList.remove('active');
    signupView.classList.add('active');
    hideError();
  });

  // Signup handler
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('signup-email').value;
    const username = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;
    const signupBtn = document.getElementById('signup-btn');

    if (!email || !password) {
      showError('Email and password are required');
      return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = 'Signing up...';
    signupForm.classList.add('loading');

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
        showError(`Server error: ${response.status} ${response.statusText}. ${text}`);
        return;
      }

      if (response.ok && data.success) {
        chrome.storage.local.set({ 
          authToken: data.token,
          userInfo: data.user || { email: email, username: username }
        }, () => {
          checkAuthAndUpdateUI();
        });
      } else {
        showError(data.error || data.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      showError(`Failed to connect to server: ${error.message}. Please check if the backend is running at ${API_URL}`);
    } finally {
      signupBtn.disabled = false;
      signupBtn.textContent = 'Sign Up';
      signupForm.classList.remove('loading');
    }
  });

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const loginBtn = document.getElementById('login-btn');

    if (!email || !password) {
      showError('Email and password are required');
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Signing in...';
    loginForm.classList.add('loading');

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
        showError(`Server error: ${response.status} ${response.statusText}. ${text}`);
        return;
      }

      if (response.ok && data.success) {
        chrome.storage.local.set({ 
          authToken: data.token,
          userInfo: data.user || { email: email }
        }, () => {
          checkAuthAndUpdateUI();
        });
      } else {
        showError(data.error || data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      showError(`Failed to connect to server: ${error.message}. Please check if the backend is running at ${API_URL}`);
    } finally {
      loginBtn.disabled = false;
      loginBtn.textContent = 'Sign In';
      loginForm.classList.remove('loading');
    }
  });

  // Google OAuth handler (placeholder)
  async function handleGoogleAuth() {
    showError('Google OAuth is not yet fully implemented. Please use email/password for now.');
  }

  googleSignupBtn.addEventListener('click', handleGoogleAuth);
  googleLoginBtn.addEventListener('click', handleGoogleAuth);

  // Logout handler
  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['authToken', 'userInfo'], () => {
      checkAuthAndUpdateUI();
      // Reset forms
      signupForm.reset();
      loginForm.reset();
      signupView.classList.add('active');
      loginView.classList.remove('active');
    });
  });

  // Check auth state when popup opens
  checkAuthAndUpdateUI();

  // Also listen for storage changes (in case user logs in/out in another tab)
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && (changes.authToken || changes.userInfo)) {
      checkAuthAndUpdateUI();
    }
  });
})();
