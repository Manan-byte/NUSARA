import React from 'react';
import { RondaWithStatus } from '../../ronda/JadwalRondaCard';
import { aiFuzzyMatch } from '../../common/CustomSelect';
import { Search } from 'lucide-react';

export interface WargaRondaTabProps {
  rondaList: RondaWithStatus[];
  selectedMingguRonda: number;
  setSelectedMingguRonda: (mg: number) => void;
  selectedRondaId: string;
  setSelectedRondaId: (id: string) => void;
  rondaSearch: string;
  setRondaSearch: (s: string) => void;
}

export const WargaRondaTab: React.FC<WargaRondaTabProps> = ({
  rondaList,
  selectedMingguRonda,
  setSelectedMingguRonda,
  selectedRondaId,
  setSelectedRondaId,
  rondaSearch,
  setRondaSearch,
}) => {
  const getMingguNum = (r: RondaWithStatus): number => {
    const m = (r as RondaWithStatus & { mingguKe?: number }).mingguKe;
    if (m) return m;
    if (r.hari.includes('MINGGU 1')) return 1;
    if (r.hari.includes('MINGGU 2')) return 2;
    if (r.hari.includes('MINGGU 3')) return 3;
    if (r.hari.includes('MINGGU 4')) return 4;
    return 1;
  };

  const searchQuery = rondaSearch.trim().toLowerCase();
  const visibleSchedules = searchQuery
    ? rondaList.filter((r) =>
        aiFuzzyMatch(
          rondaSearch,
          `${r.hari} ${r.tanggal} ${r.petugas.map((p) => `${p.namaLengkap} ${p.blokRumah}`).join(' ')}`
        )
      )
    : rondaList.filter((r) => getMingguNum(r) === selectedMingguRonda);

  const activeRonda =
    visibleSchedules.find((r) => r.id === selectedRondaId) ||
    visibleSchedules[0] ||
    rondaList[0];

  const isSemuaWarga =
    activeRonda?.petugas.length === 1 &&
    activeRonda.petugas[0].namaLengkap.toUpperCase().includes('SEMUA WARGA');

  const tugasLabel = [
    'Petugas Ronda 1 (Koordinator)',
    'Petugas Ronda 2',
    'Petugas Ronda 3',
    'Petugas Ronda 4',
    'Petugas Ronda 5',
    'Petugas Ronda 6',
  ];

  return (
    <div className="lg:h-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:h-full">
        {/* KOLOM KIRI (4 COL): PILIH MINGGU (1-4) & HARI RONDA */}
        <div className="lg:col-span-4 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 relative">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                  Jadwal Ronda Oktober
                </h3>
                <div className="relative group/tip inline-flex">
                  <span className="w-4 h-4 rounded-full bg-[#0B484C]/10 text-[#0B484C] dark:bg-[#F3D37A]/20 dark:text-[#F3D37A] text-[10px] font-black flex items-center justify-center cursor-help">
                    ?
                  </span>
                  <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] w-60 sm:w-64 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-[9999] text-[11px] leading-relaxed break-words">
                    <p className="font-extrabold text-[#F3D37A] mb-1.5">
                      🛡️ Ketentuan Ronda Malam Paguyuban:
                    </p>
                    <ul className="space-y-1 text-stone-200">
                      <li>• <strong>Jam Patroli:</strong> Jam 21.00 s/d 04.00 WIB di Pos Kamling PK8 Tahap 2.</li>
                      <li>• <strong>Rotasi 4 Minggu:</strong> Klik Minggu 1–4 untuk melihat daftar regu ronda harian.</li>
                      <li>• <strong>Malam Minggu:</strong> Ronda massal bersama seluruh warga komplek.</li>
                      <li>• <strong>Tukar Jadwal:</strong> Jika berhalangan, hubungi rekan regu atau koordinasi dengan Seksi Keamanan.</li>
                    </ul>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FEF6DF] dark:bg-[#072426] text-[#9A7018] dark:text-[#F3D37A] border border-[#D9B352]/40 dark:border-[#D9B352]/60 whitespace-nowrap flex-shrink-0">
                21.00 – 04.00
              </span>
            </div>

            {/* Tab Pilihan Minggu 1 s/d Minggu 4 */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 mb-2.5 flex-shrink-0">
              {[1, 2, 3, 4].map((mg) => (
                <button
                  key={mg}
                  type="button"
                  onClick={() => {
                    setSelectedMingguRonda(mg);
                    setRondaSearch('');
                    const firstInWeek = rondaList.find((r) => getMingguNum(r) === mg);
                    if (firstInWeek) setSelectedRondaId(firstInWeek.id);
                  }}
                  className={`py-1.5 rounded-lg text-[11px] font-extrabold transition-colors ${
                    !searchQuery && selectedMingguRonda === mg
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-2xs'
                      : 'text-stone-500 hover:text-[#1C221E] dark:hover:text-white'
                  }`}
                >
                  Minggu {mg}
                </button>
              ))}
            </div>

            <div className="relative mb-2.5 flex-shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={rondaSearch}
                onChange={(e) => setRondaSearch(e.target.value)}
                placeholder="Cari nama petugas atau blok (Semua Minggu)..."
                className="w-full h-9 pl-9 pr-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs text-[#1C221E] dark:text-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0 content-between">
              {visibleSchedules.map((r) => {
                const isSelected = activeRonda?.id === r.id;
                const cleanDay = r.hari.replace(/^MINGGU\s*\d+\s*•\s*/i, '');
                const isSunday = cleanDay === 'MINGGU';
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRondaId(r.id)}
                    className={`cursor-pointer px-3 py-1.5 rounded-xl transition-all flex items-center justify-between gap-1.5 ${
                      isSunday && !searchQuery && visibleSchedules.length === 7 ? 'col-span-2' : ''
                    } ${
                      isSelected
                        ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50 shadow-xs'
                        : isSunday
                        ? 'bg-[#FEF9EB] dark:bg-amber-950/30 border border-[#D9B352]/60 text-[#1C221E] dark:text-white hover:bg-[#FAF3DC]'
                        : 'bg-[#F8F8F6] dark:bg-stone-800/60 text-[#1C221E] dark:text-white hover:bg-[#EFECE6]'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold truncate">
                        {searchQuery ? r.hari : cleanDay}
                      </p>
                      <p
                        className={`text-[9px] truncate ${
                          isSelected ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {r.tanggal}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${
                        isSelected
                          ? 'bg-white/20 text-[#F3D37A]'
                          : isSunday
                          ? 'bg-rose-600 text-white'
                          : 'bg-[#0B484C]/10 text-[#0B484C] dark:text-[#F3D37A]'
                      }`}
                    >
                      {isSunday ? 'Semua Warga' : `${r.petugas.length} Petugas`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2.5 mt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-400 flex-shrink-0">
            <span>📍 Wilayah PK8 Tahap 2</span>
            <span className="font-bold text-[#0B484C] dark:text-[#F3D37A]">Jam 21.00 s/d 04.00</span>
          </div>
        </div>

        {/* KOLOM KANAN (8 COL): DAFTAR 6 PETUGAS REGU & KETENTUAN RONDA PK8 TAHAP 2 */}
        <div className="lg:col-span-8 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 overflow-hidden">
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 flex-shrink-0">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white truncate">
                    {isSemuaWarga
                      ? `Jadwal Malam Minggu • ${activeRonda?.tanggal}`
                      : `Daftar ${activeRonda?.petugas.length || 0} Petugas Ronda • ${activeRonda?.hari} (${activeRonda?.tanggal})`}
                  </h3>
                  <div className="relative group/tip inline-flex flex-shrink-0">
                    <span className="w-4 h-4 rounded-full bg-[#0B484C]/10 text-[#0B484C] dark:bg-[#F3D37A]/20 dark:text-[#F3D37A] text-[10px] font-black flex items-center justify-center cursor-help">
                      ?
                    </span>
                    <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+6px)] w-80 p-3.5 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                      <p className="font-extrabold text-[#F3D37A] mb-1.5">
                        🛡️ Ketentuan Ronda Malam Paguyuban:
                      </p>
                      <ul className="space-y-1 text-stone-200">
                        <li>• <strong>Jam Patroli:</strong> Jam 21.00 s/d 04.00 WIB (Siaga Pos Ronda PK8).</li>
                        <li>• <strong>Jadwal Bergilir:</strong> Terbagi Minggu 1 s/d 4 (6 petugas per malam).</li>
                        <li>• <strong>Malam Minggu:</strong> Ronda &amp; silaturahmi bersama SELURUH warga.</li>
                        <li>• <strong>Tukar Jadwal:</strong> Jika berhalangan, segera koordinasi dengan rekan sesama regu.</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 truncate">
                  * Jika berhalangan pada saat jadwal, segera koordinasi dengan teman di hari tersebut
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF6DF] dark:bg-[#072426] text-[#9A7018] dark:text-[#F3D37A] border border-[#D9B352]/40 dark:border-[#D9B352]/60 whitespace-nowrap flex-shrink-0">
                ⏰ 21.00 s/d 04.00 WIB
              </span>
            </div>

            {isSemuaWarga ? (
              /* TAMPILAN KHUSUS HARI MINGGU: SEMUA WARGA + CATATAN RESMI JADWAL RONDA */
              <div className="flex-1 flex flex-col justify-between gap-3 min-h-0">
                <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-600 text-white inline-block">
                      Jadwal Khusus Malam Minggu ({activeRonda?.tanggal})
                    </span>
                    <h4 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white">
                      SEMUA WARGA PK8 TAHAP 2
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-300">
                      Ronda malam bersama &amp; silaturahmi seluruh warga Pesona Kahuripan 8 Tahap 2 (Blok D &amp; Blok E).
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    PK8
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-h-0">
                  <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/60 flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] uppercase tracking-wider mb-1">
                      Ketentuan Waktu &amp; Koordinasi
                    </span>
                    <p className="text-xs font-bold text-[#1C221E] dark:text-white">
                      • Jadwal ronda dimulai dari jam 21.00 s/d 04.00 WIB
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-300 mt-1">
                      • Jika berhalangan pada saat jadwal, segera koordinasi dengan teman di hari tersebut
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/60 flex flex-col justify-center">
                    <span className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] uppercase tracking-wider mb-1">
                      Tujuan Jadwal Ronda PK8 Tahap 2
                    </span>
                    <p className="text-xs font-bold text-[#1C221E] dark:text-white">
                      • Menjaga dan mengurangi tindak kriminal di wilayah PK8 Tahap 2
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-300 mt-1">
                      • Menjalin silaturahmi antar warga
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* TAMPILAN DINAMIS PETUGAS REGU */
              <div
                className={
                  (activeRonda?.petugas.length || 0) > 6
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 flex-1 min-h-0 content-start overflow-y-auto pr-1'
                    : 'grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-3 gap-2.5 flex-1 min-h-0'
                }
              >
                {activeRonda?.petugas.map((p, idx) => {
                  const isMany = (activeRonda?.petugas.length || 0) > 6;
                  return (
                    <div
                      key={p.slot}
                      className={`${
                        isMany ? 'px-3 py-2 rounded-xl' : 'px-3.5 py-2.5 rounded-2xl h-full'
                      } bg-[#F8F8F6] dark:bg-stone-800/60 flex items-center justify-between gap-2.5`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`${
                            isMany ? 'w-7 h-7 text-[11px]' : 'w-9 h-9 text-xs'
                          } rounded-full font-extrabold flex items-center justify-center flex-shrink-0 ${
                            p.isKoordinator
                              ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                              : 'bg-white dark:bg-stone-700 text-[#1C221E] dark:text-white'
                          }`}
                        >
                          {String(p.slot).padStart(2, '0')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#1C221E] dark:text-white truncate">
                            {p.namaLengkap}
                          </p>
                          <p className="text-[10px] text-stone-400 truncate">
                            {p.isKoordinator
                              ? 'Petugas 1 (Koordinator)'
                              : tugasLabel[idx] || `Petugas Ronda ${p.slot}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white dark:bg-stone-700 text-[#0B484C] dark:text-[#F3D37A] border border-stone-200/70 dark:border-stone-600 whitespace-nowrap flex-shrink-0">
                        {p.blokRumah.startsWith('Blok') ? p.blokRumah : `Blok ${p.blokRumah}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-3 mt-2 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-stone-400 flex-shrink-0">
            <span>🎯 Tujuan: Menjaga &amp; mengurangi tindak kriminal di wilayah PK8 Tahap 2</span>
            <span className="font-bold text-[#0B484C] dark:text-[#F3D37A]">🤝 Menjalin silaturahmi antar warga</span>
          </div>
        </div>
      </div>
    </div>
  );
};
