import React from 'react';
import {
  ItemUrunanWarga,
  PengumumanRecord,
} from '@sim-warga/types';
import { RondaWithStatus } from '../../ronda/JadwalRondaCard';
import {
  Wallet,
  CheckCircle2,
  Lightbulb,
  Users,
  Shield,
  Copy,
  Check,
  ArrowRight,
} from 'lucide-react';

export interface RecentTransferItem {
  id: string;
  title: string;
  time: string;
  badge: string;
  isPositive: boolean;
}

export interface WargaBerandaTabProps {
  onSelectTab: (tab: string) => void;
  sisaSaldo: number;
  lunasKK: number;
  totalKK: number;
  persentaseNum: number;
  persenUrunanPju: number;
  totalUrunanPju: number;
  urunanList: ItemUrunanWarga[];
  menetap: number;
  rondaList: RondaWithStatus[];
  tarifIpl: number;
  pemasukan: number;
  pengeluaran: number;
  donaturPjuCount: number;
  wajibPjuCount: number;
  namaBank: string;
  noRek: string;
  atasNama: string;
  catatanRek: string;
  recentTransfers: RecentTransferItem[];
  tonightRonda: RondaWithStatus | null | undefined;
  pengumumanList: PengumumanRecord[];
  setDetailPengumuman: (p: PengumumanRecord) => void;
  setUrunanMode: (mode: 'form' | 'daftar') => void;
  onCopyRek: () => void;
  copiedRek: boolean;
}

export const WargaBerandaTab: React.FC<WargaBerandaTabProps> = ({
  onSelectTab,
  sisaSaldo,
  lunasKK,
  totalKK,
  persentaseNum,
  persenUrunanPju,
  totalUrunanPju,
  urunanList,
  menetap,
  rondaList,
  tarifIpl,
  pemasukan,
  pengeluaran,
  donaturPjuCount,
  wajibPjuCount,
  namaBank,
  noRek,
  atasNama,
  catatanRek,
  recentTransfers,
  tonightRonda,
  pengumumanList,
  setDetailPengumuman,
  setUrunanMode,
  onCopyRek,
  copiedRek,
}) => {
  return (
    <div className="lg:h-full flex flex-col justify-between gap-2.5">
      {/* ROW 1: 4 METRIK BERBEDA (COMPACT 52PX HEIGHT) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
        <div
          onClick={() => onSelectTab('ipl')}
          className="carlic-sage-card cursor-pointer px-3.5 py-2 text-white flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
        >
          <div>
            <span className="text-[10px] font-medium text-[#F3D37A]/90 block leading-tight">
              Saldo Kas Paguyuban
            </span>
            <p className="text-base sm:text-lg font-extrabold text-white leading-tight mt-0.5">
              Rp {sisaSaldo.toLocaleString('id-ID')}
            </p>
          </div>
          <Wallet className="w-5 h-5 text-[#F3D37A] flex-shrink-0" />
        </div>

        <div
          onClick={() => onSelectTab('ipl')}
          className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
        >
          <div>
            <span className="text-[10px] font-medium text-stone-400 block leading-tight">
              Kepatuhan IPL Warga
            </span>
            <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
              {lunasKK}/{totalKK} KK{' '}
              <span className="text-xs font-bold text-[#0B484C]">({persentaseNum}%)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab('urunan')}
          className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform border-[#D9B352]/60 bg-[#FEF9EB]/70 dark:bg-stone-800"
        >
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-[#9A7018] dark:text-[#F3D37A] block leading-tight truncate">
              Urunan Lampu PJU ({persenUrunanPju}%)
            </span>
            <p className="text-sm sm:text-base font-extrabold text-[#0B484C] dark:text-white leading-tight mt-0.5 truncate">
              Rp {totalUrunanPju.toLocaleString('id-ID')}{' '}
              <span className="text-[10px] font-bold text-stone-500">({urunanList.length} Penyetor)</span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0B484C] text-[#F3D37A] flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
        </div>

        <div
          onClick={() => onSelectTab('warga')}
          className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
        >
          <div>
            <span className="text-[10px] font-medium text-stone-400 block leading-tight">
              Keluarga Terdata
            </span>
            <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
              {totalKK} KK{' '}
              <span className="text-[11px] font-semibold text-stone-400">
                ({menetap} Menetap)
              </span>
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="relative group/tip">
          <div
            onClick={() => onSelectTab('ronda')}
            className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
          >
            <div>
              <span className="text-[10px] font-medium text-stone-400 block leading-tight">
                Ronda Malam Ini
              </span>
              <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
                {rondaList && rondaList.length > 0 ? `${rondaList[0]?.petugas?.length || 0} Petugas` : '0 Petugas'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#FEF6DF] dark:bg-stone-800 text-[#B88B28] flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
          </div>
          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
            <p className="font-extrabold text-[#F3D37A] mb-1">
              🛡️ Jadwal Siskamling Malam:
            </p>
            <p className="text-stone-200">
              Patroli jam 21.00 s/d 04.00 WIB. Klik untuk membuka jadwal lengkap 4 minggu &amp; daftar petugas ronda harian.
            </p>
          </div>
        </div>
      </div>

      {/* ROW 2: RINGKASAN KAS & REKENING 3D (8 COL) + MUTASI TERKINI (4 COL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:flex-1 min-h-0">
        <div className="lg:col-span-8 carlic-card p-3 sm:p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center overflow-hidden h-full">
          <div className="md:col-span-8 flex flex-col justify-between text-left min-w-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#1C221E] dark:text-white truncate">
                  Ringkasan Kas, Urunan PJU &amp; Rekening Resmi Paguyuban
                </h2>
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 flex-shrink-0">
                  Transparan
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate mt-0.5">
                IPL Rp {tarifIpl.toLocaleString('id-ID')}/bln •{' '}
                <strong className="text-[#0B484C] dark:text-[#F3D37A]">Urunan PJU Rp 115.000/KK</strong> •{' '}
                <strong className="text-stone-600 dark:text-stone-300">{namaBank}</strong> ({noRek}) a.n. {atasNama}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 my-2">
              <div className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60">
                <span className="text-[10px] font-medium text-stone-400 block truncate">
                  Pemasukan IPL
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-[#F3D37A] block leading-tight">
                  Rp {pemasukan.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60">
                <span className="text-[10px] font-medium text-stone-400 block truncate">
                  Pengeluaran Kas
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white block leading-tight">
                  Rp {pengeluaran.toLocaleString('id-ID')}
                </span>
              </div>
              <div
                onClick={() => onSelectTab('urunan')}
                className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-[#FEF9EB] dark:bg-amber-950/35 border border-[#D9B352]/60"
              >
                <span className="text-[10px] font-extrabold text-amber-800 dark:text-[#F3D37A] block truncate">
                  💡 Dana Urunan PJU ({donaturPjuCount}+{wajibPjuCount} KK)
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-white block leading-tight">
                  Rp {totalUrunanPju.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onSelectTab('ipl')}
                className="carlic-sage-btn text-[#F3D37A] text-[11px] font-bold px-3 py-1.5 rounded-xl"
              >
                Konfirmasi Bayar IPL +
              </button>
              <button
                type="button"
                onClick={() => {
                  setUrunanMode('form');
                  onSelectTab('urunan');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FEF6DF] hover:bg-[#FCE8B2] text-[#092C2E] border border-[#D9B352]/70 text-[11px] font-extrabold flex items-center gap-1 transition-colors"
              >
                <Lightbulb className="w-3 h-3 text-[#0B484C]" />
                <span>Bayar Urunan PJU +</span>
              </button>
              <button
                type="button"
                onClick={onCopyRek}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedRek ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedRek ? 'Tersalin' : `Salin Rek (${noRek})`}</span>
              </button>
            </div>
          </div>

          {/* 3 Stacked Isometric 3D Cards */}
          <div className="md:col-span-4 relative h-28 flex items-center justify-center">
            <div className="relative w-44 h-24 scale-90">
              <div
                style={{
                  transform: 'rotate(-14deg) skewX(14deg) translateY(26px)',
                }}
                className="absolute inset-x-0 h-24 rounded-2xl bg-[#062C2F] border border-[#D9B352]/30 p-3 text-white shadow-xl flex flex-col justify-between"
              >
                <div className="text-[8px] text-[#F3D37A] font-semibold">KAS PAGUYUBAN</div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono tracking-wider">{noRek}</span>
                  <div className="flex -space-x-1">
                    <span className="w-3 h-3 rounded-full bg-[#D9B352]" />
                    <span className="w-3 h-3 rounded-full bg-[#0F585D] border border-[#D9B352]" />
                  </div>
                </div>
              </div>

              <div
                style={{
                  transform: 'rotate(-14deg) skewX(14deg) translateY(10px)',
                }}
                className="pk-gold-gradient absolute inset-x-0 h-24 rounded-2xl p-3 text-[#062C2F] shadow-lg flex flex-col justify-between"
              >
                <div className="text-[8px] text-[#062C2F]/80 font-extrabold truncate">
                  {atasNama.toUpperCase()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold tracking-wider">
                    {noRek}
                  </span>
                  <div className="flex -space-x-1">
                    <span className="w-3 h-3 rounded-full bg-[#0B484C]" />
                    <span className="w-3 h-3 rounded-full bg-white/80" />
                  </div>
                </div>
              </div>

              <div
                style={{
                  transform: 'rotate(-14deg) skewX(14deg) translateY(-6px)',
                }}
                className="absolute inset-x-0 h-24 rounded-2xl bg-white/90 dark:bg-[#0B383B]/90 backdrop-blur-md border border-[#D9B352]/60 p-3 text-[#092C2E] dark:text-white shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] truncate">
                    {namaBank}
                  </span>
                  <span className="text-[8px] font-bold text-[#B88B28] truncate max-w-[65px]">
                    {catatanRek}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest font-mono text-[#0B484C] dark:text-white">
                    {noRek}
                  </p>
                  <p className="text-[7px] text-stone-500 dark:text-stone-300 truncate">
                    {atasNama.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mutasi Kas Terkini (4 Col) */}
        <div className="lg:col-span-4 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white">
              Mutasi Kas &amp; PJU Terkini
            </h3>
            <button
              type="button"
              onClick={() => onSelectTab('urunan')}
              className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] hover:underline"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-1.5 flex-1 flex flex-col justify-center">
            {recentTransfers.length === 0 ? (
              <div className="p-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/50 text-center">
                <p className="text-[11px] font-bold text-stone-500">
                  Belum ada mutasi kas tercatat
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">
                  Mutasi otomatis muncul saat ada pembayaran IPL atau pengeluaran kas
                </p>
              </div>
            ) : (
              recentTransfers.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 pl-2.5 py-0.5 border-l-2 border-[#D9B352]"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-[#1C221E] dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[9px] text-stone-400 truncate">{item.time}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      item.isPositive
                        ? 'bg-[#0B484C]/10 text-[#0B484C] dark:bg-emerald-950 dark:text-[#F3D37A]'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: PETUGAS RONDA (6 COL) + PENGUMUMAN (6 COL) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:flex-1 min-h-0">
        <div className="lg:col-span-6 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                  Petugas Ronda ({tonightRonda?.hari || 'Malam Ini'})
                </h3>
                <span className="text-[10px] text-stone-400 truncate">
                  • {tonightRonda?.tanggal || 'Belum Ada Jadwal'} (21.00 – 04.00 WIB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('ronda')}
                className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] inline-flex items-center gap-1 hover:underline flex-shrink-0"
              >
                <span>Jadwal Lengkap</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {tonightRonda && tonightRonda.petugas && tonightRonda.petugas.length > 0 ? (
                tonightRonda.petugas.slice(0, 6).map((p) => (
                  <div
                    key={p.slot}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                          p.isKoordinator
                            ? 'bg-[#0B484C] text-[#F3D37A]'
                            : 'bg-white dark:bg-stone-700 text-[#1C221E] dark:text-white'
                        }`}
                      >
                        {p.slot}
                      </span>
                      <span className="text-[11px] font-extrabold text-[#1C221E] dark:text-white truncate">
                        {p.namaLengkap}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-stone-700 text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
                      {p.blokRumah}
                    </span>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 text-center text-xs text-stone-400 font-medium">
                  Belum ada jadwal ronda aktif untuk malam ini.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-baseline gap-2 min-w-0">
                <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                  Pengumuman &amp; Kegiatan Warga
                </h3>
                <span className="text-[10px] text-stone-400 truncate">
                  • Pengurus Paguyuban PK8
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('pengumuman')}
                className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] inline-flex items-center gap-1 hover:underline flex-shrink-0"
              >
                <span>Semua Info</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5">
              {pengumumanList.slice(0, 2).map((p) => (
                <div
                  key={p.id}
                  onClick={() => setDetailPengumuman(p)}
                  className="cursor-pointer px-3 py-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60 hover:bg-[#EFECE6] transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 flex-shrink-0">
                        {p.kategori}
                      </span>
                      <h4 className="text-xs font-extrabold text-[#1C221E] dark:text-white truncate">
                        {p.judul}
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-stone-400 whitespace-nowrap flex-shrink-0">
                      {p.tanggalAcara}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                    {p.deskripsi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
