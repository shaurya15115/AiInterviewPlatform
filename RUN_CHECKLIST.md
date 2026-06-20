# 🎯 Quick Run Checklist

## ✅ Pre-Run Setup (Do This First)

- [ ] **Get new OpenAI API key**
  - URL: https://platform.openai.com/account/api-keys
  - Action: Delete old key, create NEW one
  - Copy: The key that starts with `sk-`

- [ ] **Update server/.env**
  - Open: `server/.env`
  - Find: `OPENAI_API_KEY=your_openai_api_key_here`
  - Replace: With your NEW key
  - Save: File

- [ ] **Start MongoDB**
  - Command: `mongod`
  - Wait for: Connection messages
  - Keep running: Don't close this terminal

---

## 🚀 Run Commands (in 2 terminals)

### Terminal 1 - Server
```bash
cd server
npm install
npm start
```

**Wait for these messages:**
```
✓ Connected to MongoDB
✓ Server running on port 5000
```

### Terminal 2 - Client
```bash
cd client
npm install
npm run dev
```

**Wait for this message:**
```
Local: http://localhost:3001/
```

---

## 🌐 Browser (Open New Tab)

Go to: `http://localhost:3001`

---

## 🧪 Test Workflow

1. **Register Account**
   - Name: John Doe
   - Email: john@test.com
   - Password: test123456
   - Click "Create Account"

2. **Upload Resume**
   - Click file upload area
   - Select a PDF file
   - Wait for upload

3. **Start Interview**
   - Job Description: (optional, can skip)
   - Difficulty: Medium
   - Type: Technical
   - Click "Initialize Interview"

4. **Answer Question**
   - Click "Initialize Microphone"
   - Speak an answer
   - Wait for evaluation
   - See feedback

5. **Check Results**
   - Answer more questions (if desired)
   - See radar chart on dashboard
   - Download report

---

## ❌ If Something Goes Wrong

### Server Won't Start
```bash
# Kill all node processes
# Windows: taskkill /F /IM node.exe
# Mac/Linux: pkill node

# Check .env file
cat server/.env

# Restart
npm start
```

### Client Won't Start
```bash
# Clear node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install

# Start
npm run dev
```

### MongoDB Error
```bash
# Make sure mongod is running in another terminal
mongod

# Check connection string in server/.env
```

### Token Error After Login
```bash
# Clear browser storage
# F12 → Application → Local Storage → Clear

# Log in again
```

### API Key Error
```bash
# Check server/.env
# OPENAI_API_KEY should be: sk-...

# NOT: your_openai_api_key_here
```

---

## 📱 Endpoints to Check

- **Server:** http://localhost:5000 (API only, no UI)
- **Client:** http://localhost:3001 (Full UI)
- **API Base:** http://localhost:5000/api

---

## 🔍 Debug Commands

### Check Server Startup
```bash
cd server
npm run check
```

### View Logs
```bash
# Server will show logs in terminal
# Watch for: ✓ or ❌ messages

# Client will show logs in browser console (F12)
# Watch for: [API] messages
```

### Test Database
```bash
mongo
use interviewapp
db.users.find()
exit
```

---

## ✨ Success Indicators

You'll know it's working when:
- [ ] Server shows "✓ Connected to MongoDB"
- [ ] Server shows "✓ Server running on port 5000"
- [ ] Client page loads at http://localhost:3001
- [ ] Can register and login
- [ ] Can upload resume
- [ ] Can start interview
- [ ] Can answer and see evaluation
- [ ] Can see results page with charts

---

## 📊 File Locations

- **Server:** `./server/`
- **Client:** `./client/`
- **Database:** `~/.mongodb/` (local)
- **Uploads:** `./server/uploads/`

---

## 🎉 You're Ready!

Everything is fixed and ready to run. Follow this checklist and you'll be interviewing in minutes!

**Estimated time:** 5-10 minutes to first working interview
