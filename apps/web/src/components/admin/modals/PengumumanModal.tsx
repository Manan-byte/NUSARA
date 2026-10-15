import React, { useState, useRef } from 'react';
import { PengumumanRecord } from '@sim-warga/types';
import { X, Megaphone, UploadCloud, Image, Trash2, Check, ExternalLink } from 'lucide-react';
import { CustomSelect } from '../../common/CustomSelect';

export const getDefaultAnnouncementBanner = (category: string): string => {
  const k = (category || '').toLowerCase();
  if (k.includes('kerja bakti') || k.includes('sosial') || k.includes('lingkungan')) {
    return '/kerja-bakti.jpg';
  }
  if (k.includes('keamanan') || k.includes('ronda') || k.includes('siskamling')) {
    return '/pos-keamanan.jpg';
  }
  if (k.includes('rapat') || k.includes('warga') || k.includes('pju')) {
    return '/balai-pertemuan.jpg';
  }
  if (k.includes('fasum') || k.includes('taman')) {
    return '/fasum-taman.jpg';
  }
  return '/lush-ridge-trail.jpg';
};

interface PengumumanModalProps {
  initialData?: PengumumanRecord | null;
  authorName: string;
  onClose: () => void;
  onSave: (data: PengumumanRecord) => Promise<void> | void;
}
export const PengumumanModal: React.FC<PengumumanModalProps> = ({
  initialData,
  authorName,
  onClose,
  onSave,
}) => {
  const [judul, setJudul] = useState<string>(initialData?.judul || '');
  const [kategori, setKategori] = useState<PengumumanRecord['kategori']>(
    initialData?.kategori || 'Info Warga & Fasum'
  );
  const [tanggal, setTanggal] = useState<string>(initialData?.tanggalAcara || '17 Okt 2026');
  const [waktu, setWaktu] = useState<string>(initialData?.waktu || '09.00 - 16.00 WIB');
  const [lokasi, setLokasi] = useState<string>(
    initialData?.lokasi || 'Tiang Jalan Utama & Gang Blok C-E'
  );
  const [deskripsi, setDeskripsi] = useState<string>(initialData?.deskripsi || '');
  const [gambar, setGambar] = useState<string>(
    initialData?.gambarBanner || ''
  );
  const [customUrl, setCustomUrl] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('File harus berupa foto gambar (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ukuran file terlalu besar. Maksimal 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) {
        setGambar(res);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim() || !deskripsi.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const finalBanner = gambar.trim() || getDefaultAnnouncementBanner(kategori);
      const record: PengumumanRecord = {
        id: initialData?.id || `PGM-${Date.now().toString().slice(-4)}`,
        judul: judul.trim(),
        kategori,
        tanggalAcara: tanggal.trim(),
        waktu: waktu.trim(),
        lokasi: lokasi.trim(),
        deskripsi: deskripsi.trim(),
        author: initialData?.author || authorName,
        status: 'PUBLISHED',
        createdAt: initialData?.createdAt || '13 Okt 2026',
        gambarBanner: finalBanner,
      };
      await onSave(record);
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
        className="bg-white dark:bg-[#072426] max-w-xl w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C221E] dark:text-white">
                {initialData ? 'Edit Jarkoman Warga' : '+ Buat Jarkoman / Pengumuman Baru'}
              </h3>
              <p className="text-xs text-stone-400 font-semibold">
                Pengumuman resmi disiarkan ke papan informasi digital warga PK8
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
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Cth: Kerja Bakti Massal Saluran Air Blok A-E..."
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Kategori Kegiatan
              </label>
              <CustomSelect
                value={kategori}
                onChange={(val) =>
                  setKategori(val as PengumumanRecord['kategori'])
                }
                options={[
                  'Info Warga & Fasum',
                  'Sosial & Kerja Bakti',
                  'Rapat Warga',
                  'Keamanan & Ronda',
                ]}
                buttonClassName={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Tanggal Kegiatan
              </label>
              <input
                type="text"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                placeholder="17 Okt 2026..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={waktu}
                onChange={(e) => setWaktu(e.target.value)}
                placeholder="09.00 - 16.00 WIB..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Lokasi Pelaksanaan
              </label>
              <input
                type="text"
                value={lokasi}
                onChange={(e) => setLokasi(e.target.value)}
                placeholder="Cth: Balai Pertemuan & Pos Ronda..."
                className={inputClass}
              />
            </div>
          </div>

          {/* BANNER FOTO KEGIATAN & FILE UPLOAD */}
          <div className="p-3.5 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <label className="block font-black text-stone-800 dark:text-[#F3D37A] uppercase text-[11px] tracking-wider">
                  Banner Foto Kegiatan <span className="text-stone-400 font-semibold lowercase">(opsional / tidak wajib)</span>
                </label>
                <p className="text-[10px] text-stone-500 dark:text-stone-400">
                  Jika tidak diupload, sistem otomatis memasang gambar default resmi bertema <strong>{kategori}</strong>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-[11px] flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 flex-shrink-0 mt-1 sm:mt-0"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Foto dari Komputer</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {uploadError && (
              <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
                ⚠️ {uploadError}
              </p>
            )}

            {/* Live Preview Box */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden border-2 border-stone-300 dark:border-stone-600 bg-stone-100 dark:bg-stone-800 group shadow-xs">
              <img
                src={gambar || getDefaultAnnouncementBanner(kategori)}
                alt="Pratinjau Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[#F3D37A] font-bold text-[10px] border border-white/20">
                  {gambar ? '✓ Foto Khusus Terpasang' : `✓ Gambar Default Otomatis (${kategori})`}
                </span>
                {gambar && (
                  <button
                    type="button"
                    onClick={() => setGambar('')}
                    className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                    title="Kembalikan ke gambar default"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            {/* Quick Presets */}
            <div>
              <span className="text-[10px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider block mb-1.5">
                Atau Pilih Foto Preset Siap Pakai:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'Kerja Bakti', path: '/kerja-bakti.jpg' },
                  { label: 'Pos Keamanan', path: '/pos-keamanan.jpg' },
                  { label: 'Fasum Taman', path: '/fasum-taman.jpg' },
                  { label: 'Balai Warga', path: '/balai-pertemuan.jpg' },
                ].map((preset) => (
                  <button
                    key={preset.path}
                    type="button"
                    onClick={() => setGambar(preset.path)}
                    className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border-2 transition-all flex items-center justify-center gap-1 ${
                      gambar === preset.path
                        ? 'bg-[#0B484C] text-[#F3D37A] border-[#D9B352]/70 shadow-xs'
                        : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Direct URL input option */}
            <div className="pt-1 border-t border-stone-200 dark:border-stone-700">
              <label className="block text-[10px] font-bold text-stone-500 dark:text-stone-400 mb-1">
                Link URL Gambar Eksternal (Opsional):
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/banner-kegiatan.jpg..."
                  className="flex-1 h-8 px-3 rounded-xl border border-stone-300 dark:border-stone-600 bg-white dark:bg-[#072426] text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customUrl.trim()) {
                      setGambar(customUrl.trim());
                      setCustomUrl('');
                    }
                  }}
                  className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-[10px] border"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Rincian Isi Deskripsi Pengumuman *
            </label>
            <textarea
              rows={4}
              required
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan detail agenda rapat, perlengkapan yang perlu dibawa, atau informasi penting lainnya..."
              className="w-full p-3 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] focus:ring-2 focus:ring-[#0B484C]/20 bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white text-xs leading-relaxed focus:outline-none shadow-xs font-medium"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t-2 border-stone-200 dark:border-stone-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 border-2 border-stone-300 dark:border-stone-600 text-xs font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] text-[#F3D37A] text-xs font-extrabold shadow-md hover:bg-[#093A3E] transition-all"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Jarkoman'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
