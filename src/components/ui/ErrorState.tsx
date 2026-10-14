import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this information. Please verify your connection and try again.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-[24px] border border-red-100 shadow-[0_8px_24px_rgba(229,72,77,0.06)] my-6 max-w-lg mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#e5484d] flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-[#17172b] mb-2">{title}</h3>
      <p className="text-sm text-[#77788b] max-w-sm mb-6 leading-relaxed">{message}</p>
      <Button variant="secondary" onClick={onRetry} icon={<RefreshCw className="w-4 h-4" />}>
        Retry Loading
      </Button>
    </div>
  );
};
