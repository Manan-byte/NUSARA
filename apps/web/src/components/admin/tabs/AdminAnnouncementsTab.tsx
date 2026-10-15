import React, { useState } from 'react';
import { PengumumanRecord, AdminAccount } from '@sim-warga/types';
import {
  Megaphone,
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Image,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
export interface AdminAnnouncementsTabProps {
  pengumumanList: PengumumanRecord[];
  currentAdmin: AdminAccount;
  onAddPengumuman: (newP: PengumumanRecord) => Promise<void> | void;
  onUpdatePengumuman: (updated: PengumumanRecord) => void;
  onDeletePengumuman: (id: string) => void;
}

export const AdminAnnouncementsTab: React.FC<AdminAnnouncementsTabProps> = ({
  pengumumanList,
  currentAdmin,
  onAddPengumuman,
  onUpdatePengumuman,
  onDeletePengumuman,
}) => {
  const [jarkomMode, setJarkomMode] = useState<'list' | 'form'>('list');
  const [pgmFilterKat, setPgmFilterKat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pgmPage, setPgmPage] = useState<number>(1);
  const pgmPerPage = 6;

  // Form states
  const [editingPengumuman, setEditingPengumuman] = useState<PengumumanRecord | null>(null);
  const [pgmJudul, setPgmJudul] = useState<string>('');
  const [pgmKategori, setPgmKategori] = useState<PengumumanRecord['kategori']>('Info Warga & Fasum');
  const [pgmTanggal, setPgmTanggal] = useState<string>('17 Okt 2026');
  const [pgmWaktu, setPgmWaktu] = useState<string>('09.00 - 16.00 WIB');
  const [pgmLokasi, setPgmLokasi] = useState<string>('Tiang Jalan Utama & Gang Blok C-E');
  const [pgmDeskripsi, setPgmDeskripsi] = useState<string>('');
  const [pgmGambar, setPgmGambar] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const filteredPengumuman = pengumumanList.filter((p) => {
    const matchKat = pgmFilterKat === 'ALL' || p.kategori === pgmFilterKat;
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      p.judul.toLowerCase().includes(q) ||
      p.deskripsi.toLowerCase().includes(q) ||
      p.lokasi.toLowerCase().includes(q);
    return matchKat && matchSearch;
  });

  const totalPgmPages = Math.max(1, Math.ceil(filteredPengumuman.length / pgmPerPage));
  const paginatedPgm = filteredPengumuman.slice(
    (pgmPage - 1) * pgmPerPage,
    pgmPage * pgmPerPage
  );

  const handleOpenEdit = (pgm: PengumumanRecord) => {
    setEditingPengumuman(pgm);
    setPgmJudul(pgm.judul);
    setPgmDeskripsi(pgm.deskripsi);
    setPgmKategori(pgm.kategori);
    setPgmTanggal(pgm.tanggalAcara);
    setPgmWaktu(pgm.waktu);
    setPgmLokasi(pgm.lokasi);
    setPgmGambar(pgm.gambarBanner || '');
    setJarkomMode('form');
  };

  const handleOpenNew = () => {
    setEditingPengumuman(null);
    setPgmJudul('');
    setPgmDeskripsi('');
    setPgmKategori('Info Warga & Fasum');
    setPgmTanggal('17 Okt 2026');
    setPgmWaktu('09.00 - 16.00 WIB');
    setPgmLokasi('Tiang Jalan Utama & Gang Blok C-E');
    setPgmGambar('/kerja-bakti.jpg');
    setJarkomMode('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pgmJudul.trim() || !pgmDeskripsi.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (editingPengumuman) {
        onUpdatePengumuman({
          ...editingPengumuman,
          judul: pgmJudul.trim(),
          kategori: pgmKategori,
          tanggalAcara: pgmTanggal.trim(),
          waktu: pgmWaktu.trim(),
          lokasi: pgmLokasi.trim(),
          deskripsi: pgmDeskripsi.trim(),
          gambarBanner: pgmGambar || editingPengumuman.gambarBanner,
        });
      } else {
        await onAddPengumuman({
          id: `PGM-${Date.now().toString().slice(-4)}`,
          judul: pgmJudul.trim(),
          kategori: pgmKategori,
          tanggalAcara: pgmTanggal.trim(),
          waktu: pgmWaktu.trim(),
          lokasi: pgmLokasi.trim(),
          deskripsi: pgmDeskripsi.trim(),
          author: currentAdmin.nama,
          status: 'PUBLISHED',
          createdAt: '13 Okt 2026',
          gambarBanner: pgmGambar || undefined,
        });
      }
      setJarkomMode('list');
      setEditingPengumuman(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Papan Jarkoman &amp; Publikasi
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Journal Resmi Agenda Warga, Jadwal Rapat &amp; Pengumuman Paguyuban RT 08
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => (jarkomMode === 'form' ? setJarkomMode('list') : handleOpenNew())}
            className="h-9 px-4 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{jarkomMode === 'form' ? '← Kembali ke Journal' : '+ Tambah Jarkoman'}</span>
          </button>
        </div>
      </div>

      {jarkomMode === 'list' ? (
        <>
          {/* 2. FILTER & SEARCH PILL BAR */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                'ALL',
                'Info Warga & Fasum',
                'Sosial & Kerja Bakti',
                'Rapat Warga',
                'Keamanan & Ronda',
              ].map((kat) => (
                <button
                  key={kat}
                  type="button"
                  onClick={() => {
                    setPgmFilterKat(kat);
                    setPgmPage(1);
                  }}
                  className={`h-8 px-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    pgmFilterKat === kat
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {kat === 'ALL' ? `Semua Agenda (${pengumumanList.length})` : kat}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPgmPage(1);
                }}
                placeholder="Cari jarkoman, catatan, lokasi..."
                className="w-full h-8 pl-9 pr-3.5 rounded-xl bg-stone-100 dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/40 text-xs text-[#1C221E] dark:text-white placeholder:text-stone-400 focus:outline-none"
              />
            </div>
          </div>

          {/* 3. GROUPED JOURNAL CARDS */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-3.5 pr-1">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs space-y-3">
              <div className="flex items-center justify-between text-xs font-extrabold pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-2 text-[#0B484C] dark:text-[#F3D37A]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Agenda Aktif Warga • Oktober 2026</span>
                  <span className="text-[10px] text-stone-400 font-normal">
                    ({filteredPengumuman.length} Kegiatan Ditampilkan)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full font-bold">
                  Published Resmi Paguyuban
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedPgm.map((pgm) => (
                  <div
                    key={pgm.id}
                    className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/30 hover:border-[#0B484C] transition-all flex flex-col justify-between shadow-2xs group"
                  >
                    <div>
                      {/* Card Top: Badges & Action Menu */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {pgm.kategori}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-stone-800 text-stone-600 border">
                            {pgm.waktu}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(pgm)}
                            className="p-1 rounded-md hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-500"
                            title="Edit Jarkoman"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeletePengumuman(pgm.id)}
                            className="p-1 rounded-md hover:bg-rose-50 text-rose-500"
                            title="Hapus Jarkoman"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Banner Image Preview */}
                      {pgm.gambarBanner && (
                        <div className="w-full h-24 rounded-xl overflow-hidden mb-2 border border-stone-200/60">
                          <img
                            src={pgm.gambarBanner}
                            alt={pgm.judul}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white line-clamp-2 leading-snug">
                        {pgm.judul}
                      </h4>

                      <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-3 mt-1.5 leading-relaxed">
                        {pgm.deskripsi}
                      </p>
                    </div>

                    <div className="pt-2.5 mt-2.5 border-t border-stone-200/70 dark:border-stone-800 space-y-1 text-[10px] text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-[#0B484C] dark:text-[#F3D37A]" />
                        <span>{pgm.tanggalAcara}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="truncate">{pgm.lokasi}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex items-center justify-between text-xs flex-shrink-0">
              <span className="text-stone-400">
                Menampilkan{' '}
                <strong className="text-[#1C221E] dark:text-white">
                  {filteredPengumuman.length === 0 ? 0 : (pgmPage - 1) * pgmPerPage + 1} -{' '}
                  {Math.min(pgmPage * pgmPerPage, filteredPengumuman.length)}
                </strong>{' '}
                dari {filteredPengumuman.length} Agenda
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pgmPage === 1}
                  onClick={() => setPgmPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <span className="px-2 font-bold text-xs">
                  {pgmPage} / {totalPgmPages}
                </span>
                <button
                  type="button"
                  disabled={pgmPage >= totalPgmPages}
                  onClick={() => setPgmPage((p) => Math.min(totalPgmPages, p + 1))}
                  className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* FORM INPUT / EDIT JARKOMAN */
        <div className="p-5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs max-w-xl mx-auto w-full flex-1 overflow-y-auto">
          <h3 className="font-extrabold text-sm text-[#1C221E] dark:text-white mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A]" />
            <span>{editingPengumuman ? 'Edit Jarkoman Paguyuban' : 'Buat Jarkoman Baru'}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                Judul Pengumuman *
              </label>
              <input
                type="text"
                required
                value={pgmJudul}
                onChange={(e) => setPgmJudul(e.target.value)}
                placeholder="Cth: Kerja Bakti Massal Saluran Air Blok A-E..."
                className="w-full h-10 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                  Kategori
                </label>
                <select
                  value={pgmKategori}
                  onChange={(e) =>
                    setPgmKategori(e.target.value as PengumumanRecord['kategori'])
                  }
                  className="w-full h-9 px-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white font-bold"
                >
                  <option value="Info Warga & Fasum">Info Warga &amp; Fasum</option>
                  <option value="Sosial & Kerja Bakti">Sosial &amp; Kerja Bakti</option>
                  <option value="Rapat Warga">Rapat Warga</option>
                  <option value="Keamanan & Ronda">Keamanan &amp; Ronda</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                  Preset Banner Gambar
                </label>
                <div className="flex gap-1 flex-wrap">
                  {['/kerja-bakti.jpg', '/pos-keamanan.jpg', '/fasum-taman.jpg', '/balai-pertemuan.jpg'].map(
                    (p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPgmGambar(p)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold transition-all ${
                          pgmGambar === p
                            ? 'bg-[#0B484C] text-[#F3D37A]'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {p.replace('/', '').replace('.jpg', '')}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                  Tanggal Acara / Kegiatan
                </label>
                <input
                  type="text"
                  value={pgmTanggal}
                  onChange={(e) => setPgmTanggal(e.target.value)}
                  placeholder="17 Okt 2026..."
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                  Waktu Pelaksanaan
                </label>
                <input
                  type="text"
                  value={pgmWaktu}
                  onChange={(e) => setPgmWaktu(e.target.value)}
                  placeholder="08.00 - 11.30 WIB..."
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                  Lokasi Kegiatan
                </label>
                <input
                  type="text"
                  value={pgmLokasi}
                  onChange={(e) => setPgmLokasi(e.target.value)}
                  placeholder="Cth: Balai Warga / Pos Ronda Utama RT 08..."
                  className="w-full h-9 px-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-emerald-100 mb-1">
                Isi Lengkap Deskripsi Jarkoman *
              </label>
              <textarea
                rows={4}
                required
                value={pgmDeskripsi}
                onChange={(e) => setPgmDeskripsi(e.target.value)}
                placeholder="Rincian informasi agenda kegiatan RT..."
                className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] text-[#1C221E] dark:text-white text-xs leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-stone-200/70 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setJarkomMode('list')}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-[#051E20] text-stone-700 dark:text-stone-300 text-xs font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-[#0B484C] text-[#F3D37A] text-xs font-extrabold shadow-sm hover:bg-[#093A3E]"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Jarkoman'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
