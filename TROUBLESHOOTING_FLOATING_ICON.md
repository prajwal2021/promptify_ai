# 🔧 Troubleshooting Floating Icon

## Issue: Floating Icon Not Appearing

### Step 1: Reload Extension Properly
1. Go to `chrome://extensions/`
2. Find "Promptify AI"
3. Click the **reload button** (circular arrow icon)
4. Wait for it to finish reloading

### Step 2: Refresh the Webpage
1. After reloading extension, **refresh the webpage** you're on
2. The content script only runs when pages load
3. Press `F5` or `Cmd+R` (Mac) / `Ctrl+R` (Windows)

### Step 3: Check Browser Console
1. Open Developer Tools: `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. Go to **Console** tab
3. Look for messages starting with "Promptify:"
   - Should see: `Promptify: Initializing floating icon...`
   - Should see: `Promptify: Container added to DOM`
   - Should see: `Promptify: Initialization complete!`
4. Check for any **red error messages**

### Step 4: Check Extension Errors
1. Go to `chrome://extensions/`
2. Find "Promptify AI"
3. Click **"service worker"** link (if available)
4. Check for any errors in the service worker console

### Step 5: Verify Files Exist
Make sure these files exist in the `extension/` folder:
- ✅ `content.js`
- ✅ `floating-popup.css`
- ✅ `manifest.json`

### Step 6: Check Manifest Permissions
Open `extension/manifest.json` and verify:
```json
"content_scripts": [
  {
    "matches": [ "<all_urls>" ],
    "js": [ "content.js" ],
    "css": [ "floating-popup.css" ]
  }
]
```

### Step 7: Test on Different Page
Try visiting a simple page like:
- `https://www.google.com`
- `https://www.wikipedia.org`

Some pages might block content scripts.

### Step 8: Check for Conflicts
1. Disable other extensions temporarily
2. Some extensions might interfere with content scripts
3. Try in **Incognito mode** with only your extension enabled

### Step 9: Manual Check
1. Open Developer Tools (`F12`)
2. Go to **Console** tab
3. Type: `document.getElementById('promptify-floating-container')`
4. If it returns `null`, the script didn't run
5. If it returns an element, check CSS (might be hidden)

### Step 10: Check CSS
1. Open Developer Tools (`F12`)
2. Go to **Elements** tab
3. Search for `promptify-floating-container`
4. Check if it exists and has styles applied
5. Check if `z-index` is high enough (should be 999999)

## Common Issues

### Issue: Icon appears but is invisible
**Solution**: Check CSS file is loading. Look in Network tab for `floating-popup.css`

### Issue: Console shows errors
**Solution**: Check the error message and fix accordingly. Common issues:
- `chrome.runtime is undefined` → Extension not loaded properly
- `Cannot read property 'appendChild'` → DOM not ready (should be fixed now)

### Issue: Icon appears on some pages but not others
**Solution**: Some pages (like `chrome://` pages) don't allow content scripts. This is normal.

## Quick Fix Commands

In browser console, try:
```javascript
// Check if container exists
document.getElementById('promptify-floating-container')

// Manually inject if missing
// (Copy and paste the entire content.js code)
```

## Still Not Working?

1. **Check extension version** - Make sure you're using the latest code
2. **Clear browser cache** - Sometimes old cached files cause issues
3. **Reinstall extension** - Remove and re-add the extension
4. **Check Chrome version** - Make sure you're using a recent Chrome version

## Expected Behavior

When working correctly:
- ✅ Icon appears on right side of page (20px from edges)
- ✅ Icon is purple circular button with sparkle icon
- ✅ Clicking icon opens popup overlay
- ✅ Popup is centered with dark backdrop
- ✅ Console shows "Promptify: Initialization complete!"



