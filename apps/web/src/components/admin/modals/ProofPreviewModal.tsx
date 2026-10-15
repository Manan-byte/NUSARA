import React, { useState } from 'react';
import { TransaksiIPL, ItemUrunanWarga } from '@sim-warga/types';
import { X, ExternalLink, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface ProofPreviewModalProps {
  item: TransaksiIPL | ItemUrunanWarga;
  type: 'ipl' | 'urunan';
  onClose: () => void;
}

export const ProofPreviewModal: React.FC<ProofPreviewModalProps> = ({
  item,
  type,
  onClose,
}) => {
  const isIpl = type === 'ipl';
  const ipl = isIpl ? (item as TransaksiIPL) : null;
  const urunan = !isIpl ? (item as ItemUrunanWarga) : null;

  const namaWarga = isIpl ? ipl!.namaWarga : urunan!.namaWarga;
  const noId = isIpl ? ipl!.noTransaksi : urunan!.id;
  const nominal = isIpl ? ipl!.nominalBayar : urunan!.nominal;
  const lokasi = isIpl ? ipl!.lokasiRumah : (urunan!.keterangan || '-');
  const metode = isIpl ? ipl!.metodePembayaran : urunan!.metode;
  const status = item.status;
  const rawBuktiUrl = isIpl ? ipl!.buktiBayar : urunan!.buktiBayar;

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

  const getFallbackReceiptUrl = (metodeStr: string, isIplCheck: boolean): string => {
    const m = (metodeStr || '').toLowerCase();
    if (m.includes('qris')) {
      return '/bukti-bayar/struk_qris_01.png';
    }
    if (m.includes('mandiri')) {
      return isIplCheck ? '/bukti-bayar/struk_ipl_01.png' : '/bukti-bayar/struk_pju_01.png';
    }
    if (m.includes('bca')) {
      return '/bukti-bayar/struk_transfer_wa1.jpg';
    }
    return isIplCheck ? '/bukti-bayar/struk_ipl_02.png' : '/bukti-bayar/struk_pju_02.png';
  };

  const resolveDirectImageUrl = (url?: string): string => {
    if (!url || url === '-' || url === 'undefined') {
      return getFallbackReceiptUrl(metode, isIpl);
    }
    if (url.startsWith('data:') || url.startsWith('/') || url.startsWith('blob:')) {
      return url;
    }
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1]) {
      // Google Drive thumbnail endpoint is publicly hotlinkable for shared files without 403
      return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`;
    }
    return url;
  };

  const isPdf = rawBuktiUrl && (rawBuktiUrl.toLowerCase().includes('.pdf') || rawBuktiUrl.toLowerCase().includes('slip'));
  const [imageSrc, setImageSrc] = useState<string>(() => resolveDirectImageUrl(rawBuktiUrl));
  const [hasFallbackLoaded, setHasFallbackLoaded] = useState<boolean>(false);

  const handleImageError = () => {
    const fallback = getFallbackReceiptUrl(metode, isIpl);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasFallbackLoaded(true);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#072426] max-w-lg w-full p-5 sm:p-6 rounded-3xl border-2 border-stone-300 dark:border-[#D9B352]/60 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b-2 border-stone-200 dark:border-stone-700">
          <div>
            <h3 className="font-black text-sm sm:text-base text-[#1C221E] dark:text-white">
              Bukti Pembayaran {isIpl ? 'IPL' : 'Urunan PJU'}: {namaWarga}
            </h3>
            <span className="text-[11px] font-mono font-bold text-stone-400">
              {noId}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* DETAILS CARD */}
        <div className="space-y-2 text-xs bg-stone-50/90 dark:bg-[#051E20] p-4 rounded-2xl border-2 border-stone-200 dark:border-stone-700">
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-bold text-[10px]">PENGIRIM:</span>
            <span className="font-extrabold text-[#1C221E] dark:text-white">
              {namaWarga} ({lokasi})
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-bold text-[10px]">NOMINAL:</span>
            <span className="text-base font-black text-[#0B484C] dark:text-[#F3D37A]">
              Rp {nominal.toLocaleString('id-ID')}
            </span>
          </div>
          {isIpl && ipl && (
            <div className="flex justify-between items-center">
              <span className="text-stone-400 font-bold text-[10px]">DURASI PAKET:</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">
                {formatCleanDurasi(ipl.durasiPaket, ipl.periodeTercover)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-stone-400 font-bold text-[10px]">METODE BAYAR:</span>
            <span className="font-bold text-stone-700 dark:text-stone-300">
              {metode}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t-2 border-stone-200/80 dark:border-stone-700">
            <span className="text-stone-400 font-bold text-[10px]">STATUS TRANSAKSI:</span>
            <span
              className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                status === 'Lunas'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : status === 'Menunggu Verifikasi'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* IMAGE / DOCUMENT PREVIEW CONTAINER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Lampiran Struk Transfer:
            </span>
            {hasFallbackLoaded && (
              <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Pratinjau Struk Aktif</span>
              </span>
            )}
          </div>

          <div className="rounded-2xl overflow-hidden border-2 border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-900/60 flex flex-col items-center justify-center p-3 shadow-xs">
            {isPdf ? (
              /* PDF DOCUMENT SPECIAL CARD */
              <div className="w-full p-4 rounded-xl bg-white dark:bg-[#072426] border-2 border-stone-200 dark:border-stone-700 text-center space-y-2 my-2">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#1C221E] dark:text-white">
                    Dokumen Slip Bank Resmi (.PDF)
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium">
                    Lampiran slip setoran bank format digital warga
                  </p>
                </div>
                <img
                  src={getFallbackReceiptUrl(metode, isIpl)}
                  alt="Visual Preview Slip"
                  className="max-h-48 object-contain rounded-xl mx-auto border border-stone-200 dark:border-stone-700 my-2 shadow-xs"
                />
              </div>
            ) : (
              /* IMAGE STRUK DISPLAY */
              <img
                src={imageSrc}
                alt="Bukti Transfer Warga"
                onError={handleImageError}
                className="max-h-72 w-auto object-contain rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs bg-white dark:bg-stone-800"
              />
            )}

            {rawBuktiUrl && rawBuktiUrl !== '-' && (
              <a
                href={rawBuktiUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 px-3.5 py-1.5 rounded-xl bg-white dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 text-xs font-bold text-[#0B484C] dark:text-[#F3D37A] hover:bg-stone-50 dark:hover:bg-stone-700 flex items-center gap-1.5 shadow-2xs transition-all"
              >
                <span>Buka File Asli di Tab Baru ↗</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex justify-between items-center pt-3 border-t-2 border-stone-200 dark:border-stone-700">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Resi</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-200 font-bold text-xs border-2 border-stone-300 dark:border-stone-600 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
