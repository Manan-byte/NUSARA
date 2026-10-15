import React, { useState } from 'react';
import { PengumumanRecord } from '@sim-warga/types';
import { X, ArrowRight, Copy, Check, UploadCloud } from 'lucide-react';

export interface WargaPengumumanDetailModalProps {
  detailPengumuman: PengumumanRecord | null;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  setUrunanMode?: (mode: 'form' | 'daftar') => void;
}

export const WargaPengumumanDetailModal: React.FC<WargaPengumumanDetailModalProps> = ({
  detailPengumuman,
  onClose,
  onSelectTab,
  setUrunanMode,
}) => {
  const [copiedJarkoman, setCopiedJarkoman] = useState(false);

  if (!detailPengumuman) return null;

  const urlMatch = detailPengumuman.deskripsi.match(/https?:\/\/[^\s\]*)]+/i);
  const externalUrl = urlMatch ? urlMatch[0] : null;
  const isPjuAnn = detailPengumuman.id === 'PGM-PJU-01';

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="carlic-card max-w-2xl sm:max-w-3xl w-full p-4 sm:p-6 relative my-auto shadow-2xl rounded-[28px] flex flex-col gap-3.5 text-left bg-[#FBFBFA] dark:bg-[#072426] border border-stone-200/80 dark:border-[#D9B352]/30"
      >
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 flex items-center justify-center absolute top-4 right-4 z-20 transition-colors shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badges & Title */}
        <div className="pr-10">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#0B484C] text-[#F3D37A] text-[10px] font-extrabold uppercase tracking-wider">
              📰 PENGUMUMAN RESMI
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF6DF] dark:bg-stone-800 text-[#9A7018] dark:text-[#F3D37A] border border-[#D9B352]/40 text-[10px] font-extrabold">
              {detailPengumuman.kategori}
            </span>
            <span className="text-[11px] font-bold text-stone-400">
              • {detailPengumuman.tanggalAcara}
            </span>
          </div>
          <h3 className="text-base sm:text-xl font-black text-[#1C221E] dark:text-white leading-snug">
            {detailPengumuman.judul}
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Oleh: <strong className="text-stone-700 dark:text-stone-200">{detailPengumuman.author || 'BPH Paguyuban Pesona Kahuripan 8 Tahap 2'}</strong>
          </p>
        </div>

        {/* Hero Banner Image (Object Contain - Full Picture, Never Cropped) */}
        <div className="rounded-2xl overflow-hidden w-full h-52 sm:h-64 relative border border-stone-200/80 dark:border-stone-700/80 shadow-md bg-stone-900 flex items-center justify-center flex-shrink-0">
          <img
            src={detailPengumuman.gambarBanner || '/kegiatan/beranda_1.jpg'}
            alt={detailPengumuman.judul}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('beranda_1.jpg')) {
                target.src = '/kegiatan/beranda_1.jpg';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              📸 Dokumentasi Resmi PK8-2
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
              {detailPengumuman.tanggalAcara}
            </span>
          </div>
        </div>

        {/* Isi Lengkap Jarkoman (Expands naturally, full content visible, readable) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-700 shadow-inner">
          <div className="text-xs sm:text-[13px] text-stone-800 dark:text-stone-100 leading-relaxed whitespace-pre-line font-medium border-l-4 border-[#0B484C] dark:border-[#F3D37A] pl-3.5">
            {detailPengumuman.deskripsi}
          </div>
          {externalUrl && (
            <div className="mt-3.5 pt-3 border-t border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase block">
                  Tautan Resmi:
                </span>
                <a
                  href={externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-extrabold text-[#0B484C] dark:text-[#F3D37A] underline truncate block"
                >
                  {externalUrl}
                </a>
              </div>
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#0B484C] text-[#F3D37A] text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
              >
                <span>🔗 Buka Link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(detailPengumuman.deskripsi);
              setCopiedJarkoman(true);
              setTimeout(() => setCopiedJarkoman(false), 1800);
            }}
            className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs font-bold text-[#1C221E] dark:text-white flex items-center gap-1.5 shadow-2xs"
          >
            {copiedJarkoman ? <Check className="w-4 h-4 text-[#0B484C]" /> : <Copy className="w-4 h-4" />}
            <span>{copiedJarkoman ? 'Teks Tersalin!' : 'Salin Teks'}</span>
          </button>

          <div className="flex items-center gap-2">
            {isPjuAnn && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setUrunanMode?.('form');
                  onSelectTab('urunan');
                }}
                className="carlic-sage-btn text-[#F3D37A] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Bayar Urunan PJU →</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0B484C] text-[#F3D37A] font-bold text-xs hover:opacity-90 transition-opacity shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
