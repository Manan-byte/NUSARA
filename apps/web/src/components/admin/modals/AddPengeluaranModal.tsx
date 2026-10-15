import React, { useState } from 'react';
import { PengeluaranKasRecord } from '@sim-warga/types';
import { X, Wallet } from 'lucide-react';
import { CustomSelect } from '../../common/CustomSelect';

interface AddPengeluaranModalProps {
  onClose: () => void;
  onAddPengeluaran: (item: PengeluaranKasRecord) => Promise<void> | void;
}

export const AddPengeluaranModal: React.FC<AddPengeluaranModalProps> = ({
  onClose,
  onAddPengeluaran,
}) => {
  const [tanggal, setTanggal] = useState<string>('13 Okt 2026');
  const [kategori, setKategori] = useState<PengeluaranKasRecord['kategori']>('Sampah & Kebersihan');
  const [keterangan, setKeterangan] = useState<string>('');
  const [nominal, setNominal] = useState<string>('');
  const [penerima, setPenerima] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nom = parseInt(nominal, 10);
    if (!nom || !keterangan.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAddPengeluaran({
        id: `EXP-${Date.now().toString().slice(-4)}`,
        tanggal: tanggal.trim() || '13 Okt 2026',
        kategori: kategori,
        keterangan: keterangan.trim(),
        nominal: nom,
        penerima: penerima.trim() || 'Petugas Lingkungan',
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] focus:ring-2 focus:ring-[#0B484C]/20 bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-bold transition-all shadow-xs focus:outline-none text-xs';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-md w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1C221E] dark:text-white">
                + Catat Pengeluaran Kas RT Baru
              </h3>
              <p className="text-[10px] text-stone-400 font-semibold">
                Pencatatan kas keluar disinkronkan ke spreadsheet resmi
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Tanggal Transaksi *
            </label>
            <input
              type="text"
              required
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              placeholder="13 Okt 2026..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Kategori Pengeluaran *
            </label>
            <CustomSelect
              value={kategori}
              onChange={(val) =>
                setKategori(val as PengeluaranKasRecord['kategori'])
              }
              options={[
                'Sampah & Kebersihan',
                'Keamanan & Satpam',
                'Listrik & PJU',
                'Perbaikan Fasum',
                'Kegiatan Warga',
                'Lainnya',
              ]}
              buttonClassName="w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-bold text-xs shadow-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Keterangan Biaya *
            </label>
            <input
              type="text"
              required
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder="Cth: Iuran pengambilan sampah blok A-E..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nominal Biaya (Rp) *
            </label>
            <input
              type="number"
              required
              min="1000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              placeholder="150000..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nama Penerima Dana
            </label>
            <input
              type="text"
              value={penerima}
              onChange={(e) => setPenerima(e.target.value)}
              placeholder="Cth: Pak Sutrisno (Petugas Sampah)..."
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-2 border-stone-300 dark:border-stone-600 font-bold transition-all text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold shadow-md hover:bg-[#093A3E] transition-all text-xs"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kas Keluar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
