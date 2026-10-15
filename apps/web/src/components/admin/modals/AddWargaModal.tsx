import React, { useState } from 'react';
import { WargaRecord, StatusTempatTinggal, StatusIPL } from '@sim-warga/types';
import { X, UserPlus } from 'lucide-react';
import { CustomSelect } from '../../common/CustomSelect';

export const ALL_BLOK_AZ_OPTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

interface AddWargaModalProps {
  tarifIpl: number;
  onClose: () => void;
  onAddWarga: (w: WargaRecord) => Promise<void> | void;
}

export const AddWargaModal: React.FC<AddWargaModalProps> = ({
  tarifIpl,
  onClose,
  onAddWarga,
}) => {
  const [nama, setNama] = useState<string>('');
  const [blok, setBlok] = useState<string>('D');
  const [noBlok, setNoBlok] = useState<string>('8');
  const [noRumah, setNoRumah] = useState<string>('');
  const [wa, setWa] = useState<string>('');
  const [domisili, setDomisili] = useState<StatusTempatTinggal>('Menetap');
  const [jiwa, setJiwa] = useState<string>('3');
  const [statusIpl, setStatusIpl] = useState<StatusIPL>('Belum Bayar');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !noRumah.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const cleanBlok = `${blok.toUpperCase()}${noBlok.trim()}`;
      const cleanNo = noRumah.trim();
      await onAddWarga({
        id: `WRG-${Date.now().toString().slice(-4)}`,
        namaLengkap: nama.trim(),
        jenisKelamin: 'Laki-laki',
        pekerjaan: 'Karyawan Swasta',
        agama: 'Islam',
        statusPernikahan: 'Menikah',
        blok: cleanBlok,
        noRumah: cleanNo,
        alamatRumah: `Blok ${cleanBlok} No. ${cleanNo}`,
        noWhatsapp: wa.trim() || '-',
        statusTempatTinggal: domisili,
        statusDalamKeluarga: 'Kepala Keluarga',
        jmlJiwa: Math.max(1, parseInt(jiwa, 10) || 1),
        anggotaKeluargaTambahan: '-',
        statusIpl: statusIpl,
        periodeTercover: 'Oktober 2026',
        nominalIpl: tarifIpl || 30000,
        tanggalUpdate: '13 Okt 2026',
        catatan: 'Ditambahkan Pengurus',
        pin: '1234',
      });
      onClose();
    } finally {
      setIsSaving(false);
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
        className="bg-white dark:bg-[#072426] max-w-2xl w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C221E] dark:text-white">
                + Tambah Data Warga Baru
              </h3>
              <p className="text-xs text-stone-400 font-semibold">
                Pencatatan data warga baru RT 08 Pesona Kahuripan 8
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] block">
              Identitas Kepala Keluarga &amp; Rumah
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nama Lengkap Kepala Keluarga *
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Cth: Bapak H. Hendra Wijaya..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Blok Huruf *
                </label>
                <CustomSelect
                  value={blok}
                  onChange={(val) => setBlok(val)}
                  options={ALL_BLOK_AZ_OPTIONS.map((b) => ({ value: b, label: `Blok ${b}` }))}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Blok (Cth: 8)
                </label>
                <input
                  type="text"
                  value={noBlok}
                  onChange={(e) => setNoBlok(e.target.value)}
                  placeholder="8..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor Rumah *
                </label>
                <input
                  type="text"
                  required
                  value={noRumah}
                  onChange={(e) => setNoRumah(e.target.value)}
                  placeholder="Cth: 12..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  value={wa}
                  onChange={(e) => setWa(e.target.value)}
                  placeholder="081234567890..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Domisili
                </label>
                <CustomSelect
                  value={domisili}
                  onChange={(val) => setDomisili(val as StatusTempatTinggal)}
                  options={['Menetap', 'Pulang-Pergi', 'Belum menetap']}
                  buttonClassName={inputClass}
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Jumlah Jiwa
                </label>
                <input
                  type="number"
                  min="1"
                  value={jiwa}
                  onChange={(e) => setJiwa(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Status Awal IPL
                </label>
                <CustomSelect
                  value={statusIpl}
                  onChange={(val) => setStatusIpl(val as StatusIPL)}
                  options={['Belum Bayar', 'Lunas']}
                  buttonClassName={inputClass}
                  dropUp={true}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-2 border-stone-300 dark:border-stone-600 font-bold transition-all text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold shadow-md transition-all text-xs"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Warga Baru'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
