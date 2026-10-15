import React, { useState } from 'react';
import { PillBadge, Modal } from '@sim-warga/ui';
import { TransaksiIPL, InfoRekeningBank } from '@sim-warga/types';
import {
  CreditCard,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Eye,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { RupiahInput } from '../common/RupiahInput';

export interface AdminTransaksiIplTableProps {
  transaksiList: TransaksiIPL[];
  tarifIpl: number;
  onUpdateTarifIpl: (newTarif: number) => void;
  onApprove: (noTransaksi: string, namaWarga: string) => void;
  onReject: (noTransaksi: string, catatan: string) => void;
  rekeningBank?: InfoRekeningBank;
  onUpdateRekening?: (newRekening: InfoRekeningBank) => void;
}
export const AdminTransaksiIplTable: React.FC<AdminTransaksiIplTableProps> = ({
  transaksiList,
  tarifIpl,
  onUpdateTarifIpl,
  onApprove,
  onReject,
  rekeningBank,
  onUpdateRekening,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Lunas' | 'Menunggu Verifikasi' | 'Ditolak'>('ALL');
  // Modal Tarif
  const [isModalTarifOpen, setIsModalTarifOpen] = useState(false);
  const [inputTarifBaru, setInputTarifBaru] = useState(tarifIpl);

  // Modal Rekening Kas Bank RT
  const [isModalRekeningOpen, setIsModalRekeningOpen] = useState(false);
  const [formBank, setFormBank] = useState(rekeningBank?.namaBank || 'Bank Central Asia (BCA)');
  const [formNoRek, setFormNoRek] = useState(rekeningBank?.noRekening || '8820192839');
  const [formAtasNama, setFormAtasNama] = useState(rekeningBank?.atasNama || 'Kas Paguyuban Warga PK8');
  const [formCatatanRek, setFormCatatanRek] = useState(rekeningBank?.catatan || '');

  const handleSaveRekening = (e: React.FormEvent) => {
    e.preventDefault();
    if (formBank.trim() && formNoRek.trim() && formAtasNama.trim() && onUpdateRekening) {
      onUpdateRekening({
        namaBank: formBank.trim(),
        noRekening: formNoRek.trim(),
        atasNama: formAtasNama.trim(),
        catatan: formCatatanRek.trim(),
      });
      setIsModalRekeningOpen(false);
    }
  };
  // Modal Preview Gambar Struk
  const [selectedTrxForPreview, setSelectedTrxForPreview] = useState<TransaksiIPL | null>(null);

  // Modal Tolak Pembayaran
  const [rejectModalTrx, setRejectModalTrx] = useState<TransaksiIPL | null>(null);
  const [rejectCatatan, setRejectCatatan] = useState('');

  // Antrean Verifikasi
  const antreanMenunggu = transaksiList.filter((t) => t.status === 'Menunggu Verifikasi');

  const filtered = transaksiList.filter((t) => {
    const matchSearch =
      t.namaWarga.toLowerCase().includes(search.toLowerCase()) ||
      t.lokasiRumah.toLowerCase().includes(search.toLowerCase()) ||
      t.noTransaksi.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalMasukLunas = transaksiList
    .filter((t) => t.status === 'Lunas')
    .reduce((acc, curr) => acc + curr.nominalBayar, 0);

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputTarifBaru >= 5000) {
      onUpdateTarifIpl(inputTarifBaru);
      setIsModalTarifOpen(false);
    }
  };

  const handleConfirmReject = () => {
    if (rejectModalTrx) {
      onReject(rejectModalTrx.noTransaksi, rejectCatatan || 'Struk tidak sesuai atau belum masuk mutasi');
      setRejectModalTrx(null);
      setRejectCatatan('');
    }
  };

  const getDirectImageUrl = (rawUrl?: string): string => {
    if (!rawUrl || rawUrl === '-' || rawUrl === 'Terlampir') {
      return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
    }

    const driveMatch = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || rawUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
    }

    if (rawUrl.startsWith('http') || rawUrl.startsWith('data:image')) {
      return rawUrl;
    }

    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80';
  };

  return (
    <div className="bg-white dark:bg-[#111C2D] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-blue-900/40 shadow-sm mb-8 select-none text-slate-900 dark:text-white transition-colors">
      {/* ======================================================== */}
      {/* 1. MASTER HEADER: TITLE & ATUR TARIF BUTTON              */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Manajemen &amp; Verifikasi Kas IPL</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pengurus / Bendahara RT 08</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Data Transaksi &amp; Verifikasi IPL Warga
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Verifikasi bukti transfer warga, pantau mutasi kas masuk, dan atur besaran tarif iuran bulanan.
          </p>
        </div>

        {/* Action Controls: Atur Tarif IPL & Atur Rekening Kas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setFormBank(rekeningBank?.namaBank || 'Bank Central Asia (BCA)');
              setFormNoRek(rekeningBank?.noRekening || '8820192839');
              setFormAtasNama(rekeningBank?.atasNama || 'Kas Paguyuban Warga PK8');
              setFormCatatanRek(rekeningBank?.catatan || '');
              setIsModalRekeningOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/70 dark:hover:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold text-xs border border-blue-200 dark:border-blue-800 transition-all shadow-xs"
            title="Ubah nomor rekening bank tujuan transfer IPL"
          >
            <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Atur Rekening Kas ({rekeningBank?.namaBank.split(' ')[0] || 'BCA'} - {rekeningBank?.noRekening || '8820192839'})</span>
          </button>

          <button
            onClick={() => {
              setInputTarifBaru(tarifIpl);
              setIsModalTarifOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-xs"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Atur Tarif (Rp {tarifIpl.toLocaleString('id-ID')} / bulan)</span>
          </button>
        </div>
      </div>
      {/* ======================================================== */}
      {/* 2. RINGKASAN METRIK KAS MASUK                            */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
          <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 block uppercase tracking-wider">
            Total Kas IPL Masuk (Lunas)
          </span>
          <span className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-300 mt-0.5 block">
            Rp {totalMasukLunas.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
            Total Transaksi Tercatat
          </span>
          <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5 block">
            {transaksiList.length} Transaksi
          </span>
        </div>

        <div className={`p-4 rounded-2xl border transition-colors ${
          antreanMenunggu.length > 0
            ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/60 ring-2 ring-amber-400/20'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
        }`}>
          <span className={`text-[10px] font-bold block uppercase tracking-wider ${
            antreanMenunggu.length > 0 ? 'text-amber-800 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
          }`}>
            Menunggu Verifikasi Struk
          </span>
          <span className={`text-lg sm:text-xl font-black mt-0.5 block ${
            antreanMenunggu.length > 0 ? 'text-amber-900 dark:text-amber-300' : 'text-slate-900 dark:text-white'
          }`}>
            {antreanMenunggu.length} Antrean
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. RIWAYAT & VERIFIKASI TRANSAKSI IPL DALAM TABEL        */}
      {/* ======================================================== */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wide">
            Riwayat Seluruh Catatan Pembayaran IPL
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total {filtered.length} baris data
          </span>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama warga, no. transaksi, atau blok..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {(['ALL', 'Lunas', 'Menunggu Verifikasi', 'Ditolak'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Transactions */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">No. Transaksi</th>
                <th className="py-3.5 px-4">Nama Warga</th>
                <th className="py-3.5 px-4">Blok / Rumah</th>
                <th className="py-3.5 px-4">Periode</th>
                <th className="py-3.5 px-4">Nominal (Rp)</th>
                <th className="py-3.5 px-4">Metode</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4 text-center">Aksi / Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111C2D]">
              {filtered.map((t) => (
                <tr key={t.noTransaksi} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {t.noTransaksi}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {t.namaWarga}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {t.lokasiRumah}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {t.periodeTercover}
                  </td>
                  <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white font-mono text-xs sm:text-sm">
                    Rp {t.nominalBayar.toLocaleString('id-ID')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                    {t.metodePembayaran}
                  </td>
                  <td className="py-3.5 px-4">
                    <PillBadge
                      variant={
                        t.status === 'Lunas'
                          ? 'lunas'
                          : t.status === 'Menunggu Verifikasi'
                          ? 'verifikasi'
                          : 'belumBayar'
                      }
                      size="sm"
                    >
                      {t.status}
                    </PillBadge>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-medium">
                    {t.tanggalPelunasan || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {t.status === 'Menunggu Verifikasi' ? (
                      <div className="flex items-center justify-center gap-1.5 flex-nowrap">
                        <button
                          onClick={() => setSelectedTrxForPreview(t)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                          title="Lihat Bukti Foto Struk"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Struk</span>
                        </button>

                        <button
                          onClick={() => setRejectModalTrx(t)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                          title="Tolak Verifikasi"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>

                        <button
                          onClick={() => onApprove(t.noTransaksi, t.namaWarga)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
                          title="Setujui Pembayaran Lunas"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedTrxForPreview(t)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          title="Lihat Struk Pembayaran"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-400" />
                          <span>Lihat Struk</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs font-semibold bg-white dark:bg-[#111C2D]">
              Tidak ada transaksi IPL yang sesuai dengan pencarian atau filter.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL PREVIEW GAMBAR STRUK TRANSFER                      */}
      {/* ======================================================== */}
      <Modal
        isOpen={!!selectedTrxForPreview}
        onClose={() => setSelectedTrxForPreview(null)}
        title="Bukti Struk Transfer (Google Sheets Tab PEMBAYARAN_IPL)"
        subtitle={`Transaksi ${selectedTrxForPreview?.noTransaksi} • ${selectedTrxForPreview?.namaWarga} (${selectedTrxForPreview?.lokasiRumah})`}
        maxWidth="lg"
      >
        {selectedTrxForPreview && (
          <div className="space-y-4 text-xs">
            {/* Meta rincian transaksi */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Warga</span>
                <span className="font-bold text-slate-900">{selectedTrxForPreview.namaWarga}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Blok Rumah</span>
                <span className="font-bold text-slate-900">{selectedTrxForPreview.lokasiRumah}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Nominal</span>
                <span className="font-bold text-emerald-700">
                  Rp {selectedTrxForPreview.nominalBayar.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Metode</span>
                <span className="font-bold text-slate-900">{selectedTrxForPreview.metodePembayaran}</span>
              </div>
            </div>

            {/* Container Preview Gambar */}
            <div className="bg-slate-100 rounded-2xl border border-slate-200 p-2 sm:p-4 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
              <div className="relative group max-w-full text-center">
                <img
                  src={getDirectImageUrl(selectedTrxForPreview.buktiBayar)}
                  alt={`Struk ${selectedTrxForPreview.noTransaksi}`}
                  className="max-h-[420px] w-auto object-contain rounded-xl shadow-md border border-slate-300 mx-auto"
                />
                <div className="mt-2.5 text-center">
                  <a
                    href={getDirectImageUrl(selectedTrxForPreview.buktiBayar)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-2xs"
                  >
                    <span>Buka Foto Struk Ukuran Penuh</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Tombol aksi cepat */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <a
                href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit#gid=0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-bold"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buka Google Sheets</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setRejectModalTrx(selectedTrxForPreview);
                    setSelectedTrxForPreview(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 font-bold hover:bg-rose-100"
                >
                  Tolak Struk
                </button>
                <button
                  onClick={() => {
                    onApprove(selectedTrxForPreview.noTransaksi, selectedTrxForPreview.namaWarga);
                    setSelectedTrxForPreview(null);
                  }}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-black hover:bg-blue-700 shadow-sm"
                >
                  Approve (Lunas)
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ======================================================== */}
      {/* MODAL ALASAN PENOLAKAN PEMBAYARAN                         */}
      {/* ======================================================== */}
      <Modal
        isOpen={!!rejectModalTrx}
        onClose={() => setRejectModalTrx(null)}
        title="Tolak Verifikasi Pembayaran"
        subtitle={`Transaksi ${rejectModalTrx?.noTransaksi} atas nama ${rejectModalTrx?.namaWarga}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 font-medium">
            Tentukan alasan penolakan agar status kembali ke <strong>Belum Bayar</strong>:
          </p>
          <textarea
            rows={3}
            value={rejectCatatan}
            onChange={(e) => setRejectCatatan(e.target.value)}
            placeholder="Contoh: Bukti transfer buram, nominal tidak cocok, atau belum masuk mutasi bank..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setRejectModalTrx(null)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-xs"
            >
              Konfirmasi Tolak
            </button>
          </div>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL ATUR TARIF IPL BULANAN                              */}
      {/* ======================================================== */}
      {isModalTarifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setIsModalTarifOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#111C2D] rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Atur Tarif Iuran IPL Bulanan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 mb-5">
              Tentukan besaran iuran pengelolaan lingkungan per rumah untuk setiap bulan.
            </p>

            <form onSubmit={handleSaveTarif} className="space-y-4 text-xs">
              <RupiahInput
                label="Nominal Tarif IPL Baru (Rp / Bulan)"
                required
                value={inputTarifBaru}
                onChange={(val) => setInputTarifBaru(val)}
                presets={[25000, 30000, 50000, 100000]}
                helperText="Format rupiah standar Indonesia dengan titik pemisah ribuan otomatis."
              />

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800 font-medium">
                Tarif baru akan otomatis memperbarui nominal pembayaran 1 bulan, 2 bulan, 6 bulan, dan 1 tahun untuk seluruh warga.
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalTarifOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md"
                >
                  Simpan Tarif Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isModalRekeningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalRekeningOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#111C2D] rounded-3xl p-6 sm:p-7 max-w-md w-full z-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">Atur Rekening Kas RT</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rekening bank resmi tujuan pembayaran IPL</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalRekeningOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRekening} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Nama Bank <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Central Asia (BCA)"
                  value={formBank}
                  onChange={(e) => setFormBank(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Nomor Rekening Bank <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 8820 1928 39"
                  value={formNoRek}
                  onChange={(e) => setFormNoRek(e.target.value)}
                  className="w-full text-xs sm:text-sm font-mono font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Atas Nama (Pemilik Rekening) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kas Paguyuban Warga PK8"
                  value={formAtasNama}
                  onChange={(e) => setFormAtasNama(e.target.value)}
                  className="w-full text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Catatan Transfer untuk Warga (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Cantumkan nama & blok di berita transfer"
                  value={formCatatanRek}
                  onChange={(e) => setFormCatatanRek(e.target.value)}
                  className="w-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalRekeningOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
                >
                  Simpan Rekening Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
