export const SUPPORTED_VIDEO_FORMATS = [
  'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'm4v', 'wmv', 'mpg', 'mpeg'
];

export const SUPPORTED_MIME_TYPES = [
  'video/mp4',
  'video/x-msvideo',
  'video/quicktime',
  'video/x-matroska',
  'video/webm',
  'video/x-flv',
  'video/x-m4v',
  'video/x-ms-wmv',
  'video/mpeg',
];

export const JOB_STATUS = {
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  EXTRACTING: 'extracting',
  TRANSCRIBING: 'transcribing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
} as const;

export const PROCESSING_STEPS = {
  UPLOADING: 'uploading',
  VALIDATING: 'validating',
  EXTRACTING: 'extracting',
  TRANSCRIBING: 'transcribing',
  FORMATTING: 'formatting',
  COMPLETED: 'completed',
} as const;

export const EXPORT_FORMATS = {
  TXT: 'txt',
  SRT: 'srt',
  VTT: 'vtt',
  JSON: 'json',
} as const;

export const REDIS_KEYS = {
  JOB_PREFIX: 'job:',
  RESULT_PREFIX: 'result:',
  RATE_LIMIT_PREFIX: 'ratelimit:',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const PROGRESS_PERCENTAGES = {
  UPLOAD_START: 0,
  UPLOAD_COMPLETE: 10,
  VALIDATION_COMPLETE: 15,
  EXTRACTION_START: 20,
  EXTRACTION_COMPLETE: 35,
  TRANSCRIPTION_START: 40,
  TRANSCRIPTION_PROGRESS_MIN: 45,
  TRANSCRIPTION_PROGRESS_MAX: 90,
  FORMATTING: 95,
  COMPLETED: 100,
} as const;
