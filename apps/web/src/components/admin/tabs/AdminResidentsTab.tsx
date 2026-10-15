import React, { useState } from 'react';
import { WargaRecord } from '@sim-warga/types';
import { RondaWithStatus } from '../../ronda/JadwalRondaCard';
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
export interface AdminResidentsTabProps {
  wargaList: WargaRecord[];
  rondaList: RondaWithStatus[];
  initialSubTab?: 'warga' | 'ronda';
  onOpenAddWarga: () => void;
  onOpenEditWarga: (w: WargaRecord) => void;
  onOpenEditRonda: (r: RondaWithStatus) => void;
  onDeleteWarga?: (key: string) => Promise<void> | void;
}

export const AdminResidentsTab: React.FC<AdminResidentsTabProps> = ({
  wargaList,
  rondaList,
  initialSubTab = 'warga',
  onOpenAddWarga,
  onOpenEditWarga,
  onOpenEditRonda,
}) => {
  const [subTab, setSubTab] = useState<'warga' | 'ronda'>(initialSubTab);

  // Warga States
  const [blokGroup, setBlokGroup] = useState<string>('ALL');
  const [wargaSearch, setWargaSearch] = useState<string>('');
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [wargaPage, setWargaPage] = useState<number>(1);
  const [wargaPerPage, setWargaPerPage] = useState<number>(6);
  // Ronda States
  const [selectedMingguRonda, setSelectedMingguRonda] = useState<number>(2);

  // Filtered Warga
  const filteredWarga = wargaList.filter((w) => {
    const b = w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim();
    const matchGroup =
      blokGroup === 'ALL' ? true : b.startsWith(blokGroup.replace('BLOK-', ''));
    const q = wargaSearch.trim().toLowerCase();
    const matchSearch =
      !q ||
      w.namaLengkap.toLowerCase().includes(q) ||
      w.alamatRumah.toLowerCase().includes(q) ||
      w.noWhatsapp.includes(q);
    return matchGroup && matchSearch;
  });

  const totalWargaPages = Math.max(1, Math.ceil(filteredWarga.length / wargaPerPage));
  const paginatedWarga = filteredWarga.slice(
    (wargaPage - 1) * wargaPerPage,
    wargaPage * wargaPerPage
  );

  // Filtered Ronda
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
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-y-auto md:overflow-hidden h-auto md:h-full w-full max-w-full">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
            Kependudukan &amp; Siskamling
          </h2>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Manajemen Data Kepala Keluarga, Secret PIN Warga, dan Penjadwalan Ronda Malam
          </p>
        </div>

        <a
          href="https://docs.google.com/spreadsheets/d/1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0/edit"
          target="_blank"
          rel="noreferrer"
          className="h-9 px-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold transition-colors flex items-center gap-1.5 border-2 border-stone-300 dark:border-stone-700 shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Buka DATA_WARGA</span>
        </a>
      </div>

      {/* 2. PROMINENT SUB-TAB NAVIGATION BAR */}
      <div className="p-1.5 rounded-2xl bg-stone-200/70 dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700 flex items-center gap-1.5 overflow-x-auto shadow-2xs flex-shrink-0">
        <button
          type="button"
          onClick={() => setSubTab('warga')}
          title="Daftar lengkap 143 KK warga RT 08 dengan filter per blok, nomor telepon, dan status kepatuhan IPL."
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            subTab === 'warga'
              ? 'bg-[#0B484C] text-[#F3D37A] shadow-md ring-1 ring-[#D9B352]/50 scale-[1.01]'
              : 'text-stone-600 dark:text-stone-400 hover:text-[#0B484C] hover:bg-white/60 dark:hover:bg-stone-800'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Direktori Warga ({wargaList.length} KK)</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('ronda')}
          title="Papan kalender pembagian 6 slot petugas ronda harian untuk 4 periode minggu siskamling."
          className={`flex-1 min-w-[150px] py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
            subTab === 'ronda'
              ? 'bg-[#0B484C] text-[#F3D37A] shadow-md ring-1 ring-[#D9B352]/50 scale-[1.01]'
              : 'text-stone-600 dark:text-stone-400 hover:text-[#0B484C] hover:bg-white/60 dark:hover:bg-stone-800'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Jadwal Siskamling (Minggu {selectedMingguRonda})</span>
        </button>
      </div>
      {/* =================================================================== */}
      {/* SUB-TAB 1: DIREKTORI WARGA                                          */}
      {/* =================================================================== */}
      {subTab === 'warga' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden">
          {/* Top Block Pills & Search */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBlokGroup(b === 'ALL' ? 'ALL' : `BLOK-${b}`);
                    setWargaPage(1);
                  }}
                  className={`text-xs font-extrabold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    blokGroup === (b === 'ALL' ? 'ALL' : `BLOK-${b}`)
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  {b === 'ALL' ? `Semua (${wargaList.length} KK)` : `Blok ${b}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative min-w-[200px] sm:min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={wargaSearch}
                  onChange={(e) => {
                    setWargaSearch(e.target.value);
                    setWargaPage(1);
                  }}
                  placeholder="Cari nama, blok, no rumah..."
                  className="w-full h-8 pl-8 pr-3 rounded-xl bg-stone-50 dark:bg-[#051E20] border-2 border-stone-300 dark:border-stone-600 text-xs font-medium text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C]"
                />
              </div>
              <button
                type="button"
                onClick={onOpenAddWarga}
                title="Pendaftaran kepala keluarga baru ke dalam database resmi tab DATA_WARGA spreadsheet."
                className="h-8 px-3.5 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-xs flex items-center gap-1 shadow-xs flex-shrink-0 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Warga Baru</span>
              </button>
            </div>
          </div>

          {/* Citizen Cards Grid (Scrollable) */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paginatedWarga.map((w) => {
                const key = w.id || w.alamatRumah;
                const isPinRevealed = Boolean(revealedPins[key]);

                return (
                  <div
                    key={key}
                    onClick={() => onOpenEditWarga(w)}
                    className="cursor-pointer p-4 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs hover:border-[#0B484C] dark:hover:border-[#F3D37A] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0B484C] dark:bg-emerald-950 dark:text-[#F3D37A] font-black text-xs flex items-center justify-center ring-2 ring-[#D9B352]/50">
                            {w.namaLengkap.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
                              {w.namaLengkap}
                            </p>
                            <span className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A]">
                              {w.alamatRumah}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            w.statusIpl === 'Lunas'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {w.statusIpl}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap my-2">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {w.statusTempatTinggal}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                          {w.jmlJiwa || 3} Jiwa
                        </span>
                        <span className="text-[9px] font-mono text-stone-400">
                          WA: {w.noWhatsapp || '-'}
                        </span>
                      </div>

                      {w.catatan && w.catatan !== '-' && (
                        <div className="my-1.5 p-2 rounded-xl bg-stone-50/90 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 text-[10px] text-stone-600 dark:text-stone-300 flex items-start gap-1.5 leading-snug">
                          <span className="text-stone-400 font-bold flex-shrink-0">📝</span>
                          <span className="line-clamp-2 italic">{w.catatan}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2.5 mt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-400">
                      <div className="flex items-center gap-1">
                        <span>PIN: {isPinRevealed ? w.pin || '1234' : '••••••'}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedPins((p) => ({ ...p, [key]: !p[key] }));
                          }}
                          className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          {isPinRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                      <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] hover:underline flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Edit Warga →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between text-xs flex-shrink-0">
            <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400">
              <span>
                Menampilkan{' '}
                <strong className="text-[#1C221E] dark:text-white">
                  {filteredWarga.length === 0 ? 0 : (wargaPage - 1) * wargaPerPage + 1} -{' '}
                  {Math.min(wargaPage * wargaPerPage, filteredWarga.length)}
                </strong>{' '}
                dari {filteredWarga.length} KK
              </span>
              <div className="hidden sm:flex items-center gap-1 ml-2 pl-2 border-l border-stone-200 dark:border-stone-700">
                <span className="text-[10px]">Per halaman:</span>
                {[6, 9, 12].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => {
                      setWargaPerPage(cnt);
                      setWargaPage(1);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      wargaPerPage === cnt
                        ? 'bg-[#0B484C] text-[#F3D37A]'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={wargaPage === 1}
                onClick={() => setWargaPage((p) => Math.max(1, p - 1))}
                className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalWargaPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalWargaPages || Math.abs(p - wargaPage) <= 1)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="text-stone-400 px-1">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setWargaPage(p)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                          wargaPage === p
                            ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                            : 'hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                type="button"
                disabled={wargaPage >= totalWargaPages}
                onClick={() => setWargaPage((p) => Math.min(totalWargaPages, p + 1))}
                className="h-8 px-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#051E20] hover:bg-stone-100 dark:hover:bg-stone-800 font-bold flex items-center gap-1 disabled:opacity-40"
              >
                <span className="hidden sm:inline">Berikutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-TAB 2: JADWAL SISKAMLING RONDA MALAM                            */}
      {/* =================================================================== */}
      {subTab === 'ronda' && (
        <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-hidden">
          {/* Calendar Top Controls */}
          <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-stone-300 dark:border-stone-700 shadow-xs flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
                Papan Kalender Siskamling — Minggu ke-{selectedMingguRonda}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMingguRonda(m)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                    selectedMingguRonda === m
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                  }`}
                >
                  Minggu {m}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
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
                    className={`p-3.5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 shadow-xs flex flex-col justify-between min-h-[360px] transition-all hover:border-[#0B484C] ${
                      isSunday
                        ? 'border-amber-400 dark:border-amber-700'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="pb-2 border-b-2 border-stone-200 dark:border-stone-700 mb-2.5 flex items-center justify-between">
                        <span className="font-black text-xs uppercase text-[#0B484C] dark:text-[#F3D37A] px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800">
                          {dName}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                          {sched ? sched.tanggal.replace(/\s*2026/g, '') : '-'}
                        </span>
                      </div>

                      {isSunday ? (
                        <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 text-center border-2 border-amber-300 dark:border-amber-700/80 space-y-2 my-auto">
                          <span className="text-3xl block">🛡️</span>
                          <h4 className="font-black text-xs text-amber-950 dark:text-amber-200">
                            Ronda Akbar Paguyuban
                          </h4>
                          <p className="text-[10px] text-stone-600 dark:text-stone-300 leading-relaxed font-semibold">
                            Siskamling gabungan seluruh warga PK8 Blok A s/d E
                          </p>
                          <span className="inline-block text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 border border-amber-300">
                            23:00 - 04:00 WIB
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {Array.from({ length: 6 }).map((_, slotIdx) => {
                            const p = sched?.petugas?.[slotIdx];
                            const slotNum = slotIdx + 1;
                            const isKoord = slotIdx === 0;

                            if (p && p.namaLengkap && p.namaLengkap !== '-') {
                              return (
                                <div
                                  key={slotNum}
                                  className={`p-1.5 px-2 rounded-xl border-2 text-[11px] flex items-center justify-between gap-1 transition-all ${
                                    isKoord
                                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80'
                                      : 'bg-stone-50 dark:bg-[#051E20] border-stone-200 dark:border-stone-700/80'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <span
                                      className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center flex-shrink-0 ${
                                        isKoord
                                          ? 'bg-amber-400 text-stone-950'
                                          : 'bg-[#0B484C] text-[#F3D37A]'
                                      }`}
                                    >
                                      {slotNum}
                                    </span>
                                    <span className="font-bold truncate text-[#1C221E] dark:text-stone-200">
                                      {p.namaLengkap}
                                    </span>
                                  </div>
                                  <span className="text-stone-500 dark:text-stone-400 font-mono text-[9px] flex-shrink-0 px-1 py-0.5 rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 font-bold">
                                    {p.blokRumah || '-'}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={slotNum}
                                className="p-1.5 px-2 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700/70 text-[10px] text-stone-400 flex items-center justify-between bg-stone-50/40 dark:bg-black/10"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-500 flex items-center justify-center font-bold">
                                    {slotNum}
                                  </span>
                                  <span className="italic">Slot {slotNum}</span>
                                </span>
                                <span className="text-[9px] text-stone-400 font-semibold">+ Kosong</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {sched && (
                      <button
                        type="button"
                        onClick={() => onOpenEditRonda(sched)}
                        className="w-full mt-3 py-2 rounded-xl bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-1"
                      >
                        <span>Edit Petugas (6 Slot)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
