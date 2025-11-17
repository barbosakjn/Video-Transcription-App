export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class FileUploadError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'FILE_UPLOAD_ERROR', details);
  }
}

export class FileNotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'FILE_NOT_FOUND');
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: number, receivedSize: number) {
    super(
      `File too large. Maximum size is ${formatBytes(maxSize)}`,
      413,
      'FILE_TOO_LARGE',
      { maxSize, receivedSize }
    );
  }
}

export class VideoTooLongError extends AppError {
  constructor(maxDuration: number, videoDuration: number) {
    super(
      `Video too long. Maximum duration is ${maxDuration} seconds (${Math.floor(maxDuration / 60)} minutes)`,
      422,
      'VIDEO_TOO_LONG',
      { maxDuration, videoDuration }
    );
  }
}

export class InvalidFormatError extends AppError {
  constructor(supportedFormats: string[]) {
    super(
      `Invalid file format. Supported formats: ${supportedFormats.join(', ')}`,
      400,
      'INVALID_FORMAT',
      { supportedFormats }
    );
  }
}

export class ProcessingError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'PROCESSING_ERROR', details);
  }
}

export class TranscriptionError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'TRANSCRIPTION_ERROR', details);
  }
}

export class JobNotFoundError extends AppError {
  constructor(jobId: string) {
    super(`No transcription job found with ID: ${jobId}`, 404, 'JOB_NOT_FOUND', { jobId });
  }
}

export class JobExpiredError extends AppError {
  constructor(jobId: string) {
    super(
      'This transcription has expired and is no longer available. Results are stored for 24 hours.',
      410,
      'JOB_EXPIRED',
      { jobId }
    );
  }
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
