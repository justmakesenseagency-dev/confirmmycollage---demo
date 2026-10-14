import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  helperText,
  error,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-[#17172b]">
          {label} {required && <span className="text-[#e5484d]">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`h-12 w-full px-4 rounded-[12px] border bg-white text-sm text-[#17172b] placeholder-[#77788b]/60 transition-all outline-none ${
          error
            ? 'border-[#e5484d] focus:ring-4 focus:ring-[#e5484d]/20'
            : 'border-[#e9e7f4] focus:border-[#7456ff] focus:ring-4 focus:ring-[#7456ff]/25'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-[#e5484d] font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#77788b]">{helperText}</span>}
    </div>
  );
};

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  options: { label: string; value: string | number }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  helperText,
  error,
  required,
  options,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full flex flex-col gap-1.5 text-left">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-[#17172b]">
          {label} {required && <span className="text-[#e5484d]">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`h-12 w-full px-4 rounded-[12px] border bg-white text-sm text-[#17172b] transition-all outline-none cursor-pointer ${
          error
            ? 'border-[#e5484d] focus:ring-4 focus:ring-[#e5484d]/20'
            : 'border-[#e9e7f4] focus:border-[#7456ff] focus:ring-4 focus:ring-[#7456ff]/25'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-[#e5484d] font-medium">{error}</span>}
      {!error && helperText && <span className="text-xs text-[#77788b]">{helperText}</span>}
    </div>
  );
};
