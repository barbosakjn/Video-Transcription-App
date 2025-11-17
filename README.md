# 🎬 Video Transcription Web App

A modern full-stack application that automatically transcribes videos using AI. Upload a video, and get accurate transcriptions with timestamps, exportable in multiple formats.

## ✨ Features

- 🎥 **Video Upload**: Drag-and-drop interface supporting multiple formats (MP4, AVI, MOV, MKV, WebM, FLV)
- 🎵 **Automatic Audio Extraction**: Uses FFmpeg to extract audio from any video format
- 🤖 **AI-Powered Transcription**: Leverages OpenAI's Whisper API for accurate transcriptions
- 📊 **Real-time Progress Tracking**: Monitor upload and processing status in real-time
- ⏱️ **Timestamp Support**: View transcriptions with precise timestamps
- 🔍 **Search Functionality**: Search within transcriptions
- 💾 **Multiple Export Formats**: Download as TXT, SRT, VTT, or JSON
- 🎨 **Modern UI**: Clean, responsive interface built with React and Tailwind CSS

## 🏗️ Architecture

### Backend
- **Node.js** + **TypeScript** + **Express**
- **Redis** for caching and job queue
- **Bull Queue** for asynchronous processing
- **FFmpeg** for video/audio processing
- **OpenAI Whisper API** for transcription

### Frontend
- **React 18** + **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Axios** for API communication
- **React Dropzone** for file uploads

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ LTS ([Download](https://nodejs.org/))
- **Redis** 6+ ([Installation guide](https://redis.io/docs/getting-started/installation/))
- **FFmpeg** 6+ ([Download](https://ffmpeg.org/download.html))
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installing Prerequisites

#### Windows (using Chocolatey)
```bash
choco install nodejs redis-64 ffmpeg
```

#### macOS (using Homebrew)
```bash
brew install node redis ffmpeg
brew services start redis
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install nodejs npm redis-server ffmpeg
sudo systemctl start redis-server
```

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd video-transcription-app
```

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Required: OPENAI_API_KEY=sk-proj-your-key-here
```

### 3. Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# (Optional) Copy environment file
cp .env.example .env
```

### 4. Start Redis

Make sure Redis is running:

```bash
# macOS/Linux
redis-server

# Windows
redis-server.exe

# Verify it's running
redis-cli ping
# Should return: PONG
```

### 5. Start the Application

You'll need **3 terminal windows**:

#### Terminal 1: Backend API
```bash
cd backend
npm run dev
```

#### Terminal 2: Backend Worker
```bash
cd backend
npm run worker
```

#### Terminal 3: Frontend
```bash
cd frontend
npm run dev
```

### 6. Open the Application

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

## 📖 Usage

1. **Upload a Video**
   - Drag and drop a video file or click to browse
   - Supported formats: MP4, AVI, MOV, MKV, WebM, FLV
   - Maximum size: 2GB
   - Maximum duration: 50 minutes

2. **Select Language** (Optional)
   - Choose the video's language or use auto-detect

3. **Start Transcription**
   - Click "Start Transcription"
   - Monitor real-time progress

4. **View Results**
   - Search within the transcription
   - Toggle timestamps on/off
   - Copy text to clipboard

5. **Export**
   - Download in your preferred format (TXT, SRT, VTT, JSON)

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
# Required
OPENAI_API_KEY=sk-proj-your-key-here

# Optional (with defaults)
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
WORKER_CONCURRENCY=3
RATE_LIMIT_MAX_ANONYMOUS=3
```

### Frontend Configuration (`frontend/.env`)

```env
# Optional (defaults to http://localhost:3001/api)
VITE_API_URL=http://localhost:3001/api
```

## 📊 API Endpoints

### Upload Video
```http
POST /api/transcribe/upload
Content-Type: multipart/form-data

Body:
- video: File
- language: String (optional)
```

### Get Status
```http
GET /api/transcribe/:jobId/status
```

### Get Result
```http
GET /api/transcribe/:jobId/result
```

### Export Transcription
```http
GET /api/transcribe/:jobId/export?format={txt|srt|vtt|json}
```

### Health Check
```http
GET /api/health
```

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🏭 Production Deployment

### Backend

1. Build:
```bash
cd backend
npm run build
```

2. Set production environment:
```env
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

3. Start:
```bash
npm start
```

4. Start worker (in separate process):
```bash
node dist/workers/transcription.worker.js
```

### Frontend

1. Build:
```bash
cd frontend
npm run build
```

2. Deploy `dist/` folder to your hosting service (Vercel, Netlify, etc.)

## 💰 Cost Estimation

### OpenAI Whisper API
- **Rate**: $0.006 per minute of audio
- **10-minute video**: ~$0.06
- **50-minute video**: ~$0.30
- **1000 videos/month (avg 20 min)**: ~$120/month

### Infrastructure (estimated)
- **Server**: $10-50/month
- **Redis**: $15/month (managed) or included with server
- **Total**: $25-65/month + API costs

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Verify installation
ffmpeg -version

# Add to PATH or set in .env
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### Redis connection failed
```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server
```

### Worker not processing jobs
- Ensure the worker is running in a separate terminal/process
- Check Redis connection
- Review worker logs for errors

### Upload fails
- Check file size (max 2GB)
- Check video duration (max 50 minutes)
- Verify supported format
- Check network connection

## 📁 Project Structure

```
video-transcription-app/
├── backend/
│   ├── src/
│   │   ├── api/          # API routes, controllers, middleware
│   │   ├── config/       # Configuration files
│   │   ├── queue/        # Bull queue processors
│   │   ├── services/     # Business logic
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── workers/      # Background workers
│   ├── temp/             # Temporary files (auto-created)
│   └── logs/             # Application logs (auto-created)
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Utilities
│   └── public/           # Static assets
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [OpenAI Whisper](https://openai.com/research/whisper) for transcription
- [FFmpeg](https://ffmpeg.org/) for video processing
- [Bull](https://github.com/OptimalBits/bull) for job queue management

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

---

**Built with ❤️ using React, Node.js, and OpenAI Whisper**
