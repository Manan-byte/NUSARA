import React from 'react';
import { Modal, PillButton } from '@sim-warga/ui';
import { AlertTriangle, Trash2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  description?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus Data',
  itemName,
  description = 'Data yang dihapus tidak dapat dipulihkan kembali. Apakah Anda yakin ingin melanjutkan?',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Perhatian: Tindakan ini permanen"
      maxWidth="sm"
    >
      <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
        <div className="flex items-start gap-3 p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-2xl text-rose-800 dark:text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-xs text-rose-900 dark:text-rose-100">
              Yakin ingin menghapus {itemName ? `"${itemName}"` : 'data ini'}?
            </p>
            <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <PillButton
            variant="ghost"
            size="sm"
            type="button"
            onClick={onClose}
          >
            Batal
          </PillButton>
          <PillButton
            variant="danger"
            size="sm"
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            icon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Ya, Hapus Data
          </PillButton>
        </div>
      </div>
    </Modal>
  );
};
