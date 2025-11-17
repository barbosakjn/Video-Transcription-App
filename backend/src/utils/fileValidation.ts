import { FileTypeResult, fileTypeFromFile } from 'file-type';
import path from 'path';
import { SUPPORTED_VIDEO_FORMATS, SUPPORTED_MIME_TYPES } from './constants';
import { InvalidFormatError, FileTooLargeError } from './errors';
import { config } from '../config/env.config';

export async function validateVideoFile(filePath: string, fileSize: number): Promise<void> {
  // Check file size
  if (fileSize > config.upload.maxFileSize) {
    throw new FileTooLargeError(config.upload.maxFileSize, fileSize);
  }

  // Check file extension
  const ext = path.extname(filePath).toLowerCase().slice(1);
  if (!SUPPORTED_VIDEO_FORMATS.includes(ext)) {
    throw new InvalidFormatError(SUPPORTED_VIDEO_FORMATS);
  }

  // Verify actual MIME type using magic numbers
  const fileType: FileTypeResult | undefined = await fileTypeFromFile(filePath);

  if (!fileType) {
    throw new InvalidFormatError(SUPPORTED_VIDEO_FORMATS);
  }

  if (!SUPPORTED_MIME_TYPES.includes(fileType.mime)) {
    throw new InvalidFormatError(SUPPORTED_VIDEO_FORMATS);
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove any directory traversal attempts
  const basename = path.basename(filename);

  // Replace any non-alphanumeric characters (except dots and dashes) with underscores
  return basename.replace(/[^a-zA-Z0-9.-]/g, '_');
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}
