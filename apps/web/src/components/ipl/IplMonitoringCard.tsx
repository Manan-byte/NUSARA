import React, { useState } from 'react';
import { PillBadge } from '@sim-warga/ui';
import { TransaksiIPL, WargaRecord, InfoRekeningBank } from '@sim-warga/types';
import {
  CreditCard,
  UploadCloud,
  CheckCircle,
  CheckCircle2,
  Copy,
  Search,
  Check,
  Clock,
  Phone,
  Settings,
  ShieldCheck,
  Send,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  X,
  Edit,
  Home,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { RupiahInput } from '../common/RupiahInput';
export interface IplMonitoringCardProps {
  wargaList: WargaRecord[];
  transaksiList: TransaksiIPL[];
  tarifIpl: number;
  onUpdateTarifIpl?: (newTarif: number) => void;
  isAdmin: boolean;
  onUploadBukti: (trx: {
    noTransaksi: string;
    namaWarga: string;
    lokasiRumah: string;
    nominal: number;
    metode: string;
    buktiUrl: string;
  }) => void;
  isModalBayarOpen: boolean;
  setIsModalBayarOpen: (open: boolean) => void;
  onGoToDaftar?: () => void;
  rekeningBank?: InfoRekeningBank;
  onUpdateRekening?: (newRek: InfoRekeningBank) => void;
}

export const IplMonitoringCard: React.FC<IplMonitoringCardProps> = ({
  wargaList,
  transaksiList,
  tarifIpl,
  onUpdateTarifIpl,
  isAdmin,
  onUploadBukti,
  isModalBayarOpen,
  setIsModalBayarOpen,
  onGoToDaftar,
  rekeningBank,
  onUpdateRekening,
}) => {
  const [searchRumah, setSearchRumah] = useState('');
  const [copiedRekening, setCopiedRekening] = useState(false);

  // Form upload bukti
  const [namaWargaInput, setNamaWargaInput] = useState('');
  const [lokasiRumahInput, setLokasiRumahInput] = useState('Blok B No. 45');
  const [nominalInput, setNominalInput] = useState(tarifIpl.toString());
  const [metodeInput, setMetodeInput] = useState('Transfer Bank BCA');
  const [mockFilePreview, setMockFilePreview] = useState<string>('');

  // Validasi Aturan Wajib: Warga harus terdaftar sebelum bisa bayar IPL
  const [selectedWargaKey, setSelectedWargaKey] = useState<string>('');
  const [isUnregisteredError, setIsUnregisteredError] = useState<boolean>(false);
  // Modal Notifikasi Verifikasi untuk Warga
  const [noticeTrx, setNoticeTrx] = useState<{
    noTransaksi: string;
    namaWarga: string;
    lokasiRumah: string;
    nominal: number;
    metode: string;
  } | null>(null);
  // Modal Admin: Atur Tarif IPL
  const [isModalTarifOpen, setIsModalTarifOpen] = useState(false);
  const [inputTarifBaru, setInputTarifBaru] = useState(tarifIpl.toString());

  // State untuk Tabel Status IPL Seluruh Warga (di dalam Menu IPL)
  const [iplTableSearch, setIplTableSearch] = useState('');
  const [iplStatusFilter, setIplStatusFilter] = useState<'ALL' | 'Lunas' | 'Belum Bayar' | 'Menunggu Verifikasi'>('ALL');
  const [iplBlokFilter, setIplBlokFilter] = useState('ALL');
  const [iplTablePage, setIplTablePage] = useState(1);
  const [iplTablePageSize, setIplTablePageSize] = useState(10);

  const handleCopyRekening = () => {
    navigator.clipboard.writeText(rekeningBank?.noRekening || '8820192839');
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.7);
            setMockFilePreview(compressed);
          } else {
            setMockFilePreview(rawResult);
          }
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitBukti = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaWargaInput.trim()) return;

    const noTrx = `#TRX-${Date.now().toString().slice(-4)}`;
    const nominal = parseInt(nominalInput, 10) || tarifIpl;

    onUploadBukti({
      noTransaksi: noTrx,
      namaWarga: namaWargaInput.trim(),
      lokasiRumah: lokasiRumahInput.trim(),
      nominal,
      metode: metodeInput,
      buktiUrl:
        mockFilePreview ||
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    });

    setIsModalBayarOpen(false);
    setMockFilePreview('');

    // Buka Notifikasi Verifikasi untuk Warga
    setNoticeTrx({
      noTransaksi: noTrx,
      namaWarga: namaWargaInput.trim(),
      lokasiRumah: lokasiRumahInput.trim(),
      nominal,
      metode: metodeInput,
    });
  };

  const handleSaveTarif = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(inputTarifBaru, 10);
    if (val && val >= 5000 && onUpdateTarifIpl) {
      onUpdateTarifIpl(val);
      setIsModalTarifOpen(false);
    }
  };

  // Filtered warga status
  const matchedWarga = wargaList.filter((w) => {
    const q = searchRumah.toLowerCase();
    return (
      w.namaLengkap.toLowerCase().includes(q) ||
      w.alamatRumah.toLowerCase().includes(q)
    );
  });

  // Filter list warga untuk Tabel Status IPL di Menu IPL
  const filteredIplWarga = wargaList.filter((w) => {
    const matchSearch =
      w.namaLengkap.toLowerCase().includes(iplTableSearch.toLowerCase()) ||
      w.alamatRumah.toLowerCase().includes(iplTableSearch.toLowerCase());
    const matchBlok =
      iplBlokFilter === 'ALL' || w.blok.toUpperCase() === iplBlokFilter;
    const matchStatus =
      iplStatusFilter === 'ALL' ||
      (iplStatusFilter === 'Lunas' && w.statusIpl === 'Lunas') ||
      (iplStatusFilter === 'Belum Bayar' && w.statusIpl === 'Belum Bayar') ||
      (iplStatusFilter === 'Menunggu Verifikasi' && w.statusIpl === 'Menunggu Verifikasi');
    return matchSearch && matchBlok && matchStatus;
  });

  const totalIplPages = Math.max(1, Math.ceil(filteredIplWarga.length / iplTablePageSize));
  const iplStartIndex = (iplTablePage - 1) * iplTablePageSize;
  const paginatedIplWarga = filteredIplWarga.slice(iplStartIndex, iplStartIndex + iplTablePageSize);

  const lunasCount = wargaList.filter((w) => w.statusIpl === 'Lunas').length;
  const belumBayarCount = wargaList.filter((w) => w.statusIpl === 'Belum Bayar').length;
  const waitingCount = wargaList.filter((w) => w.statusIpl === 'Menunggu Verifikasi').length;
  return (
    <div className="w-full mb-10 select-none">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Keuangan &amp; Kas Lingkungan</span>
            </span>
            <span className="text-xs text-slate-500 font-medium">Iuran Pengelolaan Lingkungan (IPL)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Transparansi Pembayaran IPL
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Tarif resmi: <strong className="text-blue-700 dark:text-blue-400">Rp {tarifIpl.toLocaleString('id-ID')} / bulan</strong>. Pantau status kepatuhan dan konfirmasi pembayaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
          {/* Admin Edit Tarif Button */}
          {isAdmin && (
            <button
              onClick={() => {
                setInputTarifBaru(tarifIpl.toString());
                setIsModalTarifOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all shadow-xs"
              title="Atur besar tarif iuran bulanan"
            >
              <Settings className="w-3.5 h-3.5 text-slate-600" />
              <span>Atur Tarif (Rp {tarifIpl.toLocaleString('id-ID')})</span>
            </button>
          )}

          <button
            onClick={() => {
              setNominalInput(tarifIpl.toString());
              setIsModalBayarOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Konfirmasi Bayar IPL</span>
          </button>
        </div>
      </div>
      {/* 1. ALERT BANNER: DAFTAR TRANSAKSI DITOLAK UNTUK WARGA */}
      {(() => {
        const activeRejectedTrxList = transaksiList.filter((trx) => {
          if (trx.status !== 'Ditolak') return false;
          const hasNewerValid = transaksiList.some(
            (t) =>
              t.noTransaksi !== trx.noTransaksi &&
              t.namaWarga.toLowerCase() === trx.namaWarga.toLowerCase() &&
              (t.status === 'Menunggu Verifikasi' || t.status === 'Lunas')
          );
          return !hasNewerValid;
        });

        if (activeRejectedTrxList.length === 0) return null;

        return (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-950 text-xs shadow-xs space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>Pemberitahuan: Terdapat Bukti Pembayaran IPL yang Ditolak oleh Pengurus</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Pembayaran berikut belum dapat disetujui karena ketidaksesuaian struk/nominal. Silakan periksa alasan penolakan dan unggah ulang bukti transfer yang jelas:
            </p>
            <div className="space-y-2">
              {activeRejectedTrxList.map((trx) => (
                <div
                  key={trx.noTransaksi}
                  className="p-3 bg-white rounded-xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800">{trx.noTransaksi}</span>
                      <span className="font-bold text-slate-900">• {trx.namaWarga} ({trx.lokasiRumah})</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                        ❌ Ditolak
                      </span>
                    </div>
                    <p className="text-rose-700 font-semibold mt-1">
                      ⚠️ Alasan: {trx.keterangan || 'Bukti transfer tidak terbaca / nominal tidak cocok'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setNamaWargaInput(trx.namaWarga);
                      setLokasiRumahInput(trx.lokasiRumah);
                      setNominalInput(trx.nominalBayar.toString());
                      setIsModalBayarOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 whitespace-nowrap self-start sm:self-center"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Ulang Bukti Transfer</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Rekening Info Card & Search Cek Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Info Rekening Kas RT */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                  Rekening Resmi Kas RT
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Rp {tarifIpl.toLocaleString('id-ID')} / bulan
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-4 leading-relaxed">
              Seluruh pembayaran IPL disalurkan ke rekening bank resmi paguyuban warga Pesona Kahuripan 8 Tahap 2:
            </p>

            <div className="bg-slate-50 dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                  {rekeningBank?.namaBank || 'Bank Central Asia (BCA)'}
                </span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  Kas Paguyuban
                </span>
              </div>
              <p className="font-mono font-black text-xl text-slate-900 dark:text-white mt-1.5 tracking-wider">
                {rekeningBank?.noRekening || '8820 1928 39'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                a.n. {rekeningBank?.atasNama || 'Kas Paguyuban Warga PK8'}
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyRekening}
            className="w-full flex items-center justify-center gap-2 text-xs font-bold py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-colors shadow-xs"
          >
            {copiedRekening ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Nomor Rekening Berhasil Disalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Nomor Rekening {rekeningBank?.namaBank.split(' ')[0] || 'BCA'}</span>
              </>
            )}
          </button>
        </div>

        {/* Checker Status Rumah Warga */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm h-full flex flex-col justify-between transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Cek Status Pembayaran Rumah Anda
                </h4>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Periode: Oktober 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mb-4">
                Ketik nama kepala keluarga atau blok rumah untuk memeriksa status tagihan (Rp {tarifIpl.toLocaleString('id-ID')} / bulan):
              </p>

              <div className="relative mb-4">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ketik nama atau blok rumah (misal: 'Budi' atau 'Blok B')..."
                  value={searchRumah}
                  onChange={(e) => setSearchRumah(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              {/* Status List */}
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {matchedWarga.slice(0, 8).map((w) => {
                  const isLunas = w.statusIpl === 'Lunas';
                  const isWaiting = w.statusIpl === 'Menunggu Verifikasi';
                  const rejectedTrx = transaksiList.find(
                    (t) =>
                      t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() &&
                      t.status === 'Ditolak'
                  );
                  // Jika warga sudah upload bukti baru (Menunggu Verifikasi) atau sudah Lunas, jangan tampilkan Ditolak
                  const isRejected = (w.statusIpl === 'Ditolak' || !!rejectedTrx) && !isWaiting && !isLunas;
                  const alasanDitolak =
                    rejectedTrx?.keterangan ||
                    (w.catatan && w.catatan.toLowerCase().includes('ditolak') ? w.catatan : 'Bukti transfer tidak sesuai / buram');
                  return (
                    <div
                      key={w.id || w.no}
                      className={`p-3.5 rounded-2xl border transition-colors ${
                        isRejected
                          ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800'
                          : isWaiting
                          ? 'bg-amber-50/30 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                          : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/80 hover:bg-slate-100/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                              {w.namaLengkap} ({w.alamatRumah})
                            </span>
                            {isRejected && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
                                ❌ Pembayaran Ditolak
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {w.periodeTercover} • <strong className="text-slate-700 dark:text-slate-200">Rp {(w.nominalIpl || tarifIpl).toLocaleString('id-ID')}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isWaiting ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="w-3 h-3" />
                              <span>Menunggu Verifikasi Ketua RT</span>
                            </span>
                          ) : isLunas ? (
                            <PillBadge variant="lunas" size="sm">
                              Lunas
                            </PillBadge>
                          ) : isRejected ? (
                            <button
                              onClick={() => {
                                setNamaWargaInput(w.namaLengkap);
                                setLokasiRumahInput(w.alamatRumah);
                                setNominalInput(tarifIpl.toString());
                                setIsModalBayarOpen(true);
                              }}
                              className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <UploadCloud className="w-3.5 h-3.5" />
                              <span>Upload Ulang Bukti</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setNamaWargaInput(w.namaLengkap);
                                setLokasiRumahInput(w.alamatRumah);
                                setNominalInput(tarifIpl.toString());
                                setIsModalBayarOpen(true);
                              }}
                              className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors whitespace-nowrap"
                            >
                              Bayar Sekarang
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Kotak Alasan Penolakan dari Admin */}
                      {isRejected && (
                        <div className="mt-2.5 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300 text-rose-950 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                          <div className="leading-snug">
                            <span className="font-bold block text-rose-900">Alasan Penolakan oleh Pengurus:</span>
                            <span className="text-rose-800">{alasanDitolak}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Biaya Standar: Rp {tarifIpl.toLocaleString('id-ID')} / bulan</span>
              <span>Paket 1 Tahun (12 Bln): Rp {(tarifIpl * 12).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. TABEL STATUS PEMBAYARAN IPL SELURUH WARGA             */}
      {/* (KINI RESMI BERADA DI DALAM MENU IURAN IPL)              */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm mb-8 transition-colors">
        {/* Header Tabel IPL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200 dark:border-blue-800">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Status IPL</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">RT 08 Tahap 2</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Tabel Status Pembayaran IPL Seluruh Warga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pengecekan kepatuhan iuran kas per unit rumah lengkap dengan status lunas dan belum bayar.
            </p>
          </div>

          {/* Tombol Konfirmasi Bayar Cepat */}
          <button
            onClick={() => {
              setNominalInput(tarifIpl.toString());
              setIsModalBayarOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all self-start sm:self-center"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Konfirmasi Bayar IPL</span>
          </button>
        </div>

        {/* Filter Bar: Status Pills & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setIplStatusFilter('ALL');
                setIplTablePage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                iplStatusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              Semua ({wargaList.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setIplStatusFilter('Lunas');
                setIplTablePage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                iplStatusFilter === 'Lunas'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              Lunas ({lunasCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setIplStatusFilter('Belum Bayar');
                setIplTablePage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                iplStatusFilter === 'Belum Bayar'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              Belum Bayar ({belumBayarCount})
            </button>

            <button
              type="button"
              onClick={() => {
                setIplStatusFilter('Menunggu Verifikasi');
                setIplTablePage(1);
              }}
              className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                iplStatusFilter === 'Menunggu Verifikasi'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Verifikasi ({waitingCount})
            </button>
          </div>

          {/* Search Input & Blok Filter */}
          <div className="flex items-center gap-2">
            <select
              value={iplBlokFilter}
              onChange={(e) => {
                setIplBlokFilter(e.target.value);
                setIplTablePage(1);
              }}
              className="bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">Semua Blok</option>
              <option value="A">Blok A</option>
              <option value="B">Blok B</option>
              <option value="C">Blok C</option>
              <option value="D">Blok D</option>
              <option value="E">Blok E</option>
              <option value="F">Blok F</option>
            </select>

            <div className="relative w-48 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama warga..."
                value={iplTableSearch}
                onChange={(e) => {
                  setIplTableSearch(e.target.value);
                  setIplTablePage(1);
                }}
                className="w-full text-xs bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Table List Status IPL */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">No</th>
                <th className="py-3 px-4">Nama Warga</th>
                <th className="py-3 px-4">Blok &amp; No. Rumah</th>
                <th className="py-3 px-4">Periode</th>
                <th className="py-3 px-4">Nominal</th>
                <th className="py-3 px-4">Status IPL</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
              {paginatedIplWarga.map((w, idx) => {
                const isLunas = w.statusIpl === 'Lunas';
                const isWaiting = w.statusIpl === 'Menunggu Verifikasi';

                return (
                  <tr key={w.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 font-bold">{iplStartIndex + idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {w.namaLengkap}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.alamatRumah}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                      {w.periodeTercover || 'Oktober 2026'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      Rp {(w.nominalIpl || tarifIpl).toLocaleString('id-ID')}
                    </td>
                    <td className="py-3.5 px-4">
                      {isWaiting ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Menunggu Verifikasi</span>
                        </span>
                      ) : (
                        <PillBadge
                          variant={isLunas ? 'lunas' : 'belumBayar'}
                          size="sm"
                        >
                          {w.statusIpl}
                        </PillBadge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {!isLunas && !isWaiting ? (
                        <button
                          onClick={() => {
                            setNamaWargaInput(w.namaLengkap);
                            setLokasiRumahInput(w.alamatRumah);
                            setNominalInput(tarifIpl.toString());
                            setIsModalBayarOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                        >
                          <span>Bayar</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : isWaiting ? (
                        <span className="text-[11px] text-amber-700 font-semibold">Proses Bendahara</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Lunas</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredIplWarga.length === 0 && (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs font-semibold bg-white dark:bg-[#111827]">
              Tidak ada data pembayaran IPL yang sesuai dengan filter atau pencarian.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {filteredIplWarga.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs mt-3">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Menampilkan <strong>{iplStartIndex + 1}</strong> - <strong>{Math.min(iplStartIndex + iplTablePageSize, filteredIplWarga.length)}</strong> dari <strong>{filteredIplWarga.length}</strong> data IPL
            </span>

            <div className="flex items-center gap-1 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIplTablePage((prev) => Math.max(1, prev - 1))}
                disabled={iplTablePage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 font-bold text-slate-700">
                Halaman {iplTablePage} / {totalIplPages}
              </span>
              <button
                type="button"
                onClick={() => setIplTablePage((prev) => Math.min(totalIplPages, prev + 1))}
                disabled={iplTablePage === totalIplPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
      {/* ======================================================== */}
      {/* MODAL 1: FORM UPLOAD BUKTI BAYAR IPL (WARGA)             */}
      {/* ======================================================== */}
      {isModalBayarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalBayarOpen(false)}
          />
          <div className="relative bg-white rounded-3xl max-w-lg w-full z-10 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* 1. Header (Tetap terlihat di atas, tidak terpotong) */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0 bg-white">
              <div className="pr-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Konfirmasi Pembayaran IPL
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Unggah bukti struk transfer pembayaran iuran kas lingkungan Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalBayarOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex-shrink-0 -mr-1"
                aria-label="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. Scrollable Body & Footer Container */}
            <form onSubmit={handleSubmitBukti} className="flex flex-col flex-1 overflow-hidden">
              <div className="overflow-y-auto flex-1 p-6 space-y-4 text-xs overscroll-contain">
              {/* ATURAN WAJIB RT 08: PILIH WARGA TERDAFTAR */}
              <div className="space-y-3">
                <CustomSelect
                  label="Pilih Data Warga Terdaftar (Wajib Sesuai Aturan RT 08)"
                  required
                  placeholder="-- Pilih nama kepala keluarga / blok rumah --"
                  value={selectedWargaKey}
                  onChange={(val) => {
                    setSelectedWargaKey(val);
                    if (val === 'BELUM_TERDAFTAR') {
                      setIsUnregisteredError(true);
                      setNamaWargaInput('');
                      setLokasiRumahInput('');
                    } else {
                      setIsUnregisteredError(false);
                      const matched = wargaList.find((w) => (w.id || `${w.namaLengkap}-${w.alamatRumah}`) === val);
                      if (matched) {
                        setNamaWargaInput(matched.namaLengkap);
                        setLokasiRumahInput(matched.alamatRumah);
                      }
                    }
                  }}
                  options={[
                    ...wargaList.map((w) => ({
                      value: w.id || `${w.namaLengkap}-${w.alamatRumah}`,
                      label: `${w.namaLengkap} (${w.alamatRumah})`,
                      description: `Status Saat Ini: ${w.statusIpl}`,
                    })),
                    {
                      value: 'BELUM_TERDAFTAR',
                      label: '⚠️ Warga Baru (Belum Terdata / Belum Isi Formulir)',
                      description: 'Wajib melakukan pendaftaran warga terlebih dahulu',
                    },
                  ]}
                />

                {/* Banner Peringatan Aturan Baru jika belum terdaftar */}
                {isUnregisteredError ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span>Aturan Resmi: Wajib Pendataan Warga Terlebih Dahulu</span>
                    </div>
                    <p className="leading-relaxed text-slate-700">
                      Sesuai peraturan pengurus RT 08 Pesona Kahuripan 8, warga <strong>tidak dapat melakukan pembayaran IPL</strong> jika belum melakukan pendataan kependudukan keluarga di sistem.
                    </p>
                    {onGoToDaftar && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalBayarOpen(false);
                          setIsUnregisteredError(false);
                          onGoToDaftar();
                        }}
                        className="mt-3.5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-transform active:scale-95"
                      >
                        <span>Daftar / Isi Data Warga Sekarang</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ) : namaWargaInput ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold block">{namaWargaInput}</span>
                        <span className="text-[11px] text-emerald-700">{lokasiRumahInput}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                      Terdaftar Sah RT 08
                    </span>
                  </div>
                ) : null}
              </div>

                {/* PILIHAN NOMINAL DINAMIS BERDASARKAN TARIF */}
                <div>
                  <CustomSelect
                    label="Pilih Periode Bayar"
                    required
                    value={nominalInput}
                    onChange={(val) => setNominalInput(val)}
                    options={[
                      {
                        value: tarifIpl.toString(),
                        label: `1 Bulan (Rp ${tarifIpl.toLocaleString('id-ID')})`,
                        description: 'Oktober 2026',
                      },
                      {
                        value: (tarifIpl * 2).toString(),
                        label: `2 Bulan (Rp ${(tarifIpl * 2).toLocaleString('id-ID')})`,
                        description: 'Okt - Nov 2026',
                      },
                      {
                        value: (tarifIpl * 6).toString(),
                        label: `6 Bulan (Rp ${(tarifIpl * 6).toLocaleString('id-ID')})`,
                        description: 'Setengah Tahun',
                      },
                      {
                        value: (tarifIpl * 12).toString(),
                        label: `1 Tahun (Rp ${(tarifIpl * 12).toLocaleString('id-ID')})`,
                        description: '1 Tahun Penuh (Disarankan)',
                      },
                    ]}
                  />
                </div>
              <div>
                <CustomSelect
                  label="Metode Pembayaran"
                  value={metodeInput}
                  onChange={(val) => setMetodeInput(val)}
                  options={[
                    {
                      value: `Transfer ${rekeningBank?.namaBank || 'Bank BCA'}`,
                      label: `Transfer ${rekeningBank?.namaBank || 'Bank BCA'} (${rekeningBank?.noRekening || '8820192839'})`,
                      description: `a.n. ${rekeningBank?.atasNama || 'Kas Paguyuban PK8'}`,
                    },
                    { value: 'Transfer Bank Lain', label: 'Transfer Antar Bank', description: 'Ke rekening kas via BI-Fast' },
                    { value: 'QRIS Komplek', label: 'QRIS Resmi PK8', description: 'Scan barcode di pos kamling' },
                    { value: 'Tunai ke Bendahara', label: 'Tunai Langsung ke Bendahara', description: 'Serah terima tunai' },
                  ]}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Unggah Foto Struk / Screenshot Bukti Transfer *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100"
                />
                {mockFilePreview && (
                  <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img
                      src={mockFilePreview}
                      alt="Preview"
                      className="w-14 h-14 object-cover rounded-lg border border-slate-300"
                    />
                    <span className="text-xs text-slate-600 font-medium">
                      Foto struk siap dikirim untuk verifikasi bendahara &amp; Ketua RT.
                    </span>
                  </div>
                )}
              </div>

              </div>

              {/* 3. Footer (Tetap terlihat di bawah, tombol tidak akan hilang / terpotong) */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-2.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalBayarOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUnregisteredError || !namaWargaInput.trim()}
                  className={`px-5 py-2 rounded-xl font-black shadow-md transition-all ${
                    isUnregisteredError || !namaWargaInput.trim()
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                      : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                  }`}
                >
                  Kirim Konfirmasi Bayar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: NOTIFIKASI VERIFIKASI UNTUK WARGA SETELAH BAYAR */}
      {/* ======================================================== */}
      {noticeTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/65 backdrop-blur-xs"
            onClick={() => setNoticeTrx(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full z-10 shadow-2xl border border-emerald-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <Clock className="w-7 h-7 animate-pulse" />
            </div>

            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
                <span>Status: Menunggu Verifikasi Ketua RT</span>
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Bukti Pembayaran Terkirim!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 leading-relaxed">
                Bukti transfer Anda telah tersimpan di sistem. Pengurus (Ketua RT / Bendahara) akan melakukan pencocokan mutasi kas untuk menyetujui status menjadi <strong>LUNAS</strong>.
              </p>
            </div>

            {/* Rincian Transaksi */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">No. Transaksi</span>
                <span className="font-mono font-bold text-slate-900">{noticeTrx.noTransaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Pembayar</span>
                <span className="font-bold text-slate-900">{noticeTrx.namaWarga}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Blok / Rumah</span>
                <span className="font-bold text-slate-900">{noticeTrx.lokasiRumah}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nominal Iuran</span>
                <span className="font-black text-emerald-700 text-sm">Rp {noticeTrx.nominal.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Metode</span>
                <span className="font-bold text-slate-900">{noticeTrx.metode}</span>
              </div>
            </div>

            {/* Action Buttons: WhatsApp to Ketua RT */}
            <div className="space-y-2.5">
              <a
                href={`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
                  `Halo Pak RT 08 Pesona Kahuripan 8,\nSaya ${noticeTrx.namaWarga} (${noticeTrx.lokasiRumah}) telah mengunggah bukti pembayaran IPL kas komplek sebesar Rp ${noticeTrx.nominal.toLocaleString('id-ID')} via ${noticeTrx.metode}.\nNo. Transaksi: ${noticeTrx.noTransaksi}.\nMohon bantu verifikasi dan approve ya pak. Terima kasih!`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>Kirim Konfirmasi WhatsApp ke Ketua RT</span>
              </a>

              <button
                type="button"
                onClick={() => setNoticeTrx(null)}
                className="w-full py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Tutup &amp; Cek Status di Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: ADMIN EDIT TARIF BULANAN IPL                    */}
      {/* ======================================================== */}
      {isModalTarifOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs"
            onClick={() => setIsModalTarifOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full z-10 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-xl font-black text-slate-900">
              Atur Tarif Iuran IPL Bulanan
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1 mb-5">
              Tentukan besaran iuran pengelolaan lingkungan per rumah untuk setiap bulan.
            </p>

            <form onSubmit={handleSaveTarif} className="space-y-4 text-xs">
              <div>
                <RupiahInput
                  label="Nominal Tarif IPL Baru (Rp / Bulan)"
                  required
                  value={parseInt(inputTarifBaru, 10) || 30000}
                  onChange={(val) => setInputTarifBaru(val.toString())}
                  presets={[25000, 30000, 50000, 100000]}
                  helperText="Format rupiah standar Indonesia dengan titik pemisah ribuan otomatis."
                />
              </div>

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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
                >
                  Simpan Tarif Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
