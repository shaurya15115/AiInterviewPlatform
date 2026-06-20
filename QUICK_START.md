# 🚀 QUICK START - Run the Project NOW

## ⚠️ BEFORE YOU START

Your OpenAI API key was exposed! **DO THIS FIRST:**

1. Go to: https://platform.openai.com/account/api-keys
2. Delete key starting with: `sk-proj-w8b2fEC3FJGKEWquyeSmwb-...`
3. Click **Create new secret key**
4. Copy the NEW key

---

## 1️⃣ Make Sure MongoDB is Running

**Check if running:**
```bash
mongo --version
```

**If not installed, download:** https://www.mongodb.com/try/download/community

**Start MongoDB:**
```bash
mongod
```

---

## 2️⃣ Update the API Key

**File:** `server/.env`

Replace line 4:
```
OPENAI_API_KEY=your_openai_api_key_here
```

With your NEW key from step 1.

---

## 3️⃣ Terminal 1 - Start Server

```bash
cd server
npm install  # First time only
npm start
```

**Wait for:**
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

---

## 4️⃣ Terminal 2 - Start Client

```bash
cd client
npm install  # First time only
npm run dev
```

**Wait for:**
```
Local: http://localhost:3001/
```

---

## 5️⃣ Open Browser

Go to: **http://localhost:3001**

---

## 6️⃣ Test It

1. Click **"Create Account"**
2. Enter:
   - Name: John Doe
   - Email: john@example.com
   - Password: test123456
3. Click **"Create Account"**
4. Upload a PDF resume
5. Enter a job description (or skip)
6. Click **"Initialize Interview"**
7. Start answering questions!

---

## ❌ If Something Goes Wrong

### Server won't start
```bash
# Kill existing node process
# Windows: taskkill /F /IM node.exe
# Mac/Linux: pkill node

# Check .env file exists
cat server/.env

# Restart
npm start
```

### "JWT error" or "Invalid token"
```bash
# Clear browser storage (F12 → Application → Local Storage → Clear)
# Then log in again
```

### "MongoDB error"
```bash
# Make sure mongod is running in another terminal
mongod

# Or check connection string in server/.env
```

### "OPENAI error"
```bash
# Check your API key in server/.env is correct
# Make sure it starts with sk-
```

---

## That's It! 🎉

Your AI Interview Platform is now running!

**Next:** Read `SETUP_GUIDE.md` for full troubleshooting.
