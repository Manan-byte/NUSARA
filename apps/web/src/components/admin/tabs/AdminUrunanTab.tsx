import React, { useState } from 'react';
import {
  ProgramUrunanRecord,
  ItemUrunanWarga,
} from '@sim-warga/types';
import {
  Lightbulb,
  Clock,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { AddUrunanModal } from '../modals/AddUrunanModal';
import { getActiveSpreadsheetUrl } from '../../../services/apiService';

export interface AdminUrunanTabProps {
  programUrunan: ProgramUrunanRecord;
  urunanList: ItemUrunanWarga[];
  onAddUrunan: (item: ItemUrunanWarga) => Promise<void> | void;
  onDeleteUrunan: (id: string) => Promise<void> | void;
  onApproveUrunan?: (id: string, namaWarga: string) => Promise<void> | void;
  onRejectUrunanModal?: (item: ItemUrunanWarga) => void;
  onPreviewUrunan?: (item: ItemUrunanWarga) => void;
}

export const AdminUrunanTab: React.FC<AdminUrunanTabProps> = ({
  programUrunan,
  urunanList,
  onAddUrunan,
  onDeleteUrunan,
  onApproveUrunan,
  onRejectUrunanModal,
  onPreviewUrunan,
}) => {
  const [urunanFilter, setUrunanFilter] = useState<'ALL' | 'DONATUR' | 'URUNAN_WAJIB' | 'MENUNGGU'>('ALL');
  const [urunanSearch, setUrunanSearch] = useState<string>('');
  const [urunanPage, setUrunanPage] = useState<number>(1);
  const urunanPerPage = 6;

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Calculations
  const totalUrunanPju = urunanList
    .filter((u) => u.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const targetPju = programUrunan?.targetNominal || 17500000;
  const persenUrunanPju = Math.min(100, Math.round((totalUrunanPju / targetPju) * 100));

  const pjuPendingCount = urunanList.filter((u) => u.status === 'Menunggu Verifikasi').length;
  const donaturCount = urunanList.filter((u) => u.tipe === 'DONATUR').length;
  const wajibCount = urunanList.filter((u) => u.tipe === 'URUNAN_WAJIB').length;

  const filteredUrunan = urunanList.filter((item) => {
    const matchType =
      urunanFilter === 'ALL'
        ? true
        : urunanFilter === 'MENUNGGU'
        ? item.status === 'Menunggu Verifikasi'
        : item.tipe === urunanFilter;
    const q = urunanSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      item.namaWarga.toLowerCase().includes(q) ||
      (item.keterangan || '').toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const totalUrunanPages = Math.max(1, Math.ceil(filteredUrunan.length / urunanPerPage));
  const pageUrunan = filteredUrunan.slice(
    (urunanPage - 1) * urunanPerPage,
    urunanPage * urunanPerPage
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP TITLE & ACTION ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Urunan Lampu PJU RT 08
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Program Swadaya Pengadaan &amp; Pemasangan Lampu Penerangan Jalan Umum
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#093A3E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input Setoran Manual</span>
          </button>

          <a
            href={getActiveSpreadsheetUrl()}
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Sheets</span>
          </a>
        </div>
      </div>

      {/* 2. PROGRESS CAPSULE BAR */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#092C2E] text-white text-xs font-bold shadow-xs whitespace-nowrap">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Menunggu: {pjuPendingCount}</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#F3D37A] text-[#092C2E] text-xs font-black shadow-xs whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-[#092C2E]" />
            <span>Donatur: {donaturCount} KK</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900 text-xs font-bold whitespace-nowrap">
            <span>Wajib: {wajibCount} KK</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold whitespace-nowrap">
            <span>Total: {urunanList.length} Penyetor</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
          <span className="text-stone-400">Terkumpul:</span>
          <span className="text-sm font-black text-[#0B484C] dark:text-[#F3D37A]">
            Rp {totalUrunanPju.toLocaleString('id-ID')} ({persenUrunanPju}%)
          </span>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {(['ALL', 'MENUNGGU', 'DONATUR', 'URUNAN_WAJIB'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setUrunanFilter(mode);
                setUrunanPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                urunanFilter === mode
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {mode === 'ALL'
                ? 'Semua Setoran'
                : mode === 'MENUNGGU'
                ? 'Menunggu Verifikasi'
                : mode === 'DONATUR'
                ? 'Donatur Bebas'
                : 'Urunan Wajib'}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={urunanSearch}
            onChange={(e) => {
              setUrunanSearch(e.target.value);
              setUrunanPage(1);
            }}
            placeholder="Cari donatur, blok rumah..."
            className="w-full h-8 pl-9 pr-3 rounded-xl bg-stone-100 dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/40 text-xs font-medium text-[#1C221E] dark:text-white focus:outline-none"
          />
        </div>
      </div>

      {/* 4. DONORS DATA TABLE */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200/70 dark:border-stone-800 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-emerald-100/60 whitespace-nowrap">
                <th className="py-2 px-3 whitespace-nowrap">Nama Penyetor</th>
                <th className="py-2 px-3 whitespace-nowrap">Keterangan / Blok</th>
                <th className="py-2 px-3 whitespace-nowrap">Kategori</th>
                <th className="py-2 px-3 whitespace-nowrap">Nominal</th>
                <th className="py-2 px-3 whitespace-nowrap">Metode</th>
                <th className="py-2 px-3 whitespace-nowrap">Status</th>
                <th className="py-2 px-3 text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-stone-100 dark:divide-stone-800/60">
              {pageUrunan.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 text-[#1C221E] dark:text-stone-200 transition-colors"
                >
                  <td className="py-2.5 px-3 font-extrabold whitespace-nowrap">
                    {item.namaWarga}
                  </td>
                  <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 whitespace-nowrap">
                    {item.keterangan || '-'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.tipe === 'DONATUR'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      }`}
                    >
                      {item.tipe === 'DONATUR' ? 'Donatur Sukarela' : 'Urunan Wajib'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-black text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </td>
                  <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">{item.metode}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                        item.status === 'Lunas'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : item.status === 'Menunggu Verifikasi'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      {onPreviewUrunan && (
                        <button
                          type="button"
                          onClick={() => onPreviewUrunan(item)}
                          className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                          title="Lihat Bukti"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {item.status === 'Menunggu Verifikasi' && (
                        <>
                          {onRejectUrunanModal && (
                            <button
                              type="button"
                              onClick={() => onRejectUrunanModal(item)}
                              className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px]"
                            >
                              Tolak
                            </button>
                          )}
                          {onApproveUrunan && (
                            <button
                              type="button"
                              onClick={() => onApproveUrunan(item.id, item.namaWarga)}
                              className="px-2.5 py-0.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px]"
                            >
                              Approve
                            </button>
                          )}
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => onDeleteUrunan(item.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                        title="Hapus Data"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 text-xs flex-shrink-0">
          <span className="text-stone-400">
            Menampilkan {(urunanPage - 1) * urunanPerPage + 1} -{' '}
            {Math.min(urunanPage * urunanPerPage, filteredUrunan.length)} dari {filteredUrunan.length} Penyetor
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={urunanPage === 1}
              onClick={() => setUrunanPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold">
              {urunanPage} / {totalUrunanPages}
            </span>
            <button
              type="button"
              disabled={urunanPage >= totalUrunanPages}
              onClick={() => setUrunanPage((p) => Math.min(totalUrunanPages, p + 1))}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL INPUT MANUAL SETORAN PJU */}
      {isAddModalOpen && (
        <AddUrunanModal
          onClose={() => setIsAddModalOpen(false)}
          onSave={onAddUrunan}
        />
      )}
    </div>
  );
};
