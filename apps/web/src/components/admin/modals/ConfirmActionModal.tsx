import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmActionModalProps {
  title: string;
  subtitle?: string;
  message?: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  title,
  subtitle,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  isDestructive = false,
  onConfirm,
  onClose,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleConfirm = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-sm w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2 text-[#0B484C] dark:text-[#F3D37A]">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${isDestructive ? 'text-rose-600' : 'text-amber-500'}`} />
            <h3 className="font-extrabold text-sm truncate">
              {title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {subtitle && (
          <p className="text-xs font-bold text-[#1C221E] dark:text-white">
            {subtitle}
          </p>
        )}

        {message && (
          <p className="text-xs text-stone-600 dark:text-stone-300">
            {message}
          </p>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isProcessing}
            className={`px-5 py-2 rounded-xl font-black text-xs shadow-md transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A]'
            }`}
          >
            {isProcessing ? 'Memproses...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
