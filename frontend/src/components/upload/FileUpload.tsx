import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Video } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
  disabled?: boolean;
}

const SUPPORTED_FORMATS = {
  'video/*': ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.m4v', '.wmv', '.mpg', '.mpeg'],
};

const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

export function FileUpload({
  onFileSelect,
  accept = SUPPORTED_FORMATS,
  maxSize = MAX_FILE_SIZE,
  disabled = false,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    disabled,
    multiple: false,
  });

  const hasRejections = fileRejections.length > 0;
  const rejectionMessage = fileRejections[0]?.errors[0]?.message;

  return (
    <div>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200',
          {
            'border-primary-400 bg-primary-50': isDragActive && !disabled,
            'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-50/50':
              !isDragActive && !disabled,
            'border-gray-200 bg-gray-50 cursor-not-allowed': disabled,
            'border-red-400 bg-red-50': hasRejections,
          }
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center gap-4">
          {isDragActive ? (
            <>
              <Upload className="w-16 h-16 text-primary-600 animate-bounce" />
              <p className="text-lg font-medium text-primary-900">Drop your video here</p>
            </>
          ) : (
            <>
              <Video className="w-16 h-16 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900 mb-1">
                  {disabled ? 'Upload disabled' : 'Drag & drop your video here'}
                </p>
                <p className="text-sm text-gray-500">
                  or <span className="text-primary-600 font-medium">click to browse</span>
                </p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>Supported formats: MP4, AVI, MOV, MKV, WebM, FLV</p>
                <p>Maximum file size: 2GB • Maximum duration: 50 minutes</p>
              </div>
            </>
          )}
        </div>
      </div>

      {hasRejections && (
        <div className="mt-3 text-sm text-red-600">
          <p>❌ {rejectionMessage}</p>
        </div>
      )}
    </div>
  );
}
