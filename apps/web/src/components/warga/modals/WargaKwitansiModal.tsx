import React from 'react';
import { X, Download, Printer, RefreshCw } from 'lucide-react';

export interface KwitansiModalData {
  type: 'ipl' | 'pju';
  title: string;
  resiNo: string;
  namaWarga: string;
  blokRumah: string;
  noWa: string;
  kategori: string;
  rincian: string;
  nominal: number;
  terbilang: string;
  tanggalBayar: string;
  masaAktif: string;
  metode: string;
  keterangan: string;
  verifiedBy: string;
  tanggalPelunasan?: string;
}

export interface WargaKwitansiModalProps {
  kwitansiModal: KwitansiModalData | null;
  onClose: () => void;
  onDownloadSlipText: (k: KwitansiModalData) => void;
  onPrintKwitansiPdf: (k: KwitansiModalData) => void;
  isPrintingKwitansi: boolean;
}

export const WargaKwitansiModal: React.FC<WargaKwitansiModalProps> = ({
  kwitansiModal,
  onClose,
  onDownloadSlipText,
  onPrintKwitansiPdf,
  isPrintingKwitansi,
}) => {
  if (!kwitansiModal) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[75] flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="print-kwitansi-sheet carlic-card max-w-2xl w-full p-4 sm:p-5 relative border-2 border-[#D9B352]/70 shadow-2xl bg-white dark:bg-[#0B383B]"
      >
        {/* Tombol Tutup (Non-Print) */}
        <button
          type="button"
          onClick={onClose}
          className="no-print w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 flex items-center justify-center absolute top-3.5 right-3.5"
        >
          <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
        </button>

        {/* Kop Surat Resmi Kwitansi Digital Paguyuban (Ringkas) */}
        <div className="flex items-center gap-3 pb-2.5 mb-2.5 border-b-2 border-[#D9B352]/50 pr-8">
          <div className="w-10 h-10 rounded-xl bg-[#0B484C] ring-2 ring-[#D9B352] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
            <img
              src="/logo-pesona-kahuripan.png"
              alt="Logo PK8"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#9A7018] dark:text-[#F3D37A] block">
              Paguyuban Warga Pesona Kahuripan 8 Tahap 2 • RT 08
            </span>
            <h3 className="text-sm sm:text-base font-black text-[#1C221E] dark:text-white leading-tight truncate">
              {kwitansiModal.type === 'ipl'
                ? 'KWITANSI RESMI PELUNASAN IURAN IPL'
                : 'KWITANSI RESMI SETORAN URUNAN PJU'}
            </h3>
            <p className="text-[10px] text-stone-500 dark:text-stone-300 truncate">
              Surat Bukti Pelunasan Keuangan Sah Terverifikasi Bendahara Paguyuban
            </p>
          </div>
        </div>

        {/* Nomor Resi & Status Lunas */}
        <div className="px-3 py-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-3 mb-2.5 text-xs">
          <div>
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
              Nomor Kwitansi / Resi
            </span>
            <span className="font-mono font-extrabold text-[#0B484C] dark:text-[#F3D37A] text-xs sm:text-sm">
              {kwitansiModal.resiNo}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
              Status Pembukuan Kas
            </span>
            <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B484C] border border-emerald-300 inline-block">
              ✓ LUNAS TERVERIFIKASI
            </span>
          </div>
        </div>

        {/* Tabel Rincian Pelunasan Kwitansi */}
        <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 text-xs mb-2.5 space-y-1">
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Nama Kepala Keluarga</span>
            <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
              {kwitansiModal.namaWarga}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Alamat Rumah / Blok</span>
            <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] text-right">
              {kwitansiModal.blokRumah}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Pos Pembayaran Kas</span>
            <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
              {kwitansiModal.kategori}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Rincian Durasi / Program</span>
            <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
              {kwitansiModal.rincian}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Masa Aktif / Periode</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-right">
              {kwitansiModal.masaAktif}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
            <span className="text-stone-400 whitespace-nowrap">Metode Penyetoran</span>
            <span className="font-bold text-stone-600 dark:text-stone-300 text-right">
              {kwitansiModal.metode}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1.5">
            <div>
              <span className="text-[11px] font-extrabold text-stone-600 dark:text-stone-300 uppercase block">
                Total Jumlah Lunas
              </span>
              <span className="text-[10px] italic text-stone-400">
                Terbilang: &ldquo;{kwitansiModal.terbilang}&rdquo;
              </span>
            </div>
            <span className="text-base sm:text-lg font-black text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
              Rp {kwitansiModal.nominal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Cap Stempel Resmi Paguyuban & Tanda Tangan Bendahara */}
        <div className="grid grid-cols-2 gap-2 px-3 py-2 rounded-xl bg-[#FEF9EB] dark:bg-[#072B2E]/70 border border-[#D9B352]/50 text-xs mb-3 items-center">
          <div>
            <span className="text-[9px] font-extrabold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider block">
              Pengesahan &amp; Verifikasi
            </span>
            <p className="font-bold text-[#1C221E] dark:text-white text-[11px] leading-tight">
              {kwitansiModal.verifiedBy}
            </p>
            <span className="text-[9px] text-stone-400 block font-mono">
              VALID-PK8-{kwitansiModal.type.toUpperCase()}-{kwitansiModal.resiNo.replace(/\D/g, '') || '2026'}
            </span>
          </div>
          <div className="text-right flex flex-col items-end gap-0.5">
            <div className="px-2 py-0.5 rounded-md border-2 border-rose-600 text-rose-600 font-black text-[9px] uppercase tracking-widest rotate-[-2deg] inline-block">
              STEMPEL DIGITAL SAH • PK8
            </div>
            <span className="text-[9px] text-stone-500 dark:text-stone-300 font-semibold">
              Tercatat Resmi di Google Sheets
            </span>
          </div>
        </div>

        {/* Tombol Aksi Download & Print (Non-Print) */}
        <div className="no-print grid grid-cols-3 gap-2 text-xs">
          <button
            type="button"
            onClick={() => onDownloadSlipText(kwitansiModal)}
            className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-[#1C221E] dark:text-white font-extrabold flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
            <span>Unduh Slip (.txt)</span>
          </button>
          <button
            type="button"
            disabled={isPrintingKwitansi}
            onClick={() => onPrintKwitansiPdf(kwitansiModal)}
            className="carlic-sage-btn text-[#F3D37A] font-extrabold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 transition-all"
          >
            {isPrintingKwitansi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F3D37A]" />
                <span>Menyiapkan Lembar Cetak...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak / Simpan PDF</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-700 font-bold text-stone-700 dark:text-stone-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
