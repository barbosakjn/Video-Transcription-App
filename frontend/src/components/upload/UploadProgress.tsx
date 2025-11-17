import React from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import { ProgressBar } from '../common/ProgressBar';

interface UploadProgressProps {
  progress: number;
  filename: string;
}

export function UploadProgress({ progress, filename }: UploadProgressProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <UploadIcon className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-gray-900">Uploading {filename}</h3>
          <p className="text-sm text-gray-500">Please wait while your video is being uploaded...</p>
        </div>
      </div>

      <ProgressBar percentage={progress} />
    </div>
  );
}
