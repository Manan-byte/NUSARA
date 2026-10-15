import React from 'react';
import { FileSpreadsheet, Users, Lock, CheckCircle2 } from 'lucide-react';

export const AdminOfficeIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`relative w-full h-full min-h-[300px] bg-gradient-to-br from-[#062C2F] via-[#0B484C] to-[#083B3E] rounded-2xl overflow-hidden flex flex-col justify-between p-5 sm:p-6 text-white select-none border border-[#D9B352]/45 shadow-xl ${className}`}
    >
      {/* GOLDEN AMBIENT GLOW & DOT PATTERN */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#E5C158]/20 via-transparent to-transparent pointer-events-none" />
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(229, 193, 88, 0.35) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* TOP HEADER BADGES (SINGLE LINE, NO WRAPPING) */}
      <div className="relative z-10 flex items-center justify-between gap-2 whitespace-nowrap">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-[#D9B352]/35 text-[11px] font-semibold text-[#F3D37A]">
          <span className="w-2 h-2 rounded-full bg-[#E5C158] flex-shrink-0" />
          <span>Portal Pengurus</span>
        </div>
        <span className="text-[10px] font-extrabold text-[#062C2F] pk-gold-gradient px-3 py-1 rounded-full shadow-xs">
          PK8 • TAHAP 2
        </span>
      </div>

      {/* CENTERPIECE: PESONA KAHURIPAN OFFICIAL LOGO & GOVERNANCE */}
      <div className="relative z-10 my-auto py-3 flex flex-col items-center">
        <div className="relative mb-3 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-[#E5C158]/20 blur-xl" />
          <div className="relative w-16 h-16 rounded-2xl bg-[#0B484C] ring-2 ring-[#E5C158] shadow-xl overflow-hidden flex items-center justify-center">
            <img
              src="/logo-pesona-kahuripan.png"
              alt="Pesona Kahuripan"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h3 className="text-lg font-extrabold text-center tracking-tight text-white mb-1 whitespace-nowrap">
          Pengurus Paguyuban PK8
        </h3>
        <p className="text-[11px] text-emerald-100/80 text-center max-w-[260px] leading-relaxed">
          Kelola direktori warga, verifikasi IPL, kas lingkungan, dan jadwal siskamling.
        </p>

        {/* FLOATING MINI WIDGETS (SINGLE LINE TITLES, NO WRAPPING) */}
        <div className="w-full space-y-2.5 mt-4">
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D9B352]/25">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#E5C158]/20 border border-[#E5C158]/40 flex items-center justify-center text-[#F3D37A] flex-shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Google Sheets Live</p>
                <p className="text-[10px] text-emerald-100/70 truncate">Data Kas &amp; Warga Otomatis</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#F3D37A] bg-[#062C2F]/80 border border-[#D9B352]/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              <CheckCircle2 className="w-3 h-3" /> Aktif
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-[#D9B352]/25">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#E5C158]/20 border border-[#E5C158]/40 flex items-center justify-center text-[#F3D37A] flex-shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">Direktori Warga PK8</p>
                <p className="text-[10px] text-emerald-100/70 truncate">Pesona Kahuripan 8 Tahap 2</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#F3D37A] bg-[#062C2F]/80 border border-[#D9B352]/40 px-2.5 py-0.5 rounded-full flex-shrink-0 whitespace-nowrap">
              Resmi
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER (SINGLE LINE, NO WRAPPING) */}
      <div className="relative z-10 pt-3.5 border-t border-white/10 flex items-center justify-between gap-2 text-[11px] text-emerald-100/80 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3.5 h-3.5 text-[#F3D37A] flex-shrink-0" />
          <span>Akses Terproteksi</span>
        </div>
        <span className="text-[#F3D37A] font-bold">Pesona Kahuripan 8</span>
      </div>
    </div>
  );
};
