import React from 'react';

export interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'light' | 'dark' | 'sand';
  className?: string;
  hoverEffect?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  variant = 'light',
  className = '',
  hoverEffect = true,
  ...props
}) => {
  const variantStyles = {
    light: 'bg-white text-stone-900 border border-stone-200/80 shadow-sm shadow-stone-900/5',
    dark: 'bg-[#1C1917] text-white border border-stone-800 shadow-md',
    sand: 'bg-[#FAF8F5] text-stone-900 border border-[#E7E2D8] shadow-sm',
  };

  const hoverStyle = hoverEffect
    ? 'transition-all duration-200 hover:shadow-md hover:border-stone-300'
    : '';

  return (
    <div
      className={`rounded-3xl p-6 ${variantStyles[variant]} ${hoverStyle} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
