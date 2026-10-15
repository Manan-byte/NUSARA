import React, { useState } from 'react';
import {
  DashboardSummary,
  TransaksiIPL,
  PengeluaranKasRecord,
  InfoRekeningBank,
} from '@sim-warga/types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Trash2,
  ExternalLink,
  Settings,
  CreditCard,
  Check,
} from 'lucide-react';

export interface AdminIplTabProps {
  summary: DashboardSummary;
  transaksiList: TransaksiIPL[];
  pengeluaranList: PengeluaranKasRecord[];
  tarifIpl: number;
  rekeningBank?: InfoRekeningBank;
  onApproveIpl: (noTransaksi: string, namaWarga: string) => Promise<void> | void;
  onRejectIplModal: (trx: TransaksiIPL) => void;
  onPreviewTrx: (trx: TransaksiIPL) => void;
  onOpenAddExp: () => void;
  onDeletePengeluaran: (id: string) => Promise<void> | void;
  onUpdateTarifIpl: (newTarif: number) => void;
  onUpdateRekeningBank: (newRek: InfoRekeningBank) => void;
}

export const AdminIplTab: React.FC<AdminIplTabProps> = ({
  summary,
  transaksiList,
  pengeluaranList,
  tarifIpl,
  rekeningBank,
  onApproveIpl,
  onRejectIplModal,
  onPreviewTrx,
  onOpenAddExp,
  onDeletePengeluaran,
  onUpdateTarifIpl,
  onUpdateRekeningBank,
}) => {
  const [subTab, setSubTab] = useState<'transaksi' | 'pengeluaran' | 'pengaturan'>('transaksi');

  // IPL States
  const [trxFilter, setTrxFilter] = useState<'ALL' | 'Menunggu Verifikasi' | 'Lunas' | 'Ditolak'>('ALL');
  const [trxSearch, setTrxSearch] = useState<string>('');
  const [trxPage, setTrxPage] = useState<number>(1);
  const [selectedIplTrxIds, setSelectedIplTrxIds] = useState<Record<string, boolean>>({});

  // Pengeluaran States
  const [expPage, setExpPage] = useState<number>(1);
  const expPerPage = 6;

  // Pengaturan States
  const [editTarifInput, setEditTarifInput] = useState<string>(String(tarifIpl));
  const [namaBank, setNamaBank] = useState<string>(rekeningBank?.namaBank || 'Bank BCA');
  const [nomorRekening, setNomorRekening] = useState<string>(rekeningBank?.noRekening || '8830123456');
  const [atasNama, setAtasNama] = useState<string>(rekeningBank?.atasNama || 'Kas Paguyuban RT 08');
  const [savedSettingsNotice, setSavedSettingsNotice] = useState<boolean>(false);

  const formatCleanDurasi = (durasi?: string, periode?: string): string => {
    const raw = (durasi || '') + ' ' + (periode || '');
    if (raw.includes('1 Tahun') || raw.includes('12 Bulan') || raw.includes('14 Bulan')) {
      return '1 Tahun (12 Bln)';
    }
    if (raw.includes('6 Bulan')) return '6 Bulan';
    if (raw.includes('3 Bulan') || raw.includes('Triwulan')) return '3 Bulan';
    const m = raw.match(/(\d+)\s*Bulan/i);
    if (m) return `${m[1]} Bulan`;
    return '1 Bulan';
  };

  const sisaSaldo = Math.max(0, summary.sisaSaldoKas ?? 720000);

  // IPL Calculations
  const filteredTrx = transaksiList.filter((t) => {
    const matchStatus = trxFilter === 'ALL' ? true : t.status === trxFilter;
    const q = trxSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      t.namaWarga.toLowerCase().includes(q) ||
      t.lokasiRumah.toLowerCase().includes(q) ||
      t.noTransaksi.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
  const trxPerPage = 6;
  const totalTrxPages = Math.max(1, Math.ceil(filteredTrx.length / trxPerPage));
  const pageTrx = filteredTrx.slice((trxPage - 1) * trxPerPage, trxPage * trxPerPage);

  const antreanCount = transaksiList.filter((t) => t.status === 'Menunggu Verifikasi').length;
  const lunasCount = transaksiList.filter((t) => t.status === 'Lunas').length;
  const ditolakCount = transaksiList.filter((t) => t.status === 'Ditolak').length;
  const totalTrxCount = transaksiList.length;

  const pctMenunggu = totalTrxCount > 0 ? Math.round((antreanCount / totalTrxCount) * 100) : 0;
  const pctLunas = totalTrxCount > 0 ? Math.round((lunasCount / totalTrxCount) * 100) : 0;
  const pctDitolak = totalTrxCount > 0 ? Math.round((ditolakCount / totalTrxCount) * 100) : 0;
  const selectedCount = Object.values(selectedIplTrxIds).filter(Boolean).length;

  // Expense Calculations
  const totalExpPages = Math.max(1, Math.ceil(pengeluaranList.length / expPerPage));
  const paginatedExp = pengeluaranList.slice((expPage - 1) * expPerPage, expPage * expPerPage);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const newTarif = parseInt(editTarifInput, 10);
    if (newTarif && newTarif > 0) {
      onUpdateTarifIpl(newTarif);
    }
    onUpdateRekeningBank({
      namaBank: namaBank.trim() || 'Bank BCA',
      noRekening: nomorRekening.trim() || '8830123456',
      atasNama: atasNama.trim() || 'Kas Paguyuban RT 08',
      catatan: rekeningBank?.catatan || 'Rekening Kas Utama',
    });
    setSavedSettingsNotice(true);
    setTimeout(() => setSavedSettingsNotice(false), 3000);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP TITLE & SUB-NAV TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Transaksi IPL &amp; Kas RT
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Rekapitulasi Iuran Pengelolaan Lingkungan RT 08 Pesona Kahuripan 8 Tahap 2
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-stone-100 dark:bg-[#072426] p-1 rounded-2xl border border-stone-200/60 dark:border-stone-800">
            <button
              type="button"
              onClick={() => setSubTab('transaksi')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'transaksi'
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Tabel Transaksi ({totalTrxCount})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('pengeluaran')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'pengeluaran'
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Pengeluaran Kas ({pengeluaranList.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('pengaturan')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subTab === 'pengaturan'
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                  : 'text-stone-600 dark:text-stone-300'
              }`}
            >
              Pengaturan Kas
            </button>
          </div>

          <a
            href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Sheets</span>
          </a>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SUB-TAB 1: TABEL TRANSAKSI IPL                                      */}
      {/* =================================================================== */}
      {subTab === 'transaksi' && (
        <>
          {/* SEGMENTED PROGRESS CAPSULE BAR */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 flex-shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1 max-w-2xl">
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#092C2E] text-white text-xs font-bold shadow-xs whitespace-nowrap">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Menunggu: {antreanCount}</span>
                <span className="text-[10px] text-amber-300 font-mono">({pctMenunggu}%)</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-[#F3D37A] text-[#092C2E] text-xs font-black shadow-xs whitespace-nowrap">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#092C2E]" />
                <span>Lunas: {lunasCount} KK</span>
                <span className="text-[10px] bg-black/15 px-1.5 py-0.2 rounded-md font-mono">({pctLunas}%)</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-bold whitespace-nowrap">
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Ditolak: {ditolakCount}</span>
                <span className="text-[10px] text-rose-500 font-mono">({pctDitolak}%)</span>
              </div>

              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 text-xs font-bold whitespace-nowrap">
                <span>Total Trx: {totalTrxCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
              <span className="text-stone-400">Total Pemasukan IPL:</span>
              <span className="text-sm font-black text-[#0B484C] dark:text-[#F3D37A]">
                Rp{' '}
                {transaksiList
                  .filter((t) => t.status === 'Lunas')
                  .reduce((acc, t) => acc + t.nominalBayar, 0)
                  .toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* FILTER & SEARCH BAR */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {(['ALL', 'Menunggu Verifikasi', 'Lunas', 'Ditolak'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => {
                    setTrxFilter(st);
                    setTrxPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                    trxFilter === st
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {st === 'ALL' ? 'Semua Status' : st}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trxSearch}
                onChange={(e) => {
                  setTrxSearch(e.target.value);
                  setTrxPage(1);
                }}
                placeholder="Cari nama, blok, no transaksi..."
                className="w-full h-8 pl-9 pr-3 rounded-xl bg-stone-100 dark:bg-[#051E20] border border-stone-200/80 dark:border-[#D9B352]/40 text-xs font-medium text-[#1C221E] dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* BATCH ACTION BAR */}
          {selectedCount > 0 && (
            <div className="p-2 sm:p-2.5 rounded-2xl bg-[#0B484C] text-[#F3D37A] border border-[#D9B352]/70 shadow-lg flex items-center justify-between gap-3 animate-in fade-in flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#F3D37A] text-[#092C2E] font-black text-xs flex items-center justify-center">
                  {selectedCount}
                </span>
                <span className="text-xs font-bold text-white">Transaksi Menunggu Terpilih</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    const keys = Object.keys(selectedIplTrxIds).filter((k) => selectedIplTrxIds[k]);
                    for (const k of keys) {
                      const item = transaksiList.find((t) => t.noTransaksi === k);
                      await onApproveIpl(k, item?.namaWarga || '');
                    }
                    setSelectedIplTrxIds({});
                  }}
                  className="h-8 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Masal ({selectedCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIplTrxIds({})}
                  className="h-8 px-3 rounded-xl bg-white/15 text-white font-bold text-xs"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* TABLE OF TRANSACTIONS */}
          <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200/70 dark:border-stone-800 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-emerald-100/60 whitespace-nowrap">
                    <th className="py-2 px-3 w-8 whitespace-nowrap">
                      <span className="sr-only">Pilih</span>
                    </th>
                    <th className="py-2 px-3 whitespace-nowrap">Nama Warga</th>
                    <th className="py-2 px-3 whitespace-nowrap">No. Transaksi</th>
                    <th className="py-2 px-3 whitespace-nowrap">Durasi Paket</th>
                    <th className="py-2 px-3 whitespace-nowrap">Alamat Blok</th>
                    <th className="py-2 px-3 whitespace-nowrap">Nominal</th>
                    <th className="py-2 px-3 whitespace-nowrap">Metode Bayar</th>
                    <th className="py-2 px-3 whitespace-nowrap">Status</th>
                    <th className="py-2 px-3 text-right whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-stone-100 dark:divide-stone-800/60">
                  {pageTrx.map((trx) => {
                    const isPending = trx.status === 'Menunggu Verifikasi';
                    const isSelected = Boolean(selectedIplTrxIds[trx.noTransaksi]);

                    return (
                      <tr
                        key={trx.noTransaksi}
                        className={`transition-colors hover:bg-stone-50/80 dark:hover:bg-stone-800/50 text-[#1C221E] dark:text-stone-200 ${
                          isSelected ? 'bg-[#FEF6DF]/90 dark:bg-amber-950/30' : ''
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          {isPending && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                setSelectedIplTrxIds((prev) => ({
                                  ...prev,
                                  [trx.noTransaksi]: !prev[trx.noTransaksi],
                                }));
                              }}
                              className="w-4 h-4 rounded text-[#0B484C] accent-[#0B484C] cursor-pointer"
                            />
                          )}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#0B484C] dark:text-[#F3D37A] font-black text-[9px] flex items-center justify-center flex-shrink-0">
                              {trx.namaWarga.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-extrabold text-xs text-[#1C221E] dark:text-white whitespace-nowrap">
                              {trx.namaWarga}
                            </span>
                          </div>
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-[11px] text-stone-500 dark:text-stone-400">
                          {trx.noTransaksi}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap font-medium text-xs text-stone-700 dark:text-stone-300">
                          {formatCleanDurasi(trx.durasiPaket, trx.periodeTercover)}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap font-bold text-xs text-[#0B484C] dark:text-[#F3D37A]">
                          {trx.lokasiRumah}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap font-extrabold text-xs text-[#1C221E] dark:text-white">
                          Rp {trx.nominalBayar.toLocaleString('id-ID')}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap font-medium text-stone-600 dark:text-stone-400 text-xs">
                          {trx.metodePembayaran}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              trx.status === 'Lunas'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : trx.status === 'Menunggu Verifikasi'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {trx.status}
                          </span>
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onPreviewTrx(trx)}
                              className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
                              title="Lihat Struk"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {isPending && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onRejectIplModal(trx)}
                                  className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[10px]"
                                >
                                  Tolak
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onApproveIpl(trx.noTransaksi, trx.namaWarga)}
                                  className="px-2.5 py-0.5 rounded-md bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px]"
                                >
                                  Approve
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 text-xs">
              <span className="text-stone-400">
                Menampilkan {(trxPage - 1) * trxPerPage + 1} -{' '}
                {Math.min(trxPage * trxPerPage, filteredTrx.length)} dari {filteredTrx.length} Transaksi
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={trxPage === 1}
                  onClick={() => setTrxPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 font-bold">
                  {trxPage} / {totalTrxPages}
                </span>
                <button
                  type="button"
                  disabled={trxPage >= totalTrxPages}
                  onClick={() => setTrxPage((p) => Math.min(totalTrxPages, p + 1))}
                  className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-700 disabled:opacity-30"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: PENGELUARAN KAS RT                                       */}
      {/* =================================================================== */}
      {subTab === 'pengeluaran' && (
        <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col justify-between gap-3 overflow-hidden">
            {/* Summary 4 Mini Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-shrink-0">
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#051E20] border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 font-bold block">Total Kas Keluar</span>
                <p className="text-sm font-black text-rose-600 mt-0.5">
                  -Rp {summary.pengeluaranKas.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#051E20] border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 font-bold block">Sisa Saldo Bersih</span>
                <p className="text-sm font-black text-[#0B484C] dark:text-[#F3D37A] mt-0.5">
                  Rp {sisaSaldo.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#051E20] border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 font-bold block">Pemasukan IPL</span>
                <p className="text-sm font-black text-emerald-600 mt-0.5">
                  Rp {summary.pemasukanIpl.toLocaleString('id-ID')}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#051E20] border border-stone-200/60 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold block">Catatan Keluar</span>
                  <p className="text-sm font-black text-[#1C221E] dark:text-white mt-0.5">
                    {pengeluaranList.length} Catatan
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenAddExp}
                  className="px-2.5 py-1.5 rounded-lg bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px] shadow-xs flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Catat Baru</span>
                </button>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-0.5 border border-stone-200/70 dark:border-stone-800 rounded-xl">
              <table className="w-full text-left border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-stone-200/70 dark:border-stone-800 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 dark:text-emerald-100/60 whitespace-nowrap bg-stone-50/50 dark:bg-black/20">
                    <th className="py-2 px-3 w-12 text-center">No.</th>
                    <th className="py-2 px-3 w-28">Tanggal</th>
                    <th className="py-2 px-3 w-36">Kategori Biaya</th>
                    <th className="py-2 px-3">Keterangan Pengeluaran</th>
                    <th className="py-2 px-3 w-32 text-right">Nominal (-Rp)</th>
                    <th className="py-2 px-3 w-36">Penerima Dana</th>
                    <th className="py-2 px-3 w-20 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-stone-100 dark:divide-stone-800/60">
                  {paginatedExp.map((exp, idx) => (
                    <tr
                      key={exp.id}
                      className="hover:bg-stone-50/80 dark:hover:bg-stone-800/50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-center font-bold text-stone-400 text-[11px]">
                        #{(expPage - 1) * expPerPage + idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-600 dark:text-stone-300 whitespace-nowrap">
                        {exp.tanggal}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {exp.kategori}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#1C221E] dark:text-white truncate">
                        {exp.keterangan}
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        -Rp {exp.nominal.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600 dark:text-stone-300 truncate">
                        {exp.penerima}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onDeletePengeluaran(exp.id)}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* EXPENSES PAGINATION FOOTER */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-200/70 dark:border-stone-800 text-xs flex-shrink-0">
              <span className="text-stone-400">
                Menampilkan{' '}
                <strong className="text-[#1C221E] dark:text-white">
                  {pengeluaranList.length === 0 ? 0 : (expPage - 1) * expPerPage + 1} -{' '}
                  {Math.min(expPage * expPerPage, pengeluaranList.length)}
                </strong>{' '}
                dari {pengeluaranList.length} Catatan
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={expPage === 1}
                  onClick={() => setExpPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Sebelumnya</span>
                </button>
                <span className="px-2 font-bold text-xs">
                  {expPage} / {totalExpPages}
                </span>
                <button
                  type="button"
                  disabled={expPage >= totalExpPages}
                  onClick={() => setExpPage((p) => Math.min(totalExpPages, p + 1))}
                  className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 3: PENGATURAN TARIF IPL & REKENING KAS                       */}
      {/* =================================================================== */}
      {subTab === 'pengaturan' && (
        <div className="flex-1 min-h-0 overflow-y-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 w-full items-start">
            {/* COLUMN 1 (7 COLS): PENGATURAN FORM */}
            <div className="lg:col-span-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b-2 border-stone-200 dark:border-stone-700">
                <div className="w-10 h-10 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-bold shadow-xs">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1C221E] dark:text-white">
                    Pengaturan Keuangan RT 08
                  </h3>
                  <p className="text-xs text-stone-400 font-semibold">
                    Atur tarif iuran bulanan dan nomor rekening resmi paguyuban warga
                  </p>
                </div>
              </div>

              {savedSettingsNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-300 dark:border-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan keuangan berhasil disimpan dan diselaraskan!</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                {/* 1. TARIF IPL */}
                <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
                  <span className="font-extrabold text-xs text-[#0B484C] dark:text-[#F3D37A] uppercase tracking-wider block">
                    1. Tarif Iuran Pengelolaan Lingkungan (IPL)
                  </span>

                  <div>
                    <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                      Nominal Tarif IPL Bulanan per KK (Rp) *
                    </label>
                    <div className="relative">
                      <CreditCard className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min="1000"
                        step="5000"
                        required
                        value={editTarifInput}
                        onChange={(e) => setEditTarifInput(e.target.value)}
                        className="w-full h-11 pl-10 pr-3 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] focus:ring-2 focus:ring-[#0B484C]/20 bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-black text-base shadow-xs focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium mt-1.5 block">
                      Tarif saat ini: <strong className="text-[#0B484C] dark:text-[#F3D37A]">Rp {tarifIpl.toLocaleString('id-ID')}</strong> / bulan per kepala keluarga
                    </span>
                  </div>
                </div>

                {/* 2. REKENING BANK KAS */}
                <div className="p-4 rounded-2xl bg-stone-50/90 dark:bg-[#051E20] border-2 border-stone-200 dark:border-stone-700 space-y-3 shadow-xs">
                  <span className="font-extrabold text-xs text-[#0B484C] dark:text-[#F3D37A] uppercase tracking-wider block">
                    2. Informasi Rekening Bank Kas Pembayaran
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Nama Bank *
                      </label>
                      <input
                        type="text"
                        required
                        value={namaBank}
                        onChange={(e) => setNamaBank(e.target.value)}
                        placeholder="Cth: Bank BCA, Mandiri, BRI..."
                        className="w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-bold text-xs focus:outline-none shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Nomor Rekening Kas *
                      </label>
                      <input
                        type="text"
                        required
                        value={nomorRekening}
                        onChange={(e) => setNomorRekening(e.target.value)}
                        placeholder="Cth: 8830123456..."
                        className="w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-mono font-bold text-xs focus:outline-none shadow-xs"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                        Atas Nama Rekening (Pemilik Akun Kas) *
                      </label>
                      <input
                        type="text"
                        required
                        value={atasNama}
                        onChange={(e) => setAtasNama(e.target.value)}
                        placeholder="Cth: Paguyuban RT 08 Pesona Kahuripan..."
                        className="w-full h-10 px-3.5 rounded-xl border-2 border-stone-300 dark:border-stone-600 focus:border-[#0B484C] dark:focus:border-[#F3D37A] bg-white dark:bg-[#072426] text-[#1C221E] dark:text-white font-bold text-xs focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold shadow-md transition-all text-xs"
                  >
                    Simpan Perubahan Pengaturan
                  </button>
                </div>
              </form>
            </div>

            {/* COLUMN 2 (5 COLS): PRATINJAU KARTU REKENING & INFORMASI KAS */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* VIRTUAL BANK CARD PREVIEW */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#0B484C] via-[#083A3E] to-[#041D1E] text-white border-2 border-[#D9B352]/50 shadow-xl relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-6 rounded bg-amber-300/80 ring-1 ring-amber-400 flex items-center justify-center">
                      <div className="w-5 h-4 border border-stone-800 rounded-sm opacity-60" />
                    </div>
                    <span className="font-mono text-[10px] text-emerald-200 tracking-wider">OFFICIAL REK RT</span>
                  </div>
                  <span className="font-black text-sm text-[#F3D37A] tracking-wider uppercase">
                    {namaBank || 'BANK BCA'}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-[10px] text-stone-300 block font-medium">Nomor Rekening Tujuan:</span>
                  <p className="font-mono text-xl sm:text-2xl font-black text-[#F3D37A] tracking-widest mt-0.5">
                    {nomorRekening || '8830123456'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/15 text-xs">
                  <div>
                    <span className="text-[9px] text-stone-400 block font-medium">Atas Nama:</span>
                    <p className="font-bold text-white text-xs truncate max-w-[200px]">
                      {atasNama || 'Kas Paguyuban RT 08'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-stone-400 block font-medium">Tarif IPL:</span>
                    <p className="font-black text-[#F3D37A] text-xs">
                      Rp {(parseInt(editTarifInput, 10) || 30000).toLocaleString('id-ID')} / KK
                    </p>
                  </div>
                </div>
              </div>

              {/* ESTIMASI KAS INFO CARD */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs space-y-3">
                <h4 className="font-black text-xs text-[#1C221E] dark:text-white flex items-center gap-2">
                  <span>💡</span>
                  <span>Estimasi Potensi Pemasukan Kas RT</span>
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 font-medium">Total Warga Terdata:</span>
                    <strong className="text-[#1C221E] dark:text-white">{summary.totalRumah || 20} Rumah</strong>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 font-medium">Potensi per Bulan:</span>
                    <strong className="text-emerald-600 font-black">
                      Rp {((summary.totalRumah || 20) * (parseInt(editTarifInput, 10) || 30000)).toLocaleString('id-ID')}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                    <span className="text-stone-500 font-medium">Potensi per Tahun:</span>
                    <strong className="text-[#0B484C] dark:text-[#F3D37A] font-black">
                      Rp {((summary.totalRumah || 20) * (parseInt(editTarifInput, 10) || 30000) * 12).toLocaleString('id-ID')}
                    </strong>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 italic leading-snug">
                  * Seluruh warga dapat melihat nomor rekening dan nominal iuran ini secara transparan pada formulir pembayaran IPL mandiri.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
