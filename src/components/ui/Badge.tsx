import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'purple' | 'lime' | 'pink' | 'emerald' | 'amber' | 'neutral' | 'active';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-bold rounded-full select-none transition-colors';

  const sizeStyles = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
  };

  const variantStyles = {
    purple: 'bg-[#eeebff] text-[#7456ff]',
    active: 'bg-[#7456ff] text-white',
    lime: 'bg-[#d9ff64] text-[#17172b]',
    pink: 'bg-[#ff8dc7]/20 text-[#cc3580]',
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200/50',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200/50',
    neutral: 'bg-gray-100 text-[#77788b]',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};
