import React from 'react';

export interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'dark' | 'emerald' | 'blue' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const PillButton: React.FC<PillButtonProps> = ({
  children,
  variant = 'dark',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantClasses = {
    dark: 'bg-[#1C1917] hover:bg-[#292524] text-white focus:ring-stone-700 shadow-sm',
    blue: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-md shadow-blue-500/25',
    emerald: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm',
    outline: 'border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-300',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
  };

  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span>{children}</span>
      {icon && <span className="flex-shrink-0">{icon}</span>}
    </button>
  );
};
