import React from 'react';
import { cn } from '../../utils/cn';

interface ProgressBarProps {
  percentage: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ percentage, className, showPercentage = true }: ProgressBarProps) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {Math.round(clampedPercentage)}%
        </div>
      )}
    </div>
  );
}
