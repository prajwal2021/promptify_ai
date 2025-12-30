# Authentication Setup Guide

## Backend Setup

### 1. Install Required Packages

Before running the backend, you need to install the authentication dependencies:

```bash
cd backend
npm install bcrypt jsonwebtoken
```

### 2. Set Up MongoDB

MongoDB is required to store user accounts. Follow the detailed guide in **MONGODB_SETUP.md** to set up MongoDB Atlas (free cloud database).

**Quick steps:**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string

### 3. Environment Variables

Add the following to your `.env` file in the `backend` directory:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/promptify_ai?retryWrites=true&w=majority
```

**Important**: 
- Change `JWT_SECRET` to a strong, random secret in production!
- Replace `username`, `password`, and the cluster URL in `MONGODB_URI` with your actual MongoDB Atlas credentials
- See **MONGODB_SETUP.md** for detailed instructions

### 3. Start the Backend

```bash
cd backend
npm start
```

## Authentication Features

### Sign Up
- Users can sign up with email and password
- Optional username field
- Password is hashed using bcrypt before storage

### Sign In
- Users can sign in with email and password
- JWT token is generated and stored in browser storage

### Google OAuth (Placeholder)
- Google OAuth button is available but requires additional setup
- To fully implement Google OAuth:
  1. Set up a Google Cloud Console project
  2. Configure OAuth 2.0 credentials
  3. Update the `/api/auth/google` endpoint with proper OAuth flow

### Authentication Flow
1. When the extension popup opens, it checks for an authentication token
2. If no token exists, the signup/login screen is shown
3. After successful authentication, the token is stored in `chrome.storage.local`
4. All extension features are blocked until the user is authenticated
5. The Shift+O shortcut will open the auth screen if not authenticated

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Sign in existing user
- `POST /api/auth/google` - Google OAuth authentication (placeholder)
- `GET /api/auth/verify` - Verify authentication token (requires Bearer token)

## Extension Behavior

- **Before Authentication**: Only the authentication screen is accessible
- **After Authentication**: All features (Shift+O, selection toolbar, prompt generation) are available
- **Token Storage**: Authentication token is stored in `chrome.storage.local` with key `authToken`
- **Token Expiration**: Tokens expire after 30 days

## Testing

1. Start the backend server
2. Load the extension in Chrome
3. Press Shift+O to open the popup
4. You should see the signup screen
5. Create an account or sign in
6. After authentication, the main prompt interface should appear

