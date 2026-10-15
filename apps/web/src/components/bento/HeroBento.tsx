import React from 'react';
import {
  ArrowRight,
  Shield,
  CreditCard,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  Search,
  Bell,
  Users,
  Layers,
  BarChart3,
  Home,
  Play,
  Lock,
  Cloud,
  QrCode,
  Lightbulb,
  Landmark,
} from 'lucide-react';
import { DashboardSummary, PengumumanRecord, InfoRekeningBank } from '@sim-warga/types';

export interface HeroBentoProps {
  onGoToForm: () => void;
  onGoToRonda: () => void;
  onGoToIpl: () => void;
  onGoToUrunan?: () => void;
  onGoToPengumuman: () => void;
  onOpenBayarModal?: () => void;
  summary: DashboardSummary;
  pengumumanList: PengumumanRecord[];
  isDarkMode: boolean;
  rekeningBank?: InfoRekeningBank;
}

/**
 * HERO & SHOWCASE KHUSUS DASHBOARD WARGA (GAYA NEXORA IMAGE #1)
 * Murni untuk warga (tanpa prop / kondisi isAdmin).
 */
export const HeroBento: React.FC<HeroBentoProps> = ({
  onGoToForm,
  onGoToRonda,
  onGoToIpl,
  onGoToUrunan,
  onGoToPengumuman,
  onOpenBayarModal,
  summary,
  pengumumanList,
  rekeningBank,
}) => {
  const totalWarga = summary.totalWarga ?? 52;
  const wargaMenetap = summary.wargaMenetap ?? 26;
  const wargaPulangPergi = summary.wargaPulangPergi ?? 12;
  const totalKK = summary.totalRumah ?? 52;
  const saldoKas = Math.max(0, summary.sisaSaldoKas ?? 2630000);
  const latestPengumuman = pengumumanList?.[0]?.judul || 'Kerja Bakti & Pemasangan PJU Tahap 2';

  return (
    <div className="w-full select-none">
      {/* =================================================================== */}
      {/* 1. NEXORA HERO SECTION: HEADLINE KIRI + 5 LAYERED 3D GLASS KANAN     */}
      {/* =================================================================== */}
      <section className="relative pt-8 sm:pt-12 pb-16 sm:pb-24 overflow-hidden">
        {/* Diagonal Sky-Blue Ambient Light Beams (Right Side) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 w-[680px] h-[620px] rounded-full bg-gradient-to-bl from-blue-400/25 via-sky-300/15 to-transparent blur-3xl -z-10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 right-[12%] w-[420px] h-[520px] -rotate-[28deg] bg-gradient-to-b from-blue-500/15 via-blue-300/10 to-transparent blur-2xl -z-10"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: TYPOGRAPHY, ARCHITECTURAL CALLOUT, CTAs, SOCIAL PROOF */}
          <div className="lg:col-span-6 text-left z-10">
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400 mb-5">
              PORTAL RESMI WARGA RT 08 • PESONA KAHURIPAN 8
            </p>

            {/* Headline + Architectural Hairline Callout ("Ideas / Products / Growth" style) */}
            <div className="relative flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-7 mb-6">
              <h1 className="text-4xl sm:text-[54px] font-extrabold text-slate-900 dark:text-white leading-[1.06] tracking-tight font-heading">
                Layanan pintar <br />
                <span className="text-slate-800 dark:text-slate-100">warga untuk</span> <br />
                <span className="text-[#2563EB] dark:text-blue-400">lingkungan tertib</span>
              </h1>

              {/* Architectural Callout Box (Left & Bottom Hairline) */}
              <div className="hidden xl:flex flex-col justify-center pl-4 pb-3 pt-1 border-l border-b border-slate-300/80 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 space-y-1 mt-2 min-w-[115px]">
                <span>Data Warga</span>
                <span>Ronda Malam</span>
                <span>Kas &amp; IPL</span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed max-w-md mb-8">
              SIM-Warga membantu keluarga RT 08 mengisi pendataan mandiri, memantau jadwal ronda malam, dan memeriksa transparansi kas lingkungan dengan mudah.
            </p>

            {/* Primary & Secondary Nexora CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-12">
              <button
                type="button"
                onClick={onGoToForm}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 transition-all group"
              >
                <span>Isi Data Warga</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={onGoToIpl}
                className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-white/90 hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800 text-slate-800 dark:text-white border border-slate-200/90 dark:border-slate-700 font-semibold text-sm shadow-xs transition-all"
              >
                <span className="w-5 h-5 rounded-full border border-slate-400 dark:border-slate-500 flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>Cek Status IPL</span>
              </button>
            </div>

            {/* Social Proof Avatar Stack ("Trusted by 50,000+ teams worldwide" style) */}
            <div className="flex items-center gap-3.5">
              <div className="flex -space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[#F4F7FC] dark:ring-[#070C18]">
                  A1
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-400 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[#F4F7FC] dark:ring-[#070C18]">
                  B4
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-700 to-blue-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[#F4F7FC] dark:ring-[#070C18]">
                  C2
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-[#F4F7FC] dark:ring-[#070C18]">
                  D5
                </div>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Dipercaya oleh {totalKK} Kepala Keluarga
                </span>
                <br />
                <span>({totalWarga} Jiwa) Warga Pesona Kahuripan 8</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 5 LAYERED 3D FROSTED GLASS PANES (EXACT IMAGE #1 CASCADE) */}
          <div className="lg:col-span-6 relative h-[360px] sm:h-[430px] flex items-center justify-center">
            <div className="nexora-3d-stage relative w-full max-w-[540px] h-full">
              {/* Soft base reflection shadow under the 3D glass slabs */}
              <div className="absolute bottom-4 left-12 right-12 h-16 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

              {/* SLAB 0 (Bottom-Left Back): Soft Frosted Periwinkle Base Pane */}
              <div
                style={{
                  transform: 'rotateX(16deg) rotateY(-22deg) rotateZ(-26deg) translate3d(-115px, 95px, -60px)',
                }}
                className="nexora-glass-slab-cyan absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-48 sm:h-56 rounded-3xl opacity-80 transition-transform duration-500 hover:-translate-y-[53%]"
              />

              {/* SLAB 1 (Top-Left Primary White Glass Card with Embossed 4-Tile Logo) */}
              <div
                onClick={onGoToForm}
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(-90px, -45px, 10px)',
                }}
                className="nexora-glass-slab-white cursor-pointer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-48 h-56 sm:h-64 rounded-3xl p-5 flex flex-col justify-between transition-transform duration-500 hover:scale-[1.03]"
                title="Klik untuk membuka Data Warga"
              >
                {/* Embossed Frosted 4-Square Logo in Center-Top */}
                <div className="w-full flex-1 flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1.5 w-11 h-11 opacity-35">
                    <span className="rounded-[4px] bg-blue-400" />
                    <span className="rounded-[4px] bg-blue-300" />
                    <span className="rounded-[4px] bg-blue-300" />
                    <span className="rounded-[4px] bg-blue-500" />
                  </div>
                </div>
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 block">
                    Direktori RT 08
                  </span>
                  <span className="text-xs font-extrabold text-slate-800">
                    {totalKK} KK Terdaftar
                  </span>
                </div>
              </div>

              {/* SLAB 2 (Bottom-Center Ribbed Royal Blue Glass Slab) */}
              <div
                onClick={onGoToRonda}
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(-25px, 65px, 30px)',
                }}
                className="nexora-glass-slab-ribbed cursor-pointer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-52 sm:h-60 rounded-3xl p-4 flex flex-col justify-end transition-transform duration-500 hover:scale-[1.03]"
                title="Klik untuk membuka Jadwal Ronda"
              >
                <div className="bg-white/85 backdrop-blur-md rounded-2xl px-3 py-2 shadow-xs">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-700 block">
                    Siskamling
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    6 Petugas / Malam
                  </span>
                </div>
              </div>

              {/* SLAB 3 (Center Glossy Ice-Cyan Glass Slab) */}
              <div
                onClick={onGoToIpl}
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(35px, -5px, 50px)',
                }}
                className="nexora-glass-slab-cyan cursor-pointer absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 sm:w-48 h-56 sm:h-64 rounded-3xl p-4 flex flex-col justify-between transition-transform duration-500 hover:scale-[1.03]"
                title="Klik untuk membuka Iuran IPL & Kas"
              >
                <div className="w-8 h-8 rounded-xl bg-white/80 flex items-center justify-center text-[#2563EB] shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div className="bg-white/90 backdrop-blur-md rounded-2xl px-3.5 py-2.5 shadow-xs">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 block">
                    Saldo Kas RT 08
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    Rp {(saldoKas / 1000000).toFixed(2)} Jt
                  </span>
                </div>
              </div>

              {/* SLAB 4 (Right Dotted-Mesh Electric Blue Glass Slab) */}
              <div
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(95px, -25px, 25px)',
                }}
                className="nexora-glass-slab-mesh absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 sm:w-44 h-56 sm:h-64 rounded-3xl p-4 flex flex-col justify-end pointer-events-none"
              >
                <span className="text-[10px] font-bold text-white/90">
                  Transparan 100%
                </span>
              </div>

              {/* SLAB 5 (Far-Right Translucent Deep Sky Pane) */}
              <div
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(145px, -45px, -10px)',
                }}
                className="nexora-glass-slab-deep absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 sm:w-40 h-52 sm:h-60 rounded-3xl opacity-85 pointer-events-none"
              />

              {/* SLAB 6 (Far-Right Back Frosted Mist Pane) */}
              <div
                style={{
                  transform: 'rotateX(14deg) rotateY(-20deg) rotateZ(-24deg) translate3d(185px, -60px, -45px)',
                }}
                className="nexora-glass-slab-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 sm:w-36 h-48 sm:h-56 rounded-3xl opacity-60 pointer-events-none"
              />
            </div>

            {/* Bottom-Right Architectural Caption ("From / insight / to impact." style) */}
            <div className="hidden sm:flex flex-col pl-3.5 py-1 border-l border-slate-300/90 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 absolute bottom-0 right-2 leading-snug">
              <span>Dari warga</span>
              <span>untuk warga</span>
              <span>RT 08.</span>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 2. PARTNER & PAYMENT INTEGRATION BAR (ARCHITECTURAL HAIRLINE STRIP) */}
      {/* =================================================================== */}
      <section className="py-7 border-y border-blue-900/[0.07] dark:border-slate-800/80 mb-14">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 items-center justify-items-center text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <Landmark className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>{rekeningBank?.namaBank?.split(' ')[0] || 'BCA'} Transfer</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <QrCode className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>QRIS RT 08</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <FileSpreadsheet className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Google Sheets</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <Shield className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Siskamling</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <Lightbulb className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Urunan PJU</span>
          </div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base tracking-tight opacity-85 hover:opacity-100 transition-opacity">
            <Bell className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            <span>Info Warga</span>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 3. 4-COLUMN FEATURE ROW ("A smarter way to work" + 3 WHITE CARDS)   */}
      {/* =================================================================== */}
      <section className="py-4 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left">
          {/* COLUMN 1: ARCHITECTURAL INTRO COLUMN */}
          <div className="flex flex-col justify-between py-2 pr-2">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-3 font-heading">
                Cara lebih mudah <br />
                mengurus warga
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Semua menu utama warga dirancang bersih, huruf jelas terbaca, dan mudah digunakan oleh seluruh penghuni RT 08.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToPengumuman}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 group w-fit"
            >
              <span>Lihat pengumuman RT</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* COLUMN 2: CARD 1 - DATA WARGA & KK */}
          <div className="nexora-card nexora-card-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-950 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Pendataan cepat
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Isi data keluarga mandiri, status menetap atau pulang-pergi, dan cari direktori warga per blok A–Z.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToForm}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 group w-fit"
            >
              <span>Buka Data Warga</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* COLUMN 3: CARD 2 - JADWAL RONDA MALAM */}
          <div className="nexora-card nexora-card-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-950 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Ronda lebih rapi
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Pantau jadwal siskamling 6 petugas per malam, cek giliran jaga blok Anda, dan keamanan lingkungan.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToRonda}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 group w-fit"
            >
              <span>Lihat Jadwal Ronda</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* COLUMN 4: CARD 3 - TRANSPARANSI KAS & IPL */}
          <div className="nexora-card nexora-card-hover rounded-3xl p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-950 flex items-center justify-center text-[#2563EB] dark:text-blue-400 mb-5">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white mb-2">
                Kas terbuka bersama
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                Cek status lunas IPL rumah, unggah bukti transfer, dan lihat laporan pemasukan serta pengeluaran kas RT.
              </p>
            </div>

            <button
              type="button"
              onClick={onGoToIpl}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#2563EB] dark:text-blue-400 hover:text-blue-700 group w-fit"
            >
              <span>Cek Kas &amp; IPL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 4. 4-COLUMN ARCHITECTURAL STATS STRIP ("50K+ | 3.2M | 99.9% | 150+")*/}
      {/* =================================================================== */}
      <section className="py-9 border-y border-blue-900/[0.07] dark:border-slate-800/80 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-blue-900/[0.07] dark:lg:divide-slate-800 text-left">
          <div className="lg:pr-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              {totalKK} KK
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kepala Keluarga terdata ({totalWarga} Jiwa)
            </p>
          </div>

          <div className="lg:px-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              Rp {(saldoKas / 1000000).toFixed(2)} Jt
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Saldo kas aktif lingkungan RT 08
            </p>
          </div>

          <div className="lg:px-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              {summary.persentasePemasukan || '100%'}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kepatuhan IPL ({summary.rumahLunas}/{summary.totalRumah} Rumah)
            </p>
          </div>

          <div className="lg:pl-8">
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
              Blok A–Z
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {wargaMenetap} Menetap • {wargaPulangPergi} Pulang-Pergi
            </p>
          </div>
        </div>
      </section>

      {/* =================================================================== */}
      {/* 5. MOBILE WORKSPACE SHOWCASE ("Your workspace in your hands")       */}
      {/* =================================================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-white/80 dark:border-blue-900/30 bg-gradient-to-br from-[#F8FAFF] via-[#EAF2FF] to-[#DCEAFE] dark:from-[#0B1329] dark:via-[#0F1B3D] dark:to-[#0A1124] p-6 sm:p-12 mb-14 shadow-xl shadow-blue-600/5">
        {/* Diagonal Light Beams inside Mobile Showcase */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-1/4 w-96 h-96 bg-white/60 dark:bg-blue-500/10 rounded-full blur-3xl"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* LEFT: HEADLINE, DESCRIPTION & SLEEK DARK ACTION BADGES */}
          <div className="lg:col-span-5 text-left z-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">
              PORTAL WARGA MOBILE
            </p>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-[1.12] tracking-tight mb-4 font-heading">
              Kebutuhan warga <br />
              <span className="text-[#2563EB] dark:text-blue-400">dalam genggaman</span>
            </h2>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-8 max-w-md">
              Akses mudah dari HP maupun komputer. Cek pengumuman terbaru RT 08, jadwal ronda malam, hingga konfirmasi pembayaran IPL kapan saja tanpa ribet.
            </p>

            {/* Dark Store-Style Quick Action Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenBayarModal || onGoToIpl}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white shadow-md transition-all text-left"
              >
                <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 leading-none">
                    Konfirmasi Cepat
                  </span>
                  <span className="text-xs font-bold leading-tight">Bayar Iuran IPL</span>
                </div>
              </button>

              <button
                type="button"
                onClick={onGoToUrunan || onGoToPengumuman}
                className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white shadow-md transition-all text-left"
              >
                <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 leading-none">
                    Gotong Royong
                  </span>
                  <span className="text-xs font-bold leading-tight">Program Urunan PJU</span>
                </div>
              </button>
            </div>
          </div>

          {/* RIGHT: SLEEK MOBILE MOCKUP + FLOATING FROSTED GLASS BADGES */}
          <div className="lg:col-span-7 relative flex items-center justify-center py-4">
            {/* Floating Frosted Glass Card Left ("Focus / Build what matters" style) */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl nexora-glass-slab-white absolute left-0 xl:left-4 top-12 z-20 -rotate-6">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Data Aman
                </span>
                <span className="text-[10px] text-slate-500">Privasi warga terjaga</span>
              </div>
            </div>

            {/* Floating Frosted Glass Card Right ("Sync / Across all devices" style) */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-3 rounded-2xl nexora-glass-slab-white absolute right-2 xl:right-8 top-10 z-20 rotate-6">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
                <Cloud className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-extrabold text-slate-900 block leading-tight">
                  Sinkron Live
                </span>
                <span className="text-[10px] text-slate-500">Google Spreadsheet</span>
              </div>
            </div>

            {/* Center Sleek Smartphone Frame (Tilted like Image #1) */}
            <div className="relative w-[270px] sm:w-[290px] rounded-[38px] bg-slate-950 p-2.5 shadow-2xl shadow-blue-900/30 -rotate-3 transition-transform duration-500 hover:rotate-0">
              {/* Dynamic Island Notch */}
              <div className="w-20 h-4 bg-slate-950 rounded-full mx-auto absolute top-4 left-1/2 -translate-x-1/2 z-20" />

              {/* Phone Screen */}
              <div className="bg-white dark:bg-slate-900 rounded-[30px] pt-8 pb-4 px-4 text-left overflow-hidden">
                {/* Phone Top Bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                      <span className="rounded-[2px] bg-[#2563EB]" />
                      <span className="rounded-[2px] bg-[#60A5FA]" />
                      <span className="rounded-[2px] bg-[#60A5FA]" />
                      <span className="rounded-[2px] bg-[#2563EB]" />
                    </div>
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                      SIM-Warga
                    </span>
                  </div>
                  <Search className="w-3.5 h-3.5 text-slate-400" />
                </div>

                {/* Greeting */}
                <div className="mb-4">
                  <p className="text-xs text-slate-500">Selamat datang,</p>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    Warga RT 08
                  </p>
                </div>

                {/* Today Tasks */}
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Informasi Hari Ini
                </p>

                <div className="space-y-2 mb-4">
                  <div
                    onClick={onGoToPengumuman}
                    className="cursor-pointer p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        {latestPengumuman}
                      </p>
                      <p className="text-[9px] text-slate-400">Pengumuman RT 08</p>
                    </div>
                  </div>

                  <div
                    onClick={onGoToRonda}
                    className="cursor-pointer p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-2.5 hover:border-blue-300 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#2563EB] flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                        Jadwal Siskamling Malam
                      </p>
                      <p className="text-[9px] text-slate-400">6 Petugas Siap Jaga</p>
                    </div>
                  </div>
                </div>

                {/* Team Progress / Realisasi Kas Wave Chart */}
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-slate-800/80 border border-blue-100 dark:border-slate-700 mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">
                      Realisasi Kas &amp; IPL
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300">
                      {summary.persentasePemasukan || '78%'}
                    </span>
                  </div>
                  <svg className="w-full h-10" viewBox="0 0 160 40" fill="none">
                    <path
                      d="M0 32 Q 20 12, 40 26 T 80 18 T 120 14 T 160 8"
                      stroke="#2563EB"
                      strokeWidth="2.2"
                      fill="none"
                    />
                  </svg>
                </div>

                {/* Bottom Phone Tab Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-around text-[9px] font-bold text-slate-400">
                  <span className="flex flex-col items-center text-[#2563EB]">
                    <Home className="w-3.5 h-3.5 mb-0.5" />
                    Beranda
                  </span>
                  <span
                    onClick={onGoToForm}
                    className="flex flex-col items-center cursor-pointer hover:text-slate-700"
                  >
                    <Users className="w-3.5 h-3.5 mb-0.5" />
                    Warga
                  </span>
                  <span
                    onClick={onGoToIpl}
                    className="flex flex-col items-center cursor-pointer hover:text-slate-700"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mb-0.5" />
                    IPL
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom-Right Architectural Callout ("Same power. More freedom." style) */}
            <div className="hidden xl:block absolute bottom-8 right-2 text-left pt-2.5 border-t border-slate-300/90 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white">Mudah dibaca.</p>
              <p>Nyaman bagi semua usia.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
