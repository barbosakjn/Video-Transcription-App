import fs from 'fs/promises';
import path from 'path';
import { logger } from '../utils/logger';
import { config } from '../config/env.config';
import redis from '../config/redis.config';
import { REDIS_KEYS } from '../utils/constants';

export async function cleanupJobFiles(jobId: string): Promise<void> {
  try {
    // Cleanup video file
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'm4v'];
    for (const ext of videoExtensions) {
      const videoPath = path.join(config.storage.tempUploadDir, `${jobId}.${ext}`);
      try {
        await fs.unlink(videoPath);
        logger.info(`Deleted video file: ${videoPath}`);
      } catch (error) {
        // File doesn't exist, ignore
      }
    }

    // Cleanup audio file
    const audioPath = path.join(config.storage.tempAudioDir, `${jobId}.wav`);
    try {
      await fs.unlink(audioPath);
      logger.info(`Deleted audio file: ${audioPath}`);
    } catch (error) {
      // File doesn't exist, ignore
    }

    // Cleanup any audio chunks
    const audioDir = config.storage.tempAudioDir;
    const files = await fs.readdir(audioDir);
    const chunkFiles = files.filter((file) => file.startsWith(`${jobId}_chunk`));

    for (const file of chunkFiles) {
      const filePath = path.join(audioDir, file);
      try {
        await fs.unlink(filePath);
        logger.info(`Deleted audio chunk: ${filePath}`);
      } catch (error) {
        logger.warn(`Failed to delete audio chunk: ${filePath}`);
      }
    }
  } catch (error) {
    logger.error(`Error during cleanup for job ${jobId}:`, error);
  }
}

export async function cleanupExpiredJobs(): Promise<void> {
  try {
    logger.info('Starting cleanup of expired jobs...');

    const jobKeys = await redis.keys(`${REDIS_KEYS.JOB_PREFIX}*`);
    let expiredCount = 0;

    for (const key of jobKeys) {
      const jobData = await redis.get(key);
      if (!jobData) continue;

      const job = JSON.parse(jobData);
      const expiresAt = new Date(job.expiresAt);
      const now = new Date();

      if (now > expiresAt) {
        const jobId = key.replace(REDIS_KEYS.JOB_PREFIX, '');

        // Delete from Redis
        await redis.del(key);
        await redis.del(`${REDIS_KEYS.RESULT_PREFIX}${jobId}`);

        // Cleanup files
        await cleanupJobFiles(jobId);

        expiredCount++;
        logger.info(`Cleaned up expired job: ${jobId}`);
      }
    }

    logger.info(`Cleanup complete. Removed ${expiredCount} expired jobs.`);
  } catch (error) {
    logger.error('Error during cleanup of expired jobs:', error);
  }
}

export async function cleanupOrphanedFiles(): Promise<void> {
  try {
    logger.info('Starting cleanup of orphaned files...');

    const now = Date.now();
    const fileTTL = config.storage.fileTTL * 1000; // Convert to milliseconds

    // Cleanup orphaned uploads
    await cleanupOrphanedFilesInDirectory(config.storage.tempUploadDir, fileTTL, now);

    // Cleanup orphaned audio files
    await cleanupOrphanedFilesInDirectory(config.storage.tempAudioDir, fileTTL, now);

    logger.info('Orphaned files cleanup complete');
  } catch (error) {
    logger.error('Error during cleanup of orphaned files:', error);
  }
}

async function cleanupOrphanedFilesInDirectory(
  directory: string,
  fileTTL: number,
  now: number
): Promise<void> {
  try {
    const files = await fs.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);

      try {
        const stats = await fs.stat(filePath);

        // Delete files older than TTL
        if (now - stats.mtimeMs > fileTTL) {
          await fs.unlink(filePath);
          logger.info(`Deleted orphaned file: ${filePath}`);
        }
      } catch (error) {
        logger.warn(`Failed to process file ${filePath}:`, error);
      }
    }
  } catch (error) {
    logger.error(`Failed to read directory ${directory}:`, error);
  }
}

// Schedule periodic cleanup
export function startCleanupScheduler(): void {
  const interval = config.storage.cleanupInterval;

  setInterval(async () => {
    logger.info('Running scheduled cleanup...');
    await cleanupExpiredJobs();
    await cleanupOrphanedFiles();
  }, interval);

  logger.info(`Cleanup scheduler started (interval: ${interval}ms)`);
}
