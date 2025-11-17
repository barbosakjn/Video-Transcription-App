import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
}

export function ErrorMessage({ title = 'Error', message, className }: ErrorMessageProps) {
  return (
    <div className={cn('bg-red-50 border border-red-200 rounded-lg p-4', className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">{title}</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
