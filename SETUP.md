# 🚀 Quick Setup Guide

Follow these steps to get the Video Transcription App running locally.

## Step 1: Install Prerequisites

### Windows
```powershell
# Install Chocolatey first (https://chocolatey.org/install)

# Then install prerequisites
choco install nodejs redis-64 ffmpeg -y
```

### macOS
```bash
# Install Homebrew first (https://brew.sh/)

# Then install prerequisites
brew install node redis ffmpeg
brew services start redis
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y nodejs npm redis-server ffmpeg
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

### Verify Installation
```bash
node --version    # Should be v20+
redis-cli ping    # Should return "PONG"
ffmpeg -version   # Should show version info
```

## Step 2: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-proj-...`)

## Step 3: Clone and Setup Project

```bash
# Clone the repository
git clone <your-repo-url>
cd video-transcription-app

# Setup backend
cd backend
npm install
cp .env.example .env

# IMPORTANT: Edit backend/.env and add your OpenAI API key
# Open backend/.env in a text editor and set:
# OPENAI_API_KEY=sk-proj-your-actual-key-here

# Setup frontend
cd ../frontend
npm install
```

## Step 4: Verify Redis is Running

```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
# Windows: redis-server.exe
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

## Step 5: Start the Application

Open **3 separate terminal windows**:

### Terminal 1: Start Backend API
```bash
cd video-transcription-app/backend
npm run dev
```

Wait until you see: `🚀 Server started successfully`

### Terminal 2: Start Worker
```bash
cd video-transcription-app/backend
npm run worker
```

Wait until you see: `Transcription worker started`

### Terminal 3: Start Frontend
```bash
cd video-transcription-app/frontend
npm run dev
```

Wait until you see: `Local: http://localhost:5173`

## Step 6: Open the App

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## ✅ Quick Test

1. Upload a short video (< 1 minute)
2. Click "Start Transcription"
3. Watch the progress
4. View and export your transcription

## 🐛 Troubleshooting

### "Cannot connect to Redis"
```bash
# Make sure Redis is running
redis-cli ping

# If not, start it
redis-server
```

### "FFmpeg not found"
```bash
# Check if FFmpeg is in PATH
ffmpeg -version

# If not, install it or set path in backend/.env
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### "Invalid API key"
- Make sure you've set `OPENAI_API_KEY` in `backend/.env`
- Verify the key is correct (starts with `sk-proj-` or `sk-`)
- Check you have credits on your OpenAI account

### Port already in use
If port 3001 or 5173 is already in use:

```env
# In backend/.env, change:
PORT=3002

# In frontend/.env, change:
VITE_API_URL=http://localhost:3002/api
```

## 📝 Next Steps

- Try uploading different video formats
- Experiment with different languages
- Export transcriptions in various formats
- Check the main README.md for production deployment

## 💡 Tips

- **Development**: Use Chrome DevTools to debug the frontend
- **Backend Logs**: Check `backend/logs/combined.log` for detailed logs
- **Worker Logs**: The worker terminal shows processing progress
- **Redis Data**: Use `redis-cli` to inspect job data:
  ```bash
  redis-cli
  KEYS job:*
  GET job:<job-id>
  ```

---

Need help? Check the main README.md or open an issue on GitHub.
