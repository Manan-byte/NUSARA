import React, { useState } from 'react';
import { PillBadge, Modal } from '@sim-warga/ui';
import { PengumumanRecord } from '@sim-warga/types';
import { Calendar, MapPin, User, Plus, Edit, Trash2, Clock, Sparkles, Share2, ExternalLink } from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CustomSelect } from '../common/CustomSelect';
export interface PengumumanFeedProps {
  pengumumanList: PengumumanRecord[];
  isAdmin: boolean;
  onAddPengumuman: (item: PengumumanRecord) => void;
  onUpdatePengumuman?: (item: PengumumanRecord) => void;
  onDeletePengumuman: (id: string) => void;
}

export const PengumumanFeed: React.FC<PengumumanFeedProps> = ({
  pengumumanList,
  isAdmin,
  onAddPengumuman,
  onUpdatePengumuman,
  onDeletePengumuman,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PengumumanRecord | null>(null);
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');

  // Form states
  const [formJudul, setFormJudul] = useState('');
  const [formKategori, setFormKategori] = useState<PengumumanRecord['kategori']>('Sosial & Kerja Bakti');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formTanggalAcara, setFormTanggalAcara] = useState('');
  const [formWaktu, setFormWaktu] = useState('08:00 WIB - Selesai');
  const [formLokasi, setFormLokasi] = useState('Lingkungan RT 08');
  const [formBannerUrl, setFormBannerUrl] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormJudul('');
    setFormKategori('Sosial & Kerja Bakti');
    setFormDeskripsi('');
    setFormTanggalAcara('');
    setFormWaktu('08:00 WIB - Selesai');
    setFormLokasi('Lingkungan RT 08');
    setFormBannerUrl('/kerja-bakti.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PengumumanRecord) => {
    setEditingId(p.id);
    setFormJudul(p.judul);
    setFormKategori(p.kategori);
    setFormDeskripsi(p.deskripsi);
    setFormTanggalAcara(p.tanggalAcara);
    setFormWaktu(p.waktu);
    setFormLokasi(p.lokasi);
    setFormBannerUrl(p.gambarBanner || '/kerja-bakti.jpg');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formDeskripsi.trim()) return;

    if (editingId && onUpdatePengumuman) {
      const updated: PengumumanRecord = {
        id: editingId,
        judul: formJudul.trim(),
        kategori: formKategori,
        deskripsi: formDeskripsi.trim(),
        tanggalAcara: formTanggalAcara.trim() || 'Akan Datang',
        waktu: formWaktu.trim() || 'WIB',
        lokasi: formLokasi.trim() || 'Lingkungan RT 08',
        gambarBanner: formBannerUrl || '/kerja-bakti.jpg',
        author: 'Pengurus RT 08',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      };
      onUpdatePengumuman(updated);
    } else {
      const newPengumuman: PengumumanRecord = {
        id: `ann-${Date.now()}`,
        judul: formJudul.trim(),
        kategori: formKategori,
        deskripsi: formDeskripsi.trim(),
        tanggalAcara: formTanggalAcara.trim() || 'Akan Datang',
        waktu: formWaktu.trim() || 'WIB',
        lokasi: formLokasi.trim() || 'Lingkungan RT 08',
        gambarBanner: formBannerUrl || '/kerja-bakti.jpg',
        author: 'Pengurus RT 08',
        status: 'PUBLISHED',
        createdAt: new Date().toISOString(),
      };
      onAddPengumuman(newPengumuman);
    }

    setIsModalOpen(false);
  };

  const filteredPengumuman = pengumumanList.filter((p) => {
    if (selectedKategori === 'ALL') return true;
    return p.kategori.toLowerCase().includes(selectedKategori.toLowerCase());
  });

  return (
    <div className="w-full mb-10 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Agenda &amp; Kegiatan Warga</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Papan Pengumuman &amp; Kegiatan Lingkungan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Informasi resmi agenda kerja bakti, rapat warga, dan imbauan keamanan RT 08 Pesona Kahuripan 8.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Pengumuman Baru</span>
          </button>
        )}
      </div>

      {/* KATEGORI FILTER INTERAKTIF */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'Semua Agenda Kegiatan' },
          { id: 'Kerja Bakti', label: '🧹 Kerja Bakti' },
          { id: 'Rapat', label: '👥 Rapat Warga' },
          { id: 'Sosial', label: '🤝 Sosial & Lingkungan' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedKategori(cat.id)}
            className={`text-xs px-4 py-2 rounded-full font-bold transition-all whitespace-nowrap ${
              selectedKategori === cat.id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid of Announcement Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPengumuman.map((p) => {
          const bannerUrl = p.gambarBanner || '/kerja-bakti.jpg';
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-[#111827] rounded-3xl overflow-hidden flex flex-col justify-between border border-slate-200/90 dark:border-slate-800 shadow-sm hover:border-blue-500/60 hover:shadow-md transition-all group"
            >
              {/* Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={bannerUrl}
                  alt={p.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30" />
                <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    {p.kategori}
                  </span>
                  {isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="text-white hover:text-emerald-300 p-1.5 rounded-full bg-black/60 backdrop-blur-xs transition-colors"
                        title="Edit pengumuman"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setItemToDelete(p)}
                        className="text-white hover:text-rose-400 p-1.5 rounded-full bg-black/60 backdrop-blur-xs transition-colors"
                        title="Hapus pengumuman"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2.5 leading-snug">
                    {p.judul}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-6">
                    {p.deskripsi}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {p.tanggalAcara} ({p.waktu})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {p.lokasi}
                  </span>
                  <span className="flex items-center gap-1.5 ml-auto text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5" />
                    {p.author}
                  </span>
                </div>

                {/* Interactive Action Buttons: WhatsApp Share & Google Calendar */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `📢 *PENGUMUMAN WARGA RT 08 PESONA KAHURIPAN 8*\n\n` +
                        `📌 *Kegiatan:* ${p.judul}\n` +
                        `🗓️ *Waktu:* ${p.tanggalAcara} (${p.waktu})\n` +
                        `📍 *Lokasi:* ${p.lokasi}\n\n` +
                        `${p.deskripsi}\n\n` +
                        `_Pesan resmi dari Pengurus RT 08._`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan WA</span>
                  </a>

                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(p.judul)}&details=${encodeURIComponent(p.deskripsi)}&location=${encodeURIComponent(p.lokasi)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Simpan jadwal kegiatan ini ke Google Calendar di smartphone Anda"
                  >
                    <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Simpan Kalender</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Popup Konfirmasi Hapus Pengumuman */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => {
          if (itemToDelete) {
            onDeletePengumuman(itemToDelete.id);
          }
        }}
        title="Hapus Pengumuman Kegiatan"
        itemName={itemToDelete?.judul}
        description="Pengumuman ini akan dihapus dari portal warga dan tidak dapat dikembalikan."
      />

      {/* Modal Admin: Buat / Edit Pengumuman */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Pengumuman Kegiatan' : 'Buat Pengumuman Baru'}
        subtitle="Publikasikan informasi kegiatan warga ke dashboard portal."
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-900 dark:text-slate-200 mb-1">
              Judul Pengumuman *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Kerja Bakti Lingkungan Blok D &amp; E"
              value={formJudul}
              onChange={(e) => setFormJudul(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Kategori Kegiatan"
                value={formKategori}
                onChange={(val) => setFormKategori(val as PengumumanRecord['kategori'])}
                options={[
                  'Sosial & Kerja Bakti',
                  'Rapat Warga',
                  'Keagamaan',
                  'Keamanan & Ronda',
                ]}
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-slate-200 mb-1">
                Tanggal Acara
              </label>
              <input
                type="text"
                placeholder="Contoh: Minggu, 12 Okt 2026"
                value={formTanggalAcara}
                onChange={(e) => setFormTanggalAcara(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-white dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                placeholder="08:00 WIB - Selesai"
                value={formWaktu}
                onChange={(e) => setFormWaktu(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Lokasi / Titik Kumpul
              </label>
              <input
                type="text"
                placeholder="Pos Kamling / Fasum Blok E"
                value={formLokasi}
                onChange={(e) => setFormLokasi(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Deskripsi Pengumuman *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Tuliskan rincian informasi kegiatan, peralatan yang perlu dibawa, dan imbauan penting lainnya..."
              value={formDeskripsi}
              onChange={(e) => setFormDeskripsi(e.target.value)}
              className="w-full text-xs sm:text-sm font-medium text-slate-900 dark:text-white bg-white dark:bg-[#1E293B] border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md"
            >
              {editingId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
