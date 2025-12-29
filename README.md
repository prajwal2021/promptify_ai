# 🚀 Promptify AI - Project Documentation

A comprehensive AI prompt generation tool consisting of a Chrome Extension, React UI, and Node.js backend API.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Component Breakdown](#component-breakdown)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

**Promptify AI** is a multi-component application that helps users generate high-quality AI prompts. It consists of:

1. **Chrome Extension** - Floating icon interface that works on any webpage
2. **React UI Builder** - Modern web interface for prompt generation
3. **Node.js Backend API** - Server that processes requests and generates prompts

---

## 🏗️ Architecture

```
┌─────────────────┐
│  Chrome Browser │
│                 │
│  ┌───────────┐  │
│  │ Extension │  │
│  │ (Popup +  │  │
│  │  Floating)│  │
│  └─────┬─────┘  │
│        │        │
│        ▼        │
│  ┌───────────┐  │
│  │Background │  │
│  │  Script   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
│  Port: 8000     │
└─────────────────┘
```

---

## 🛠️ Technology Stack

### **Backend (`/backend`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | Latest | JavaScript runtime environment for server-side code |
| **Express.js** | ^5.1.0 | Web framework for building RESTful APIs and handling HTTP requests |
| **CORS** | ^2.8.5 | Middleware to enable Cross-Origin Resource Sharing for API access from extension |
| **Axios** | ^1.11.0 | HTTP client library for making API requests (currently unused, reserved for future AI API integration) |
| **Mongoose** | ^8.17.0 | MongoDB object modeling tool for database operations (configured but not actively used) |
| **dotenv** | ^17.2.1 | Environment variable management for configuration (API keys, database URIs) |
| **Vercel** | - | Cloud platform for serverless deployment (configured via `vercel.json`) |
| **llama-node** | ^0.1.6 | Local LLM integration library (installed but not currently used) |
| **Prisma** | ^6.13.0 | Database ORM tool (dev dependency, not actively used) |

**Backend Purpose:**
- Receives prompt generation requests from the extension
- Processes user input and generates AI prompts
- Currently uses template-based generation (can be extended with AI APIs)
- Returns JSON array of generated prompts

---

### **Chrome Extension (`/extension`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **Chrome Extension API** | Manifest V3 | Browser extension framework for Chrome |
| **Service Worker** | - | Background script (`background.js`) that runs independently of web pages |
| **Content Scripts** | - | JavaScript that runs in the context of web pages (`content.js`) |
| **Chrome Storage API** | - | Local storage for extension data (responses, error logs) |
| **Chrome Runtime API** | - | Message passing between extension components |
| **Vanilla JavaScript** | ES6+ | Core logic for extension functionality (no framework) |
| **CSS3** | - | Styling for floating icon and popup overlay |

**Extension Components:**

1. **`background.js`** (Service Worker)
   - Handles API communication with backend
   - Manages message passing between content scripts and popup
   - Stores responses in Chrome storage
   - Error logging and fallback responses

2. **`content.js`** (Content Script)
   - Injects floating icon into web pages
   - Manages popup overlay UI
   - Handles user interactions (clicks, form submissions)
   - Detects text selection on pages

3. **`popup.html`** (Extension Popup)
   - Traditional extension popup interface
   - Uses React (bundled in `main.js`)
   - Alternative UI to floating icon

4. **`floating-popup.css`** (Styles)
   - Styles for floating icon and popup overlay
   - Responsive design for mobile
   - Animations and transitions

**Extension Purpose:**
- Provides floating icon on any webpage
- Opens custom popup overlay for prompt generation
- Communicates with backend API
- Displays generated prompts with copy functionality

---

### **UI Builder (`/ui-builder`)**

| Tool | Version | Purpose |
|------|---------|---------|
| **React** | ^19.1.0 | JavaScript library for building user interfaces |
| **React DOM** | ^19.1.0 | React renderer for web browsers |
| **Vite** | ^7.0.4 | Fast build tool and development server |
| **@vitejs/plugin-react** | ^4.6.0 | Vite plugin for React support (JSX, HMR) |
| **ESLint** | ^9.30.1 | Code linting tool for JavaScript/React |
| **@eslint/js** | ^9.30.1 | ESLint JavaScript configuration |
| **eslint-plugin-react-hooks** | ^5.2.0 | ESLint rules for React Hooks |
| **eslint-plugin-react-refresh** | ^0.4.20 | ESLint plugin for React Fast Refresh |
| **TypeScript Types** | ^19.1.8 | Type definitions for React (dev dependency) |

**UI Builder Purpose:**
- Development environment for React components
- Builds production-ready UI for extension popup
- Hot Module Replacement (HMR) for fast development
- Code quality checks via ESLint

**Build Process:**
- `npm run dev` - Starts Vite dev server (port 5173)
- `npm run build` - Creates production build in `/dist`
- Built files can be used in extension popup

---

## 📁 Project Structure

```
promptify_ai/
├── backend/                 # Node.js API Server
│   ├── index.js            # Main Express server
│   ├── models/             # Database models (Mongoose)
│   │   └── promptModel.js
│   ├── package.json        # Backend dependencies
│   └── vercel.json         # Vercel deployment config
│
├── extension/              # Chrome Extension
│   ├── background.js       # Service worker (API communication)
│   ├── content.js          # Content script (floating icon)
│   ├── popup.html          # Extension popup UI
│   ├── main.js             # Bundled React app (minified)
│   ├── main.css            # Popup styles
│   ├── floating-popup.css  # Floating icon styles
│   └── manifest.json       # Extension manifest (V3)
│
└── ui-builder/             # React Development Environment
    ├── src/
    │   ├── App.jsx         # Main React component
    │   ├── App.css         # Component styles
    │   ├── main.jsx        # React entry point
    │   └── index.css       # Global styles
    ├── dist/               # Production build output
    ├── vite.config.js      # Vite configuration
    └── package.json        # Frontend dependencies
```

---

## 🔧 Component Breakdown

### **1. Backend API (`/backend`)**

**Technology:** Node.js + Express.js

**Key Files:**
- `index.js` - Main server file
  - Sets up Express app
  - Configures CORS middleware
  - Defines `/api/generate` endpoint
  - Handles prompt generation logic

**Dependencies Explained:**
- **Express** - Web server framework
- **CORS** - Allows extension to call API from browser
- **dotenv** - Loads environment variables (`.env` file)
- **Mongoose** - Database connection (MongoDB)
- **Axios** - HTTP client (for future AI API calls)

**Current Implementation:**
- Template-based prompt generation
- Returns array of 2 prompts
- Error handling and logging
- Ready for AI API integration

---

### **2. Chrome Extension (`/extension`)**

**Technology:** Chrome Extension API (Manifest V3)

**Key Files:**

1. **`manifest.json`**
   - Defines extension metadata
   - Declares permissions (storage, host permissions)
   - Registers content scripts and service worker
   - Configures popup action

2. **`background.js`** (Service Worker)
   - Listens for messages from content scripts/popup
   - Makes HTTP requests to backend API
   - Stores responses in Chrome storage
   - Handles errors and timeouts

3. **`content.js`** (Content Script)
   - Injects floating icon into web pages
   - Creates popup overlay UI
   - Handles user interactions
   - Manages form submissions

4. **`floating-popup.css`**
   - Styles for floating icon (position, colors, animations)
   - Popup overlay styles (centered, backdrop)
   - Responsive design
   - Copy button styles

**Extension Features:**
- Floating icon on all webpages
- Custom popup overlay
- Text selection detection
- Copy-to-clipboard functionality
- Error handling and fallback responses

---

### **3. UI Builder (`/ui-builder`)**

**Technology:** React + Vite

**Key Files:**

1. **`src/App.jsx`**
   - Main React component
   - Manages state (input, responses, loading)
   - Handles form submission
   - Listens to Chrome storage changes

2. **`vite.config.js`**
   - Vite build configuration
   - React plugin setup
   - Development server settings

3. **`eslint.config.js`**
   - ESLint rules for React
   - Code quality standards
   - Hooks and refresh rules

**Build Tools:**
- **Vite** - Fast build tool (replaces Webpack)
  - Instant server start
  - Hot Module Replacement (HMR)
  - Optimized production builds
- **ESLint** - Code linting
  - Catches errors early
  - Enforces React best practices
  - Maintains code quality

**Development Workflow:**
1. Edit React components in `src/`
2. Vite dev server provides HMR
3. Build production bundle with `npm run build`
4. Use built files in extension

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Chrome browser
- MongoDB (optional, for future database features)

### Installation

1. **Backend Setup:**
```bash
cd backend
npm install
# Create .env file with:
# PORT=8000
# MONGODB_URI=your_mongodb_uri (optional)
npm start
```

2. **UI Builder Setup:**
```bash
cd ui-builder
npm install
npm run dev  # Development server
# or
npm run build  # Production build
```

3. **Extension Setup:**
- Open Chrome → `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `extension/` folder

---

## 🔄 Development Workflow

### Backend Development
1. Edit `backend/index.js`
2. Server auto-restarts (if using nodemon)
3. Test API with Postman or curl
4. Deploy to Vercel when ready

### Extension Development
1. Edit `extension/content.js` or `background.js`
2. Reload extension in Chrome
3. Refresh webpage to see changes
4. Check browser console for errors

### UI Development
1. Edit `ui-builder/src/App.jsx`
2. Vite HMR updates automatically
3. Build for production: `npm run build`
4. Copy built files to extension if needed

---

## 📊 Data Flow

```
User Input (Extension)
    ↓
Content Script (content.js)
    ↓
Background Script (background.js)
    ↓
HTTP POST Request
    ↓
Backend API (Express)
    ↓
Prompt Generation
    ↓
JSON Response
    ↓
Chrome Storage
    ↓
UI Update (Popup/Floating)
```

---

## 🔐 Environment Variables

**Backend (`.env`):**
```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/promptify (optional)
GEMINI_API_KEY=your_key_here (for future AI integration)
```

---

## 📦 Deployment

### Backend
- **Vercel**: Configured via `vercel.json`
- Deploy: `vercel deploy`
- Environment variables set in Vercel dashboard

### Extension
- Package extension files
- Submit to Chrome Web Store
- Or distribute as `.crx` file

---

## 🎨 Design Decisions

### Why Manifest V3?
- Latest Chrome extension standard
- Service workers instead of background pages
- Better security and performance

### Why Vite?
- Faster than Webpack
- Better developer experience
- Modern build tooling

### Why Express?
- Simple and lightweight
- Easy API development
- Large ecosystem

### Why React?
- Component-based architecture
- Reusable UI components
- Great developer tools

---

## 🔮 Future Enhancements

- [ ] Integrate real AI API (Gemini, OpenAI)
- [ ] MongoDB for prompt history
- [ ] User authentication
- [ ] Prompt templates library
- [ ] Export/import prompts
- [ ] Analytics and usage tracking

---

## 📝 License

ISC

---

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📞 Support

For issues or questions:
- Check `TROUBLESHOOTING_FLOATING_ICON.md`
- Review `PROJECT_REVIEW.md`
- See `RUN_INSTRUCTIONS.md`

---

**Built with ❤️ using modern web technologies**









