import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-[24px] border border-[#e9e7f4] shadow-[0_8px_24px_rgba(33,25,76,0.04)] my-6 max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-[#eeebff] flex items-center justify-center text-[#7456ff] mb-4">
        {icon || (
          <svg
            className="w-10 h-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        )}
      </div>
      <h3 className="text-xl font-bold text-[#17172b] mb-2">{title}</h3>
      <p className="text-sm text-[#77788b] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
