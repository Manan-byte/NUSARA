import React, { useState } from 'react';
import { PillBadge, Modal } from '@sim-warga/ui';
import { TransaksiIPL } from '@sim-warga/types';
import {
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  Clock,
  ExternalLink,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

export interface AdminVerifikasiQueueProps {
  transaksiList: TransaksiIPL[];
  onApprove: (noTransaksi: string, namaWarga: string) => void;
  onReject: (noTransaksi: string, catatan: string) => void;
}

export const AdminVerifikasiQueue: React.FC<AdminVerifikasiQueueProps> = ({
  transaksiList,
  onApprove,
  onReject,
}) => {
  const [selectedTrxForPreview, setSelectedTrxForPreview] = useState<TransaksiIPL | null>(null);
  const [rejectModalTrx, setRejectModalTrx] = useState<TransaksiIPL | null>(null);
  const [rejectCatatan, setRejectCatatan] = useState('');

  const antreanMenunggu = transaksiList.filter(
    (t) => t.status === 'Menunggu Verifikasi'
  );

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
    <div className="bg-white dark:bg-[#111C2D] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-blue-900/40 shadow-sm mb-8 select-none text-slate-900 dark:text-white transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panel Verifikasi Pembayaran IPL (Pengurus / Bendahara)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Bukti struk diambil langsung dari <strong>Google Sheets (Tab PEMBAYARAN_IPL Kolom 11: Bukti Bayar)</strong>.
          </p>
        </div>
        <PillBadge
          variant={antreanMenunggu.length > 0 ? 'verifikasi' : 'lunas'}
          size="sm"
        >
          {antreanMenunggu.length} Menunggu Verifikasi
        </PillBadge>
      </div>

      {antreanMenunggu.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2 opacity-80" />
          <p className="font-bold text-slate-800 dark:text-slate-200">Semua Pembayaran Telah Terverifikasi</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tidak ada antrean bukti transfer yang tertunda saat ini.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {antreanMenunggu.map((trx) => (
            <div
              key={trx.noTransaksi}
              className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                      {trx.noTransaksi}
                    </span>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {trx.namaWarga}
                    </span>
                    <PillBadge variant="blok" size="sm">
                      {trx.lokasiRumah}
                    </PillBadge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                    Periode: <strong>{trx.periodeTercover}</strong> • Nominal: <strong>Rp {trx.nominalBayar.toLocaleString('id-ID')}</strong> ({trx.metodePembayaran})
                  </p>
                  {trx.keterangan && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5">
                      Catatan di Sheet: {trx.keterangan}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setSelectedTrxForPreview(trx)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  title="Lihat Bukti Struk dari Google Sheets"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Lihat Struk</span>
                </button>

                <button
                  onClick={() => setRejectModalTrx(trx)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Tolak</span>
                </button>

                <button
                  onClick={() => onApprove(trx.noTransaksi, trx.namaWarga)}
                  className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve (Lunas)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Preview Gambar Struk */}
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
                href="https://docs.google.com/spreadsheets/d/1Tt692ZhKSoWV13GMZGCXdcSYi3DOPLFqaIBstql-neM/edit#gid=0"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-black hover:bg-emerald-700 shadow-sm"
                >
                  Approve (Lunas)
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Alasan Penolakan */}
      <Modal
        isOpen={!!rejectModalTrx}
        onClose={() => setRejectModalTrx(null)}
        title="Tolak Verifikasi Pembayaran"
        subtitle={`Transaksi ${rejectModalTrx?.noTransaksi} atas nama ${rejectModalTrx?.namaWarga}`}
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600">
            Tentukan alasan penolakan agar status kembali ke <strong>Belum Bayar</strong>:
          </p>
          <textarea
            rows={3}
            value={rejectCatatan}
            onChange={(e) => setRejectCatatan(e.target.value)}
            placeholder="Contoh: Bukti buram, nominal tidak sesuai, atau belum masuk mutasi rekening BCA..."
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
    </div>
  );
};
