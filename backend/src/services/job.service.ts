import { v4 as uuidv4 } from 'uuid';
import redis from '../config/redis.config';
import { logger } from '../utils/logger';
import { Job, CreateJobData, UpdateJobData } from '../types/job.types';
import { JobNotFoundError, JobExpiredError } from '../utils/errors';
import { REDIS_KEYS, JOB_STATUS } from '../utils/constants';
import { config } from '../config/env.config';

export async function createJob(data: CreateJobData): Promise<Job> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.storage.resultTTL * 1000);

  const job: Job = {
    jobId: data.jobId,
    status: JOB_STATUS.UPLOADING,
    videoMetadata: {
      filename: data.filename,
      originalName: data.originalName,
      size: data.size,
      format: '',
      duration: 0,
      uploadedAt: now.toISOString(),
    },
    progress: {
      step: 'uploading',
      percentage: 0,
      message: 'Upload started',
    },
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  const key = `${REDIS_KEYS.JOB_PREFIX}${job.jobId}`;
  await redis.set(key, JSON.stringify(job), 'EX', config.storage.resultTTL);

  logger.info(`Job created: ${job.jobId}`);

  return job;
}

export async function getJob(jobId: string): Promise<Job> {
  const key = `${REDIS_KEYS.JOB_PREFIX}${jobId}`;
  const jobData = await redis.get(key);

  if (!jobData) {
    throw new JobNotFoundError(jobId);
  }

  const job: Job = JSON.parse(jobData);

  // Check if job has expired
  if (new Date(job.expiresAt) < new Date()) {
    await deleteJob(jobId);
    throw new JobExpiredError(jobId);
  }

  return job;
}

export async function updateJob(jobId: string, updates: UpdateJobData): Promise<Job> {
  const job = await getJob(jobId);

  // Update fields
  if (updates.status) {
    job.status = updates.status;
  }

  if (updates.progress) {
    job.progress = { ...job.progress, ...updates.progress };
  }

  if (updates.videoMetadata && job.videoMetadata) {
    job.videoMetadata = { ...job.videoMetadata, ...updates.videoMetadata } as any;
  }

  if (updates.transcription) {
    job.transcription = updates.transcription;
  }

  if (updates.error) {
    job.error = updates.error;
  }

  job.updatedAt = new Date().toISOString();

  if (updates.status === JOB_STATUS.COMPLETED) {
    job.completedAt = new Date().toISOString();
  }

  if (updates.status === JOB_STATUS.FAILED) {
    job.failedAt = new Date().toISOString();
  }

  // Save to Redis
  const key = `${REDIS_KEYS.JOB_PREFIX}${jobId}`;
  await redis.set(key, JSON.stringify(job), 'EX', config.storage.resultTTL);

  logger.info(`Job updated: ${jobId}`, {
    status: job.status,
    progress: job.progress.percentage,
  });

  return job;
}

export async function deleteJob(jobId: string): Promise<void> {
  const jobKey = `${REDIS_KEYS.JOB_PREFIX}${jobId}`;
  const resultKey = `${REDIS_KEYS.RESULT_PREFIX}${jobId}`;

  await redis.del(jobKey);
  await redis.del(resultKey);

  logger.info(`Job deleted: ${jobId}`);
}

export async function saveTranscriptionResult(jobId: string, transcription: any): Promise<void> {
  const key = `${REDIS_KEYS.RESULT_PREFIX}${jobId}`;
  await redis.set(key, JSON.stringify(transcription), 'EX', config.storage.resultTTL);

  logger.info(`Transcription result saved for job: ${jobId}`);
}

export async function getTranscriptionResult(jobId: string): Promise<any> {
  const key = `${REDIS_KEYS.RESULT_PREFIX}${jobId}`;
  const resultData = await redis.get(key);

  if (!resultData) {
    throw new JobNotFoundError(jobId);
  }

  return JSON.parse(resultData);
}

export function generateJobId(): string {
  return uuidv4();
}
