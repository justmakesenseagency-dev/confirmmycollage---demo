import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-[14px]';

  const sizeStyles = {
    sm: 'text-xs px-3 py-2 gap-1.5',
    md: 'text-sm px-5 py-3.5 gap-2',
    lg: 'text-base px-6 py-4 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#7456ff] text-white hover:bg-[#6046e8] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(116,86,255,0.25)] active:translate-y-0',
    secondary:
      'bg-white text-[#17172b] border border-[#e9e7f4] hover:bg-[#f8f7ff] hover:border-[#7456ff]/40 hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(23,23,43,0.06)] active:translate-y-0',
    ghost:
      'bg-transparent text-[#7456ff] hover:bg-[#eeebff] active:bg-[#e0dbff]',
    dark:
      'bg-[#17172b] text-white hover:bg-[#252542] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(23,23,43,0.2)] active:translate-y-0',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
