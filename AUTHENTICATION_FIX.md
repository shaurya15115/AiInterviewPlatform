# Authentication Fix Guide

## The Problem

You're getting "Invalid or expired token" when trying to use the API after login. This is because:

1. Token was created with one JWT_SECRET
2. Server restarted with a different JWT_SECRET
3. Token verification fails because secrets don't match

## The Solution

### Step 1: Set a Strong, Permanent JWT_SECRET

Replace the weak secret with this strong one:

**File:** `server/.env`

```dotenv
JWT_SECRET=aB9kL2mN7pQ4rS5tU8vW3xY6zC1dE4fG7hI0jK3lM6nO9pQ2rS5tU8vW1xY4z
```

**Or generate your own:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and use it.

### Step 2: Clear Old Tokens

**In Browser DevTools (F12):**
1. Go to **Application** tab
2. Click **Local Storage** → **http://localhost:3001**
3. Find key named `token` and delete it
4. Refresh page

**Or run in console:**
```javascript
localStorage.clear()
window.location.reload()
```

### Step 3: Remove Exposed API Key

**File:** `server/.env`

Change:
```
OPENAI_API_KEY=sk-proj-w8b2fEC3FJGKEWquyeSmwb-...
```

To:
```
OPENAI_API_KEY=your_openai_api_key_here
```

Then add your NEW key from https://platform.openai.com/account/api-keys

### Step 4: Restart Everything

**Kill all processes:**
```bash
# Windows
taskkill /F /IM node.exe

# Mac/Linux
pkill node
```

**Start server:**
```bash
cd server
npm start
```

Wait for:
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

**Start client (new terminal):**
```bash
cd client
npm run dev
```

### Step 5: Test the Flow

1. **Clear localStorage** (F12 → Application → Local Storage → Delete everything)
2. **Register new account**:
   - Email: test@example.com
   - Password: test123456
3. **Check DevTools Console** - should see:
   ```
   [API] Sending request with token: ey...
   ```
4. **Upload resume**
5. **Start interview**

---

## Debugging Steps

If still getting "Invalid or expired token":

### Check 1: Verify JWT_SECRET is loaded

In server terminal, look for:
```
🔧 Environment Configuration:
  JWT_SECRET: ✓ Set
```

If it says `✗ NOT SET`, the .env file isn't loading.

### Check 2: Verify Token is Being Sent

**In Browser DevTools (F12):**

1. Go to **Network** tab
2. Make any API call
3. Click the request
4. Look at **Headers** → **Authorization**
5. Should see: `Bearer eyJhbGciOi...`

If header is missing, the token isn't in localStorage.

### Check 3: Verify Token Format

**In Browser Console (F12):**
```javascript
localStorage.getItem('token')
```

Should output something like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzJhMzQ1YzQ1YzI1NzAwMDFhYmM0ZjkiLCJpYXQiOjE3MzA2MzQ1NzcsImV4cCI6MTczMTIzOTM3N30.W9nq1...
```

If it's empty or malformed, token didn't save properly.

### Check 4: Verify Server Can Read JWT_SECRET

Add this to browser console after login:
```javascript
// Copy a token
const token = localStorage.getItem('token')

// The server should be able to decode this
// Check server logs for: "✓ Token generated successfully"
```

### Check 5: Reset Database

If nothing works, reset MongoDB:

**In MongoDB shell:**
```bash
mongo
use interviewapp
db.dropDatabase()
exit
```

Then:
1. Clear localStorage in browser
2. Restart server
3. Register new account
4. Try again

---

## Expected Logs

### Server Startup:
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

### After Registration:
```
🔐 Generating token for user: 672a345c45c2570001abc4f9
✓ Token generated successfully
```

### When Making API Calls:
```
[API] Sending request with token: eyJhbGciOi...
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "JWT_SECRET NOT SET" | Check `server/.env` exists and has JWT_SECRET line |
| "Invalid credentials" on login | Use registered email and correct password |
| "No token in localStorage" | Token wasn't returned from login - check server logs |
| "Authorization header missing" | Token exists but not being sent - check interceptor |
| "Token keeps expiring" | 7-day expiry is normal, implement refresh tokens |
| "CORS error" | Verify CORS_ORIGIN in .env matches client port (3001) |

---

## Long-term Fix (Production)

1. **Use environment-specific .env files:**
   - `.env.development`
   - `.env.production`
   - `.env.test`

2. **Use secrets management:**
   - AWS Secrets Manager
   - Vault
   - HashiCorp Consul

3. **Implement token refresh:**
   - Short-lived access tokens (15 min)
   - Long-lived refresh tokens (7 days)
   - Automatic refresh on API calls

4. **Add monitoring:**
   - Log all auth failures
   - Alert on multiple failed attempts
   - Track token usage

