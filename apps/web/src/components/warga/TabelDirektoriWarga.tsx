import React, { useState, useEffect } from 'react';
import { WargaRecord } from '@sim-warga/types';
import { Search, Phone, Home, Users, Shield, ChevronLeft, ChevronRight, ChevronDown, LayoutGrid, List, Eye, X, Briefcase, Heart } from 'lucide-react';

export interface TabelDirektoriWargaProps {
  wargaList: WargaRecord[];
  isAdmin: boolean;
}

export const TabelDirektoriWarga: React.FC<TabelDirektoriWargaProps> = ({
  wargaList,
  isAdmin,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [selectedBlok, setSelectedBlok] = useState<string>('ALL');
  const [isBlokDropdownOpen, setIsBlokDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedWargaDetail, setSelectedWargaDetail] = useState<WargaRecord | null>(null);
  const dynamicBloks = Array.from(new Set(wargaList.map((w) => w.blok.toUpperCase()))).sort();

  const filtered = wargaList.filter((w) => {
    const matchSearch =
      w.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
      w.alamatRumah.toLowerCase().includes(search.toLowerCase()) ||
      w.pekerjaan.toLowerCase().includes(search.toLowerCase());

    const b = w.blok.toUpperCase();
    let matchGroup = true;
    if (selectedGroup === 'A-F') matchGroup = b >= 'A' && b <= 'F';
    else if (selectedGroup === 'G-L') matchGroup = b >= 'G' && b <= 'L';
    else if (selectedGroup === 'M-R') matchGroup = b >= 'M' && b <= 'R';
    else if (selectedGroup === 'S-Z') matchGroup = b >= 'S' && b <= 'Z';

    const matchSpecific = selectedBlok === 'ALL' || b === selectedBlok;

    return matchSearch && matchGroup && matchSpecific;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGroup, selectedBlok, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filtered.slice(startIndex, startIndex + pageSize);

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm mb-8 select-none transition-colors">
      {/* Title & Filter Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Users className="w-3.5 h-3.5" />
              <span>Kependudukan Lingkungan</span>
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Direktori Warga RT 08
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Data kependudukan 52 kepala keluarga di Pesona Kahuripan 8 Tahap 2
          </p>
          {isAdmin && (
            <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Mode Pemantauan Pengurus RT 08</span>
            </div>
          )}
        </div>

        {/* Ringkas: Group Filter Tabs & Blok Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200/60 dark:border-slate-700">
            {[
              { id: 'ALL', label: 'Semua' },
              { id: 'A-F', label: 'Blok A-F' },
              { id: 'G-L', label: 'Blok G-L' },
              { id: 'M-R', label: 'Blok M-R' },
              { id: 'S-Z', label: 'Blok S-Z' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedGroup(tab.id);
                  setSelectedBlok('ALL');
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                  selectedGroup === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Custom Floating Popover Dropdown (Menggantikan Native Select) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsBlokDropdownOpen(!isBlokDropdownOpen)}
              className="inline-flex items-center gap-2 bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-2xs transition-all"
            >
              <span>{selectedBlok === 'ALL' ? 'Pilih Blok Spesifik' : `Blok ${selectedBlok}`}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isBlokDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {isBlokDropdownOpen && (
              <div className="absolute top-[calc(100%+6px)] right-0 z-30 w-56 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-2 animate-in fade-in zoom-in-95 duration-150">
                <div
                  onClick={() => {
                    setSelectedBlok('ALL');
                    setIsBlokDropdownOpen(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    selectedBlok === 'ALL'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  Semua Blok
                </div>

                <div className="grid grid-cols-3 gap-1 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700 max-h-48 overflow-y-auto">
                  {dynamicBloks.map((b) => (
                    <div
                      key={b}
                      onClick={() => {
                        setSelectedBlok(b);
                        setSelectedGroup('ALL');
                        setIsBlokDropdownOpen(false);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold text-center cursor-pointer transition-colors ${
                        selectedBlok === b
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      Blok {b}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama warga, blok rumah, atau pekerjaan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* View Switcher: Card View (Mobile-Friendly) vs Table View */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-end sm:self-center flex-shrink-0">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tampilan Kartu Profil Warga"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Mode Kartu</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Tampilan Tabel Administratif"
          >
            <List className="w-3.5 h-3.5" />
            <span>Mode Tabel</span>
          </button>
        </div>
      </div>
      {/* Table */}
      {/* KONTEN UTAMA: MODE KARTU ATAU MODE TABEL */}
      {viewMode === 'grid' ? (
        /* 1. INTERACTIVE CARD GRID VIEW (SUPER RAMAH HP & TABLET) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedList.map((w, idx) => (
            <div
              key={w.id || idx}
              className="bg-slate-50/70 dark:bg-[#1E293B]/70 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between shadow-2xs group"
            >
              <div>
                {/* Header Kartu: Avatar Inisial & Lencana Blok */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                      {w.namaLengkap.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {w.namaLengkap}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        {w.pekerjaan || 'Warga'} • {w.agama}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex-shrink-0">
                    {w.alamatRumah}
                  </span>
                </div>

                {/* Status Domisili & Keluarga */}
                <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                  {w.statusTempatTinggal === 'Menetap' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Menetap</span>
                    </span>
                  ) : w.statusTempatTinggal === 'Pulang-Pergi' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                      <span>Pulang-Pergi</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>Belum Menetap</span>
                    </span>
                  )}

                  <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                    👨‍👩‍👧 {w.jmlJiwa} Jiwa ({w.statusDalamKeluarga})
                  </span>
                </div>
              </div>

              {/* Aksi Buka Detail Kartu Keluarga & Kontak WA */}
              <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs mt-1">
                <button
                  type="button"
                  onClick={() => setSelectedWargaDetail(w)}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Detail Keluarga →</span>
                </button>

                {isAdmin && (
                  <a
                    href={`https://wa.me/${w.noWhatsapp.replace(/^0/, '62')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Hubungi</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* 2. TABULAR VIEW LENGKAP */
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">No</th>
                <th className="py-3.5 px-4">Nama Warga</th>
                <th className="py-3.5 px-4">Blok &amp; Unit</th>
                <th className="py-3.5 px-4">Domisili</th>
                <th className="py-3.5 px-4">Keluarga</th>
                {isAdmin && <th className="py-3.5 px-4">Kontak WhatsApp</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
              {paginatedList.map((w, idx) => (
                <tr key={w.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 font-bold">{startIndex + idx + 1}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs sm:text-sm">{w.namaLengkap}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{w.pekerjaan} • {w.agama}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs flex-shrink-0">
                        <Home className="w-3.5 h-3.5" />
                      </span>
                      <span>{w.alamatRumah}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {w.statusTempatTinggal === 'Menetap' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Menetap</span>
                      </span>
                    ) : w.statusTempatTinggal === 'Pulang-Pergi' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                        <span>Pulang-Pergi</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        <span>Belum Menetap</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      {w.jmlJiwa} Jiwa <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">({w.statusDalamKeluarga})</span>
                    </span>
                    {w.anggotaKeluargaTambahan && w.anggotaKeluargaTambahan !== '-' && (
                      <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                        {w.anggotaKeluargaTambahan}
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="py-3.5 px-4">
                      <a
                        href={`https://wa.me/${w.noWhatsapp.replace(/^0/, '62')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{w.noWhatsapp}</span>
                      </a>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Kontrol Navigasi Halaman (Pagination Bar) */}
      {filtered.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs mt-3">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
            <span>
              Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, filtered.length)}</strong> dari <strong>{filtered.length}</strong> warga
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <div className="flex items-center gap-1">
              <span>Baris:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 font-bold text-slate-700 dark:text-slate-200 focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 self-end sm:self-center">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-bold text-slate-700 dark:text-slate-300">
              Halaman {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DETAIL KELUARGA INTERAKTIF */}
      {selectedWargaDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedWargaDetail(null)}
          />
          <div className="relative bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 max-w-md w-full z-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  {selectedWargaDetail.namaLengkap.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-base font-extrabold">{selectedWargaDetail.namaLengkap}</h4>
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">{selectedWargaDetail.alamatRumah}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedWargaDetail(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Domisili</span>
                  <span className="font-bold">{selectedWargaDetail.statusTempatTinggal}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pekerjaan</span>
                  <span className="font-bold">{selectedWargaDetail.pekerjaan}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Agama</span>
                  <span className="font-bold">{selectedWargaDetail.agama}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Status Pernikahan</span>
                  <span className="font-bold">{selectedWargaDetail.statusPernikahan}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="text-xs font-bold text-blue-950 dark:text-blue-200 block mb-1">
                  👨‍👩‍👧 Susunan Anggota Keluarga ({selectedWargaDetail.jmlJiwa} Jiwa):
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedWargaDetail.anggotaKeluargaTambahan && selectedWargaDetail.anggotaKeluargaTambahan !== '-'
                    ? selectedWargaDetail.anggotaKeluargaTambahan
                    : 'Tidak ada catatan anggota keluarga tambahan.'}
                </p>
              </div>

              {isAdmin && (
                <a
                  href={`https://wa.me/${selectedWargaDetail.noWhatsapp.replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors mt-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>Kirim Pesan WhatsApp ({selectedWargaDetail.noWhatsapp})</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
