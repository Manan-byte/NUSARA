import React from 'react';

export interface PillBadgeProps {
  children: React.ReactNode;
  variant?: 'lunas' | 'belumBayar' | 'verifikasi' | 'blok' | 'neutral' | 'blue';
  size?: 'sm' | 'md';
  className?: string;
}

export const PillBadge: React.FC<PillBadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5',
    md: 'text-xs px-3 py-1 font-semibold',
  };

  const variantClasses = {
    lunas: 'bg-emerald-50 text-emerald-800 border border-emerald-200/80',
    belumBayar: 'bg-rose-50 text-rose-800 border border-rose-200/80',
    verifikasi: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    blok: 'bg-slate-100 text-slate-800 border border-slate-200 font-mono tracking-tight',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
