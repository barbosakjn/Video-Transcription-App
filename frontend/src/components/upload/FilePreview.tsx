import React, { useEffect, useState } from 'react';
import { FileVideo, X } from 'lucide-react';
import { formatBytes, formatDuration } from '../../utils/formatters';
import { Button } from '../common/Button';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setVideoUrl(url);

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setDuration(video.duration);
      URL.revokeObjectURL(video.src);
    };
    video.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileVideo className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{file.name}</h3>
            <p className="text-sm text-gray-500">
              {formatBytes(file.size)} • {formatDuration(duration)}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          onClick={onRemove}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Remove
        </Button>
      </div>

      {videoUrl && (
        <div className="mt-4">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-96 rounded-lg bg-black"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
}
