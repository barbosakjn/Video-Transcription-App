import { Request } from 'express';
import { Job, VideoMetadata } from './job.types';
import { TranscriptionResult } from './transcription.types';

export interface UploadRequest extends Request {
  file?: Express.Multer.File;
  body: {
    language?: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface UploadResponse {
  jobId: string;
  status: string;
  message: string;
  filename: string;
  fileSize: number;
  estimatedDuration?: number;
}

export interface StatusResponse {
  jobId: string;
  status: Job['status'];
  progress: Job['progress'];
  videoMetadata?: VideoMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: Job['error'];
}

export interface ResultResponse {
  jobId: string;
  status: string;
  videoMetadata: VideoMetadata;
  transcription: TranscriptionResult;
  processingTime: number;
  createdAt: string;
  completedAt: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
}
