import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { config } from '../../config/env.config';
import { generateJobId } from '../../services/job.service';
import { FileUploadError } from '../../utils/errors';

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.storage.tempUploadDir);
  },
  filename: (req, file, cb) => {
    const jobId = generateJobId();
    const ext = path.extname(file.originalname);
    const filename = `${jobId}${ext}`;

    // Store jobId in request for later use
    (req as any).jobId = jobId;

    cb(null, filename);
  },
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.m4v', '.wmv', '.mpg', '.mpeg'];

  if (!allowedExtensions.includes(ext)) {
    cb(
      new FileUploadError(
        `Invalid file format. Supported formats: ${allowedExtensions.join(', ')}`
      )
    );
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
});

export const uploadSingle = upload.single('video');
