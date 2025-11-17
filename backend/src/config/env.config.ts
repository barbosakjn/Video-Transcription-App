import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

export const config = {
  // API Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Redis Configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // OpenAI Configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Upload Configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '2147483648', 10), // 2GB
    maxVideoDuration: parseInt(process.env.MAX_VIDEO_DURATION || '3000', 10), // 50 min
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ||
      'video/mp4,video/x-msvideo,video/quicktime,video/x-matroska,video/webm,video/x-flv').split(','),
    uploadTimeout: parseInt(process.env.UPLOAD_TIMEOUT || '1800000', 10), // 30 min
    chunkSize: parseInt(process.env.CHUNK_SIZE || '5242880', 10), // 5MB
  },

  // Storage Configuration
  storage: {
    tempUploadDir: path.resolve(process.env.TEMP_UPLOAD_DIR || './temp/uploads'),
    tempAudioDir: path.resolve(process.env.TEMP_AUDIO_DIR || './temp/audio'),
    cleanupInterval: parseInt(process.env.CLEANUP_INTERVAL || '3600000', 10), // 1 hour
    fileTTL: parseInt(process.env.FILE_TTL || '3600', 10), // 1 hour
    resultTTL: parseInt(process.env.RESULT_TTL || '86400', 10), // 24 hours
  },

  // Processing Configuration
  processing: {
    workerConcurrency: parseInt(process.env.WORKER_CONCURRENCY || '3', 10),
    processingTimeout: parseInt(process.env.PROCESSING_TIMEOUT || '7200000', 10), // 2 hours
    ffmpegPath: process.env.FFMPEG_PATH || 'ffmpeg',
    ffprobePath: process.env.FFPROBE_PATH || 'ffprobe',
  },

  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '3600000', 10), // 1 hour
    maxAnonymous: parseInt(process.env.RATE_LIMIT_MAX_ANONYMOUS || '3', 10),
    enabled: process.env.RATE_LIMIT_ENABLED === 'true',
  },

  // Security
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableMetrics: process.env.ENABLE_METRICS === 'true',
  },
};

// Validate critical configuration
export function validateConfig() {
  const errors: string[] = [];

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}
