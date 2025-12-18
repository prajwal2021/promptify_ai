# 🚀 How to Run Promptify AI

## ✅ Current Status

**Backend Server:** ✅ Running on http://localhost:8000

---

## 📋 Quick Start Guide

### 1. Backend Server (Already Running)
```bash
cd backend
npm start
```
**Status:** ✅ Currently running on port 8000

### 2. Load Chrome Extension

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **"Load unpacked"**
4. Select the `extension/` folder:
   ```
   /Users/prajwal/Documents/CODE_PROJECTS/promptify_ai/extension
   ```
5. The extension should appear in your extensions list

### 3. Test the Extension

1. Click the extension icon in Chrome toolbar
2. Enter some text in the textarea (e.g., "Write an email about a meeting")
3. Click **"Generate Prompt"**
4. You should see 2 generated prompts appear below

---

## 🔧 Development Mode

### UI Builder (React Development)
If you want to develop the UI with hot-reload:
```bash
cd ui-builder
npm run dev
```
This starts Vite dev server on http://localhost:5173

**Note:** The extension uses its own built `main.js`, so dev server is only for UI development/testing.

### Rebuild Extension UI
If you make changes to `ui-builder/src/`:
```bash
cd ui-builder
npm run build
# Then copy dist files to extension/ if needed
```

---

## 🐛 Troubleshooting

### Backend Not Running?
```bash
cd backend
npm install  # If dependencies missing
npm start
```

### Extension Not Working?
1. Check browser console (F12) for errors
2. Check extension service worker logs:
   - Go to `chrome://extensions/`
   - Find "Promptify AI"
   - Click "service worker" link
3. Verify backend is running: http://localhost:8000

### API Connection Issues?
- Make sure backend is running on port 8000
- Check `extension/background.js` has correct API_URL
- Verify manifest.json has `http://localhost:8000/*` permission

---

## 📝 Current Setup

- **Backend:** http://localhost:8000 ✅ Running
- **Extension:** Needs to be loaded in Chrome
- **UI Builder:** Optional (for development)

---

## 🎯 Next Steps

1. ✅ Backend is running
2. ⏳ Load extension in Chrome (see step 2 above)
3. ⏳ Test the extension popup

---

## 📞 Quick Commands

```bash
# Start backend
cd backend && npm start

# Start UI dev server (optional)
cd ui-builder && npm run dev

# Build UI for production
cd ui-builder && npm run build
```




