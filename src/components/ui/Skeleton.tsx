import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl ${className}`}
    />
  );
};

export const CollegeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[20px] border border-[#e9e7f4] p-6 shadow-[0_8px_24px_rgba(33,25,76,0.06)] flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-36 h-5" />
            <Skeleton className="w-24 h-4" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="w-16 h-6 rounded-full" />
        <Skeleton className="w-20 h-6 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8f7ff] rounded-xl">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      <div className="flex items-center justify-between pt-2">
        <Skeleton className="w-24 h-5" />
        <Skeleton className="w-28 h-10 rounded-[14px]" />
      </div>
    </div>
  );
};
