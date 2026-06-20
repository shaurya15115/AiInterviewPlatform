# AI Interview Platform - Complete Setup Guide

## ⚠️ CRITICAL: READ FIRST

**YOUR OPENAI API KEY WAS EXPOSED** - You must:
1. Go to https://platform.openai.com/account/api-keys
2. Delete the exposed key: `sk-proj-w8b2fEC3FJGKEWquyeSmwb-...`
3. Create a NEW key
4. Use the NEW key below

---

## Prerequisites

- Node.js 16+ installed
- MongoDB running locally (or connection string to remote)
- OpenAI API key (get from https://platform.openai.com)

---

## Step 1: Install Dependencies

```bash
# Server
cd server
npm install

# Client (in new terminal)
cd client
npm install
```

---

## Step 2: Start MongoDB (if local)

**Windows (using MongoDB Community):**
```bash
mongod
```

**Or check if already running:**
```bash
mongo --version  # Check if installed
```

**If not installed, download from:** https://www.mongodb.com/try/download/community

---

## Step 3: Set Environment Variables

### Server (.env file)

**Location:** `server/.env`

```dotenv
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/interviewapp
JWT_SECRET=aB9kL2mN7pQ4rS5tU8vW3xY6zC1dE4fG7hI0jK3lM6nO9pQ2rS5tU8vW1xY4z
OPENAI_API_KEY=your_new_api_key_here
CORS_ORIGIN=http://localhost:3001
NODE_ENV=development
```

**Replace:** `your_new_api_key_here` with your actual OpenAI key

### Client (Update vite.config.js if needed)

No additional config needed - client uses `http://localhost:5000/api`

---

## Step 4: Start the Application

### Terminal 1 - Server

```bash
cd server
npm start
```

**Expected Output:**
```
🔧 Environment Configuration:
  PORT: 5000
  MONGODB_URI: mongodb://127.0.0.1:27017/interviewapp
  JWT_SECRET: ✓ Set
  OPENAI_API_KEY: ✓ Set
  CORS_ORIGIN: http://localhost:3001
  NODE_ENV: development
✓ Connected to MongoDB
✓ Server running on port 5000
```

### Terminal 2 - Client

```bash
cd client
npm run dev
```

**Expected Output:**
```
  ➜  Local:   http://localhost:3001/
```

---

## Step 5: Test the Application

1. Open browser: `http://localhost:3001`
2. Click "Create Account"
3. Register with:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Upload a resume (PDF)
5. Enter a job description (or leave blank for general)
6. Click "Initialize Interview"

---

## Troubleshooting

### ❌ "MongoDB connection error"

**Solution:**
```bash
# Check if MongoDB is running
mongod

# Or check connection string in .env
# Should be: mongodb://127.0.0.1:27017/interviewapp
```

### ❌ "Invalid or expired token"

**Solution:**
- Clear browser localStorage: Press F12 → Application → Local Storage → Delete "token"
- Log in again

### ❌ "CORS error"

**Solution:**
- Verify .env has: `CORS_ORIGIN=http://localhost:3001`
- Restart server: Stop and `npm start` again

### ❌ "OPENAI_API_KEY is not set"

**Solution:**
- Check server/.env exists
- Verify: `OPENAI_API_KEY=sk-...` (not blank)
- Restart server

### ❌ Client won't start (npm run dev error)

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Port 5000 or 3001 already in use

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "Email already exists" | User already registered | Use different email or delete DB |
| "Authentication required" | No token sent | Log in again, clear localStorage |
| "Invalid credentials" | Wrong password | Check email/password |
| "Please upload a resume first" | Resume not parsed | Upload PDF again |
| "Failed to start interview" | OpenAI API error | Check API key is valid |
| "No token provided" | Auth header missing | Check browser sends Authorization header |

---

## Database Reset (if needed)

**Delete all data:**
```bash
# Connect to MongoDB
mongo

# In MongoDB shell:
use interviewapp
db.dropDatabase()
exit
```

---

## Files Modified

- ✅ `server/.env` - Fixed JWT_SECRET and removed exposed API key
- ✅ `server/index.js` - Improved logging
- ✅ `server/middleware/auth.js` - Better error messages
- ✅ `server/controllers/authController.js` - JWT validation
- ✅ `client/src/utils/api.js` - Token sending verification

---

## Next Steps After Getting It Working

1. ✅ Test complete interview flow
2. ✅ Upload resume and verify parsing
3. ✅ Ask questions and verify answers are evaluated
4. ✅ Check results page shows metrics
5. ✅ Verify token persists across page refresh

---

## Production Deployment Checklist

- [ ] Generate new strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Rotate OpenAI API key in production
- [ ] Set `NODE_ENV=production`
- [ ] Use environment-specific .env files
- [ ] Set up MongoDB Atlas or managed DB
- [ ] Configure error tracking (Sentry)
- [ ] Set up logging (Winston/Bunyan)
- [ ] Enable HTTPS only
- [ ] Set CORS_ORIGIN to your production domain

---

## Support

If still having issues:
1. Check all console logs (both browser & terminal)
2. Verify all environment variables are set
3. Make sure MongoDB is running
4. Make sure OpenAI API key is valid
5. Check network tab in DevTools for actual errors

