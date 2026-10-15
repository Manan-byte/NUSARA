import React, { useState } from 'react';
import { ItemUrunanWarga, TipeUrunan } from '@sim-warga/types';
import { X, Lightbulb } from 'lucide-react';
import { CustomSelect } from '../../common/CustomSelect';

interface AddUrunanModalProps {
  onClose: () => void;
  onSave: (item: ItemUrunanWarga) => Promise<void> | void;
}

export const AddUrunanModal: React.FC<AddUrunanModalProps> = ({
  onClose,
  onSave,
}) => {
  const [nama, setNama] = useState<string>('');
  const [lokasi, setLokasi] = useState<string>('');
  const [tipe, setTipe] = useState<TipeUrunan>('URUNAN_WAJIB');
  const [nominal, setNominal] = useState<string>('115000');
  const [metode, setMetode] = useState<string>('Cash');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nom = parseInt(nominal, 10);
    if (!nama.trim() || !nom || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSave({
        id: `PJU-${Date.now().toString().slice(-4)}`,
        noUrut: 1,
        programId: 'PROG-PJU-01',
        namaWarga: nama.trim(),
        nominal: nom,
        tanggal: '13 Okt 2026',
        tipe,
        metode,
        status: 'Lunas',
        buktiBayar: '-',
        keterangan: lokasi.trim() || 'Dicatat manual oleh Bendahara RT',
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
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1C221E] dark:text-white">
                + Input Setoran Urunan PJU Manual
              </h3>
              <p className="text-[10px] text-stone-400 font-semibold">
                Pencatatan setoran tunai atau transfer langsung oleh Bendahara
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
              Nama Warga / Donatur *
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Cth: Bapak Sutrisno..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Blok / Alamat Rumah
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Cth: Blok D8 No. 12..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tipe Setoran
              </label>
              <CustomSelect
                value={tipe}
                onChange={(val) => setTipe(val as TipeUrunan)}
                options={[
                  { value: 'URUNAN_WAJIB', label: 'Urunan Wajib (Rp 115rb)' },
                  { value: 'DONATUR', label: 'Donatur Bebas' },
                ]}
                buttonClassName={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Metode Pembayaran
              </label>
              <CustomSelect
                value={metode}
                onChange={(val) => setMetode(val)}
                options={['Cash', 'Transfer Bank']}
                buttonClassName={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Nominal Setoran (Rp) *
            </label>
            <input
              type="number"
              required
              min="10000"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
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
              {isSubmitting ? 'Menyimpan...' : 'Simpan Setoran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
