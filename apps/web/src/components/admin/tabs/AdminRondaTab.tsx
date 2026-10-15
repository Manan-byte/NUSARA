import React, { useState } from 'react';
import { RondaWithStatus } from '../../ronda/JadwalRondaCard';
import {
  Shield,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export interface AdminRondaTabProps {
  rondaList: RondaWithStatus[];
  onOpenEditRonda: (r: RondaWithStatus) => void;
}

export const AdminRondaTab: React.FC<AdminRondaTabProps> = ({
  rondaList,
  onOpenEditRonda,
}) => {
  const [selectedMingguRonda, setSelectedMingguRonda] = useState<number>(2);

  const visibleSchedules = rondaList.filter((r) => {
    const rWithMinggu = r as RondaWithStatus & { mingguKe?: number };
    const m =
      rWithMinggu.mingguKe ||
      (r.hari.includes('MINGGU 1')
        ? 1
        : r.hari.includes('MINGGU 2')
        ? 2
        : r.hari.includes('MINGGU 3')
        ? 3
        : 4);
    return m === selectedMingguRonda;
  });

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden h-full">
      {/* 1. TOP TITLE & ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Jadwal Siskamling &amp; Ronda Malam
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Papan Kalender Plotting Petugas Ronda Mandiri RT 08 Pesona Kahuripan 8 (Minggu ke-{selectedMingguRonda})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit"
            target="_blank"
            rel="noreferrer"
            className="h-9 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border border-stone-200/80"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>JADWAL_RONDA</span>
          </a>
        </div>
      </div>

      {/* 2. WEEK SELECTOR PILLS */}
      <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs flex items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A]" />
          <h3 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
            Pilih Periode Minggu:
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setSelectedMingguRonda(m)}
              className={`text-xs font-extrabold px-3.5 py-1.5 rounded-xl transition-all ${
                selectedMingguRonda === m
                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs scale-105'
                  : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
            >
              Minggu {m}
            </button>
          ))}
        </div>
      </div>

      {/* 3. 7-DAY CALENDAR GRID */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'].map((dName) => {
            const sched = visibleSchedules.find((r) =>
              r.hari.toLowerCase().includes(dName.toLowerCase())
            );
            const isSunday = dName === 'Minggu';

            return (
              <div
                key={dName}
                className={`p-3 rounded-2xl bg-white dark:bg-[#072B2E] border shadow-2xs flex flex-col justify-between min-h-[320px] transition-all hover:border-[#0B484C] ${
                  isSunday
                    ? 'border-amber-300 dark:border-amber-700/60'
                    : 'border-stone-200/80 dark:border-[#D9B352]/30'
                }`}
              >
                <div>
                  <div className="pb-2 border-b border-stone-200/70 dark:border-stone-800 mb-2">
                    <span className="font-extrabold text-xs uppercase text-[#1C221E] dark:text-white block">
                      {dName}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      {sched ? sched.tanggal.replace(/\s*2026/g, '') : '-'}
                    </span>
                  </div>

                  {sched ? (
                    <div className="space-y-1.5">
                      {isSunday ? (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-center text-[10px] font-black text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 my-4">
                          🛡️ Ronda Akbar
                          <br />
                          Seluruh Warga PK8
                        </div>
                      ) : (
                        sched.petugas.slice(0, 6).map((p, idx) => (
                          <div
                            key={p.slot || idx}
                            className="p-1.5 rounded-lg bg-stone-50 dark:bg-[#051E20] border border-stone-200/50 dark:border-stone-800 text-[10px] flex items-center justify-between"
                          >
                            <span className="font-bold truncate text-[#1C221E] dark:text-stone-200">
                              {p.namaLengkap}
                            </span>
                            <span className="text-stone-400 font-mono text-[9px] flex-shrink-0">
                              {p.blokRumah}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 italic">Belum diatur</p>
                  )}
                </div>

                {sched && (
                  <button
                    type="button"
                    onClick={() => onOpenEditRonda(sched)}
                    className="w-full mt-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-[#051E20] dark:hover:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] font-bold text-xs transition-colors"
                  >
                    Edit Petugas
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
