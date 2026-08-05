# 🚀 Promptify AI - Complete Documentation

A powerful Chrome Extension that transforms your text selections into high-quality AI prompts and provides direct AI-powered responses. Built with authentication, MongoDB integration, and seamless user experience.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Usage Guide](#usage-guide)
- [API Endpoints](#api-endpoints)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Promptify AI** is a comprehensive Chrome Extension that helps users:

1. **Generate Structured Prompts** - Transform unstructured text into high-quality, executable AI prompts
2. **Get Direct AI Responses** - Receive instant explanations, summaries, examples, and comparisons
3. **Work with Context** - Build context-aware prompts by saving background information
4. **Compare Content** - Compare two pieces of text side-by-side with AI analysis

The extension consists of three main components:
- **Chrome Extension** - User interface and interaction layer
- **Node.js Backend API** - Authentication, prompt generation, and AI integration
- **MongoDB Database** - User account storage and authentication

---

## ✨ Key Features

### 🔐 Authentication
- **Sign Up/Login** - Email and password authentication with optional username
- **Google OAuth** - Sign in with Google account (placeholder for full implementation)
- **Session Management** - JWT-based authentication with 30-day token expiration
- **Secure Storage** - Passwords hashed with bcrypt before storage

### ⌨️ Keyboard Shortcuts
- **Shift+O** (No selection) - Opens prompt generator popup
- **Shift+O** (With selection) - Opens full toolbar with action buttons

### 🎯 Selection Toolbar Actions
When text is selected and Shift+O is pressed, a toolbar appears with:

1. **Explain** - Get detailed explanations of selected text
2. **Summarize** - Receive concise summaries
3. **Give Example** - Get practical examples related to the concept
4. **Compare** - Two-step comparison (select first text, click Compare, select second text)
5. **Add Context** - Save context for future prompts
6. **Prompt** - Generate structured prompts from selection

### 📝 Prompt Generation
- **Structured Prompts** - Role-Task-Context-Format-Goal structure
- **Spell Correction** - Automatic correction of spelling mistakes
- **Context-Aware** - Uses saved context when available
- **Multiple Formats** - Generates 2 distinct prompt variations

### 🤖 Direct AI Responses
- **Real-time AI** - Direct integration with Gemini API
- **Formatted Output** - Markdown support (bold, italic, code blocks)
- **Result Panels** - Beautiful gradient panels for displaying responses
- **Copy Functionality** - Easy copy-to-clipboard for all responses

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Browser                       │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │         Extension Popup (popup.html)            │  │
│  │  - Authentication UI (Signup/Login)              │  │
│  │  - User info & Instructions                      │  │
│  └──────────────────┬──────────────────────────────┘  │
│                     │                                   │
│  ┌──────────────────▼──────────────────────────────┐  │
│  │      Content Script (content.js)                │  │
│  │  - Selection Toolbar                            │  │
│  │  - Result Panels                                │  │
│  │  - Keyboard Shortcuts (Shift+O)                 │  │
│  └──────────────────┬──────────────────────────────┘  │
│                     │                                   │
│  ┌──────────────────▼──────────────────────────────┐  │
│  │   Background Script (background.js)             │  │
│  │  - API Communication                           │  │
│  │  - Storage Management                          │  │
│  └──────────────────┬──────────────────────────────┘  │
└─────────────────────┼───────────────────────────────────┘
                      │
                      │ HTTP Requests
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Backend API (Express.js)                   │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Authentication Routes                          │
│  │  - /api/auth/signup                             │  │
│  │  - /api/auth/login                              │  │
│  │  - /api/auth/google                             │  │
│  │  - /api/auth/verify                             │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Prompt Generation                              │  │
│  │  - /api/generate                                │  │
│  │  - Spell Correction                            │  │
│  │  - Context Integration                         │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  AI Integration (Gemini API)                    │  │
│  │  - Direct AI Responses                         │  │
│  │  - Explain, Summarize, Examples, Compare      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              MongoDB Database (Atlas)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  User Collection                                 │  │
│  │  - Email, Username, Password (hashed)            │  │
│  │  - Google ID (for OAuth)                        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### **Backend (`/backend`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | Latest | JavaScript runtime environment |
| **Express.js** | ^5.1.0 | Web framework for RESTful APIs |
| **MongoDB** | - | User account storage (via Mongoose) |
| **Mongoose** | ^8.17.0 | MongoDB object modeling |
| **bcrypt** | ^6.0.0 | Password hashing for security |
| **jsonwebtoken** | ^9.0.3 | JWT token generation for authentication |
| **CORS** | ^2.8.5 | Cross-Origin Resource Sharing |
| **Axios** | ^1.11.0 | HTTP client for Gemini API calls |
| **natural** | ^8.1.0 | Natural language processing (spell correction) |
| **spellchecker** | ^3.7.1 | Advanced spell checking |
| **dotenv** | ^17.2.1 | Environment variable management |
| **Vercel** | - | Serverless deployment platform |

**Backend Features:**
- User authentication (signup/login)
- JWT token generation and verification
- Password hashing with bcrypt
- MongoDB user storage
- Prompt generation with spell correction
- Direct AI API integration (Gemini)
- Context-aware prompt generation

---

### **Chrome Extension (`/extension`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **Chrome Extension API** | Manifest V3 | Browser extension framework |
| **Service Worker** | - | Background script execution |
| **Content Scripts** | - | Page injection and interaction |
| **Chrome Storage API** | - | Local data persistence |
| **Chrome Runtime API** | - | Inter-component messaging |
| **Vanilla JavaScript** | ES6+ | Core extension logic |

**Extension Components:**

1. **`popup.html` + `popup.js`**
   - Authentication UI (signup/login forms)
   - User status display (logged in + username)
   - Usage instructions
   - Logout functionality

2. **`content.js`** (Content Script)
   - Selection toolbar injection
   - Keyboard shortcut handling (Shift+O)
   - Result panel creation
   - Context management
   - Compare mode (two-step process)

3. **`background.js`** (Service Worker)
   - API communication with backend
   - Message routing
   - Storage management
   - Error handling

4. **`floating-popup.css`**
   - Selection toolbar styles
   - Result panel styling
   - Auth form styles
   - Responsive design

**Extension Features:**
- Authentication state management
- Keyboard shortcuts (Shift+O)
- Text selection detection
- Action toolbar (Explain, Summarize, etc.)
- Context saving and retrieval
- Two-step compare functionality
- Direct AI response display
- Copy-to-clipboard functionality

---

### **UI Builder (`/ui-builder`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **React** | ^19.1.0 | UI component library |
| **Vite** | ^7.0.4 | Fast build tool and dev server |
| **ESLint** | ^9.30.1 | Code quality and linting |

**Note:** The UI Builder is primarily for development. The extension popup now uses a custom HTML/JS implementation for authentication.

---

## 📁 Project Structure

```
promptify_ai/
├── backend/                      # Node.js API Server
│   ├── index.js                 # Main Express server + Auth routes
│   ├── models/
│   │   ├── userModel.js         # User schema (Mongoose)
│   │   └── promptModel.js       # Prompt model (optional)
│   ├── package.json             # Backend dependencies
│   ├── vercel.json              # Vercel deployment config
│   └── .env                     # Environment variables (not in git)
│
├── extension/                    # Chrome Extension
│   ├── popup.html               # Extension popup (auth + instructions)
│   ├── popup.js                 # Popup logic (auth handling)
│   ├── content.js               # Content script (toolbar, shortcuts)
│   ├── background.js            # Service worker (API communication)
│   ├── floating-popup.css       # Styles (toolbar, panels, auth)
│   ├── manifest.json            # Extension manifest (V3)
│   └── dist/                    # Built React files (legacy)
│
├── ui-builder/                  # React Development (Optional)
│   ├── src/
│   │   ├── App.jsx              # React component
│   │   └── main.jsx             # Entry point
│   ├── dist/                    # Production build
│   └── package.json             # Frontend dependencies
│
├── AUTHENTICATION_SETUP.md      # Auth setup guide
├── MONGODB_SETUP.md             # MongoDB Atlas setup
├── RUN_INSTRUCTIONS.md          # How to run the project
└── README.md                    # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Google Chrome** browser
- **MongoDB Atlas** account (free tier) - See [MONGODB_SETUP.md](./MONGODB_SETUP.md)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd promptify_ai
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

**Install authentication dependencies:**
```bash
npm install bcrypt jsonwebtoken
```

**Create `.env` file:**
```env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promptify_ai?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
GEMINI_API_KEY=your-gemini-api-key-here
```

**Start the server:**
```bash
npm start
```

You should see:
```
✅ Successfully connected to MongoDB.
🚀 Server is running on http://localhost:8000
```

#### 3. Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `extension/` folder
5. Extension should appear in your extensions list

#### 4. Test Authentication

1. Click the extension icon in Chrome toolbar
2. You should see the signup form
3. Create an account with email and password
4. After signup, you'll see:
   - ✅ Logged in status with username
   - Instructions for using the extension

---

## 🔐 Authentication

### Sign Up
- **Email** (required)
- **Username** (optional, defaults to email prefix)
- **Password** (required, hashed with bcrypt)

### Sign In
- **Email** (required)
- **Password** (required)

### Authentication Flow

1. User opens extension popup
2. If not authenticated → Shows signup/login forms
3. User signs up or logs in
4. Backend validates credentials
5. JWT token generated and stored in `chrome.storage.local`
6. User info (email, username) stored
7. Popup updates to show logged-in view
8. All extension features become accessible

### Session Management
- **Token Expiration**: 30 days
- **Storage**: `chrome.storage.local` (persists across browser sessions)
- **Logout**: Clears token and user info

**For detailed setup instructions, see:**
- [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)
- [MONGODB_SETUP.md](./MONGODB_SETUP.md)

---

## 📖 Usage Guide

### Basic Usage

#### 1. Open Prompt Generator
- Press **Shift+O** on any webpage (no text selected)
- A popup overlay appears with prompt generation interface
- Enter your text and click "Generate Prompt"

#### 2. Use Selection Toolbar
1. **Select text** on any webpage
2. Press **Shift+O**
3. Toolbar appears below selection with actions:
   - Explain
   - Summarize
   - Give Example
   - Compare
   - Add Context
   - Prompt

#### 3. Get Direct AI Responses
- Click **Explain**, **Summarize**, or **Give Example**
- AI response appears in a result panel below the selection
- Response is formatted with markdown support
- Click the copy button to copy the response

#### 4. Use Context Feature
1. Select text that provides context
2. Press **Shift+O** → Click **"Add Context"**
3. Context is saved
4. Select new text and use any action
5. The saved context will be included in the prompt

#### 5. Compare Two Texts
1. Select first text → Press **Shift+O** → Click **"Compare"**
2. Status message: "Please select the second piece of text to compare"
3. Select second text
4. Comparison result appears automatically

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Shift+O** (no selection) | Open prompt generator popup |
| **Shift+O** (with selection) | Show selection toolbar |

---

## 🔌 API Endpoints

### Authentication Endpoints

#### `POST /api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "optional_username",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### `POST /api/auth/login`
Sign in existing user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:** Same as signup

#### `POST /api/auth/google`
Google OAuth authentication (placeholder).

#### `GET /api/auth/verify`
Verify authentication token (requires Bearer token in Authorization header).

### Prompt Generation Endpoint

#### `POST /api/generate`
Generate prompts or get AI responses.

**Request:**
```json
{
  "userText": "your text here",
  "action": "prompt|explain|summarize|example|compare|add-context",
  "context": "optional saved context",
  "text1": "first text for compare",
  "text2": "second text for compare"
}
```

**Response (for 'prompt' action):**
```json
[
  "Generated prompt 1...",
  "Generated prompt 2..."
]
```

**Response (for other actions):**
```json
{
  "type": "ai-response",
  "action": "explain",
  "response": "AI generated explanation..."
}
```

---

## 🔄 Development Workflow

### Backend Development

1. **Edit `backend/index.js`**
2. **Restart server:**
   ```bash
   cd backend
   npm start
   ```
3. **Test endpoints** with Postman, curl, or browser
4. **Check logs** for errors

### Extension Development

1. **Edit extension files:**
   - `extension/popup.html` - Popup UI
   - `extension/popup.js` - Popup logic
   - `extension/content.js` - Content script
   - `extension/background.js` - Background script
   - `extension/floating-popup.css` - Styles

2. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click reload icon on "Promptify AI"
   - Refresh any open webpages

3. **Debug:**
   - Popup: Right-click extension icon → "Inspect popup"
   - Content Script: Browser DevTools (F12)
   - Background: `chrome://extensions/` → Click "service worker" link

### UI Builder Development (Optional)

```bash
cd ui-builder
npm run dev
```

Access at `http://localhost:5173`

---

## 📊 Data Flow

### Authentication Flow
```
User → Popup (Signup/Login) → Backend API → MongoDB
                                    ↓
                            JWT Token Generated
                                    ↓
                            Stored in chrome.storage.local
                                    ↓
                            Extension Features Unlocked
```

### Prompt Generation Flow
```
User Input → Content Script → Background Script → Backend API
                                                          ↓
                                                    Spell Correction
                                                          ↓
                                                    Prompt Generation
                                                          ↓
                                                    Response → Storage
                                                          ↓
                                                    UI Update
```

### Direct AI Response Flow
```
Selected Text + Action → Content Script → Background Script → Backend API
                                                                      ↓
                                                            Gemini API Call
                                                                      ↓
                                                            AI Response
                                                                      ↓
                                                            Result Panel Display
```

---

## 🔐 Environment Variables

### Backend `.env` File

```env
# Server Configuration
PORT=8000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promptify_ai?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# AI Integration
GEMINI_API_KEY=your-gemini-api-key-here
```

**Important:**
- Change `JWT_SECRET` to a strong, random secret in production
- Never commit `.env` file to git
- Set environment variables in Vercel dashboard for deployment

---

## 📦 Deployment

### Backend (Vercel)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd backend
   vercel
   ```

3. **Set Environment Variables:**
   - Go to Vercel dashboard
   - Project → Settings → Environment Variables
   - Add: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`

4. **Update Extension:**
   - Update `API_URL` in `extension/background.js` to Vercel URL
   - Reload extension

### Extension (Chrome Web Store)

1. **Package extension:**
   - Zip the `extension/` folder
   - Or use Chrome's "Pack extension"

2. **Submit to Chrome Web Store:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload package
   - Fill in store listing details
   - Submit for review

---

## 🐛 Troubleshooting

### Extension Context Invalidated Error

**Problem:** "Extension context invalidated" error appears

**Solution:**
1. Reload the extension in `chrome://extensions/`
2. Refresh the webpage
3. The error should be resolved

### Authentication Not Working

**Check:**
1. Backend server is running (`npm start` in backend folder)
2. MongoDB is connected (check backend logs)
3. `.env` file has correct `MONGODB_URI` and `JWT_SECRET`
4. Extension has correct `API_URL` in `background.js`

### AI Responses Not Appearing

**Check:**
1. `GEMINI_API_KEY` is set in backend `.env`
2. API key is valid and has access to `gemini-2.5-flash` model
3. Check backend console for API errors
4. Verify network requests in browser DevTools

### Selection Toolbar Not Appearing

**Check:**
1. User is authenticated (check popup)
2. Text is actually selected (not just highlighted)
3. Press Shift+O after selection
4. Check browser console for errors

### MongoDB Connection Issues

**See:** [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed troubleshooting

---

## 📚 Additional Documentation

- **[AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)** - Complete authentication setup guide
- **[MONGODB_SETUP.md](./MONGODB_SETUP.md)** - MongoDB Atlas setup instructions
- **[RUN_INSTRUCTIONS.md](./RUN_INSTRUCTIONS.md)** - Step-by-step running guide
- **[STRUCTURED_PROMPT_ENGINEERING.md](./STRUCTURED_PROMPT_ENGINEERING.md)** - Prompt generation logic
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing scenarios and examples

---

## 🎨 Design Decisions

### Why Manifest V3?
- Latest Chrome extension standard
- Service workers for better performance
- Enhanced security features

### Why MongoDB Atlas?
- Free tier available
- Cloud-hosted (no local setup)
- Easy scaling
- Automatic backups and monitoring

### Why JWT Tokens?
- Stateless authentication
- Secure and scalable
- 30-day expiration for convenience
- No server-side session storage needed

### Why Gemini API?
- Free tier available
- Fast response times
- Good quality outputs
- Easy integration

---

## 🔮 Future Enhancements

- [x] User authentication
- [x] MongoDB integration
- [x] Direct AI responses
- [x] Context management
- [x] Compare functionality
- [x] Keyboard shortcuts
- [ ] Full Google OAuth implementation
- [ ] Prompt history storage
- [ ] User preferences
- [ ] Export/import prompts
- [ ] Analytics dashboard
- [ ] Multi-language support

---

## 📝 License

ISC

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues or questions:
- Check documentation files in the project root
- Review browser console for errors
- Check backend server logs
- Verify environment variables are set correctly

---

