# MongoDB Setup Guide for Promptify AI

MongoDB is required to store user accounts and authentication data. This guide will help you set up MongoDB Atlas (free cloud database) in just a few minutes.

## Option 1: MongoDB Atlas (Recommended - Free Cloud Database)

MongoDB Atlas offers a free tier (M0) that's perfect for development and small projects.

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account (or sign in if you already have one)

### Step 2: Create a Cluster

1. After logging in, click **"Build a Database"** or **"Create"**
2. Choose the **FREE (M0)** tier
3. Select a cloud provider and region (choose the closest to you)
4. Click **"Create"** (cluster name is optional)

### Step 3: Create Database User

1. In the **Security** section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter a username (e.g., `promptify_user`)
5. Click **"Autogenerate Secure Password"** or create your own
6. **IMPORTANT**: Copy the password - you'll need it for the connection string!
7. Under **"Database User Privileges"**, select **"Atlas admin"** or **"Read and write to any database"**
8. Click **"Add User"**

### Step 4: Configure Network Access

1. In the **Security** section, click **"Network Access"**
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
   - **Note**: For production, restrict this to your server's IP address
4. Click **"Confirm"**

### Step 5: Get Connection String

1. Go back to **"Database"** (or **"Clusters"**)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** as the driver
5. Copy the connection string (it looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

### Step 6: Update Your .env File

1. Open `backend/.env`
2. Replace `<username>` and `<password>` in the connection string with your database user credentials
3. Add a database name at the end (before `?retryWrites`), e.g., `promptify_ai`:

```env
MONGODB_URI=mongodb+srv://promptify_user:your_password@cluster0.xxxxx.mongodb.net/promptify_ai?retryWrites=true&w=majority
JWT_SECRET=your-jwt-secret-key-here
```

**Example:**
```env
MONGODB_URI=mongodb+srv://promptify_user:MySecurePass123@cluster0.abc123.mongodb.net/promptify_ai?retryWrites=true&w=majority
JWT_SECRET=my-super-secret-jwt-key-12345
```

### Step 7: Test the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. You should see: `✅ Successfully connected to MongoDB.`

3. If you see an error, check:
   - The username and password in the connection string
   - Network access is configured (IP whitelist)
   - The connection string format is correct

## Option 2: Local MongoDB (Advanced)

If you prefer to run MongoDB locally:

1. **Install MongoDB Community Edition:**
   - macOS: `brew install mongodb-community`
   - Windows: Download from [mongodb.com/download](https://www.mongodb.com/try/download/community)
   - Linux: Follow [MongoDB installation guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB:**
   ```bash
   mongod
   ```

3. **Update .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/promptify_ai
   ```

## Troubleshooting

### "Database not connected" Error

- Check that `MONGODB_URI` is set in your `.env` file
- Verify the connection string format
- Ensure MongoDB Atlas network access allows your IP
- Check that the username and password are correct

### Connection Timeout

- Verify your IP address is whitelisted in MongoDB Atlas
- Check your internet connection
- Try using `0.0.0.0/0` for development (allows all IPs)

### Authentication Failed

- Double-check the username and password in the connection string
- Ensure the database user has proper permissions
- Make sure special characters in the password are URL-encoded

## Quick Start Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created a free cluster
- [ ] Created database user (saved password)
- [ ] Added IP address to network access (0.0.0.0/0 for dev)
- [ ] Copied connection string
- [ ] Updated `.env` file with `MONGODB_URI`
- [ ] Added `JWT_SECRET` to `.env`
- [ ] Started backend server and verified connection

Once you see `✅ Successfully connected to MongoDB.`, you're ready to use authentication!

