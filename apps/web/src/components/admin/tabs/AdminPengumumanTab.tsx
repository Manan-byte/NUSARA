import React, { useState } from 'react';
import { PengumumanRecord, AdminAccount } from '@sim-warga/types';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { PengumumanModal, getDefaultAnnouncementBanner } from '../modals/PengumumanModal';

export interface AdminPengumumanTabProps {
  pengumumanList: PengumumanRecord[];
  currentAdmin: AdminAccount;
  onAddPengumuman: (newP: PengumumanRecord) => Promise<void> | void;
  onUpdatePengumuman: (updated: PengumumanRecord) => void;
  onDeletePengumuman: (id: string) => void;
}

export const AdminPengumumanTab: React.FC<AdminPengumumanTabProps> = ({
  pengumumanList,
  currentAdmin,
  onAddPengumuman,
  onUpdatePengumuman,
  onDeletePengumuman,
}) => {
  const [pgmFilterKat, setPgmFilterKat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pgmPage, setPgmPage] = useState<number>(1);
  const pgmPerPage = 6;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<PengumumanRecord | null>(null);

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

  const handleOpenNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: PengumumanRecord) => {
    setEditingItem(p);
    setIsModalOpen(true);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Papan Jarkoman &amp; Agenda RT 08
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Journal Resmi Agenda Kegiatan, Jadwal Rapat &amp; Pengumuman Paguyuban Warga PK8
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenNew}
            className="h-9 px-4 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#093A3E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Jarkoman</span>
          </button>

          <a
            href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Sheets</span>
          </a>
        </div>
      </div>

      {/* 2. FILTER & SEARCH BAR */}
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
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-xs font-extrabold pb-2 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2 text-[#0B484C] dark:text-[#F3D37A]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Agenda Aktif Warga • Oktober 2026</span>
              <span className="text-[10px] text-stone-400 font-normal">
                ({filteredPengumuman.length} Agenda)
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

                  <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 border border-stone-200/80 bg-stone-100 shadow-2xs">
                    <img
                      src={pgm.gambarBanner || getDefaultAnnouncementBanner(pgm.kategori)}
                      alt={pgm.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getDefaultAnnouncementBanner(pgm.kategori);
                      }}
                    />
                  </div>

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
      </div>

      {/* 4. PAGINATION FOOTER */}
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

      {/* MODAL BUAT / EDIT JARKOMAN */}
      {isModalOpen && (
        <PengumumanModal
          initialData={editingItem}
          authorName={currentAdmin.nama}
          onClose={() => setIsModalOpen(false)}
          onSave={async (record) => {
            if (editingItem) {
              onUpdatePengumuman(record);
            } else {
              await onAddPengumuman(record);
            }
          }}
        />
      )}
    </div>
  );
};
