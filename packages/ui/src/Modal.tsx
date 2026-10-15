import React, { useEffect } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none">
      {/* Subtle Luxury Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Box (Safe Centering & Viewport Clipping Prevention) */}
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white dark:bg-[#072426] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-[#D9B352]/40 overflow-hidden z-10 max-h-[92dvh] sm:max-h-[88dvh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150 transition-colors`}
      >
        <div className="px-6 py-5 border-b border-stone-100 dark:border-[#D9B352]/40 flex items-center justify-between flex-shrink-0 bg-white dark:bg-[#072426]">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain text-slate-900 dark:text-white">{children}</div>
      </div>
    </div>
  );
};
