import React, { useState } from 'react';
import {
  AdminAccount,
  DashboardSummary,
  WargaRecord,
  TransaksiIPL,
  PengeluaranKasRecord,
  ProgramUrunanRecord,
  ItemUrunanWarga,
} from '@sim-warga/types';
import {
  Wallet,
  Users,
  Lightbulb,
  Shield,
  Calendar,
  CloudSun,
  Plus,
  RefreshCw,
  Folder,
  CheckCircle2,
  XCircle,
  Eye,
  Megaphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { getActiveSpreadsheetUrl } from '../../../services/apiService';

export interface AdminBerandaTabProps {
  currentAdmin: AdminAccount;
  summary: DashboardSummary;
  wargaList: WargaRecord[];
  transaksiList: TransaksiIPL[];
  pengeluaranList: PengeluaranKasRecord[];
  programUrunan: ProgramUrunanRecord;
  urunanList: ItemUrunanWarga[];
  onSelectTab: (tab: string) => void;
  onApproveIpl: (noTransaksi: string, namaWarga: string) => Promise<void> | void;
  onRejectIplModal: (trx: TransaksiIPL) => void;
  onPreviewTrx: (trx: TransaksiIPL) => void;
  onApproveUrunan?: (id: string, namaWarga: string) => Promise<void> | void;
  onRejectUrunanModal?: (item: ItemUrunanWarga) => void;
  onPreviewUrunan?: (item: ItemUrunanWarga) => void;
  onOpenAddWarga: () => void;
  onOpenAddExp: () => void;
  onSyncSheet: () => void;
  isSyncingSheet: boolean;
}

export const AdminBerandaTab: React.FC<AdminBerandaTabProps> = ({
  currentAdmin,
  summary,
  wargaList,
  transaksiList,
  pengeluaranList,
  programUrunan,
  urunanList,
  onSelectTab,
  onApproveIpl,
  onRejectIplModal,
  onPreviewTrx,
  onApproveUrunan,
  onRejectUrunanModal,
  onPreviewUrunan,
  onOpenAddWarga,
  onOpenAddExp,
  onSyncSheet,
  isSyncingSheet,
}) => {
  const [queueTab, setQueueTab] = useState<'ipl' | 'pju'>('ipl');
  const [queuePage, setQueuePage] = useState<number>(1);
  const queuePerPage = 6;

  const sisaSaldo = Math.max(0, summary.sisaSaldoKas ?? 720000);
  const totalUrunanPju = urunanList
    .filter((u) => u.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const targetPju = programUrunan?.targetNominal || 17500000;
  const persenUrunanPju = Math.min(100, Math.round((totalUrunanPju / targetPju) * 100));

  const iplPending = transaksiList.filter((t) => t.status === 'Menunggu Verifikasi');
  const pjuPending = urunanList.filter((u) => u.status === 'Menunggu Verifikasi');

  const lunasWargaCount = wargaList.filter((w) => w.statusIpl === 'Lunas').length;
  const persenIpl = wargaList.length > 0 ? Math.round((lunasWargaCount / wargaList.length) * 100) : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden h-full">
      {/* ROW 1: COMPACT HERO GREETING BANNER */}
      <div className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50/70 to-[#FEF9EB] dark:from-[#072426] dark:to-stone-900 border border-[#D9B352]/40 shadow-2xs flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#0B484C] text-[#F3D37A] font-black text-xs flex items-center justify-center ring-2 ring-[#D9B352]/50 shadow-xs flex-shrink-0">
            PK8
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white truncate">
                Selamat Datang, {currentAdmin.nama}!
              </h2>
              <span className="text-xs">☀️</span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 italic truncate">
              &ldquo;Mewujudkan lingkungan guyub, aman, dan transparan untuk seluruh 143 KK.&rdquo;
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-stone-800/90 border border-stone-200/70 text-left">
            <div className="flex items-center gap-1 text-stone-400 text-[9px] font-bold">
              <Calendar className="w-2.5 h-2.5 text-[#0B484C]" />
              <span>Selasa, 13 Okt 2026</span>
            </div>
            <p className="text-[10px] font-black text-[#1C221E] dark:text-white leading-tight">
              Kas: Okt 2026
            </p>
          </div>

          <div className="px-2.5 py-1 rounded-xl bg-white/90 dark:bg-stone-800/90 border border-stone-200/70 text-left hidden sm:block">
            <div className="flex items-center gap-1 text-amber-500 text-[9px] font-bold">
              <CloudSun className="w-2.5 h-2.5" />
              <span>29°C Cerah Berawan</span>
            </div>
            <p className="text-[10px] font-black text-[#1C221E] dark:text-white leading-tight">
              Cileungsi, Bogor
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: 4 QUICK STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 flex-shrink-0">
        {/* Card 1: Saldo Kas */}
        <div
          onClick={() => onSelectTab('ipl')}
          className="cursor-pointer p-2.5 px-3 rounded-xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <span className="text-[9px] text-stone-400 font-bold block truncate">Sisa Saldo Kas RT</span>
            <p className="text-sm sm:text-base font-black text-[#0B484C] dark:text-[#F3D37A] leading-tight truncate">
              Rp {sisaSaldo.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Kepatuhan IPL */}
        <div
          onClick={() => onSelectTab('ipl')}
          className="cursor-pointer p-2.5 px-3 rounded-xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <span className="text-[9px] text-stone-400 font-bold block truncate">Kepatuhan IPL</span>
            <p className="text-sm sm:text-base font-black text-[#1C221E] dark:text-white leading-tight truncate">
              {lunasWargaCount} / {wargaList.length} KK{' '}
              <span className="text-[10px] font-bold text-purple-600">({persenIpl}%)</span>
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Urunan PJU */}
        <div
          onClick={() => onSelectTab('urunan')}
          className="cursor-pointer p-2.5 px-3 rounded-xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <span className="text-[9px] text-stone-400 font-bold block truncate">Dana Urunan PJU</span>
            <p className="text-sm sm:text-base font-black text-[#1C221E] dark:text-white leading-tight truncate">
              Rp {totalUrunanPju.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] font-bold text-amber-600">({persenUrunanPju}%)</span>
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Siskamling */}
        <div
          onClick={() => onSelectTab('ronda')}
          className="cursor-pointer p-2.5 px-3 rounded-xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs hover:-translate-y-0.5 transition-transform flex items-center justify-between gap-2"
        >
          <div className="min-w-0">
            <span className="text-[9px] text-stone-400 font-bold block truncate">Ronda Malam</span>
            <p className="text-sm sm:text-base font-black text-[#1C221E] dark:text-white leading-tight truncate">
              6 Anggota / Hari
            </p>
          </div>
          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 flex items-center justify-center flex-shrink-0">
            <Shield className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* ROW 3: 3-COLUMN BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 flex-1 min-h-0 overflow-hidden items-stretch">
        {/* COLUMN 1 (4 COLS): CASH FLOW CHART + GAUGE */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-extrabold text-[#1C221E] dark:text-white">
                    Arus Kas (IPL &amp; PJU)
                  </h3>
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded-full">
                    ↑ 12%
                  </span>
                </div>
                <p className="text-base font-black text-[#0B484C] dark:text-[#F3D37A] mt-0.5">
                  Rp {(summary.pemasukanIpl + totalUrunanPju).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Visual SVG Mini Chart */}
            <div className="w-full h-24 my-1">
              <svg viewBox="0 0 300 80" className="w-full h-full">
                <defs>
                  <linearGradient id="chartGradBeranda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0B484C" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#0B484C" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,60 Q50,45 100,50 T200,25 T300,15 L300,80 L0,80 Z"
                  fill="url(#chartGradBeranda)"
                />
                <path
                  d="M0,60 Q50,45 100,50 T200,25 T300,15"
                  fill="none"
                  stroke="#0B484C"
                  strokeWidth="3"
                />
              </svg>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-stone-200/60 dark:border-stone-800">
              <div>
                <span className="text-stone-400 font-bold block">Pemasukan Terkumpul</span>
                <span className="font-extrabold text-emerald-600">
                  Rp {(summary.pemasukanIpl + totalUrunanPju).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-400 font-bold block">Total Pengeluaran</span>
                <span className="font-extrabold text-rose-600">
                  Rp {summary.pengeluaranKas.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          {/* Program Swadaya Progress */}
          <div className="p-3 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs h-[135px] flex items-center justify-between gap-3 overflow-hidden flex-shrink-0">
            <div className="space-y-1.5 flex-1 min-w-0 text-[10px]">
              <span className="font-extrabold text-[#1C221E] dark:text-white block">
                Target Swadaya PJU
              </span>
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-stone-500 dark:text-stone-300">
                  <span>Terkumpul:</span>
                  <span className="text-[#0B484C] dark:text-[#F3D37A] font-black">
                    Rp {totalUrunanPju.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
                  <div
                    style={{ width: `${persenUrunanPju}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-[#0B484C] rounded-full transition-all"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-stone-400">
                  <span>Target: Rp {targetPju.toLocaleString('id-ID')}</span>
                  <span className="font-bold text-amber-600">{persenUrunanPju}% tercapai</span>
                </div>
              </div>
            </div>

            <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-200 dark:text-stone-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#0B484C] dark:text-[#F3D37A]"
                  strokeDasharray={`${persenUrunanPju}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-[11px] font-black text-[#0B484C] dark:text-[#F3D37A]">
                  {persenUrunanPju}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 2 (4 COLS): PINTASAN AKSI CEPAT & SPREADSHEET REKAP */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-extrabold text-[#1C221E] dark:text-white">
                Pintasan Aksi Cepat Pengurus
              </h4>
              <span className="text-[9px] text-stone-400">Operasional RT</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={onOpenAddWarga}
                className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-left hover:scale-[1.02] transition-transform flex flex-col justify-between gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-emerald-900 dark:text-emerald-200">+ Warga Baru</p>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400">Form input 16 kolom</p>
                </div>
              </button>

              <button
                type="button"
                onClick={onOpenAddExp}
                className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-left hover:scale-[1.02] transition-transform flex flex-col justify-between gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-rose-900 dark:text-rose-200">Catat Belanja Kas</p>
                  <p className="text-[10px] text-rose-700/80 dark:text-rose-400">Pengeluaran RT 08</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('ronda')}
                className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-left hover:scale-[1.02] transition-transform flex flex-col justify-between gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-teal-900 dark:text-teal-200">Jadwal Siskamling</p>
                  <p className="text-[10px] text-teal-700/80 dark:text-teal-400">Atur giliran ronda</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('pengumuman')}
                className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-left hover:scale-[1.02] transition-transform flex flex-col justify-between gap-2"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-extrabold text-amber-900 dark:text-amber-200">Buat Jarkoman</p>
                  <p className="text-[10px] text-amber-700/80 dark:text-amber-400">Broadcast pengumuman</p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[10px]">
              <span className="text-stone-400 font-bold">Sinkronisasi Database:</span>
              <button
                type="button"
                onClick={onSyncSheet}
                disabled={isSyncingSheet}
                className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-extrabold flex items-center gap-1 hover:bg-sky-100"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncingSheet ? 'animate-spin' : ''}`} />
                <span>{isSyncingSheet ? 'Menyelaraskan...' : 'Sync Google Sheets'}</span>
              </button>
            </div>
          </div>

          {/* Database Master Spreadsheet Preview */}
          <div className="p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs h-[75px] flex flex-col justify-between overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between text-[9px] text-stone-400">
              <span className="font-bold flex items-center gap-1">
                <Folder className="w-3 h-3 text-[#0B484C]" /> Database Master Spreadsheet
              </span>
              <a
                href={getActiveSpreadsheetUrl()}
                target="_blank"
                rel="noreferrer"
                className="text-[#0B484C] dark:text-[#F3D37A] font-bold hover:underline"
              >
                Buka Dokumen ↗
              </a>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[8px] font-extrabold text-center">
              <div className="p-1 rounded bg-stone-50 dark:bg-[#051E20] border border-stone-200/50 dark:border-stone-800 text-stone-700 dark:text-stone-300 truncate">
                WARGA: {wargaList.length}
              </div>
              <div className="p-1 rounded bg-stone-50 dark:bg-[#051E20] border border-stone-200/50 dark:border-stone-800 text-stone-700 dark:text-stone-300 truncate">
                IPL: {transaksiList.length}
              </div>
              <div className="p-1 rounded bg-stone-50 dark:bg-[#051E20] border border-stone-200/50 dark:border-stone-800 text-stone-700 dark:text-stone-300 truncate">
                KAS: {pengeluaranList.length}
              </div>
              <div className="p-1 rounded bg-stone-50 dark:bg-[#051E20] border border-stone-200/50 dark:border-stone-800 text-stone-700 dark:text-stone-300 truncate">
                PJU: {urunanList.length}
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 3 (4 COLS): ANTREAN VERIFIKASI DENGAN MINI-PAGINATION */}
        <div className="md:col-span-4 flex flex-col justify-between gap-2 h-full min-h-0 overflow-hidden">
          <div className="p-3 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-[#051E20] p-1 rounded-xl text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setQueueTab('ipl');
                    setQueuePage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    queueTab === 'ipl'
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                >
                  IPL ({iplPending.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQueueTab('pju');
                    setQueuePage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    queueTab === 'pju'
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400'
                  }`}
                >
                  PJU ({pjuPending.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSelectTab(queueTab === 'ipl' ? 'ipl' : 'urunan')}
                className="text-[10px] font-bold text-[#0B484C] dark:text-[#F3D37A] hover:underline"
              >
                Lihat Semua →
              </button>
            </div>

            <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
              {queueTab === 'ipl' ? (
                iplPending.length > 0 ? (
                  iplPending
                    .slice((queuePage - 1) * queuePerPage, queuePage * queuePerPage)
                    .map((trx) => (
                      <div
                        key={trx.noTransaksi}
                        className="p-2.5 rounded-xl bg-white dark:bg-[#051E20] border border-stone-200 dark:border-[#D9B352]/30 shadow-2xs hover:border-[#0B484C] transition-all flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#0B484C] dark:text-[#F3D37A] font-black text-[10px] flex items-center justify-center flex-shrink-0">
                            {trx.namaWarga.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-extrabold text-[#1C221E] dark:text-white truncate text-xs">
                              {trx.namaWarga}
                            </p>
                            <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                              {trx.lokasiRumah} • <strong className="text-[#0B484C] dark:text-[#F3D37A]">Rp {trx.nominalBayar.toLocaleString('id-ID')}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => onPreviewTrx(trx)}
                            className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                            title="Lihat Struk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onRejectIplModal(trx)}
                            className="p-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                            title="Tolak"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onApproveIpl(trx.noTransaksi, trx.namaWarga)}
                            className="px-2 py-1 rounded-lg bg-[#0B484C] text-[#F3D37A] font-extrabold text-[9px] flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-[#051E20] rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                    🎉 Tidak ada antrean verifikasi IPL
                  </div>
                )
              ) : pjuPending.length > 0 ? (
                pjuPending
                  .slice((queuePage - 1) * queuePerPage, queuePage * queuePerPage)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-[#051E20] border border-stone-200 dark:border-[#D9B352]/30 shadow-2xs hover:border-[#0B484C] transition-all flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-[#F3D37A] font-black text-[10px] flex items-center justify-center flex-shrink-0">
                          PJU
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-[#1C221E] dark:text-white truncate text-xs">
                            {item.namaWarga}
                          </p>
                          <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate">
                            {item.keterangan || '-'} • <strong className="text-amber-600">Rp {item.nominal.toLocaleString('id-ID')}</strong> ({item.tipe === 'DONATUR' ? 'Sukarela' : 'Wajib'})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {onPreviewUrunan && (
                          <button
                            type="button"
                            onClick={() => onPreviewUrunan(item)}
                            className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200"
                            title="Lihat Struk"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onRejectUrunanModal && (
                          <button
                            type="button"
                            onClick={() => onRejectUrunanModal(item)}
                            className="p-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200"
                            title="Tolak"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onApproveUrunan && (
                          <button
                            type="button"
                            onClick={() => onApproveUrunan(item.id, item.namaWarga)}
                            className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-[9px] flex items-center gap-0.5"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="p-6 text-center text-xs text-stone-400 bg-stone-50 dark:bg-[#051E20] rounded-xl border border-dashed border-stone-200 dark:border-stone-800">
                  🎉 Tidak ada antrean donasi PJU
                </div>
              )}
            </div>

            {/* Compact Queue Pagination Footer */}
            {(queueTab === 'ipl' ? iplPending.length : pjuPending.length) > queuePerPage && (
              <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400 flex-shrink-0">
                <span>
                  Hal {queuePage} dari{' '}
                  {Math.ceil(
                    (queueTab === 'ipl' ? iplPending.length : pjuPending.length) / queuePerPage
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={queuePage === 1}
                    onClick={() => setQueuePage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-stone-200 dark:border-stone-700 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={
                      queuePage >=
                      Math.ceil(
                        (queueTab === 'ipl' ? iplPending.length : pjuPending.length) / queuePerPage
                      )
                    }
                    onClick={() => setQueuePage((p) => p + 1)}
                    className="p-1 rounded border border-stone-200 dark:border-stone-700 disabled:opacity-30"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
