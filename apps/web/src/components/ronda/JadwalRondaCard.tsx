import React, { useState } from 'react';
import { PillBadge, Modal } from '@sim-warga/ui';
import { JadwalRondaRecord, PetugasSlot } from '@sim-warga/types';
import {
  Shield,
  Search,
  Plus,
  Share2,
  Phone,
  Clock,
  Edit,
  Trash2,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Radio,
  Sparkles,
  Info,
  ChevronRight,
  Navigation,
  Home,
  RefreshCw,
  Copy,
  Check,
} from 'lucide-react';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { TimePresetPicker } from '../common/TimePresetPicker';
import { getTodayRondaDate, getTomorrowRondaDate } from '../../data/mockInitialData';

export type RondaWithStatus = JadwalRondaRecord & {
  statusPublikasi: 'PUBLISHED' | 'DRAFT';
};

export interface JadwalRondaCardProps {
  rondaList: RondaWithStatus[];
  isAdmin: boolean;
  onPublishRonda: (id: string) => void;
  onAddRonda: (newRonda: RondaWithStatus) => void;
  onUpdateRonda?: (updatedRonda: RondaWithStatus) => void;
  onDeleteRonda?: (id: string) => void;
}

export const JadwalRondaCard: React.FC<JadwalRondaCardProps> = ({
  rondaList,
  isAdmin,
  onPublishRonda,
  onAddRonda,
  onUpdateRonda,
  onDeleteRonda,
}) => {
  const todayInfo = getTodayRondaDate();
  const tomorrowInfo = getTomorrowRondaDate();

  const [search, setSearch] = useState('');
  const [selectedRondaId, setSelectedRondaId] = useState<string>(
    rondaList[0]?.id || 'RND-TODAY'
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRondaId, setEditingRondaId] = useState<string | null>(null);
  const [rondaToDelete, setRondaToDelete] = useState<RondaWithStatus | null>(null);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [swapRequester, setSwapRequester] = useState('');
  const [swapTargetDate, setSwapTargetDate] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [copiedSwap, setCopiedSwap] = useState(false);
  // Form state for creating/editing schedule
  const [formRawDate, setFormRawDate] = useState(todayInfo.rawIso);
  const [formHari, setFormHari] = useState(todayInfo.hari);
  const [formTanggal, setFormTanggal] = useState(todayInfo.tanggal);
  const [formJam, setFormJam] = useState('22:00 - 04:00 WIB');
  const [formLokasi, setFormLokasi] = useState('Pos Kamling Gerbang Utama');
  const [formCatatan, setFormCatatan] = useState('Bawa senter & HT siaga pos');

  // 6 Petugas form states
  const [p1Nama, setP1Nama] = useState('');
  const [p1Blok, setP1Blok] = useState('E2/17');
  const [p1Wa, setP1Wa] = useState('');

  const [p2Nama, setP2Nama] = useState('');
  const [p2Blok, setP2Blok] = useState('E4/05');

  const [p3Nama, setP3Nama] = useState('');
  const [p3Blok, setP3Blok] = useState('D11/12');

  const [p4Nama, setP4Nama] = useState('');
  const [p4Blok, setP4Blok] = useState('E9/19');

  const [p5Nama, setP5Nama] = useState('');
  const [p5Blok, setP5Blok] = useState('E1/02');

  const [p6Nama, setP6Nama] = useState('');
  const [p6Blok, setP6Blok] = useState('E3/08');

  // Active selected schedule
  const activeRonda =
    rondaList.find((r) => r.id === selectedRondaId) ||
    rondaList[0] || {
      id: 'RND-DEFAULT',
      hari: todayInfo.hari,
      tanggal: todayInfo.tanggal,
      jamOperasional: '22:00 - 04:00 WIB',
      lokasiPos: 'Pos Kamling Gerbang Utama',
      statusPublikasi: 'PUBLISHED' as const,
      catatan: 'Patroli keliling setiap 1 jam sekali',
      petugas: [
        { slot: 1, namaLengkap: 'Roland Fitzgerald Kerong', blokRumah: 'Blok E2 / 7', isKoordinator: true, noWhatsapp: '081288990011' },
        { slot: 2, namaLengkap: 'Darisman', blokRumah: 'Blok E4 / 05', isKoordinator: false },
        { slot: 3, namaLengkap: 'Lois Elyhart Tirbola', blokRumah: 'Blok D11 / 12', isKoordinator: false },
        { slot: 4, namaLengkap: 'Muhammad Hasby Assid', blokRumah: 'Blok E9 / 19', isKoordinator: false },
        { slot: 5, namaLengkap: 'Hendro Wijaya', blokRumah: 'Blok E1 / 02', isKoordinator: false },
        { slot: 6, namaLengkap: 'Slamet Riyadi', blokRumah: 'Blok E3 / 08', isKoordinator: false },
      ],
    };

  const koordinator = activeRonda.petugas.find((p) => p.isKoordinator) || activeRonda.petugas[0];

  // Tugas per slot
  const slotRoles = [
    {
      title: 'Koordinator Regu & Komando',
      desc: 'Penanggung jawab pos & koordinasi darurat warga',
      badge: 'Koordinator Utama',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold',
    },
    {
      title: 'Penjagaan Portal Gerbang Utama',
      desc: 'Pemeriksaan tamu malam & keamanan portal masuk',
      badge: 'Portal Masuk',
      badgeBg: 'bg-sky-50 text-sky-800 border-sky-200 font-bold',
    },
    {
      title: 'Patroli Keliling Blok A & B',
      desc: 'Ronda berkala lorong pemukiman blok barat',
      badge: 'Patroli Barat',
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
    },
    {
      title: 'Patroli Keliling Blok C & D',
      desc: 'Ronda berkala lorong pemukiman blok tengah',
      badge: 'Patroli Tengah',
      badgeBg: 'bg-purple-50 text-purple-800 border-purple-200 font-bold',
    },
    {
      title: 'Patroli Keliling Blok E & F',
      desc: 'Ronda berkala lorong pemukiman blok timur',
      badge: 'Patroli Timur',
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
    },
    {
      title: 'Kontrol Penerangan & Saklar PJU',
      desc: 'Pengecekan lampu jalan & siaga pos induk',
      badge: 'Kontrol Fasum',
      badgeBg: 'bg-teal-50 text-teal-800 border-teal-200 font-bold',
    },
  ];

  // Smart Search: Cek apakah pencarian cocok dengan petugas di seluruh jadwal
  const searchResults = search.trim()
    ? rondaList.flatMap((ronda) =>
        ronda.petugas
          .filter(
            (p) =>
              p.namaLengkap.toLowerCase().includes(search.toLowerCase()) ||
              p.blokRumah.toLowerCase().includes(search.toLowerCase())
          )
          .map((p) => ({
            petugas: p,
            ronda,
          }))
      )
    : [];

  const handleOpenAddModal = () => {
    setEditingRondaId(null);
    setFormRawDate(todayInfo.rawIso);
    setFormHari(todayInfo.hari);
    setFormTanggal(todayInfo.tanggal);
    setFormJam('22:00 - 04:00 WIB');
    setFormLokasi('Pos Kamling Gerbang Utama');
    setFormCatatan('Bawa senter & HT siaga pos');

    setP1Nama('');
    setP1Blok('E2/17');
    setP1Wa('');

    setP2Nama('');
    setP2Blok('E4/05');

    setP3Nama('');
    setP3Blok('D11/12');

    setP4Nama('');
    setP4Blok('E9/19');

    setP5Nama('');
    setP5Blok('E1/02');

    setP6Nama('');
    setP6Blok('E3/08');

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ronda: RondaWithStatus) => {
    setEditingRondaId(ronda.id);
    setFormHari(ronda.hari);
    setFormTanggal(ronda.tanggal);
    setFormJam(ronda.jamOperasional);
    setFormLokasi(ronda.lokasiPos);
    setFormCatatan(ronda.catatan || '');

    const p = ronda.petugas;
    setP1Nama(p[0]?.namaLengkap || '');
    setP1Blok(p[0]?.blokRumah || '');
    setP1Wa(p[0]?.noWhatsapp || '');

    setP2Nama(p[1]?.namaLengkap || '');
    setP2Blok(p[1]?.blokRumah || '');

    setP3Nama(p[2]?.namaLengkap || '');
    setP3Blok(p[2]?.blokRumah || '');

    setP4Nama(p[3]?.namaLengkap || '');
    setP4Blok(p[3]?.blokRumah || '');

    setP5Nama(p[4]?.namaLengkap || '');
    setP5Blok(p[4]?.blokRumah || '');

    setP6Nama(p[5]?.namaLengkap || '');
    setP6Blok(p[5]?.blokRumah || '');

    setIsModalOpen(true);
  };

  const handleSaveRonda = (status: 'PUBLISHED' | 'DRAFT') => {
    const newPetugas: [PetugasSlot, PetugasSlot, PetugasSlot, PetugasSlot, PetugasSlot, PetugasSlot] = [
      { slot: 1, namaLengkap: p1Nama || 'Petugas 1', blokRumah: p1Blok, isKoordinator: true, noWhatsapp: p1Wa },
      { slot: 2, namaLengkap: p2Nama || 'Petugas 2', blokRumah: p2Blok, isKoordinator: false },
      { slot: 3, namaLengkap: p3Nama || 'Petugas 3', blokRumah: p3Blok, isKoordinator: false },
      { slot: 4, namaLengkap: p4Nama || 'Petugas 4', blokRumah: p4Blok, isKoordinator: false },
      { slot: 5, namaLengkap: p5Nama || 'Petugas 5', blokRumah: p5Blok, isKoordinator: false },
      { slot: 6, namaLengkap: p6Nama || 'Petugas 6', blokRumah: p6Blok, isKoordinator: false },
    ];

    if (editingRondaId && onUpdateRonda) {
      onUpdateRonda({
        id: editingRondaId,
        hari: formHari,
        tanggal: formTanggal,
        jamOperasional: formJam,
        lokasiPos: formLokasi,
        statusPublikasi: status,
        catatan: formCatatan,
        petugas: newPetugas,
      });
    } else {
      onAddRonda({
        id: `RND-${Date.now()}`,
        hari: formHari,
        tanggal: formTanggal,
        jamOperasional: formJam,
        lokasiPos: formLokasi,
        statusPublikasi: status,
        catatan: formCatatan,
        petugas: newPetugas,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="w-full mb-10 select-none space-y-6">
      {/* ======================================================== */}
      {/* 1. HEADER UTAMA: BERSIH & RAMAH                          */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Siskamling Warga RT 08</span>
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rotasi 6 Warga / Malam</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Jadwal Ronda Malam
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-xl">
            Cek tanggal giliran jaga siskamling Anda, rute patroli keamanan komplek, dan kontak koordinator regu malam ini.
          </p>
        </div>

        {/* Right Action: Search Box & Admin Add */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama Anda atau blok rumah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {isAdmin && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Atur Jadwal Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HASIL PENCARIAN PERSONAL (SMART SEARCH JADWAL SAYA)  */}
      {/* ======================================================== */}
      {search.trim() && (
        <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-3xl p-5 sm:p-6 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 mb-3 text-sm">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>Hasil Pencarian Jadwal untuk "{search}":</span>
          </div>

          {searchResults.length === 0 ? (
            <p className="text-xs text-slate-600 font-medium">
              Nama atau blok <strong>"{search}"</strong> tidak ditemukan dalam jadwal ronda aktif. Silakan pastikan ejaan nama atau nomor blok sesuai data RT.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedRondaId(res.ronda.id)}
                  className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 border border-emerald-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer shadow-xs transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                      {res.petugas.slot}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {res.petugas.namaLengkap} ({res.petugas.blokRumah})
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                        🗓️ {res.ronda.hari}, {res.ronda.tanggal} • {res.ronda.jamOperasional}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 whitespace-nowrap">
                    Buka Jadwal →
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. PILIHAN HARI / TANGGAL JADWAL (SUPER USER FRIENDLY)   */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Pilih Jadwal Tanggal Ronda:</span>
          </span>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Klik hari untuk melihat rincian regu ronda
          </span>
        </div>
        {/* Tab Cards for Each Available Ronda in Database */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {rondaList.map((ronda, idx) => {
            const isSelected = ronda.id === activeRonda.id;
            const isToday =
              ronda.id === 'RND-TODAY' ||
              ronda.tanggal.toLowerCase().includes(todayInfo.tanggal.toLowerCase());
            const isTomorrow =
              ronda.id === 'RND-TOMORROW' ||
              ronda.tanggal.toLowerCase().includes(tomorrowInfo.tanggal.toLowerCase());

            return (
              <button
                key={ronda.id}
                onClick={() => setSelectedRondaId(ronda.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 ring-2 ring-blue-500/30'
                    : isToday
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white hover:bg-blue-100/70'
                    : 'bg-slate-50/70 dark:bg-[#1E293B]/70 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100/80 hover:border-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : isToday
                      ? 'bg-emerald-200 text-emerald-950 font-black'
                      : isTomorrow
                      ? 'bg-sky-100 text-sky-800 font-bold'
                      : 'bg-slate-200 text-slate-700'
                  }`}>
                    {isToday ? 'Malam Ini' : isTomorrow ? 'Besok Malam' : `Jadwal ${idx + 1}`}
                  </span>
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                    6 Petugas
                  </span>
                </div>

                <div>
                  <h4 className={`text-sm font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {ronda.hari}
                  </h4>
                  <p className={`text-xs font-medium mt-0.5 ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {ronda.tanggal}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. SOROTAN JADWAL TERPILIH (HERO SCHEDULE DISPLAY)      */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div className="p-5 sm:p-7 rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-blue-800/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xl">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold shadow-xs">
                <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                <span>Regu Siskamling Aktif</span>
              </span>
              <span className="text-xs text-blue-200/80 font-medium px-2.5 py-0.5 rounded-full bg-white/10">
                ⏰ {activeRonda.jamOperasional}
              </span>
            </div>

            <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white font-heading">
              {activeRonda.hari}, {activeRonda.tanggal}
            </h3>

            <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span>Pos Jaga: <strong className="text-white">{activeRonda.lokasiPos}</strong></span>
              {activeRonda.catatan && (
                <span className="hidden sm:inline text-slate-400">• {activeRonda.catatan}</span>
              )}
            </p>
          </div>
          {/* Quick Actions: Share WA & Admin Edit/Delete */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                `*JADWAL SISKAMLING PESONA KAHURIPAN 8 TAHAP 2 (RT 08)*\n\n` +
                  `🗓️ *Hari/Tanggal:* ${activeRonda.hari}, ${activeRonda.tanggal}\n` +
                  `⏰ *Waktu:* ${activeRonda.jamOperasional}\n` +
                  `📍 *Pos Jaga:* ${activeRonda.lokasiPos}\n` +
                  `💡 *Catatan:* ${activeRonda.catatan || 'Siaga patroli berkala'}\n\n` +
                  `*Daftar 6 Petugas Jaga Malam:*\n` +
                  activeRonda.petugas
                    .map((p) => `${p.slot}. ${p.namaLengkap} (${p.blokRumah}) ${p.isKoordinator ? '⭐ [Koordinator Utama]' : ''}`)
                    .join('\n') +
                  `\n\n_Mohon hadir tepat waktu demi keamanan komplek bersama. Terima kasih!_`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Bagikan ke Grup WA</span>
            </a>

            <button
              type="button"
              onClick={() => {
                setSwapRequester(activeRonda.petugas[0]?.namaLengkap || '');
                setSwapTargetDate('Besok');
                setSwapReason('Ada keperluan mendadak');
                setIsSwapModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-300" />
              <span>Ajukan Tukar Jadwal</span>
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => handleOpenEditModal(activeRonda)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
                  title="Edit Jadwal Ini"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                {onDeleteRonda && (
                  <button
                    onClick={() => setRondaToDelete(activeRonda)}
                    className="p-2.5 rounded-full bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition-colors border border-rose-400/30"
                    title="Hapus Jadwal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {/* ======================================================== */}
        {/* 5. GRID 6 PETUGAS JAGA (BERSIH, LEGA, RAMAH PENGGUNA)   */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Daftar 6 Petugas Jaga Malam Ini:</span>
            </h4>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Rotasi Penugasan Lengkap
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeRonda.petugas.map((petugas, index) => {
              const role = slotRoles[index % slotRoles.length];
              const isP1 = petugas.isKoordinator || index === 0;

              return (
                <div
                  key={petugas.slot}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3.5 hover:shadow-md hover:-translate-y-0.5 ${
                    isP1
                      ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300/90 dark:border-amber-700/60 shadow-xs'
                      : 'bg-white dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {/* Top Bar: Nomor Slot & Status Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs text-white ${
                        isP1 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                      }`}>
                        #{petugas.slot}
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                        {isP1 ? 'Koordinator Utama' : `Petugas ${petugas.slot}`}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Siaga</span>
                    </span>
                  </div>

                  {/* Body: Nama & Blok Rumah */}
                  <div>
                    <h5 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                      {petugas.namaLengkap}
                    </h5>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
                        <Home className="w-3 h-3 text-blue-500" />
                        <span>{petugas.blokRumah}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">• RT 08</span>
                    </div>
                  </div>

                  {/* Bottom: Rincian Rute Tugas */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    <strong className="text-slate-800 dark:text-slate-200 block mb-0.5 font-bold">{role.title}</strong>
                    <span>{role.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* 6. PANDUAN PRAKTIS & SOP SISKAMLING BAGI WARGA           */}
        {/* ======================================================== */}
        <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#1E293B]/60 border border-slate-200 dark:border-slate-700 space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
            <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span>Panduan &amp; Tata Tertib Siskamling bagi Warga:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1.5" />
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">1. Hadir Tepat Waktu</span>
              <span>Tiba di pos kamling 15 menit sebelum jam 22:00 WIB untuk presensi.</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-1.5" />
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">2. Bawa Perlengkapan</span>
              <span>Bawa senter penerangan, jaket hangat, dan jas hujan jika cuaca mendung.</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <Navigation className="w-4 h-4 text-sky-600 dark:text-sky-400 mb-1.5" />
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">3. Patroli Berkala</span>
              <span>Keliling lorong komplek berdua setiap 60 menit dan cek portal timur.</span>
            </div>
            <div className="p-3.5 bg-white dark:bg-[#111827] rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <Phone className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-1.5" />
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">4. Tukar Jadwal</span>
              <span>Jika berhalangan, wajib konfirmasi ke Koordinator H-1 untuk tukar regu.</span>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL EDIT / TAMBAH JADWAL RONDA (KHUSUS ADMIN)          */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRondaId ? 'Edit Jadwal Ronda Malam' : 'Tambah & Atur Jadwal Ronda Baru'}
        subtitle="Kelola giliran 6 petugas ronda siskamling lingkungan RT 08"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* Custom Date Picker */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <CustomDatePicker
              label="Pilih Tanggal Pelaksanaan"
              required
              valueIso={formRawDate}
              onChange={(iso, dayName, formatted) => {
                setFormRawDate(iso);
                setFormHari(dayName);
                setFormTanggal(formatted);
              }}
            />
          </div>

          {/* Time Preset Picker */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <TimePresetPicker
              label="Jam Operasional Jaga"
              value={formJam}
              onChange={(val) => setFormJam(val)}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Lokasi Pos Ronda
            </label>
            <input
              type="text"
              value={formLokasi}
              onChange={(e) => setFormLokasi(e.target.value)}
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 h-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-900 mb-1">
              Catatan Operasional Ronda
            </label>
            <input
              type="text"
              value={formCatatan}
              onChange={(e) => setFormCatatan(e.target.value)}
              placeholder="Contoh: Bawa senter & cek portal timur..."
              className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 h-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 6 Slot Petugas Penugasan */}
          <div className="pt-2">
            <p className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-[11px]">
              6 Slot Petugas Ronda:
            </p>

            <div className="space-y-2.5">
              {/* Slot 1 (Koordinator) */}
              <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-amber-950 mb-1">
                    Slot 1: Koordinator Utama Regu Malam *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Koordinator"
                    value={p1Nama}
                    onChange={(e) => setP1Nama(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-950 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="E2/17"
                    value={p1Blok}
                    onChange={(e) => setP1Blok(e.target.value)}
                    className="w-full text-xs font-bold text-slate-900 bg-white border border-amber-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot 2 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Slot 2: Petugas Portal Gerbang
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Petugas 2"
                    value={p2Nama}
                    onChange={(e) => setP2Nama(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="E4/05"
                    value={p2Blok}
                    onChange={(e) => setP2Blok(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot 3 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Slot 3: Petugas Patroli Barat (Blok A-B)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Petugas 3"
                    value={p3Nama}
                    onChange={(e) => setP3Nama(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="D11/12"
                    value={p3Blok}
                    onChange={(e) => setP3Blok(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot 4 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Slot 4: Petugas Patroli Tengah (Blok C-D)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Petugas 4"
                    value={p4Nama}
                    onChange={(e) => setP4Nama(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="E9/19"
                    value={p4Blok}
                    onChange={(e) => setP4Blok(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot 5 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Slot 5: Petugas Patroli Timur (Blok E-F)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Petugas 5"
                    value={p5Nama}
                    onChange={(e) => setP5Nama(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="E1/02"
                    value={p5Blok}
                    onChange={(e) => setP5Blok(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Slot 6 */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Slot 6: Petugas Kontrol PJU &amp; Fasum
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Petugas 6"
                    value={p6Nama}
                    onChange={(e) => setP6Nama(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Blok Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="E3/08"
                    value={p6Blok}
                    onChange={(e) => setP6Blok(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => handleSaveRonda('DRAFT')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors"
            >
              Simpan Draft
            </button>
            <button
              type="button"
              onClick={() => handleSaveRonda('PUBLISHED')}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-md transition-all active:scale-95"
            >
              Terbitkan Jadwal
            </button>
          </div>
        </div>
      </Modal>

      {/* MODAL KONFIRMASI HAPUS JADWAL */}
      {rondaToDelete && (
        <ConfirmDeleteModal
          isOpen={!!rondaToDelete}
          onClose={() => setRondaToDelete(null)}
          onConfirm={() => {
            if (onDeleteRonda) onDeleteRonda(rondaToDelete.id);
            setRondaToDelete(null);
          }}
          title="Hapus Jadwal Ronda"
          description={`Apakah Anda yakin ingin menghapus jadwal ronda ${rondaToDelete.hari}, ${rondaToDelete.tanggal}?`}
          itemName={`Jadwal ${rondaToDelete.hari}`}
        />
      )}

      {/* MODAL PENGAJUAN TUKAR JADWAL RONDA INTERAKTIF */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSwapModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-7 max-w-md w-full z-10 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h4 className="text-base font-extrabold">Ajukan Tukar Jadwal Ronda</h4>
              </div>
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Anda (Petugas Terjadwal):
                </label>
                <input
                  type="text"
                  value={swapRequester}
                  onChange={(e) => setSwapRequester(e.target.value)}
                  placeholder="Ketik nama Anda..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ingin Bertukar dengan Jadwal Hari Apa:
                </label>
                <input
                  type="text"
                  value={swapTargetDate}
                  onChange={(e) => setSwapTargetDate(e.target.value)}
                  placeholder="Contoh: Malam Rabu / Pekan Depan"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alasan Berhalangan:
                </label>
                <input
                  type="text"
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Contoh: Tugas luar kota / ada hajatan keluarga"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5"
                />
              </div>

              <div className="p-3 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                💡 Tekan tombol di bawah untuk langsung menyalin permohonan tukar jadwal yang sopan ke grup WhatsApp RT 08.
              </div>

              <button
                type="button"
                onClick={() => {
                  const text = `Assalamu'alaikum wr. wb. Bapak-bapak warga RT 08 Pesona Kahuripan 8,\n\nMohon izin, saya *${swapRequester || 'Warga'}* terjadwal ronda malam ini (*${activeRonda.hari}, ${activeRonda.tanggal}*).\n\nDikarenakan *${swapReason || 'ada keperluan mendadak'}*, apakah ada bapak warga yang berkenan bertukar jadwal dengan saya ke *${swapTargetDate || 'hari lain'}*?\n\nTerima kasih banyak atas pengertiannya. 🙏`;
                  navigator.clipboard.writeText(text);
                  setCopiedSwap(true);
                  setTimeout(() => setCopiedSwap(false), 2000);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md transition-all active:scale-95 mt-2"
              >
                {copiedSwap ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Pesan Permohonan Berhasil Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Pesan Permohonan WhatsApp</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
