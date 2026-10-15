import React, { useState } from 'react';
import { TransaksiIPL, ItemUrunanWarga } from '@sim-warga/types';
import { X, AlertCircle } from 'lucide-react';

interface RejectReasonModalProps {
  item: TransaksiIPL | ItemUrunanWarga;
  type: 'ipl' | 'urunan';
  onClose: () => void;
  onConfirmReject: (idOrNo: string, reason: string) => Promise<void> | void;
}

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  item,
  type,
  onClose,
  onConfirmReject,
}) => {
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const isIpl = type === 'ipl';
  const ipl = isIpl ? (item as TransaksiIPL) : null;
  const urunan = !isIpl ? (item as ItemUrunanWarga) : null;
  const targetId = isIpl ? ipl!.noTransaksi : urunan!.id;
  const targetNama = isIpl ? ipl!.namaWarga : urunan!.namaWarga;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirmReject(targetId, reason.trim() || 'Bukti transfer tidak sesuai atau tidak valid');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-sm w-full p-5 sm:p-6 rounded-3xl border-2 border-rose-300 dark:border-rose-900/80 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <h3 className="font-extrabold text-sm truncate">
              Tolak Setoran {isIpl ? 'IPL' : 'PJU'}
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

        <p className="text-xs text-stone-600 dark:text-stone-300">
          Setoran dari <strong className="text-[#1C221E] dark:text-white">{targetNama}</strong> ({targetId}) akan ditolak dan statusnya diperbarui.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-400 mb-1">
              Alasan Penolakan:
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Cth: Nominal pada struk tidak sesuai, foto buram, atau rekening pengirim salah..."
              className="w-full p-3 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-[#051E20] text-[#1C221E] dark:text-white text-xs focus:outline-none focus:border-rose-500 shadow-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2 border-t-2 border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? 'Memproses...' : 'Tolak Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
