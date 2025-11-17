# Video Transcription Backend API

Backend service for the Video Transcription Web App. Handles video upload, audio extraction, and transcription using OpenAI Whisper API.

## Features

- 🎬 Video upload with multiple format support (MP4, AVI, MOV, MKV, WebM, FLV)
- 🎵 Automatic audio extraction using FFmpeg
- 📝 AI-powered transcription using OpenAI Whisper
- 📊 Real-time progress tracking
- 💾 Multiple export formats (TXT, SRT, VTT, JSON)
- ⚡ Asynchronous processing with Bull Queue
- 🔒 Rate limiting and security features
- 🧹 Automatic file cleanup

## Prerequisites

- Node.js 20+ LTS
- Redis 6+
- FFmpeg 6+
- OpenAI API Key

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install FFmpeg (if not already installed):

**Windows:**
```bash
# Using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
sudo apt-get install ffmpeg
```

3. Install Redis:

**Windows:**
```bash
# Using Chocolatey
choco install redis-64

# Or use WSL with Redis
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

## Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
# Required
OPENAI_API_KEY=sk-proj-your-api-key-here

# Optional (defaults provided)
PORT=3001
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Running the Application

### Development Mode

1. Start Redis:
```bash
# macOS/Linux
redis-server

# Windows
redis-server.exe
```

2. Start the API server:
```bash
npm run dev
```

3. Start the worker (in a separate terminal):
```bash
npm run worker
```

### Production Mode

1. Build the application:
```bash
npm run build
```

2. Start the server:
```bash
npm start
```

3. Start the worker (in a separate terminal/process):
```bash
node dist/workers/transcription.worker.js
```

## API Endpoints

### Upload Video
```http
POST /api/transcribe/upload
Content-Type: multipart/form-data

Body:
- video: File (binary)
- language: String (optional, e.g., "pt", "en", "auto")

Response: 202 Accepted
{
  "jobId": "uuid-v4",
  "status": "uploading",
  "message": "Video upload started",
  "filename": "video.mp4",
  "fileSize": 125829120
}
```

### Get Status
```http
GET /api/transcribe/:jobId/status

Response: 200 OK
{
  "jobId": "uuid-v4",
  "status": "transcribing",
  "progress": {
    "step": "transcribing",
    "percentage": 75,
    "message": "Transcribing audio..."
  },
  "videoMetadata": {...},
  "createdAt": "2025-11-15T10:00:00Z",
  "updatedAt": "2025-11-15T10:02:30Z"
}
```

### Get Result
```http
GET /api/transcribe/:jobId/result

Response: 200 OK
{
  "jobId": "uuid-v4",
  "status": "completed",
  "videoMetadata": {...},
  "transcription": {
    "text": "Full transcription text...",
    "language": "pt-BR",
    "wordCount": 1847,
    "segments": [...]
  },
  "processingTime": 180,
  "createdAt": "2025-11-15T10:00:00Z",
  "completedAt": "2025-11-15T10:03:00Z"
}
```

### Export Transcription
```http
GET /api/transcribe/:jobId/export?format={txt|srt|vtt|json}

Response: 200 OK
Content-Type: text/plain (or application/json, etc.)
Content-Disposition: attachment; filename="transcription.txt"

[File content]
```

### Health Check
```http
GET /api/health

Response: 200 OK
{
  "status": "healthy",
  "services": {
    "redis": "connected",
    "queue": "operational"
  },
  "queue": {
    "waiting": 0,
    "active": 1,
    "completed": 42,
    "failed": 0
  }
}
```

## Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API routes
│   │   └── validators/        # Request validation schemas
│   ├── config/                # Configuration files
│   ├── queue/                 # Bull queue processors
│   ├── services/              # Business logic
│   ├── types/                 # TypeScript types
│   ├── utils/                 # Utility functions
│   ├── workers/               # Background workers
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── temp/                      # Temporary files (auto-created)
├── logs/                      # Application logs (auto-created)
└── package.json
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {} // Optional additional details
}
```

Common error codes:
- `VALIDATION_ERROR` (400) - Invalid request data
- `FILE_TOO_LARGE` (413) - File exceeds 2GB limit
- `VIDEO_TOO_LONG` (422) - Video exceeds 50-minute limit
- `JOB_NOT_FOUND` (404) - Job ID doesn't exist
- `TRANSCRIPTION_ERROR` (500) - Transcription failed

## Logging

Logs are stored in the `logs/` directory:
- `combined.log` - All logs
- `error.log` - Error logs only

Log format:
```json
{
  "timestamp": "2025-11-15 10:00:00",
  "level": "info",
  "message": "Log message",
  "service": "video-transcription-api"
}
```

## Performance

- **Upload**: Supports files up to 2GB
- **Processing**: ~1-1.5x video duration
  - 10-minute video: 10-15 minutes processing
  - 50-minute video: 50-75 minutes processing
- **Concurrency**: 3 simultaneous transcriptions (configurable)
- **Rate Limiting**: 3 uploads per IP per hour

## Monitoring

Check queue status:
```bash
# Redis CLI
redis-cli

# View all jobs
KEYS job:*

# View specific job
GET job:uuid-v4
```

Monitor logs:
```bash
tail -f logs/combined.log
```

## Troubleshooting

### FFmpeg not found
```bash
# Verify FFmpeg installation
ffmpeg -version

# Set custom path in .env
FFMPEG_PATH=/usr/local/bin/ffmpeg
FFPROBE_PATH=/usr/local/bin/ffprobe
```

### Redis connection failed
```bash
# Check Redis status
redis-cli ping

# Should return: PONG
```

### Worker not processing jobs
```bash
# Check worker logs
# Ensure worker is running in separate process
npm run worker
```

## License

MIT
