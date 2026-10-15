import React, { useState, useEffect } from 'react';
import { PillBadge, Modal } from '@sim-warga/ui';
import { ProgramUrunanRecord, ItemUrunanWarga, TipeUrunan } from '@sim-warga/types';
import {
  Lightbulb,
  Search,
  Plus,
  Share2,
  Copy,
  Check,
  Users,
  Star,
  Banknote,
  CreditCard,
  ClipboardPaste,
  Trash2,
  CheckCircle2,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { RupiahInput } from '../common/RupiahInput';
import { CustomSelect } from '../common/CustomSelect';

export interface UrunanProgramCardProps {
  program: ProgramUrunanRecord;
  urunanList: ItemUrunanWarga[];
  isAdmin: boolean;
  onAddUrunan: (item: ItemUrunanWarga) => void;
  onDeleteUrunan?: (id: string) => void;
  onImportBulk?: (items: ItemUrunanWarga[]) => void;
}

export const UrunanProgramCard: React.FC<UrunanProgramCardProps> = ({
  program,
  urunanList,
  isAdmin,
  onAddUrunan,
  onDeleteUrunan,
  onImportBulk,
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DONATUR' | 'URUNAN_WAJIB' | 'TF' | 'CASH'>('ALL');
  const [copiedWa, setCopiedWa] = useState(false);

  // Modal Add Form
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const [inputNama, setInputNama] = useState('');
  const [inputTipe, setInputTipe] = useState<TipeUrunan>('URUNAN_WAJIB');
  const [inputNominal, setInputNominal] = useState<number>(program.tarifWajibPerWarga);
  const [inputMetode, setInputMetode] = useState<'TF' | 'Cash'>('TF');
  const [inputKeterangan, setInputKeterangan] = useState('');

  // Modal Smart WhatsApp Import
  const [isModalImportOpen, setIsModalImportOpen] = useState(false);
  const [pastedWaText, setPastedWaText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<ItemUrunanWarga[]>([]);

  // Perhitungan Data Real-Time
  const donaturItems = urunanList.filter((item) => item.tipe === 'DONATUR');
  const wajibItems = urunanList.filter((item) => item.tipe === 'URUNAN_WAJIB');

  const totalDonaturNominal = donaturItems.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalWajibNominal = wajibItems.reduce((acc, curr) => acc + curr.nominal, 0);
  const totalDanaTerkumpul = totalDonaturNominal + totalWajibNominal;

  // Helper normalisasi metode: hanya TF atau Cash
  const getCleanMetode = (metodeRaw?: string): 'TF' | 'Cash' => {
    const m = (metodeRaw || '').toLowerCase();
    return m.includes('cash') || m.includes('tunai') ? 'Cash' : 'TF';
  };

  const tfCount = urunanList.filter((i) => getCleanMetode(i.metode) === 'TF').length;
  const cashCount = urunanList.filter((i) => getCleanMetode(i.metode) === 'Cash').length;

  // Filter List
  const filteredList = urunanList.filter((item) => {
    const matchSearch =
      !search.trim() ||
      item.namaWarga.toLowerCase().includes(search.toLowerCase()) ||
      (item.keterangan || '').toLowerCase().includes(search.toLowerCase());

    const itemMetode = getCleanMetode(item.metode);

    let matchType = true;
    if (filterType === 'DONATUR') matchType = item.tipe === 'DONATUR';
    if (filterType === 'URUNAN_WAJIB') matchType = item.tipe === 'URUNAN_WAJIB';
    if (filterType === 'TF') matchType = itemMetode === 'TF';
    if (filterType === 'CASH') matchType = itemMetode === 'Cash';
    return matchSearch && matchType;
  });

  // Pagination State (Default 10 baris per halaman)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredList.slice(startIndex, startIndex + pageSize);
  // Handler Submit Tambah Manual
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputNama.trim() || inputNominal <= 0) return;

    const newItem: ItemUrunanWarga = {
      id: `URN-${Date.now()}`,
      noUrut: urunanList.length + 1,
      programId: program.id,
      tipe: inputTipe,
      namaWarga: inputNama.trim(),
      nominal: inputNominal,
      metode: inputMetode,
      keterangan: inputKeterangan.trim() || (inputMetode === 'Cash' ? 'Cash' : undefined),
    };

    onAddUrunan(newItem);
    setIsModalAddOpen(false);
    setInputNama('');
    setInputKeterangan('');
  };

  // Handler Salin Format Pesan WhatsApp
  const handleCopyWhatsAppFormat = () => {
    let text = `Berikut Dana urunan wajib & donatur yg sudah masuk ke rekening :\n`;
    text += `*Untuk keperluan ${program.namaProgram.toLowerCase()}*\n\n`;

    text += `*Donatur* ( Min Rp.200.000 )\n`;
    donaturItems.forEach((d, idx) => {
      text += `${idx + 1}. ${d.namaWarga.padEnd(20, ' ')} Rp.${d.nominal.toLocaleString('id-ID')}\n`;
    });

    text += `\n*urunan wajib* ( Rp.${program.tarifWajibPerWarga.toLocaleString('id-ID')} )\n`;
    wajibItems.forEach((w, idx) => {
      const isCash = getCleanMetode(w.metode) === 'Cash';
      const ketStr = isCash ? ' ( cash )' : w.keterangan ? ` ( ${w.keterangan} )` : '';
      text += `${idx + 1}. ${w.namaWarga.padEnd(25, ' ')} ${w.nominal ? w.nominal.toLocaleString('id-ID') : '115.000'}${ketStr}\n`;
    });

    text += `\n--------------------------------------------\n`;
    text += `*Total Donatur:* Rp ${totalDonaturNominal.toLocaleString('id-ID')} (${donaturItems.length} orang)\n`;
    text += `*Total Urunan Wajib:* Rp ${totalWajibNominal.toLocaleString('id-ID')} (${wajibItems.length} warga)\n`;
    text += `*TOTAL DANA TERKUMPUL:* Rp ${totalDanaTerkumpul.toLocaleString('id-ID')}\n`;
    text += `*Jumlah Warga/Donatur Tercatat:* ${urunanList.length} Penyetor\n\n`;
    text += `\nTerima kasih banyak atas partisipasi bapak/ibu warga RT 08.`;

    navigator.clipboard.writeText(text);
    setCopiedWa(true);
    setTimeout(() => setCopiedWa(false), 2500);
  };

  // Smart WhatsApp Parser: Mengubah teks WA menjadi data bersih (metode TF vs Cash)
  const handleParseWhatsAppText = () => {
    if (!pastedWaText.trim()) return;

    const lines = pastedWaText.split('\n');
    let currentMode: TipeUrunan = 'URUNAN_WAJIB';
    const parsed: ItemUrunanWarga[] = [];
    let count = 1;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.toLowerCase().includes('donatur')) {
        currentMode = 'DONATUR';
        continue;
      }
      if (line.toLowerCase().includes('urunan wajib') || line.toLowerCase().includes('urunan')) {
        currentMode = 'URUNAN_WAJIB';
        continue;
      }

      // Regex matching: "1. Nama Warga 115.000 ( cash )"
      const match = line.match(/^(\d+)[\.\)]\s*(.+?)(?:\s+(?:Rp\.?|\b)?\s*([\d\.,]{4,}))?(?:\s*\((.*?)\))?$/i);
      if (match) {
        const rawNama = match[2].trim();
        const rawNominal = match[3] ? match[3].replace(/[^\d]/g, '') : '';
        const nominal = rawNominal ? parseInt(rawNominal, 10) : (currentMode === 'DONATUR' ? 200000 : 115000);
        const ket = match[4] ? match[4].trim() : '';
        const isCash = ket.toLowerCase().includes('cash') || line.toLowerCase().includes('cash');

        parsed.push({
          id: `IMP-${Date.now()}-${count}`,
          noUrut: count++,
          programId: program.id,
          tipe: currentMode,
          namaWarga: rawNama,
          nominal,
          metode: isCash ? 'Cash' : 'TF',
          keterangan: ket,
        });
      }
    }

    setParsedPreview(parsed);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length > 0 && onImportBulk) {
      onImportBulk(parsedPreview);
      setIsModalImportOpen(false);
      setPastedWaText('');
      setParsedPreview([]);
    }
  };

  return (
    <div className="w-full mb-10 select-none space-y-6">
      {/* ======================================================== */}
      {/* 1. MASTER HEADER: TITLE, BADGE, & QUICK ACTION BUTTONS   */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 transition-colors">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-bold">
              <Lightbulb className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Program Khusus RT 08</span>
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {program.status === 'AKTIF' ? '🟢 Sedang Berjalan' : 'Selesai'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {program.namaProgram}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 max-w-2xl leading-relaxed">
            {program.tujuan}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
          {/* Copy WhatsApp Format Button */}
          <button
            onClick={handleCopyWhatsAppFormat}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-xs shadow-xs transition-all active:scale-95 ${
              copiedWa
                ? 'bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Salin rekap teks rapi untuk dibagikan ke grup WhatsApp warga"
          >
            {copiedWa ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Format WA Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Salin Format WA (1-Klik)</span>
              </>
            )}
          </button>

          {/* Add Entry Button */}
          <button
            onClick={() => {
              setInputTipe('URUNAN_WAJIB');
              setInputNominal(program.tarifWajibPerWarga);
              setIsModalAddOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Urunan</span>
          </button>

          {/* Smart WhatsApp Import (Admin) */}
          {isAdmin && (
            <button
              onClick={() => setIsModalImportOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all shadow-2xs"
              title="Tempel teks chat WhatsApp langsung untuk otomatis masuk ke sistem"
            >
              <ClipboardPaste className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>Tempel Teks WA</span>
            </button>
          )}
        </div>
      </div>

      {/* 1.5. PROGRESS FISIK PEMASANGAN LAMPU JALAN */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-xs">
            <Lightbulb className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 dark:text-white">Progres Fisik Pemasangan Lampu Jalan</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Tahap 2 Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sebanyak <strong>22 dari 30 titik tiang lampu</strong> telah sukses dipasang dan menyala di Blok A s/d F.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64 flex-shrink-0">
          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Pemasangan Tiang</span>
            <span className="text-amber-600 dark:text-amber-400 font-mono">73% (22/30 Titik)</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-700">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 shadow-sm" style={{ width: '73%' }} />
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. THREE BALANCED OVERVIEW CARDS (CLEAN & MINIMALIST)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Realisasi Pengumpulan Dana */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Dana Terkumpul
              </span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-mono">
                {urunanList.length} Penyetor
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
              Rp {totalDanaTerkumpul.toLocaleString('id-ID')}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Pengumpulan dana gotong royong warga &amp; donatur untuk instalasi lampu jalan komplek.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Peruntukan: PJU Blok A s/d Z</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              100% Transparan Dicatat
            </span>
          </div>
        </div>

        {/* Card 2: Partisipasi Donatur & Warga */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Partisipasi Warga
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {urunanList.length} Total Penyetor
              </span>
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-amber-950 dark:text-amber-200">Donatur Sukarela:</span>
                </div>
                <span className="text-xs font-black text-amber-950 dark:text-white font-mono">
                  {donaturItems.length} Orang (Rp {totalDonaturNominal.toLocaleString('id-ID')})
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">Urunan Wajib:</span>
                </div>
                <span className="text-xs font-black text-emerald-950 dark:text-white font-mono">
                  {wajibItems.length} Warga (Rp {totalWajibNominal.toLocaleString('id-ID')})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Tarif Wajib: <strong className="text-slate-800 dark:text-slate-200">Rp {program.tarifWajibPerWarga.toLocaleString('id-ID')} / KK</strong>
          </div>
        </div>

        {/* Card 3: Rekap Metode Pembayaran (TF vs Cash Sederhana) */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Metode Penyetoran
              </span>
              <span className="text-xs font-bold text-slate-400">Kas Bendahara</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-center">
                <span className="inline-block text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-600 text-white mb-1">
                  Transfer
                </span>
                <span className="text-2xl font-black text-sky-950 dark:text-white font-mono block">
                  {tfCount}
                </span>
                <span className="text-[11px] text-sky-700 dark:text-sky-300 font-medium block mt-0.5">
                  Transfer Bank
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-center">
                <span className="inline-block text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-600 text-white mb-1">
                  Tunai
                </span>
                <span className="text-2xl font-black text-amber-950 dark:text-white font-mono block">
                  {cashCount}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-medium block mt-0.5">
                  Tunai Langsung
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            Rekening: <strong className="text-slate-800 dark:text-slate-200">{program.rekeningTujuan || 'BCA 8820192839 a.n. Kas Paguyuban PK8'}</strong>
          </div>
        </div>
      </div>
      {/* ======================================================== */}
      {/* 3. TABEL DATA REKAPITULASI DENGAN METODE 'TF' & 'CASH'   */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              Daftar Penyetor Dana Urunan &amp; Donatur
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pencarian instan nama donatur dan warga yang telah menyetor
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 self-start sm:self-center">
            Total {filteredList.length} dari {urunanList.length} Baris Data
          </span>
        </div>
        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama warga / donatur (misal: Abdul Manan, Untung, Teguh)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: `Semua (${urunanList.length})` },
              { id: 'DONATUR', label: `⭐ Donatur (${donaturItems.length})` },
              { id: 'URUNAN_WAJIB', label: `Wajib (${wajibItems.length})` },
              { id: 'TF', label: `Transfer Bank (${tfCount})` },
              { id: 'CASH', label: `Tunai (${cashCount})` },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterType(p.id as typeof filterType)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-bold transition-all whitespace-nowrap ${
                  filterType === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table: Clean, Clear Columns, No Long Text Wrapping */}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E293B] border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-14 text-center whitespace-nowrap">No.</th>
                <th className="py-3 px-4 min-w-[200px]">Nama Warga / Donatur</th>
                <th className="py-3 px-4 w-36 whitespace-nowrap">Kategori</th>
                <th className="py-3 px-4 w-36 whitespace-nowrap">Nominal (Rp)</th>
                <th className="py-3 px-4 w-24 text-center whitespace-nowrap">Metode</th>
                <th className="py-3 px-4 min-w-[150px]">Keterangan</th>
                {isAdmin && <th className="py-3 px-4 w-16 text-center whitespace-nowrap">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#111827]">
              {paginatedList.map((item, idx) => {
                const isDonatur = item.tipe === 'DONATUR';
                const isCash = getCleanMetode(item.metode) === 'Cash';
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-center font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {startIndex + idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {item.namaWarga}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isDonatur ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          <Star className="w-3 h-3 fill-amber-600 text-amber-600" />
                          <span>Donatur Sukarela</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <span>Urunan Wajib</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-black font-mono text-xs sm:text-sm text-slate-900 dark:text-white whitespace-nowrap">
                      Rp {item.nominal.toLocaleString('id-ID')}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {/* TAMPILAN METODE LENGKAP TANPA SINGKATAN */}
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-black tracking-wide ${
                        isCash
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-sky-50 text-sky-800 border border-sky-200'
                      }`}>
                        {isCash ? 'Tunai' : 'Transfer Bank'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {item.keterangan || '-'}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {onDeleteUrunan && (
                          <button
                            onClick={() => onDeleteUrunan(item.id)}
                            className="p-1.5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus data ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredList.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs font-medium bg-white dark:bg-[#111827]">
              Tidak ada data urunan yang cocok dengan pencarian "{search}".
            </div>
          )}
        </div>

        {/* Kontrol Navigasi Halaman (Pagination Bar) */}
        {filteredList.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <span>
                Menampilkan <strong>{startIndex + 1}</strong> - <strong>{Math.min(startIndex + pageSize, filteredList.length)}</strong> dari <strong>{filteredList.length}</strong> data
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <span>Baris:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-700 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Tombol Halaman */}
            <div className="flex items-center gap-1 self-center sm:self-auto">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>

              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((p, pIdx, arr) => {
                    const prevP = arr[pIdx - 1];
                    const showEllipsis = prevP && p - prevP > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            currentPage === p
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: CATAT URUNAN BARU (METODE TF / CASH)            */}
      {/* ======================================================== */}
      <Modal
        isOpen={isModalAddOpen}
        onClose={() => setIsModalAddOpen(false)}
        title="Catat Pembayaran Urunan / Donatur Baru"
        subtitle={`Program: ${program.namaProgram}`}
        maxWidth="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Nama Lengkap Warga / Donatur *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Bapak Abdul Manan / Dapur Mak Ivo"
              value={inputNama}
              onChange={(e) => setInputNama(e.target.value)}
              className="w-full text-xs sm:text-sm font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <CustomSelect
                label="Kategori Urunan"
                required
                value={inputTipe}
                onChange={(val) => {
                  const t = val as TipeUrunan;
                  setInputTipe(t);
                  if (t === 'DONATUR' && inputNominal < 200000) {
                    setInputNominal(200000);
                  } else if (t === 'URUNAN_WAJIB') {
                    setInputNominal(program.tarifWajibPerWarga);
                  }
                }}
                options={[
                  { value: 'URUNAN_WAJIB', label: 'Urunan Wajib (Rp 115.000)' },
                  { value: 'DONATUR', label: '⭐ Donatur Sukarela (Min Rp 200.000)' },
                ]}
              />
            </div>

            <div>
              <CustomSelect
                label="Metode Pembayaran"
                required
                value={inputMetode}
                onChange={(val) => setInputMetode(val as 'TF' | 'Cash')}
                options={[
                  { value: 'TF', label: 'Transfer Bank' },
                  { value: 'Cash', label: 'Tunai Langsung' },
                ]}
              />
            </div>
          </div>

          <div>
            <RupiahInput
              label="Nominal Pembayaran (Rp)"
              required
              value={inputNominal}
              onChange={(val) => setInputNominal(val)}
              presets={[115000, 120000, 150000, 200000, 300000, 500000]}
              helperText="Standar urunan wajib adalah Rp 115.000 (bisa lebih bayar atau donatur sukarela)."
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Keterangan Tambahan (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Cash dititipkan ke Pak RT / Lebih bayar ikhlas"
              value={inputKeterangan}
              onChange={(e) => setInputKeterangan(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalAddOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md active:scale-95"
            >
              Simpan Data Urunan
            </button>
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: SMART WHATSAPP IMPORTER                         */}
      {/* ======================================================== */}
      {isAdmin && (
        <Modal
          isOpen={isModalImportOpen}
          onClose={() => setIsModalImportOpen(false)}
          title="Tempel Teks WhatsApp (Smart Parser)"
          subtitle="Salin dan tempel daftar chat pengumuman dari grup WhatsApp langsung ke sini"
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600 font-medium leading-relaxed">
              Sistem akan secara otomatis mendeteksi nomor urut, nama warga, nominal, dan mendeteksi metode <strong>Cash</strong> atau <strong>TF</strong>:
            </p>

            <textarea
              rows={8}
              placeholder={`Contoh teks dari grup WhatsApp:\n*Donatur*\n1. Bapak lesi Rp.200.000\n2. Bapak teguh Rp.400.000\n*urunan wajib*\n1. Dwi Saputra 115.000\n2. Bapak Untung Utami 120.000\n3. Mama anggi ( cash ) 115.000`}
              value={pastedWaText}
              onChange={(e) => setPastedWaText(e.target.value)}
              className="w-full font-mono text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <button
              type="button"
              onClick={handleParseWhatsAppText}
              disabled={!pastedWaText.trim()}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs"
            >
              🔍 Analisis &amp; Ekstrak Data dari Teks
            </button>

            {parsedPreview.length > 0 && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-900 text-xs">
                  <span>✓ Berhasil Mendeteksi {parsedPreview.length} Baris Data:</span>
                  <span>Total: Rp {parsedPreview.reduce((a, b) => a + b.nominal, 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1 text-[11px] pr-1">
                  {parsedPreview.slice(0, 10).map((p, i) => (
                    <div key={i} className="flex justify-between bg-white/70 p-1.5 rounded-lg border border-emerald-200">
                      <span>{p.noUrut}. {p.namaWarga} ({p.tipe === 'DONATUR' ? 'Donatur' : 'Wajib'})</span>
                      <span className="font-mono font-bold">
                        Rp {p.nominal.toLocaleString('id-ID')} [{p.metode}] {p.keterangan ? `(${p.keterangan})` : ''}
                      </span>
                    </div>
                  ))}
                  {parsedPreview.length > 10 && (
                    <p className="text-center text-slate-500 font-semibold pt-1">
                      ... dan {parsedPreview.length - 10} baris lainnya
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalImportOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedPreview.length === 0}
                onClick={handleConfirmImport}
                className={`px-5 py-2 rounded-xl font-bold transition-all shadow-md ${
                  parsedPreview.length > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Tambahkan {parsedPreview.length} Data ke Tabel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
