export interface VideoMetadata {
  filename: string;
  originalName: string;
  size: number;
  format: string;
  duration: number;
  resolution?: string;
  fps?: number;
  codec?: string;
  uploadedAt: string;
}

export interface JobProgress {
  step: string;
  percentage: number;
  message?: string;
  bytesUploaded?: number;
  totalBytes?: number;
  uploadSpeed?: number;
  estimatedTimeRemaining?: number;
}

export interface Job {
  jobId: string;
  status: 'uploading' | 'processing' | 'extracting' | 'transcribing' | 'completed' | 'failed' | 'cancelled';
  videoMetadata?: VideoMetadata;
  progress: JobProgress;
  transcription?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  failedAt?: string;
  expiresAt: string;
}

export interface CreateJobData {
  jobId: string;
  filename: string;
  originalName: string;
  size: number;
}

export interface UpdateJobData {
  status?: Job['status'];
  progress?: Partial<JobProgress>;
  videoMetadata?: Partial<VideoMetadata>;
  transcription?: any;
  error?: Job['error'];
}
