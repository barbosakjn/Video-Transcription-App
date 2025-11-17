import Queue from 'bull';
import { config } from './env.config';
import { logger } from '../utils/logger';

export const transcriptionQueue = new Queue('video-transcription', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
  },
  settings: {
    maxStalledCount: 1, // Retry once if job stalls
    stalledInterval: 30000, // Check every 30 seconds
    lockDuration: 300000, // Lock for 5 minutes
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

// Queue event handlers
transcriptionQueue.on('error', (error) => {
  logger.error('Queue error:', error);
});

transcriptionQueue.on('waiting', (jobId) => {
  logger.info(`Job ${jobId} is waiting`);
});

transcriptionQueue.on('active', (job) => {
  logger.info(`Job ${job.id} started processing`);
});

transcriptionQueue.on('stalled', (job) => {
  logger.warn(`Job ${job.id} stalled`);
});

transcriptionQueue.on('progress', (job, progress) => {
  logger.debug(`Job ${job.id} progress: ${progress}%`);
});

transcriptionQueue.on('completed', (job, result) => {
  logger.info(`Job ${job.id} completed successfully`);
});

transcriptionQueue.on('failed', (job, error) => {
  logger.error(`Job ${job?.id} failed:`, error);
});

transcriptionQueue.on('removed', (job) => {
  logger.info(`Job ${job.id} removed from queue`);
});

export default transcriptionQueue;
