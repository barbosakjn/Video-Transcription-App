export interface VideoMetadata {
  filename: string;
  originalName: string;
  size: number;
  format: string;
  duration: number;
  resolution?: string;
  fps?: number;
  uploadedAt: string;
}

export interface JobProgress {
  step: string;
  percentage: number;
  message?: string;
  estimatedTimeRemaining?: number;
}

export interface TranscriptionSegment {
  id: number;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  languageConfidence: number;
  duration: number;
  segments: TranscriptionSegment[];
  wordCount: number;
  characterCount: number;
  overallConfidence: number;
}

export interface JobStatus {
  jobId: string;
  status: 'uploading' | 'processing' | 'extracting' | 'transcribing' | 'completed' | 'failed';
  progress: JobProgress;
  videoMetadata?: VideoMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
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

export type ExportFormat = 'txt' | 'srt' | 'vtt' | 'json';
