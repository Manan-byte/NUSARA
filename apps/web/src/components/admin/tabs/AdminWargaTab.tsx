import React, { useState } from 'react';
import { WargaRecord } from '@sim-warga/types';
import {
  Users,
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getActiveSpreadsheetUrl } from '../../../services/apiService';

export interface AdminWargaTabProps {
  wargaList: WargaRecord[];
  onOpenAddWarga: () => void;
  onOpenEditWarga: (w: WargaRecord) => void;
  onDeleteWarga?: (key: string) => Promise<void> | void;
}

export const AdminWargaTab: React.FC<AdminWargaTabProps> = ({
  wargaList,
  onOpenAddWarga,
  onOpenEditWarga,
}) => {
  const [blokGroup, setBlokGroup] = useState<string>('ALL');
  const [wargaSearch, setWargaSearch] = useState<string>('');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [wargaPage, setWargaPage] = useState<number>(1);
  const [wargaPerPage, setWargaPerPage] = useState<number>(6);

  const filteredWarga = wargaList.filter((w) => {
    const b = w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim();
    const matchGroup =
      blokGroup === 'ALL' ? true : b.startsWith(blokGroup.replace('BLOK-', ''));
    const q = wargaSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      w.namaLengkap.toLowerCase().includes(q) ||
      w.alamatRumah.toLowerCase().includes(q) ||
      w.noWhatsapp.includes(q);
    return matchGroup && matchSearch;
  });

  const totalWargaPages = Math.max(1, Math.ceil(filteredWarga.length / wargaPerPage));
  const paginatedWarga = filteredWarga.slice(
    (wargaPage - 1) * wargaPerPage,
    wargaPage * wargaPerPage
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Direktori Data Warga (KK)
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Database 16 Kolom Spreadsheet Resmi Paguyuban RT 08 Pesona Kahuripan 8 Tahap 2
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddWarga}
            className="h-9 px-4 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#093A3E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Warga Baru</span>
          </button>

          <a
            href={getActiveSpreadsheetUrl()}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>DATA_WARGA</span>
          </a>
        </div>
      </div>

      {/* 2. BLOCK PILLS & SEARCH BAR */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                setBlokGroup(b === 'ALL' ? 'ALL' : `BLOK-${b}`);
                setWargaPage(1);
              }}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                blokGroup === (b === 'ALL' ? 'ALL' : `BLOK-${b}`)
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {b === 'ALL' ? `Semua (${wargaList.length} KK)` : `Blok ${b}`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={wargaSearch}
            onChange={(e) => {
              setWargaSearch(e.target.value);
              setWargaPage(1);
            }}
            placeholder="Cari nama warga, blok, no rumah..."
            className="w-full h-8 pl-8 pr-3 rounded-xl bg-stone-100 dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/40 text-xs font-medium text-[#1C221E] dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 3. CITIZEN CARDS GRID (3 COLUMNS) */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {paginatedWarga.map((w) => {
            const key = w.id || w.alamatRumah;
            const isPinRevealed = Boolean(revealedPins[key]);

            return (
              <div
                key={key}
                onClick={() => onOpenEditWarga(w)}
                className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs hover:border-[#0B484C] dark:hover:border-[#F3D37A] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B484C] dark:bg-emerald-950 dark:text-[#F3D37A] font-black text-xs flex items-center justify-center ring-2 ring-[#D9B352]/50">
                        {w.namaLengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
                          {w.namaLengkap}
                        </p>
                        <span className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A]">
                          {w.alamatRumah}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        w.statusIpl === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {w.statusIpl}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap my-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {w.statusTempatTinggal}
                    </span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {w.jmlJiwa || 3} Jiwa
                    </span>
                    <span className="text-[9px] font-mono text-stone-400">
                      WA: {w.noWhatsapp || '-'}
                    </span>
                  </div>

                  {w.catatan && w.catatan !== '-' && (
                    <div className="my-1.5 p-2 rounded-xl bg-stone-50/90 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-[10px] text-stone-600 dark:text-stone-300 flex items-start gap-1.5 leading-snug">
                      <span className="text-stone-400 font-bold flex-shrink-0">📝</span>
                      <span className="line-clamp-2 italic">{w.catatan}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2.5 mt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                  <div className="flex items-center gap-1">
                    <span>PIN: {isPinRevealed ? w.pin || '1234' : '••••••'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRevealedPins((p) => ({ ...p, [key]: !p[key] }));
                      }}
                      className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                    >
                      {isPinRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] hover:underline flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Edit Warga →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. PAGINATION FOOTER */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex items-center justify-between text-xs flex-shrink-0">
        <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
          <span>
            Menampilkan{' '}
            <strong className="text-[#1C221E] dark:text-white">
              {filteredWarga.length === 0 ? 0 : (wargaPage - 1) * wargaPerPage + 1} -{' '}
              {Math.min(wargaPage * wargaPerPage, filteredWarga.length)}
            </strong>{' '}
            dari {filteredWarga.length} KK
          </span>

        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={wargaPage === 1}
            onClick={() => setWargaPage((p) => Math.max(1, p - 1))}
            className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          <div className="flex items-center gap-1 px-1">
            {Array.from({ length: totalWargaPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalWargaPages || Math.abs(p - wargaPage) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-stone-400 px-1">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setWargaPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                      wargaPage === p
                        ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                        : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
          </div>

          <button
            type="button"
            disabled={wargaPage >= totalWargaPages}
            onClick={() => setWargaPage((p) => Math.min(totalWargaPages, p + 1))}
            className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
          >
            <span className="hidden sm:inline">Berikutnya</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
