import React from 'react';
import { X, AlertTriangle, RefreshCw, CheckCircle2 } from 'lucide-react';

export interface UserConfirmModalData {
  kind: 'delete' | 'edit';
  title: string;
  subtitle: string;
  itemName: string;
  detailText: string;
  confirmLabel: string;
  onConfirm: () => Promise<void> | void;
}

export interface WargaUserConfirmModalProps {
  userConfirmModal: UserConfirmModalData | null;
  userConfirmStep: 'review' | 'syncing' | 'done';
  setUserConfirmStep: (step: 'review' | 'syncing' | 'done') => void;
  onClose: () => void;
}

export const WargaUserConfirmModal: React.FC<WargaUserConfirmModalProps> = ({
  userConfirmModal,
  userConfirmStep,
  setUserConfirmStep,
  onClose,
}) => {
  if (!userConfirmModal) return null;

  return (
    <div
      onClick={() => {
        if (userConfirmStep !== 'syncing') {
          onClose();
          setUserConfirmStep('review');
        }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="carlic-card max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 border-2 border-[#D9B352]/55 shadow-2xl"
      >
        {userConfirmStep !== 'syncing' && (
          <button
            type="button"
            onClick={() => {
              onClose();
              setUserConfirmStep('review');
            }}
            className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center absolute top-4 right-4"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {userConfirmStep === 'review' ? (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  Konfirmasi Penghapusan Data Anda
                </span>
                <h3 className="text-base font-extrabold text-[#1C221E] dark:text-white mt-0.5">
                  {userConfirmModal.title}
                </h3>
              </div>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-300 mb-3 leading-relaxed">
              {userConfirmModal.subtitle}
            </p>
            <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 mb-5 text-xs">
              <p className="font-extrabold text-[#1C221E] dark:text-white">
                {userConfirmModal.itemName}
              </p>
              <p className="text-[11px] text-stone-500 mt-1">{userConfirmModal.detailText}</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setUserConfirmStep('review');
                }}
                className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-extrabold text-stone-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  setUserConfirmStep('syncing');
                  try {
                    await userConfirmModal.onConfirm();
                    setUserConfirmStep('done');
                  } catch (err) {
                    setUserConfirmStep('review');
                    console.error(err);
                  }
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-sm"
              >
                {userConfirmModal.confirmLabel}
              </button>
            </div>
          </>
        ) : userConfirmStep === 'syncing' ? (
          <div className="py-6 text-center space-y-3 animate-in fade-in">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                userConfirmModal.kind === 'delete'
                  ? 'bg-rose-600 text-white ring-4 ring-rose-200 dark:ring-rose-900/50'
                  : 'bg-[#0B484C] text-[#F3D37A] ring-4 ring-[#D9B352]/50'
              }`}
            >
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white">
              {userConfirmModal.kind === 'delete'
                ? 'Menghapus & Menyinkronkan ke Google Sheets...'
                : 'Menyimpan & Menyinkronkan ke Google Sheets...'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-300 max-w-xs mx-auto leading-relaxed">
              {userConfirmModal.kind === 'delete'
                ? 'Mohon tunggu sebentar, data sedang dihapus dari database dan tab Google Sheets sedang diperbarui...'
                : 'Mohon tunggu sebentar, data sedang diperbarui dan disinkronkan ke Google Sheets...'}
            </p>
          </div>
        ) : (
          <div className="py-4 text-center animate-in fade-in">
            <div className="w-14 h-14 rounded-full bg-emerald-600 text-white ring-4 ring-emerald-200 dark:ring-emerald-900/50 flex items-center justify-center mx-auto mb-3 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white mb-1">
              {userConfirmModal.kind === 'delete'
                ? 'Data Berhasil Dihapus!'
                : 'Perubahan Berhasil Disimpan!'}
            </h3>
            <p className="text-xs text-stone-400 mb-5">
              {userConfirmModal.kind === 'delete'
                ? 'Data telah dihapus dari sistem dan Google Sheets telah diperbarui secara langsung.'
                : 'Data telah diperbarui dan Google Sheets telah disinkronkan secara langsung.'}
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                setUserConfirmStep('review');
              }}
              className="carlic-sage-btn text-[#F3D37A] font-extrabold px-6 py-2.5 rounded-xl text-xs w-full sm:w-auto shadow-sm"
            >
              Selesai / Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
