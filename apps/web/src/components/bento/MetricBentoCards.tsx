import React from 'react';
import {
  TrendingUp,
  ArrowDownRight,
  Wallet,
  Home,
  Users,
  Building,
  Clock,
  MapPin,
  ArrowRight,
} from 'lucide-react';
import { DashboardSummary } from '@sim-warga/types';

export interface MetricBentoCardsProps {
  summary: DashboardSummary;
  isDarkMode?: boolean;
  onGoToForm?: () => void;
  onGoToIpl?: () => void;
}

/**
 * RINGKASAN TRANSPARANSI KAS, DOMISILI, PEMETAAN BLOK A-Z, & FOOTER CTA WARGA
 * Murni untuk tampilan Dashboard Warga (Gaya Nexora Image #1).
 */
export const MetricBentoCards: React.FC<MetricBentoCardsProps> = ({
  summary,
  isDarkMode = false,
  onGoToForm,
  onGoToIpl,
}) => {
  const [selectedBlockFilter, setSelectedBlockFilter] = React.useState<string>('A-F');
  const [activeBlokFilter, setActiveBlokFilter] = React.useState<string>('ALL');

  const subTextClass = isDarkMode ? 'text-slate-400' : 'text-slate-500 font-medium';
  const borderDividerClass = isDarkMode ? 'border-slate-800' : 'border-slate-100';

  const matchedRekap = summary.rekapPerBlok.find(
    (b) => b.blok.replace(/^BLOK\s*/i, '').trim().toUpperCase() === activeBlokFilter
  );

  const displayTotalRumah = matchedRekap ? matchedRekap.jumlahRumah : summary.totalRumah;
  const displayPemasukan = matchedRekap ? matchedRekap.realisasiMasuk : summary.pemasukanIpl;
  const displayTarget = matchedRekap ? matchedRekap.targetIpl : summary.targetIpl;
  const displayPersentase = matchedRekap ? matchedRekap.persentase : summary.persentasePemasukan;
  const displayLunas = matchedRekap
    ? displayTarget > 0
      ? Math.round(matchedRekap.realisasiMasuk / 30000)
      : matchedRekap.jumlahRumah
    : summary.rumahLunas;
  const displayMenetap = matchedRekap ? matchedRekap.menetap : summary.wargaMenetap;
  const displayPulangPergi = matchedRekap ? matchedRekap.pulangPergi : summary.wargaPulangPergi;
  const displayBelumMenetap = matchedRekap ? matchedRekap.belumMenetap : summary.wargaBelumMenetap;

  const totalWarga = displayTotalRumah || 1;
  const saldoAwal = summary.saldoAwalKas ?? 2500000;
  const sisaSaldoPositif = Math.max(0, summary.sisaSaldoKas);

  return (
    <div className="space-y-8 mb-10 select-none">
      {/* =================================================================== */}
      {/* 1. FILTER INTERAKTIF BLOK & 3 KARTU TRANSPARANSI KAS WARGA          */}
      {/* =================================================================== */}
      <div className="nexora-card rounded-3xl p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400 flex-shrink-0">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Filter Cepat Wilayah RT 08
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih blok untuk melihat rincian hunian dan kas per blok
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['ALL', 'A', 'B', 'C', 'D', 'E', 'F'].map((b) => {
              const isSelected = activeBlokFilter === b;
              const blockData = summary.rekapPerBlok.find(
                (r) => r.blok.replace(/^BLOK\s*/i, '').trim().toUpperCase() === b
              );
              return (
                <button
                  key={b}
                  type="button"
                  onClick={() => setActiveBlokFilter(b)}
                  className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{b === 'ALL' ? 'Semua Blok' : `Blok ${b}`}</span>
                  {blockData && b !== 'ALL' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      {blockData.jumlahRumah}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3 KARTU KEUANGAN WARGA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Realisasi Masuk IPL */}
        <div className="nexora-card nexora-card-hover rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${subTextClass}`}>
                {activeBlokFilter === 'ALL'
                  ? 'Realisasi Pemasukan IPL'
                  : `Pemasukan IPL Blok ${activeBlokFilter}`}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-white font-heading">
                Rp {displayPemasukan.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${borderDividerClass}`}
          >
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[#2563EB] dark:text-blue-400">
                {displayPersentase}
              </span>
              <span className={subTextClass}>kepatuhan</span>
            </div>
            <span className={subTextClass}>
              {displayLunas} dari {displayTotalRumah} Rumah Lunas
            </span>
          </div>
        </div>

        {/* Metric 2: Pengeluaran Kas Operasional */}
        <div className="nexora-card nexora-card-hover rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${subTextClass}`}>
                Pengeluaran Kas Komplek
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold mt-1.5 text-slate-900 dark:text-white font-heading">
                Rp {summary.pengeluaranKas.toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`mt-5 pt-4 border-t flex items-center justify-between text-xs ${borderDividerClass}`}
          >
            <span className={subTextClass}>PJU, Keamanan &amp; Kebersihan</span>
            <span className={subTextClass}>Transparan 100%</span>
          </div>
        </div>

        {/* Metric 3: Saldo Kas Aktif Bersih */}
        <div className="nexora-card nexora-card-hover rounded-3xl p-6 flex flex-col justify-between border-blue-200/80 dark:border-blue-800/50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${subTextClass}`}>
                  Sisa Saldo Kas Aktif
                </p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  Surplus
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#2563EB] dark:text-blue-400 mt-1.5 font-heading">
                Rp {sisaSaldoPositif.toLocaleString('id-ID')}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Kas Awal: Rp {saldoAwal.toLocaleString('id-ID')} + IPL Masuk
              </p>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400 flex-shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div
            className={`mt-4 pt-3.5 border-t flex items-center justify-between text-xs ${borderDividerClass}`}
          >
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <Home className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>
                {summary.rumahLunas} dari {summary.totalRumah} Rumah Lunas
              </span>
            </div>
            <span className="text-[#2563EB] dark:text-blue-400 font-bold">Kas Siap Pakai</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. KOMPOSISI STATUS TEMPAT TINGGAL WARGA (MENETAP / PULANG-PERGI)   */}
      {/* =================================================================== */}
      <div className="nexora-card rounded-3xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-[#2563EB] dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                Komposisi Status Tempat Tinggal Warga
              </h4>
              <p className={`text-xs ${subTextClass} mt-0.5`}>
                Rincian domisili keluarga Pesona Kahuripan 8 Tahap 2 RT 08
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-500/10 text-[#2563EB] dark:text-blue-300 w-fit">
            Total {totalWarga} Kepala Keluarga
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Menetap */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Warga Menetap
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tinggal permanen aktif
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {displayMenetap}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block">
                {totalWarga > 0 ? Math.round((displayMenetap / totalWarga) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Pulang-Pergi */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-[#2563EB] dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Warga Pulang-Pergi
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Singgah akhir pekan / dinas
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {displayPulangPergi}
              </span>
              <span className="text-[11px] text-[#2563EB] font-bold block">
                {totalWarga > 0 ? Math.round((displayPulangPergi / totalWarga) * 100) : 0}%
              </span>
            </div>
          </div>

          {/* Belum Menetap */}
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Belum Menetap
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tahap renovasi / belum dihuni
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {displayBelumMenetap}
              </span>
              <span className="text-[11px] text-amber-600 font-bold block">
                {totalWarga > 0 ? Math.round((displayBelumMenetap / totalWarga) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. PEMETAAN HUNIAN WARGA PER BLOK (BLOK A S/D Z)                    */}
      {/* =================================================================== */}
      <div className="nexora-card rounded-3xl p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-200/70 dark:border-slate-800">
          <div>
            <h4 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pemetaan Hunian Warga Per Blok (Blok A s/d Z)
            </h4>
            <p className={`text-xs ${subTextClass} mt-0.5`}>
              Klik kartu blok untuk menyaring statistik warga pada blok tersebut
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'A-F', label: 'Blok A - F' },
              { id: 'G-L', label: 'Blok G - L' },
              { id: 'M-R', label: 'Blok M - R' },
              { id: 'S-Z', label: 'Blok S - Z' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedBlockFilter(tab.id)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
                  selectedBlockFilter === tab.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {summary.rekapPerBlok
            .filter((b) => {
              const letter = b.blok.replace(/^BLOK\s*/i, '').trim().toUpperCase();
              if (selectedBlockFilter === 'A-F') return letter >= 'A' && letter <= 'F';
              if (selectedBlockFilter === 'G-L') return letter >= 'G' && letter <= 'L';
              if (selectedBlockFilter === 'M-R') return letter >= 'M' && letter <= 'R';
              if (selectedBlockFilter === 'S-Z') return letter >= 'S' && letter <= 'Z';
              return true;
            })
            .map((b) => {
              const letter = b.blok.replace(/^BLOK\s*/i, '').trim().toUpperCase();
              const isSelected = activeBlokFilter === letter;
              return (
                <div
                  key={b.blok}
                  onClick={() => setActiveBlokFilter(isSelected ? 'ALL' : letter)}
                  className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer hover:-translate-y-0.5 ${
                    isSelected
                      ? 'ring-2 ring-[#2563EB] border-[#2563EB] bg-blue-50/40 dark:bg-blue-950/40'
                      : 'bg-white/90 dark:bg-slate-800/70 border-slate-200/80 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {b.blok}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#2563EB] dark:text-blue-300">
                      {b.jumlahRumah} KK
                    </span>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex mb-2.5">
                    <div
                      style={{
                        width: `${b.jumlahRumah > 0 ? (b.menetap / b.jumlahRumah) * 100 : 0}%`,
                      }}
                      className="bg-emerald-500 h-full"
                    />
                    <div
                      style={{
                        width: `${b.jumlahRumah > 0 ? (b.pulangPergi / b.jumlahRumah) * 100 : 0}%`,
                      }}
                      className="bg-sky-500 h-full"
                    />
                    <div
                      style={{
                        width: `${b.jumlahRumah > 0 ? (b.belumMenetap / b.jumlahRumah) * 100 : 0}%`,
                      }}
                      className="bg-amber-500 h-full"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Menetap: {b.menetap}</span>
                    <span>P-Pergi: {b.pulangPergi}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. NEXORA BOTTOM CTA SECTION ("READY TO START? / Turn your ideas")  */}
      {/* =================================================================== */}
      <section className="pt-10 pb-4 border-t border-blue-900/[0.08] dark:border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          {/* Col 1: Headline */}
          <div className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-2">
              WARGA BARU ATAU BELUM TERDATA?
            </p>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight font-heading">
              Wujudkan lingkungan <br />
              <span className="text-[#2563EB] dark:text-blue-400">tertib &amp; guyub</span>
            </h3>
          </div>

          {/* Col 2: Description + 2 Buttons */}
          <div className="lg:col-span-5 lg:border-l lg:border-blue-900/[0.08] dark:lg:border-slate-800 lg:pl-8">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-sm">
              Mari lengkapi data keluarga Anda dan pantau informasi kas serta jadwal siskamling RT 08 Pesona Kahuripan 8.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onGoToForm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all group"
              >
                <span>Isi Data Warga</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={onGoToIpl}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs sm:text-sm transition-all"
              >
                <span>Cek Iuran IPL</span>
              </button>
            </div>
          </div>

          {/* Col 3: Mini 3D Frosted Glass Slabs + Caption ("A more intelligent tomorrow.") */}
          <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-5">
            <div className="relative w-28 h-24 flex items-center justify-center">
              <div
                style={{ transform: 'rotate(-22deg) translateX(-16px)' }}
                className="nexora-glass-slab-deep w-10 h-16 rounded-xl absolute"
              />
              <div
                style={{ transform: 'rotate(-22deg) translateX(0px)' }}
                className="nexora-glass-slab-mesh w-10 h-16 rounded-xl absolute"
              />
              <div
                style={{ transform: 'rotate(-22deg) translateX(16px)' }}
                className="nexora-glass-slab-cyan w-10 h-16 rounded-xl absolute"
              />
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-300 dark:border-slate-700 leading-snug">
              <span className="block font-semibold text-slate-700 dark:text-slate-200">
                Lingkungan nyaman
              </span>
              <span>untuk kita semua.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
