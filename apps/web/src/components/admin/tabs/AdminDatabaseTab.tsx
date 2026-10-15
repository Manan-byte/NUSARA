import React, { useState } from 'react';
import {
  Database,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Send,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  FileSpreadsheet,
  HelpCircle,
  ArrowRight,
  Info,
  X,
  Rocket,
  Users,
  CreditCard
} from 'lucide-react';
import {
  WargaRecord,
  TransaksiIPL,
  PengeluaranKasRecord,
  ItemUrunanWarga
} from '@sim-warga/types';
import {
  getSpreadsheetId,
  setSpreadsheetId,
  DEFAULT_SPREADSHEET_ID,
  getGasApiUrl,
  setGasApiUrl,
  formatPayloadForGas
} from '../../../services/apiService';
import { getGasScriptTemplate } from '../../../data/gasScriptTemplate';

export interface AdminDatabaseTabProps {
  wargaList: WargaRecord[];
  transaksiList: TransaksiIPL[];
  pengeluaranList: PengeluaranKasRecord[];
  urunanList: ItemUrunanWarga[];
  onMigrateSuccess?: () => void;
}

export const AdminDatabaseTab: React.FC<AdminDatabaseTabProps> = ({
  wargaList,
  transaksiList,
  pengeluaranList,
  urunanList,
  onMigrateSuccess
}) => {
  const currentSheetId = getSpreadsheetId();
  const currentGasUrl = getGasApiUrl();
  const isUsingDefault = currentSheetId === DEFAULT_SPREADSHEET_ID;

  // Form states
  const [targetSheetInput, setTargetSheetInput] = useState('');
  const [targetGasUrlInput, setTargetGasUrlInput] = useState('');
  const [scriptCustomId, setScriptCustomId] = useState('');

  // UI state
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedSheetId, setCopiedSheetId] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'warning';
    title?: string;
    message?: string;
  }>({ status: 'idle' });
  const [sheetCheck, setSheetCheck] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [gasCheck, setGasCheck] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [connectionVerified, setConnectionVerified] = useState<boolean>(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState<boolean>(false);

  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<string | null>(null);
  const [migrationSuccessData, setMigrationSuccessData] = useState<{
    wargaCount: number;
    iplCount: number;
    expenseCount: number;
    urunanCount: number;
  } | null>(null);

  // Helper ekstraksi ID Spreadsheet dari URL lengkap atau ID polos
  const extractSpreadsheetId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return '';
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return match[1];
    }
    return trimmed;
  };

  const cleanTargetSheetId = extractSpreadsheetId(targetSheetInput);

  // 1. Salin Script Lengkap ke Clipboard
  const handleCopyScript = () => {
    const idToUse = scriptCustomId.trim() || cleanTargetSheetId || currentSheetId;
    const scriptCode = getGasScriptTemplate(idToUse);
    navigator.clipboard.writeText(scriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  // 2. Uji Koneksi & Diagnosa AI
  const handleTestConnection = async () => {
    if (!cleanTargetSheetId) {
      alert('Mohon masukkan Link atau ID Google Sheets Baru terlebih dahulu di kolom 1.');
      return;
    }
    if (!targetGasUrlInput.trim()) {
      alert('Mohon masukkan URL Web App Google Apps Script Baru terlebih dahulu di kolom 2.');
      return;
    }

    const cleanUrl = targetGasUrlInput.trim();
    if (!cleanUrl.startsWith('https://script.google.com/macros/s/')) {
      setTestResult({
        status: 'error',
        title: 'Format URL Web App Tidak Sesuai',
        message: 'URL harus diawali dengan "https://script.google.com/macros/s/...". Pastikan Anda menyalin URL Web App yang benar.'
      });
      return;
    }

    setTestingConnection(true);
    setSheetCheck('testing');
    setGasCheck('testing');
    setConnectionVerified(false);
    setTestResult({ status: 'idle' });

    let isSheetOk = false;
    let sheetNote = '';
    let isGasOk = false;
    let gasNote = '';
    let gasTitle = '';

    // 1. PENGUJIAN NYATA: Cek Akses Google Sheets via GViz API
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${cleanTargetSheetId}/gviz/tq?tqx=out:json`;
      const gvizRes = await fetch(gvizUrl);
      const text = await gvizRes.text();
      if (text.includes('google.visualization.Query.setResponse') && (text.includes('"status":"ok"') || text.includes("'status':'ok'"))) {
        isSheetOk = true;
        sheetNote = 'Spreadsheet terhubung dan dapat dibaca secara publik (Akses Lolos).';
        setSheetCheck('ok');
      } else {
        isSheetOk = false;
        sheetNote = 'Spreadsheet terkunci (Restricted). Belum diset "Anyone with the link can view".';
        setSheetCheck('error');
      }
    } catch {
      isSheetOk = false;
      sheetNote = 'Tidak dapat menghubungi Google Sheets. Periksa kembali ID atau koneksi internet.';
      setSheetCheck('error');
    }

    // 2. PENGUJIAN NYATA: Cek Akses Google Apps Script Web App
    try {
      const gasRes = await fetch(`${cleanUrl}?action=status&t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (gasRes.ok) {
        const json = await gasRes.json();
        if (json && (json.status === 'online' || json.success === true)) {
          isGasOk = true;
          gasTitle = json.spreadsheetName || 'Spreadsheet Terhubung';
          gasNote = `Web App aktif & merespons 200 OK (Nama Sheet: "${gasTitle}").`;
          setGasCheck('ok');
        } else {
          isGasOk = false;
          gasNote = json?.error || 'Respon Google Script tidak berstatus online.';
          setGasCheck('error');
        }
      } else {
        isGasOk = false;
        gasNote = `Server Google merespons status HTTP ${gasRes.status}.`;
        setGasCheck('error');
      }
    } catch {
      isGasOk = false;
      gasNote = 'Gagal menghubungi Web App (Permintaan ditolak oleh CORS Google). Ini menandakan opsi "Who has access" belum diset ke "Anyone".';
      setGasCheck('error');
    }

    const allOk = isSheetOk && isGasOk;
    setConnectionVerified(allOk);

    if (allOk) {
      setTestResult({
        status: 'success',
        title: 'Semua Jalur Koneksi 100% Lolos Verifikasi!',
        message: `Koneksi nyata terverifikasi. Spreadsheet (${sheetNote}) dan Google Apps Script (${gasNote}) aktif dan sinkron. Database aman untuk dieksekusi sekarang!`
      });
    } else if (!isSheetOk && isGasOk) {
      setTestResult({
        status: 'warning',
        title: 'Akses Google Sheets Masih Terkunci (Restricted)',
        message: 'Google Apps Script Anda sudah aktif, namun Google Sheets belum dibuka akses publiknya. Solusi AI: Buka Google Sheets Anda -> Klik tombol Bagikan (Share) di kanan atas -> Ubah "Akses umum" dari Dibatasi menjadi "Siapa saja yang memiliki link dapat melihat" -> Simpan, lalu klik Uji Koneksi lagi.'
      });
    } else if (isSheetOk && !isGasOk) {
      setTestResult({
        status: 'error',
        title: 'Izin Google Apps Script Belum "Anyone"',
        message: 'Google Sheets dapat dibaca, namun Web App Anda menolak koneksi browser. Solusi AI: Buka Google Apps Script Anda -> Klik Deploy (Terapkan) -> Kelola Penerapan -> Klik ikon Pensil (Edit) -> Pastikan kolom "Who has access" (Siapa yang memiliki akses) diubah ke "Anyone" (Siapa saja) -> Klik Terapkan, lalu uji koneksi lagi.'
      });
    } else {
      setTestResult({
        status: 'error',
        title: 'Kedua Jalur Koneksi Belum Terhubung',
        message: 'Google Sheets dan Google Apps Script keduanya belum dapat diakses. Solusi AI: 1) Bagikan Google Sheets dengan izin "Anyone with link can view". 2) Deploy Google Apps Script dengan izin "Anyone".'
      });
    }

    setTestingConnection(false);
  };

  // 3. Buka Modal Konfirmasi Kloning
  const handleMigrateDatabase = () => {
    if (!cleanTargetSheetId) {
      setTestResult({
        status: 'error',
        title: 'Spreadsheet ID Kosong',
        message: 'Mohon masukkan Link atau ID Google Sheets Baru pada kolom 1.'
      });
      return;
    }
    if (!targetGasUrlInput.trim()) {
      setTestResult({
        status: 'error',
        title: 'URL Web App Kosong',
        message: 'Mohon masukkan URL Web App Google Apps Script Baru pada kolom 2.'
      });
      return;
    }

    setIsConfirmModalOpen(true);
  };

  // Eksekusi Kloning setelah user klik konfirmasi di modal kustom
  const executeMigration = async () => {
    setIsConfirmModalOpen(false);
    setMigrating(true);
    setMigrationStatus('Menyiapkan paket data 30 KK & pembukuan kas...');

    try {
      const { residents, iplRecords, pengeluaranRecords, urunanRecords } = formatPayloadForGas(
        wargaList,
        transaksiList,
        pengeluaranList,
        urunanList
      );

      setMigrationStatus('Menghubungi Google Apps Script baru & membuat 4 Tab otomatis...');

      const response = await fetch(targetGasUrlInput.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify({
          action: 'syncAll',
          residents,
          iplRecords,
          pengeluaranRecords,
          urunanRecords
        })
      });

      const responseText = await response.text();
      let responseJson: { success?: boolean; message?: string; wargaCount?: number; iplCount?: number; expenseCount?: number; urunanCount?: number } = {};
      try {
        responseJson = JSON.parse(responseText);
      } catch {}

      if (response.ok && (responseJson.success !== false)) {
        setSpreadsheetId(cleanTargetSheetId);
        setGasApiUrl(targetGasUrlInput.trim());

        setMigrationSuccessData({
          wargaCount: responseJson.wargaCount || wargaList.length,
          iplCount: responseJson.iplCount || transaksiList.length,
          expenseCount: responseJson.expenseCount || pengeluaranList.length,
          urunanCount: responseJson.urunanCount || urunanList.length
        });

        setMigrationStatus(null);
        onMigrateSuccess?.();
      } else {
        throw new Error(responseJson.message || 'Respon dari Google Script tidak valid.');
      }
    } catch (err) {
      setMigrationStatus(null);
      setTestResult({
        status: 'error',
        title: 'Gagal Memindahkan Database',
        message: `Terjadi kendala: ${err instanceof Error ? err.message : 'Koneksi terputus'}. Pastikan URL Web App benar dan izin "Who has access" diset ke "Anyone".`
      });
    } finally {
      setMigrating(false);
    }
  };

  // 4. Buka Modal Konfirmasi Rollback
  const handleRollbackDefault = () => {
    setIsRollbackModalOpen(true);
  };

  const executeRollback = () => {
    setIsRollbackModalOpen(false);
    localStorage.removeItem('SIM_WARGA_SPREADSHEET_ID');
    localStorage.removeItem('SIM_WARGA_GAS_URL');
    window.location.reload();
  };
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2.5 overflow-y-auto md:overflow-hidden h-auto md:h-full w-full max-w-full select-none">
      {/* 1. TOP TITLE ROW */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1C221E] dark:text-white tracking-tight">
              Database &amp; Migrasi Google Sheets
            </h2>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Aktif 24 Jam Cloud</span>
            </span>
          </div>
          <p className="text-xs text-stone-400 font-medium mt-0.5">
            Manajemen koneksi database Google Sheets, asisten kode skrip, dan migrasi instan 1-klik ke akun Google baru.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRollbackDefault}
          disabled={isUsingDefault}
          title={isUsingDefault ? 'Sedang menggunakan Spreadsheet resmi RT 08' : 'Kembalikan ke spreadsheet asli RT 08'}
          className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
            isUsingDefault
              ? 'bg-stone-100 dark:bg-stone-800/60 text-stone-400 border-stone-200 dark:border-stone-700 cursor-default opacity-60'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 cursor-pointer'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isUsingDefault ? 'Menggunakan DB Master PK8' : 'Reset ke DB Asli PK8'}</span>
        </button>
      </div>

      {/* 2. BODY CONTENT: 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 flex-1 min-h-0 overflow-y-auto pr-0.5 items-start">
        {/* KOLOM KIRI (7 COLS): PANDUAN AI & GENERATOR KODE SCRIPT */}
        <div className="lg:col-span-7 space-y-3">
          {/* CARD A: STATUS KONEKSI AKTIF */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center font-extrabold text-xs">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
                    Status Database Aktif Saat Ini
                  </h3>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {isUsingDefault ? 'Spreadsheet Resmi BPH Paguyuban PK8 Tahap 2' : 'Spreadsheet Kustom Hasil Migrasi'}
                  </span>
                </div>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${currentSheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-xs font-bold text-[#0B484C] dark:text-[#F3D37A] flex items-center gap-1 transition-colors"
              >
                <span>Buka Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-bold">Warga Terdata</span>
                <span className="text-sm font-black text-[#0B484C] dark:text-[#F3D37A]">{wargaList.length} KK</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-bold">Transaksi IPL</span>
                <span className="text-sm font-black text-emerald-600">{transaksiList.length} Trx</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-bold">Pengeluaran</span>
                <span className="text-sm font-black text-rose-600">{pengeluaranList.length} Nota</span>
              </div>
              <div className="p-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800">
                <span className="text-[10px] text-stone-400 block font-bold">Urunan PJU</span>
                <span className="text-sm font-black text-amber-600">{urunanList.length} Donatur</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl border border-stone-100 dark:border-stone-800">
                <span className="truncate pr-2">ID: {currentSheetId}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(currentSheetId);
                    setCopiedSheetId(true);
                    setTimeout(() => setCopiedSheetId(false), 2000);
                  }}
                  className="hover:text-stone-700 dark:hover:text-stone-200 flex items-center gap-1 flex-shrink-0"
                >
                  {copiedSheetId ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSheetId ? 'Tersalin' : 'Salin ID'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD B: ASISTEN AI & PANDUAN PEMINDAHAN SCRIPT */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#072B2E] border border-stone-200/80 dark:border-[#D9B352]/30 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-extrabold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white">
                  Panduan Kloning ke Akun Google / Email Baru
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">
                  Cukup 4 langkah mudah tanpa perlu mengetik kode pemrograman sama sekali.
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-stone-600 dark:text-stone-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  Buka Google Drive di <strong>Email Baru Anda</strong>, lalu buat <strong>Google Sheets Kosong</strong> (Beri nama misal: <em>SIM-Warga PK8</em>).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  Di Spreadsheet baru tersebut, klik menu <strong>Extensions (Ekstensi) &rarr; Apps Script</strong>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <div className="flex-1 space-y-1.5">
                  <p>
                    Salin seluruh skrip di bawah ini lalu <strong>Paste</strong> ke editor Apps Script Anda:
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <input
                      type="text"
                      value={scriptCustomId}
                      onChange={(e) => setScriptCustomId(e.target.value)}
                      placeholder="Tempel ID Sheet Baru (Opsional, agar otomatis terisi)"
                      className="flex-1 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#F8F8F6] dark:bg-stone-900 text-[11px] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="px-4 py-2 rounded-xl carlic-sage-btn text-[#F3D37A] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? 'Kode Skrip Tersalin!' : 'Salin Kode Skrip (Code.gs)'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#0B484C] text-[#F3D37A] font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  Klik tombol biru <strong>Deploy &rarr; New deployment &rarr; Jenis: Web App</strong>. Set <em>Execute as: Me</em> dan <strong>Who has access: Anyone</strong>. Salin <strong>Web App URL</strong> yang dihasilkan!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN (5 COLS): FORM MIGRASI 1-KLIK & AI DOCTOR */}
        <div className="lg:col-span-5 space-y-3">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#072B2E] border-2 border-[#D9B352]/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100 dark:border-stone-800">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B484C] to-emerald-700 text-white flex items-center justify-center">
                <Send className="w-4 h-4 text-[#F3D37A]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[#1C221E] dark:text-white">
                  Formulir Pemindahan Database
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">
                  Kloning 30 KK, saldo kas, dan urunan PJU secara instan.
                </span>
              </div>
            </div>

            {/* Input 1: Link atau ID Spreadsheet Baru */}
            <div className="space-y-1">
              <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs flex items-center justify-between">
                <span>1. Link atau ID Google Sheets Baru *</span>
                {cleanTargetSheetId && (
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ID Terdeteksi
                  </span>
                )}
              </label>
              <input
                type="text"
                value={targetSheetInput}
                onChange={(e) => setTargetSheetInput(e.target.value)}
                placeholder="Tempel link https://docs.google.com/spreadsheets/d/.../edit"
                className="w-full h-10 px-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#F8F8F6] dark:bg-stone-900 text-xs font-bold text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C]"
              />
              <span className="text-[10px] text-stone-400 block">
                * Cukup paste link dari address bar browser, sistem akan mengekstrak ID-nya otomatis.
              </span>
            </div>

            {/* Input 2: Web App URL */}
            <div className="space-y-1">
              <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block">
                2. URL Web App Google Apps Script Baru *
              </label>
              <input
                type="text"
                value={targetGasUrlInput}
                onChange={(e) => setTargetGasUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full h-10 px-3.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-[#F8F8F6] dark:bg-stone-900 text-xs font-bold text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C]"
              />
            </div>

            {/* LANGKAH 2: TOMBOL UJI & TES KONEKSI DATABASE (SEBELUM EKSEKUSI) */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1C221E] dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
                  <span>Langkah 2: Uji &amp; Tes Koneksi Database</span>
                </span>
                <span className="text-[10px] text-stone-400 font-bold">Wajib Sebelum Eksekusi</span>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection || !cleanTargetSheetId || !targetGasUrlInput.trim()}
                className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs ${
                  connectionVerified
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-2 border-stone-300 dark:border-stone-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#0B484C]" />
                    <span>Menguji Respons Google Sheets &amp; Apps Script...</span>
                  </>
                ) : connectionVerified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Koneksi Lolos Uji &amp; Terverifikasi! (Uji Ulang ↺)</span>
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A]" />
                    <span>🔌 Uji &amp; Tes Koneksi Database Sekarang</span>
                  </>
                )}
              </button>

              {/* CHECKLIST STATUS UJI REAL-TIME */}
              {sheetCheck !== 'idle' && (
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                    sheetCheck === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                      : sheetCheck === 'testing'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                  }`}>
                    {sheetCheck === 'ok' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : sheetCheck === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>Akses Baca Sheets: {sheetCheck === 'ok' ? 'Lolos' : sheetCheck === 'testing' ? 'Menguji...' : 'Belum Dibagikan'}</span>
                  </div>

                  <div className={`p-2 rounded-xl border flex items-center gap-1.5 ${
                    gasCheck === 'ok'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                      : gasCheck === 'testing'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-800 dark:text-amber-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                  }`}>
                    {gasCheck === 'ok' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : gasCheck === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                    <span>Akses Apps Script: {gasCheck === 'ok' ? 'Aktif' : gasCheck === 'testing' ? 'Menguji...' : 'Gagal Respons'}</span>
                  </div>
                </div>
              )}
            </div>
            {/* Feedback Hasil Uji Koneksi */}
            {testResult.status !== 'idle' && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 animate-in fade-in ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200'
                    : testResult.status === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-900 dark:text-rose-200'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {testResult.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : testResult.status === 'warning' ? (
                    <Info className="w-4 h-4 text-amber-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  <span>{testResult.title}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{testResult.message}</p>
              </div>
            )}

            {/* Status Migrasi Sedang Berjalan */}
            {migrating && (
              <div className="p-3.5 rounded-xl bg-[#FEF9EB] dark:bg-stone-900 border border-[#D9B352] text-xs space-y-2 animate-pulse">
                <div className="flex items-center gap-2 font-black text-[#0B484C] dark:text-[#F3D37A]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Melakukan Kloning Database...</span>
                </div>
                <p className="text-[11px] text-stone-600 dark:text-stone-300">{migrationStatus}</p>
              </div>
            )}

            {/* Banner Sukses Pemindahan */}
            {migrationSuccessData && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-emerald-800 dark:text-emerald-300">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Database Berhasil Dipindahkan 100%!</span>
                </div>
                <ul className="text-[11px] text-emerald-700 dark:text-emerald-300 space-y-0.5">
                  <li>✓ {migrationSuccessData.wargaCount} Data Warga berhasil disalin.</li>
                  <li>✓ {migrationSuccessData.iplCount} Transaksi IPL tercatat.</li>
                  <li>✓ {migrationSuccessData.expenseCount} Pengeluaran Kas disinkronkan.</li>
                  <li>✓ {migrationSuccessData.urunanCount} Donatur PJU dipetakan.</li>
                </ul>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full mt-2 py-2 rounded-lg bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Muat Ulang Dashboard Baru</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Tombol Utama Kloning & Pindahkan */}
            {/* LANGKAH 3: EKSEKUSI PEMINDAHAN DATABASE */}
            <div className="pt-2 border-t border-stone-200/80 dark:border-stone-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#1C221E] dark:text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
                  <span>Langkah 3: Eksekusi Kloning Database</span>
                </span>
                {connectionVerified && (
                  <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Aman Dieksekusi</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={migrating || !cleanTargetSheetId || !targetGasUrlInput.trim()}
                onClick={handleMigrateDatabase}
                className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-md transition-all ${
                  connectionVerified
                    ? 'carlic-sage-btn text-[#F3D37A] ring-2 ring-[#D9B352]/70'
                    : 'bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Send className="w-4 h-4" />
                <span>{connectionVerified ? '🚀 Kloning & Pindahkan Seluruh Database Sekarang (Siap)' : 'Kloning & Pindahkan Seluruh Database'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* =================================================================== */}
      {/* MODAL KUSTOM: KONFIRMASI PEMINDAHAN DATABASE (DESAIN ELEGAN)        */}
      {/* =================================================================== */}
      {isConfirmModalOpen && (
        <div
          onClick={() => setIsConfirmModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E20]/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white dark:bg-[#072426] rounded-3xl border-2 border-[#D9B352]/70 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 flex items-center justify-center absolute top-4 right-4 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0B484C] to-emerald-600 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <Rocket className="w-6 h-6 text-[#F3D37A]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  Siap Dipindahkan
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#1C221E] dark:text-white mt-0.5">
                  Konfirmasi Pemindahan Database
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Sistem akan mengkloning seluruh data aktif saat ini dan mengalihkan pembukuan resmi ke Google Sheets baru Anda:
            </p>

            {/* Data Summary Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0" />
                <div>
                  <span className="font-black text-[#1C221E] dark:text-white block">{wargaList.length} KK Warga</span>
                  <span className="text-[10px] text-stone-400">Direktori Lengkap</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div>
                  <span className="font-black text-[#1C221E] dark:text-white block">{transaksiList.length} Transaksi</span>
                  <span className="text-[10px] text-stone-400">Pembukuan Kas IPL</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <div>
                  <span className="font-black text-[#1C221E] dark:text-white block">{pengeluaranList.length} Belanja Kas</span>
                  <span className="text-[10px] text-stone-400">Nota Pengeluaran</span>
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <span className="font-black text-[#1C221E] dark:text-white block">{urunanList.length} Donatur</span>
                  <span className="text-[10px] text-stone-400">Urunan Lampu PJU</span>
                </div>
              </div>
            </div>

            {/* Safety Guarantee Box */}
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/60 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Jaminan Keamanan &amp; Backup:</span>
              </div>
              <p className="leading-relaxed">
                Spreadsheet lama Anda <strong>tidak akan terhapus</strong> dan otomatis menjadi arsip cadangan (backup). Anda bisa kembali ke database semula kapan saja lewat tombol reset di pojok kanan atas.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors"
              >
                Batal / Periksa Dulu
              </button>
              <button
                type="button"
                onClick={executeMigration}
                className="py-3 px-4 rounded-xl carlic-sage-btn text-[#F3D37A] font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Send className="w-4 h-4" />
                <span>Ya, Pindahkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL KUSTOM: KONFIRMASI ROLLBACK KE DATABASE ASLI                  */}
      {/* =================================================================== */}
      {isRollbackModalOpen && (
        <div
          onClick={() => setIsRollbackModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E20]/80 backdrop-blur-md animate-in fade-in duration-150 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-[#072426] rounded-3xl border-2 border-amber-400 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <button
              type="button"
              onClick={() => setIsRollbackModalOpen(false)}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-500 flex items-center justify-center absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-md flex-shrink-0">
                <RotateCcw className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C221E] dark:text-white">
                  Reset ke Database Asli PK8?
                </h3>
                <span className="text-[10px] text-stone-400 font-medium">
                  Memulihkan koneksi ke Spreadsheet Master RT 08
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              Sistem akan menghapus koneksi kustom dan mengalihkan kembali seluruh pembacaan website ke Google Sheets resmi Paguyuban Pesona Kahuripan 8 Tahap 2 semula.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRollbackModalOpen(false)}
                className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeRollback}
                className="py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Ya, Reset ke DB Asli</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
