import React from 'react';
import { PengumumanRecord } from '@sim-warga/types';
import { ArrowRight, Bookmark } from 'lucide-react';

export interface WargaPengumumanTabProps {
  pengumumanList: PengumumanRecord[];
  katPengumuman: string;
  setKatPengumuman: (k: string) => void;
  savedAnnouncementIds: Record<string, boolean>;
  setSavedAnnouncementIds: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setDetailPengumuman: (p: PengumumanRecord) => void;
}

export const WargaPengumumanTab: React.FC<WargaPengumumanTabProps> = ({
  pengumumanList,
  katPengumuman,
  setKatPengumuman,
  savedAnnouncementIds,
  setSavedAnnouncementIds,
  setDetailPengumuman,
}) => {
  const filteredAnn = pengumumanList.filter((p) => {
    if (katPengumuman === 'ALL') return true;
    return p.kategori.toLowerCase().includes(katPengumuman.toLowerCase());
  });

  return (
    <div className="lg:h-full flex flex-col gap-2.5">
      <div className="carlic-card px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'ALL', label: 'Semua Informasi' },
            { id: 'Info Warga', label: 'Info Warga & Fasum' },
            { id: 'Rapat', label: 'Rapat & PJU' },
            { id: 'Keamanan', label: 'Sosial & Keamanan' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setKatPengumuman(c.id)}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                katPengumuman === c.id
                  ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                  : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-bold text-stone-400 pr-2">
          {filteredAnn.length} Pengumuman Resmi • Klik kartu untuk baca lengkap
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-max content-start gap-3.5 flex-1 min-h-0 overflow-y-auto pr-1 pb-6">
        {filteredAnn.map((p, idx) => {
          const themes = [
            {
              cardBg: 'from-[#0B484C] via-[#083538] to-[#041E20]',
              badgeColor: 'bg-emerald-400/25 text-emerald-200 border-emerald-400/40',
              starRating: '4.9',
              ratingLabel: 'Agenda Utama',
              bannerDefault: '/kerja-bakti.jpg',
            },
            {
              cardBg: 'from-[#143248] via-[#0E2334] to-[#081520]',
              badgeColor: 'bg-sky-400/25 text-sky-200 border-sky-400/40',
              starRating: '4.8',
              ratingLabel: 'Sosial & Fasum',
              bannerDefault: '/fasum-taman.jpg',
            },
            {
              cardBg: 'from-[#2F2119] via-[#211711] to-[#140D0A]',
              badgeColor: 'bg-amber-400/25 text-amber-200 border-amber-400/40',
              starRating: '5.0',
              ratingLabel: 'Wajib Hadir',
              bannerDefault: '/balai-pertemuan.jpg',
            },
          ];
          const theme = themes[idx % themes.length];
          const isSaved = Boolean(savedAnnouncementIds[p.id]);

          return (
            <div
              key={p.id}
              className={`h-auto min-h-[380px] lg:min-h-0 rounded-[24px] overflow-hidden flex flex-col justify-between shadow-xl relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl border-2 border-white/10 bg-gradient-to-b ${theme.cardBg} text-white`}
            >
              {/* TOP MEDIA IMAGE */}
              <div className="relative h-36 lg:h-36 w-full overflow-hidden flex-shrink-0">
                <img
                  src={p.gambarBanner || '/kegiatan/beranda_1.jpg'}
                  alt={p.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('beranda_1.jpg')) {
                      target.src = '/kegiatan/beranda_1.jpg';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Right Floating Glass Bookmark Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSavedAnnouncementIds((prev) => ({
                      ...prev,
                      [p.id]: !prev[p.id],
                    }));
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/30 flex items-center justify-center hover:bg-black/60 transition-colors shadow-sm"
                  title={isSaved ? 'Tersimpan di bookmark' : 'Simpan pengumuman ini'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white text-white' : 'text-white'}`} />
                </button>
              </div>

              {/* CARD BODY CONTENT */}
              <div className="p-4 sm:p-5 pt-2 flex flex-col justify-between flex-1">
                <div>
                  {/* Title & Date/Pill Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight line-clamp-1 group-hover:text-[#F3D37A] transition-colors">
                      {p.judul}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide border whitespace-nowrap flex-shrink-0 ${theme.badgeColor}`}>
                      {p.tanggalAcara ? p.tanggalAcara.replace(/\s*2026/g, '') : 'Okt 2026'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-stone-200/90 leading-relaxed line-clamp-2 font-medium">
                    {p.deskripsi.replace(/[┏┗━🛰️👨‍✈️📺📰]/g, '').trim()}
                  </p>

                  {/* 3 Pill Tags Row */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-extrabold text-white flex items-center gap-1 border border-white/15">
                      <span>⭐</span>
                      <span>{theme.starRating}</span>
                      <span className="text-white/40">•</span>
                      <span>{theme.ratingLabel}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold text-white border border-white/15">
                      {p.kategori.replace(' & ', '/')}
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[10px] font-bold text-white border border-white/15 truncate max-w-[130px]">
                      {p.lokasi ? p.lokasi.split('&')[0].trim() : 'PK8'}
                    </span>
                  </div>
                </div>

                {/* Full-Width White Pill Button CTA */}
                <button
                  type="button"
                  onClick={() => setDetailPengumuman(p)}
                  className="w-full mt-4 py-2.5 rounded-full bg-white hover:bg-stone-100 text-[#092C2E] font-black text-xs sm:text-sm shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <span>Lihat Detail Agenda</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#092C2E]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
