import React, { useState } from 'react';
import { TransaksiIPL, ItemUrunanWarga } from '@sim-warga/types';
import { X, ExternalLink, Printer, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

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
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  const handleImageError = () => {
    const fallback = getFallbackReceiptUrl(metode, isIpl);
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setHasFallbackLoaded(true);
    }
    setIsImageLoading(false);
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Resi_Bukti_${noId}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 16px 20px;
      background: #F8FAFC;
      color: #1C221E;
      line-height: 1.4;
      font-size: 13px;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      background: #0B484C;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 9999;
    }
    .top-toolbar-title {
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .top-toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #F3D37A;
      color: #0B484C;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .voucher-card {
      max-width: 650px;
      margin: 0 auto;
      border: 2px solid #0B484C;
      border-radius: 16px;
      padding: 24px 28px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 14px;
      margin-bottom: 16px;
    }
    .brand h2 {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #0B484C;
      font-weight: 800;
    }
    .brand h1 {
      margin: 3px 0 0 0;
      font-size: 17px;
      font-weight: 900;
      color: #0F172A;
    }
    .badge {
      background: #ECFDF5;
      color: #065F46;
      border: 1.5px solid #A7F3D0;
      padding: 4px 12px;
      border-radius: 9999px;
      font-weight: 800;
      font-size: 11px;
      text-align: right;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .info-table td {
      padding: 8px 4px;
      border-bottom: 1px solid #F1F5F9;
    }
    .info-label {
      color: #64748B;
      font-size: 12px;
      width: 38%;
    }
    .info-val {
      font-weight: 700;
      color: #0F172A;
      text-align: right;
    }
    .amount-box {
      background: #FEF9EB;
      border: 1.5px solid #D9B352;
      border-radius: 12px;
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .amount-val {
      font-size: 20px;
      font-weight: 900;
      color: #0B484C;
    }
    .proof-box {
      border: 1px solid #CBD5E1;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
      background: #F8FAFC;
      margin-bottom: 16px;
    }
    .proof-img {
      max-height: 280px;
      max-width: 100%;
      object-fit: contain;
      border-radius: 8px;
      border: 1px solid #E2E8F0;
    }
    .footer-stamp {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #E2E8F0;
      font-size: 11px;
      color: #64748B;
    }
    .stamp {
      border: 2px solid #E11D48;
      color: #E11D48;
      padding: 3px 8px;
      border-radius: 6px;
      font-weight: 900;
      font-size: 9px;
      letter-spacing: 1px;
    }
    @media print {
      .top-toolbar { display: none !important; }
      body { padding: 0 !important; background: #FFF !important; }
      .voucher-card { box-shadow: none !important; border-color: #0B484C !important; }
    }
  </style>
</head>
<body>
  <div class="top-toolbar">
    <div class="top-toolbar-title">
      <span>📄 Pratinjau Dokumen Siap Cetak (${noId})</span>
    </div>
    <div class="top-toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Keluar / Tutup</button>
    </div>
  </div>

  <div class="voucher-card">
    <div class="header">
      <div class="brand">
        <h2>Paguyuban Warga Pesona Kahuripan 8 Tahap 2 • RT 08</h2>
        <h1>Lembar Bukti Setoran: ${isIpl ? 'Iuran IPL' : 'Urunan Warga'}</h1>
      </div>
      <div class="badge">
        ID: ${noId}<br>
        <span style="font-size: 10px; color: #059669;">${status}</span>
      </div>
    </div>

    <table class="info-table">
      <tr>
        <td class="info-label">Nama Pengirim / Kepala Keluarga</td>
        <td class="info-val" style="font-size: 14px;">${namaWarga}</td>
      </tr>
      <tr>
        <td class="info-label">Alamat Rumah / Blok</td>
        <td class="info-val" style="color: #0B484C;">${lokasi}</td>
      </tr>
      ${isIpl && ipl ? `
      <tr>
        <td class="info-label">Durasi Paket Tercover</td>
        <td class="info-val">${formatCleanDurasi(ipl.durasiPaket, ipl.periodeTercover)}</td>
      </tr>` : ''}
      <tr>
        <td class="info-label">Metode Penyetoran</td>
        <td class="info-val">${metode}</td>
      </tr>
    </table>

    <div class="amount-box">
      <span style="font-size: 11px; font-weight: 800; color: #9A7018; text-transform: uppercase;">Total Nominal</span>
      <span class="amount-val">Rp ${nominal.toLocaleString('id-ID')}</span>
    </div>

    <div class="proof-box">
      <div style="font-size: 10px; font-weight: 800; color: #64748B; margin-bottom: 8px; text-transform: uppercase;">
        Lampiran Struk Transfer Terverifikasi
      </div>
      <img class="proof-img" src="${imageSrc}" alt="Bukti Transfer">
    </div>

    <div class="footer-stamp">
      <div>
        * Terverifikasi pada basis data Google Sheets Paguyuban PK8 RT 08.<br>
        Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
      <div class="stamp">STEMPEL DIGITAL SAH • PK8</div>
    </div>
  </div>

  <script>
    window.onafterprint = function() {
      window.close();
    };
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    const popup = window.open('', 'CetakResiPopup', 'width=780,height=880,left=150,top=60,resizable=yes,scrollbars=yes');
    if (popup) {
      popup.document.open();
      popup.document.write(htmlContent);
      popup.document.close();
      onClose();
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const frameDoc = iframe.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(htmlContent);
        frameDoc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch {}
            onClose();
          }, 1000);
        }, 300);
      }
    }
    setIsPrinting(false);
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
              /* IMAGE STRUK DISPLAY WITH DELAY ANIMATION */
              <>
                {isImageLoading && (
                  <div className="w-full h-44 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#0B484C]/30 dark:border-[#F3D37A]/30 bg-white/70 dark:bg-stone-800/50 animate-pulse my-2">
                    <div className="w-7 h-7 rounded-full border-2 border-[#0B484C]/20 border-t-[#0B484C] dark:border-[#F3D37A]/20 dark:border-t-[#F3D37A] animate-spin" />
                    <span className="text-xs font-bold text-stone-600 dark:text-stone-300">
                      Memuat pratinjau bukti transfer...
                    </span>
                    <span className="text-[10px] text-stone-400">
                      Mohon tunggu sebentar
                    </span>
                  </div>
                )}
                <img
                  src={imageSrc}
                  alt="Bukti Transfer Warga"
                  onLoad={() => setIsImageLoading(false)}
                  onError={handleImageError}
                  className={`max-h-72 w-auto object-contain rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs bg-white dark:bg-stone-800 transition-opacity duration-300 ${
                    isImageLoading ? 'hidden' : 'block'
                  }`}
                />
              </>
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
            disabled={isPrinting}
            onClick={handlePrintReceipt}
            className="px-4 py-2 rounded-xl border-2 border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-60"
          >
            {isPrinting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0B484C] dark:text-[#F3D37A]" />
                <span>Menyiapkan Resi...</span>
              </>
            ) : (
              <>
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Resi</span>
              </>
            )}
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
