import React, { useState, useEffect } from 'react';
import {
  DashboardSummary,
  PengumumanRecord,
  InfoRekeningBank,
  WargaRecord,
  TransaksiIPL,
  PengeluaranKasRecord,
  ProgramUrunanRecord,
  ItemUrunanWarga,
  JenisKelamin,
  StatusTempatTinggal,
  Agama,
} from '@sim-warga/types';
import { RondaWithStatus } from '../ronda/JadwalRondaCard';
import { CustomSelect, aiFuzzyMatch } from '../common/CustomSelect';
import {
  generateSmartAuditLog,
  generateIplAuditLog,
  loadWargaAuditLogs,
  parseNaturalWargaInput,
  WargaAuditLogEntry,
} from '../../services/aiAssistantService';
import {
  hashPasswordSha256,
  verifyPasswordMatch,
  maskPhoneNumber,
  getHouseLockoutState,
  recordHouseFailedAttempt,
  resetHouseLockout,
} from '../../utils/security';
import {
  LayoutGrid,
  CreditCard,
  BarChart2,
  Building2,
  Users,
  Calendar,
  Settings,
  LogIn,
  Search,
  MessageSquare,
  Bell,
  CheckCircle2,
  Sun,
  Moon,
  Copy,
  Check,
  Wallet,
  Shield,
  MapPin,
  Clock,
  Share2,
  UserPlus,
  Lightbulb,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  X,
  ArrowRight,
  RefreshCw,
  Edit,
  Lock,
  Trash2,
  AlertTriangle,
  Sparkles,
  FileText,
  Printer,
  Download,
  ShieldAlert,
  Bookmark,
  Star,
} from 'lucide-react';
export interface DashboardWargaProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  summary: DashboardSummary;
  wargaList: WargaRecord[];
  rondaList: RondaWithStatus[];
  transaksiList: TransaksiIPL[];
  pengeluaranList: PengeluaranKasRecord[];
  programUrunan: ProgramUrunanRecord;
  urunanList: ItemUrunanWarga[];
  pengumumanList: PengumumanRecord[];
  rekeningBank?: InfoRekeningBank;
  tarifIpl: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenLoginModal: () => void;
  onAddWarga: (w: WargaRecord) => Promise<void> | void;
  onUpdateWarga?: (
    originalKey: string,
    updatedFields: {
      namaLengkap: string;
      blok: string;
      noRumah: string;
      noWhatsapp: string;
      statusTempatTinggal: StatusTempatTinggal;
      jmlJiwa: number;
      anggotaKeluargaTambahan?: string;
    }
  ) => Promise<void> | void;
  onDeleteWarga?: (key: string) => Promise<void> | void;
  ownedWargaKeys?: string[];
  onClaimWargaOwnership?: (w: WargaRecord) => void;
  onUploadBuktiIpl: (trx: {
    noTransaksi: string;
    namaWarga: string;
    lokasiRumah: string;
    nominal: number;
    durasiPaket?: string;
    metode: string;
    buktiUrl: string;
  }) => Promise<void> | void;
  onCancelPendingIpl?: (namaWarga: string, lokasiRumah: string) => Promise<void> | void;
  onAddUrunan?: (item: ItemUrunanWarga) => Promise<void> | void;
  onDeleteUrunan?: (id: string) => Promise<void> | void;
}

/**
 * PORTAL & DASHBOARD WARGA TERPADU (VERSI RINGKAS & BERSIH TANPA FITUR MUBAZIR)
 * Dipisahkan 100% dari DashboardAdmin.tsx.
 * Penyederhanaan yang diterapkan:
 * 1. Tidak ada form input urunan bebas di menu Urunan PJU (diganti info rekening & konfirmasi WA Bendahara).
 * 2. Tidak ada duplikasi angka/grafik kas 3x di Beranda (digabung jadi 1 kartu Ringkasan Kas & Rekening).
 * 3. Kartu dekoratif fingerprint diganti jadwal ronda malam ini & pengumuman terbaru langsung di Beranda.
 * 4. Tidak ada kotak Search ganda di header atas (diganti pintasan cepat + Isi Data Warga & Bayar IPL).
 * 5. Tidak ada tombol Login Admin ganda di bawah sidebar (bulatan RT8 dihapus).
 */
export const DashboardWarga: React.FC<DashboardWargaProps> = ({
  activeTab,
  onSelectTab,
  summary,
  wargaList,
  rondaList,
  transaksiList,
  pengeluaranList,
  programUrunan,
  urunanList,
  pengumumanList,
  rekeningBank,
  tarifIpl,
  isDarkMode,
  onToggleTheme,
  onOpenLoginModal,
  onAddWarga,
  onUpdateWarga,
  onDeleteWarga,
  ownedWargaKeys = [],
  onClaimWargaOwnership,
  onUploadBuktiIpl,
  onCancelPendingIpl,
  onAddUrunan,
  onDeleteUrunan,
}) => {
  const [copiedRek, setCopiedRek] = useState(false);

  // Menu 2 (IPL & Kas) States
  const [iplMode, setIplMode] = useState<'daftar' | 'form'>('daftar');
  const [isWargaLockedInForm, setIsWargaLockedInForm] = useState(false);
  const [iplFilter, setIplFilter] = useState<'ALL' | 'Lunas' | 'Belum Bayar' | 'Menunggu Verifikasi'>('ALL');
  const [iplSearch, setIplSearch] = useState('');
  const [iplPage, setIplPage] = useState(1);
  const [bayarNama, setBayarNama] = useState('');
  const [bayarLokasi, setBayarLokasi] = useState('');
  const [bayarDurasiNilai, setBayarDurasiNilai] = useState('1');
  const [bayarDurasiSatuan, setBayarDurasiSatuan] = useState<'Bulan' | 'Tahun'>('Bulan');
  const [bayarMetode, setBayarMetode] = useState(
    () => rekeningBank?.metodePembayaran?.[0] || `Transfer ${rekeningBank?.namaBank || 'Bank BCA'}`
  );
  const [bayarBuktiDataUrl, setBayarBuktiDataUrl] = useState('');
  const [bayarBuktiFileName, setBayarBuktiFileName] = useState('');
  const [bayarError, setBayarError] = useState('');
  const [bayarSuccess, setBayarSuccess] = useState(false);

  // Menu 3 (Urunan PJU) States
  const [urunanMode, setUrunanMode] = useState<'daftar' | 'form'>('daftar');
  const [urunanFilter, setUrunanFilter] = useState<'ALL' | 'VERIFIKASI' | 'DONATUR' | 'URUNAN_WAJIB'>('ALL');
  const [urunanSearch, setUrunanSearch] = useState('');
  const [urunanPage, setUrunanPage] = useState(1);
  const [pjuNama, setPjuNama] = useState('');
  const [pjuLokasi, setPjuLokasi] = useState('');
  const [pjuTipe, setPjuTipe] = useState<'URUNAN_WAJIB' | 'DONATUR'>('URUNAN_WAJIB');
  const [pjuNominal, setPjuNominal] = useState('115000');
  const [pjuMetode, setPjuMetode] = useState<'TF' | 'Cash'>('TF');
  const [pjuBuktiName, setPjuBuktiName] = useState('');
  const [pjuBuktiBase64, setPjuBuktiBase64] = useState('');
  const [pjuError, setPjuError] = useState('');
  const [isSyncingPju, setIsSyncingPju] = useState(false);
  const [pjuSuccess, setPjuSuccess] = useState(false);
  // Menu 4 (Data Warga & Blok) States
  const [wargaMode, setWargaMode] = useState<'direktori' | 'form'>('direktori');
  const [blokGroup, setBlokGroup] = useState<string>('ALL');
  const [wargaSearch, setWargaSearch] = useState('');
  const [wargaPage, setWargaPage] = useState(1);
  const [detailWarga, setDetailWarga] = useState<WargaRecord | null>(null);
  const [isEditingOwned, setIsEditingOwned] = useState(false);
  const [isDetailModalUnlocked, setIsDetailModalUnlocked] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editBlok, setEditBlok] = useState('D');
  const [editNoBlok, setEditNoBlok] = useState('8');
  const [editNoRumah, setEditNoRumah] = useState('');
  const [editWa, setEditWa] = useState('');
  const [editDomisili, setEditDomisili] = useState<StatusTempatTinggal>('Menetap');
  const [editJiwa, setEditJiwa] = useState('1');
  const [editAnggota, setEditAnggota] = useState('');
  const [isSyncingEdit, setIsSyncingEdit] = useState(false);
  const [editSyncDone, setEditSyncDone] = useState(false);
  const [showVerifyWa, setShowVerifyWa] = useState(false);
  const [verifyDetailPassword, setVerifyDetailPassword] = useState('');
  const [verifyDetailWa4, setVerifyDetailWa4] = useState('');
  const [verifyWaInput, setVerifyWaInput] = useState('');
  const [verifyWaError, setVerifyWaError] = useState('');
  const [showDetailPassword, setShowDetailPassword] = useState(false);
  // Proteksi Keamanan 5-Menit Lockout (Brute-Force Rate Limiting)
  const [activeLockoutSecs, setActiveLockoutSecs] = useState<number>(0);

  const [aiQuickInput, setAiQuickInput] = useState('');
  const [auditLogs, setAuditLogs] = useState<WargaAuditLogEntry[]>(() => loadWargaAuditLogs());
  const [formNama, setFormNama] = useState('');
  const [formGender, setFormGender] = useState<JenisKelamin>('Laki-laki');
  const [formBlok, setFormBlok] = useState('D');
  const [formNoBlok, setFormNoBlok] = useState('8');
  const [formNoRumah, setFormNoRumah] = useState('');
  const [formWa, setFormWa] = useState('');
  const [formDomisili, setFormDomisili] = useState<StatusTempatTinggal>('Menetap');
  const [formPekerjaan, setFormPekerjaan] = useState('');
  const [formAgama, setFormAgama] = useState<Agama>('Islam');
  const [formJiwa, setFormJiwa] = useState('3');
  const [formAnggota, setFormAnggota] = useState('');
  const [formPin, setFormPin] = useState('');
  const [formConfirmPin, setFormConfirmPin] = useState('');
  const [showFormPin, setShowFormPin] = useState(false);
  const [showGatePin, setShowGatePin] = useState(false);
  const [formWargaError, setFormWargaError] = useState('');
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [editingPjuId, setEditingPjuId] = useState<string | null>(null);
  // Kepemilikan Setoran PJU pada Perangkat Ini (Hanya yang diinput sendiri yang bisa dihapus)
  const [ownedPjuIds, setOwnedPjuIds] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('SIM_WARGA_OWNED_PJU_IDS') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem('SIM_WARGA_OWNED_PJU_IDS', JSON.stringify(ownedPjuIds));
  }, [ownedPjuIds]);

  // State Popup Konfirmasi Edit / Hapus Milik Sendiri & Verifikasi Keamanan Pemilik (IPL, PJU, Data Warga)
  const [userConfirmModal, setUserConfirmModal] = useState<{
    kind: 'delete' | 'edit';
    title: string;
    subtitle: string;
    itemName: string;
    detailText: string;
    confirmLabel: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [userConfirmStep, setUserConfirmStep] = useState<'review' | 'syncing' | 'done'>('review');
  const [isUserConfirmRunning, setIsUserConfirmRunning] = useState(false);
  // Modal Verifikasi Keamanan Kepemilikan Data Warga (PIN 4-Digit dari 4 Angka Belakang No. WA)
  const [iplSecurityGate, setIplSecurityGate] = useState<{
    warga: WargaRecord;
    intendedAction: 'edit_ipl' | 'cancel_ipl' | 'edit_pju' | 'cancel_pju' | 'kwitansi_ipl' | 'kwitansi_pju';
    pjuItem?: { id: string; tipe: 'URUNAN_WAJIB' | 'DONATUR'; nominal: number; namaWarga: string };
  } | null>(null);
  const [iplGateInput, setIplGateInput] = useState('');
  const [iplGatePassword, setIplGatePassword] = useState('');
  const [iplGateWa4, setIplGateWa4] = useState('');
  const [iplGateError, setIplGateError] = useState('');
  const [showIplGatePassword, setShowIplGatePassword] = useState(false);
  useEffect(() => {
    const targetKey =
      detailWarga?.id ||
      detailWarga?.alamatRumah ||
      iplSecurityGate?.warga.id ||
      iplSecurityGate?.warga.alamatRumah;
    if (!targetKey) {
      setActiveLockoutSecs(0);
      return;
    }
    const check = getHouseLockoutState(targetKey);
    if (check.isLocked && check.remainingSeconds > 0) {
      setActiveLockoutSecs(check.remainingSeconds);
    } else {
      setActiveLockoutSecs(0);
    }
  }, [detailWarga, iplSecurityGate]);

  // Explicitly clear verification inputs whenever security gate or detail modal opens
  useEffect(() => {
    if (iplSecurityGate) {
      setIplGatePassword('');
      setIplGateWa4('');
      setIplGateError('');
      setShowIplGatePassword(false);
    }
  }, [iplSecurityGate]);

  useEffect(() => {
    if (detailWarga) {
      setVerifyDetailPassword('');
      setVerifyDetailWa4('');
      setVerifyWaError('');
      setShowDetailPassword(false);
    }
  }, [detailWarga]);

  useEffect(() => {
    if (activeLockoutSecs <= 0) return;
    const timer = setInterval(() => {
      setActiveLockoutSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeLockoutSecs]);
  const [savedAnnouncementIds, setSavedAnnouncementIds] = useState<Record<string, boolean>>({});
  const [kwitansiModal, setKwitansiModal] = useState<{
    type: 'ipl' | 'pju';
    title: string;
    resiNo: string;
    namaWarga: string;
    blokRumah: string;
    noWa: string;
    kategori: string;
    rincian: string;
    nominal: number;
    terbilang: string;
    tanggalBayar: string;
    masaAktif: string;
    metode: string;
    keterangan: string;
    verifiedBy: string;
  } | null>(null);

  const terbilangRupiah = (n: number): string => {
    const bilangan = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'];
    const num = Math.floor(Math.abs(n));
    if (num === 0) return 'Nol Rupiah';
    const sebut = (x: number): string => {
      if (x < 12) return bilangan[x];
      if (x < 20) return `${sebut(x - 10)} Belas`;
      if (x < 100) return `${sebut(Math.floor(x / 10))} Puluh ${sebut(x % 10)}`.trim();
      if (x < 200) return `Seratus ${sebut(x - 100)}`.trim();
      if (x < 1000) return `${sebut(Math.floor(x / 100))} Ratus ${sebut(x % 100)}`.trim();
      if (x < 2000) return `Seribu ${sebut(x - 1000)}`.trim();
      if (x < 1000000) return `${sebut(Math.floor(x / 1000))} Ribu ${sebut(x % 1000)}`.trim();
      if (x < 1000000000) return `${sebut(Math.floor(x / 1000000))} Juta ${sebut(x % 1000000)}`.trim();
      return `${x}`;
    };
    return `${sebut(num)} Rupiah`;
  };

  const handleDownloadSlipText = (k: NonNullable<typeof kwitansiModal>) => {
    const slipText = [
      '======================================================================',
      '         PAGUYUBAN WARGA PESONA KAHURIPAN 8 TAHAP 2',
      '      SURAT BUKTI PELUNASAN RESMI (KWITANSI DIGITAL KAS)',
      '======================================================================',
      `No. Kwitansi      : ${k.resiNo}`,
      `Tanggal Terbit    : ${k.tanggalBayar || '12 Oktober 2026'}`,
      `Status Transaksi  : LUNAS (TERVERIFIKASI BENDAHARA)`,
      '----------------------------------------------------------------------',
      'IDENTITAS PEMBAYAR:',
      `Nama Lengkap      : ${k.namaWarga}`,
      `Alamat Rumah      : ${k.blokRumah}`,
      `No. WhatsApp      : ${k.noWa || '-'}`,
      '----------------------------------------------------------------------',
      'RINCIAN PEMBAYARAN:',
      `Pos Iuran         : ${k.kategori}`,
      `Rincian / Paket   : ${k.rincian}`,
      `Masa Aktif        : ${k.masaAktif || '-'}`,
      `Metode Bayar      : ${k.metode}`,
      '----------------------------------------------------------------------',
      `TOTAL DIBAYAR     : Rp ${k.nominal.toLocaleString('id-ID')}`,
      `TERBILANG         : ${k.terbilang}`,
      '----------------------------------------------------------------------',
      'PENGESAHAN DIGITAL:',
      `Diverifikasi Oleh : ${k.verifiedBy}`,
      `Kode Keamanan     : VALID-PK8-${k.type.toUpperCase()}-${k.resiNo.replace(/\D/g, '') || '2026'}`,
      'Stempel Digital   : BPH PAGUYUBAN PESONA KAHURIPAN 8 TAHAP 2 (SAH)',
      '======================================================================',
      'Dokumen ini merupakan bukti pembayaran resmi yang sah dan tercatat',
      'pada pembukuan kas Paguyuban Pesona Kahuripan 8 Tahap 2.',
      '======================================================================',
    ].join('\n');

    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Kwitansi_${k.type.toUpperCase()}_${k.namaWarga.replace(/\s+/g, '_')}_${k.blokRumah.replace(/[\s./]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [isPrintingKwitansi, setIsPrintingKwitansi] = useState<boolean>(false);

  const handlePrintKwitansiPdf = (k: NonNullable<typeof kwitansiModal>) => {
    setIsPrintingKwitansi(true);
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Kwitansi_${k.type.toUpperCase()}_${k.namaWarga.replace(/\\s+/g, '_')}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px 20px;
      background: #F8FAFC;
      color: #1C221E;
      line-height: 1.4;
      font-size: 13px;
    }
    .top-toolbar {
      position: sticky;
      top: 0;
      background: #0B484C;
      padding: 10px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 12px;
      margin-bottom: 20px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      z-index: 9999;
    }
    .top-toolbar-title {
      color: #FFFFFF;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .top-toolbar-actions {
      display: flex;
      gap: 10px;
    }
    .btn-print {
      background: #F3D37A;
      color: #0B484C;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      cursor: pointer;
      font-size: 12px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.2);
      color: #FFFFFF;
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 8px 14px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 12px;
    }
    .kwitansi-box {
      max-width: 680px;
      margin: 0 auto;
      border: 2px solid #D9B352;
      border-radius: 16px;
      padding: 26px 28px;
      background: #FFFFFF;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      position: relative;
    }
    .header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-bottom: 14px;
      margin-bottom: 16px;
      border-bottom: 2px solid #D9B352;
    }
    .logo-container {
      width: 54px;
      height: 54px;
      border-radius: 12px;
      background: #0B484C;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid #D9B352;
    }
    .logo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .header-text h2 {
      margin: 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #9A7018;
      font-weight: 800;
    }
    .header-text h1 {
      margin: 3px 0 2px 0;
      font-size: 17px;
      font-weight: 900;
      color: #0B484C;
      letter-spacing: -0.3px;
    }
    .header-text p {
      margin: 0;
      font-size: 11px;
      color: #64748B;
    }
    .resi-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 10px;
      padding: 10px 16px;
      margin-bottom: 16px;
    }
    .resi-no {
      font-family: monospace;
      font-weight: 800;
      font-size: 13px;
      color: #0B484C;
    }
    .badge-lunas {
      display: inline-block;
      background: #ECFDF5;
      color: #065F46;
      border: 1px solid #A7F3D0;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .table-details {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
    }
    .table-details tr {
      border-bottom: 1px solid #F1F5F9;
    }
    .table-details td {
      padding: 9px 4px;
      vertical-align: middle;
    }
    .td-label {
      color: #64748B;
      width: 38%;
    }
    .td-value {
      font-weight: 700;
      color: #0F172A;
      text-align: right;
    }
    .total-box {
      background: #FEF9EB;
      border: 1.5px solid #D9B352;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .total-nominal {
      font-size: 18px;
      font-weight: 900;
      color: #0B484C;
    }
    .total-terbilang {
      font-size: 11px;
      color: #78350F;
      font-style: italic;
      margin-top: 2px;
    }
    .auth-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-top: 12px;
    }
    .stamp-badge {
      display: inline-block;
      border: 2px solid #E11D48;
      color: #E11D48;
      font-size: 9px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      transform: rotate(-3deg);
      box-shadow: 0 1px 3px rgba(225, 29, 72, 0.2);
    }
    .footer-note {
      text-align: center;
      margin-top: 16px;
      font-size: 10px;
      color: #94A3B8;
      line-height: 1.5;
    }
    @media print {
      .top-toolbar { display: none !important; }
      body {
        padding: 0 !important;
        background: #FFF !important;
      }
      .kwitansi-box {
        border: 2px solid #D9B352 !important;
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="top-toolbar">
    <div class="top-toolbar-title">
      <span>📄 Kwitansi Resmi Siap Cetak (${k.resiNo})</span>
    </div>
    <div class="top-toolbar-actions">
      <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
      <button class="btn-close" onclick="window.close()">✕ Keluar / Tutup</button>
    </div>
  </div>

  <div class="kwitansi-box">
    <div class="header">
      <div class="logo-container">
        <img class="logo-img" src="/logo-pesona-kahuripan.png" alt="Logo">
      </div>
      <div class="header-text">
        <h2>Paguyuban Warga Pesona Kahuripan 8 Tahap 2 • RT 08</h2>
        <h1>${k.type === 'ipl' ? 'KWITANSI RESMI PELUNASAN IURAN IPL' : 'KWITANSI RESMI SETORAN URUNAN PJU'}</h1>
        <p>Surat Bukti Pelunasan Keuangan Sah Terverifikasi Bendahara Paguyuban</p>
      </div>
    </div>

    <div class="resi-bar">
      <div>
        <div style="font-size: 9px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Nomor Kwitansi / Resi</div>
        <div class="resi-no">${k.resiNo}</div>
      </div>
      <div style="text-align: right;">
        <span class="badge-lunas">✓ LUNAS TERVERIFIKASI</span>
      </div>
    </div>

    <table class="table-details">
      <tr>
        <td class="td-label">Nama Kepala Keluarga</td>
        <td class="td-value" style="font-size: 14px;">${k.namaWarga}</td>
      </tr>
      <tr>
        <td class="td-label">Alamat Rumah / Blok</td>
        <td class="td-value" style="color: #0B484C;">${k.blokRumah}</td>
      </tr>
      <tr>
        <td class="td-label">Pos Pembayaran Kas</td>
        <td class="td-value">${k.kategori}</td>
      </tr>
      <tr>
        <td class="td-label">Rincian Durasi / Program</td>
        <td class="td-value">${k.rincian}</td>
      </tr>
      <tr>
        <td class="td-label">Masa Aktif / Periode</td>
        <td class="td-value" style="color: #065F46;">${k.masaAktif}</td>
      </tr>
      <tr>
        <td class="td-label">Metode Penyetoran</td>
        <td class="td-value">${k.metode}</td>
      </tr>
    </table>

    <div class="total-box">
      <div>
        <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9A7018;">Total Jumlah Lunas</div>
        <div class="total-terbilang">Terbilang: &ldquo;${k.terbilang}&rdquo;</div>
      </div>
      <div class="total-nominal">
        Rp ${k.nominal.toLocaleString('id-ID')}
      </div>
    </div>

    <div class="auth-section">
      <div>
        <div style="font-size: 9px; font-weight: 800; color: #9A7018; text-transform: uppercase; letter-spacing: 1px;">Pengesahan &amp; Verifikasi</div>
        <div style="font-size: 12px; font-weight: 800; color: #0F172A; margin: 2px 0;">${k.verifiedBy}</div>
        <div style="font-size: 10px; color: #94A3B8; font-family: monospace;">VALID-PK8-${k.type.toUpperCase()}-${k.resiNo.replace(/\\D/g, '') || '2026'}</div>
      </div>
      <div style="text-align: right;">
        <div class="stamp-badge">STEMPEL DIGITAL SAH • PK8</div>
        <div style="font-size: 9px; color: #64748B; margin-top: 4px; font-weight: 600;">Tercatat Resmi di Google Sheets</div>
      </div>
    </div>

    <div class="footer-note">
      * Dokumen ini merupakan bukti pembayaran resmi yang sah dan tercatat pada kas Paguyuban Pesona Kahuripan 8 Tahap 2.<br>
      Dicetak secara digital pada ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
    </div>
  </div>

  <script>
    window.onafterprint = function() {
      window.close();
    };
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

    const popup = window.open('', 'CetakKwitansiPopup', 'width=780,height=880,left=150,top=60,resizable=yes,scrollbars=yes');
    if (popup) {
      popup.document.open();
      popup.document.write(htmlContent);
      popup.document.close();
      setKwitansiModal(null);
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            try { document.body.removeChild(iframe); } catch {}
            setKwitansiModal(null);
          }, 1000);
        }, 300);
      }
    }
    setIsPrintingKwitansi(false);
  };
  const handleOpenKwitansiIpl = (w: WargaRecord) => {
    const acc = getWargaIplAccumulated(w);
    const nominal = acc.nominalTotal || w.nominalIpl || tarifIpl;
    const cleanWaMasked = (w.noWhatsapp || '').replace(/(\d{4})\d+(\d{4})/, '$1••••$2') || '0812••••1111';
    setKwitansiModal({
      type: 'ipl',
      title: 'Kwitansi Resmi Pelunasan Iuran IPL',
      resiNo: `#KW-IPL-2026-${(w.blok || 'D').toUpperCase()}-${w.noRumah || '1'}`,
      namaWarga: w.namaLengkap,
      blokRumah: w.alamatRumah,
      noWa: cleanWaMasked,
      kategori: 'Iuran Pengelolaan Lingkungan (IPL)',
      rincian: `Paket ${acc.paketLabel || w.periodeTercover || '1 Bulan'}`,
      nominal,
      terbilang: terbilangRupiah(nominal),
      tanggalBayar: w.tanggalUpdate || '12 Okt 2026',
      masaAktif: acc.activeUntilText || 'Aktif s/d Akhir Bulan (31 Okt 2026)',
      metode: 'Transfer Bank Mandiri (1240010437979)',
      keterangan: w.catatan || 'Lunas Terverifikasi Bendahara',
      verifiedBy: 'Dwi Saputra (Bendahara Paguyuban)',
    });
  };

  const handleOpenKwitansiPju = (
    item: { namaWarga: string; totalNominal: number; wajibNominal: number; donaturNominal: number; hasWajib: boolean; hasDonatur: boolean },
    fallbackW: WargaRecord
  ) => {
    const cleanWaMasked = (fallbackW.noWhatsapp || '').replace(/(\d{4})\d+(\d{4})/, '$1••••$2') || '0812••••1111';
    const rincianText =
      item.hasWajib && item.hasDonatur
        ? `🔵 Urunan Wajib Rp ${item.wajibNominal.toLocaleString('id-ID')} + 🟡 ★ Donatur Rp ${item.donaturNominal.toLocaleString('id-ID')}`
        : item.hasDonatur
        ? `🟡 ★ Donatur Sukarela PJU (Rp ${item.donaturNominal.toLocaleString('id-ID')})`
        : `🔵 Urunan Wajib PJU 1x Bayar (Rp ${item.wajibNominal.toLocaleString('id-ID')})`;
    setKwitansiModal({
      type: 'pju',
      title: 'Kwitansi Resmi Setoran Urunan PJU',
      resiNo: `#KW-PJU-2026-${(fallbackW.blok || 'D').toUpperCase()}-${fallbackW.noRumah || '1'}`,
      namaWarga: fallbackW.namaLengkap,
      blokRumah: fallbackW.alamatRumah,
      noWa: cleanWaMasked,
      kategori: 'Program Penerangan Jalan Umum (PJU)',
      rincian: rincianText,
      nominal: item.totalNominal,
      terbilang: terbilangRupiah(item.totalNominal),
      tanggalBayar: '12 Okt 2026',
      masaAktif: 'Kewajiban 1x Bayar Seumur Program',
      metode: 'Transfer Bank Mandiri (1240010437979)',
      keterangan: 'Lunas Terverifikasi & Masuk Tab URUNAN_PJU',
      verifiedBy: 'Dwi Saputra (Bendahara Paguyuban)',
    });
  };
  const [confirmDialog, setConfirmDialog] = useState<
    | {
        type: 'ipl';
        step: 'review' | 'syncing' | 'done';
        noTransaksi: string;
        namaWarga: string;
        lokasiRumah: string;
        nominal: number;
        durasiPaket: string;
        metode: string;
        buktiUrl: string;
        buktiFileName: string;
      }
    | {
        type: 'warga';
        step: 'review' | 'syncing' | 'done';
        namaLengkap: string;
        blok: string;
        noRumah: string;
        noWhatsapp: string;
        statusTempatTinggal: StatusTempatTinggal;
        jmlJiwa: number;
        anggotaKeluargaTambahan?: string;
      }
    | {
        type: 'pju';
        step: 'review' | 'syncing' | 'done';
        idSetoran: string;
        namaPenyetor: string;
        tipe: 'URUNAN_WAJIB' | 'DONATUR';
        nominal: number;
        metode: 'TF' | 'Cash';
        keterangan: string;
        buktiBayar?: string;
        buktiFileName?: string;
      }
    | null
  >(null);
  // Menu 5 (Jadwal Ronda) States
  const [selectedMingguRonda, setSelectedMingguRonda] = useState<number>(2);
  const [selectedRondaId, setSelectedRondaId] = useState<string>('RND-M2-SABTU');
  const [rondaSearch, setRondaSearch] = useState('');

  // Menu 6 (Pengumuman) States
  const [katPengumuman, setKatPengumuman] = useState<string>('ALL');
  const [detailPengumuman, setDetailPengumuman] = useState<PengumumanRecord | null>(null);
  const [copiedJarkoman, setCopiedJarkoman] = useState(false);

  // State Pusat Notifikasi Interaktif Paguyuban
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'pengumuman' | 'aktivitas'>('ALL');
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const [liveActivityNotifs, setLiveActivityNotifs] = useState<
    { id: string; title: string; desc: string; time: string; targetTab: string; openPjuForm?: boolean; pengumumanObj?: PengumumanRecord; cat: 'pengumuman' | 'aktivitas' }[]
  >([]);

  // Core Metrics: Murni dihitung langsung dari data transaksi, pengeluaran, dan kependudukan warga tanpa hardcode
  const calcPemasukan = transaksiList
    .filter((t) => t.status === 'Lunas')
    .reduce((sum, t) => {
      const val = typeof t.nominalBayar === 'number'
        ? t.nominalBayar
        : parseInt(String(t.nominalBayar || '').replace(/\D/g, ''), 10) || 0;
      return sum + val;
    }, 0);

  const calcPengeluaran = pengeluaranList
    .reduce((sum, p) => {
      const val = typeof p.nominal === 'number'
        ? p.nominal
        : parseInt(String(p.nominal || '').replace(/\D/g, ''), 10) || 0;
      return sum + val;
    }, 0);

  const pemasukan = calcPemasukan > 0 ? calcPemasukan : (summary.pemasukanIpl || 0);
  const pengeluaran = calcPengeluaran > 0 ? calcPengeluaran : (summary.pengeluaranKas || 0);
  const saldoAwal = summary.saldoAwalKas || 0;
  const sisaSaldo = Math.max(0, saldoAwal + pemasukan - pengeluaran);
  const totalKK = summary.totalRumah !== undefined ? summary.totalRumah : wargaList.length;
  const lunasKK = summary.rumahLunas !== undefined
    ? summary.rumahLunas
    : wargaList.filter((w) => w.statusIpl === 'Lunas').length;

  const menetap = summary.wargaMenetap !== undefined
    ? summary.wargaMenetap
    : wargaList.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('menetap') && !st.includes('belum');
      }).length;

  const pulangPergi = summary.wargaPulangPergi !== undefined
    ? summary.wargaPulangPergi
    : wargaList.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('pergi') || st.includes('pulang');
      }).length;

  const belumMenetap = summary.wargaBelumMenetap !== undefined
    ? summary.wargaBelumMenetap
    : wargaList.filter((w) => {
        const st = (w.statusTempatTinggal || '').toLowerCase();
        return st.includes('belum');
      }).length;

  const persentaseNum = totalKK > 0 ? Math.round((lunasKK / totalKK) * 100) : 0;

  const noRek = rekeningBank?.noRekening || '1240010437979';
  const namaBank = rekeningBank?.namaBank || 'Bank Mandiri';
  const atasNama = rekeningBank?.atasNama || 'Dwi Saputra';
  const catatanRek = rekeningBank?.catatan || 'Note: Blok & No. Rumah (Cth: D13 No. 7)';
  const metodePembayaranList =
    rekeningBank?.metodePembayaran && rekeningBank.metodePembayaran.length > 0
      ? rekeningBank.metodePembayaran
      : [`Transfer ${namaBank}`, 'QRIS Paguyuban', 'Tunai ke Bendahara'];

  useEffect(() => {
    if (!metodePembayaranList.includes(bayarMetode)) {
      setBayarMetode(metodePembayaranList[0]);
    }
  }, [namaBank, noRek, rekeningBank]);
  const handleCopyRek = () => {
    navigator.clipboard?.writeText(noRek);
    setCopiedRek(true);
    setTimeout(() => setCopiedRek(false), 1800);
  };

  // Menu Sidebar Pill Vertikal Kiri
  const navItems = [
    { id: 'beranda', label: 'Dashboard Utama', icon: LayoutGrid },
    { id: 'ipl', label: 'Iuran IPL & Kas', icon: CreditCard },
    { id: 'urunan', label: 'Program Urunan PJU', icon: BarChart2 },
    { id: 'warga', label: 'Data Warga & Blok', icon: Building2 },
    { id: 'ronda', label: 'Jadwal Siskamling', icon: Users },
    { id: 'pengumuman', label: 'Pengumuman Paguyuban', icon: Calendar },
  ];

  // Metrik Program Urunan Lampu PJU untuk Beranda
  const totalUrunanPju = urunanList.reduce((acc, item) => acc + item.nominal, 0);
  const targetUrunanPju = programUrunan.targetNominal || 17500000;
  const persenUrunanPju = Math.min(100, Math.round((totalUrunanPju / targetUrunanPju) * 100));
  const donaturPjuCount = urunanList.filter((u) => u.tipe === 'DONATUR').length;
  const wajibPjuCount = urunanList.filter((u) => u.tipe === 'URUNAN_WAJIB').length;

  // Mutasi Kas & Urunan PJU Terkini untuk Beranda
  const recentTransfers = [
    ...(transaksiList.slice(0, 2).map((t, idx) => ({
      id: `trx-${idx}-${t.namaWarga}`,
      title: `IPL ${t.namaWarga}`,
      time: `Kas IPL • ${t.lokasiRumah}`,
      badge: `Rp ${(t.nominalBayar / 1000).toLocaleString('id-ID')}rb`,
      isPositive: true,
    })) || []),
    ...(urunanList.slice(0, 3).map((u, idx) => ({
      id: `pju-${idx}-${u.id}`,
      title: `PJU: ${u.namaWarga}`,
      time: `${u.tipe === 'DONATUR' ? '🟡 ★ Donatur PJU' : '🔵 Urunan Wajib PJU'} • ${u.metode}`,
      badge: `Rp ${(u.nominal / 1000).toLocaleString('id-ID')}rb`,
      isPositive: true,
    })) || []),
    ...(pengeluaranList.slice(0, 1).map((p) => ({
      id: p.id,
      title: p.keterangan || p.kategori,
      time: `Pengeluaran • ${p.tanggal}`,
      badge: `-Rp ${(p.nominal / 1000).toLocaleString('id-ID')}rb`,
      isPositive: false,
    })) || []),
  ].slice(0, 3);
  const tonightRonda =
    rondaList.find((r) => r.id === 'RND-M2-SABTU') ||
    rondaList.find((r) => r.petugas.length >= 6) ||
    rondaList[0];

  // Judul Dinamis sesuai Menu Aktif
  const menuHeaderInfo: Record<string, { title: string; subtitle: string }> = {
    beranda: {
      title: 'Halo, Warga Paguyuban PK8!',
      subtitle: 'Ringkasan kas paguyuban, program urunan lampu PJU, jadwal ronda malam, & informasi PK8 Tahap 2',
    },
    ipl: {
      title: 'Iuran IPL & Kas Paguyuban',
      subtitle: `Transparansi status IPL warga (Rp ${tarifIpl.toLocaleString('id-ID')}/bln), konfirmasi transfer, dan pengeluaran paguyuban`,
    },
    urunan: {
      title: programUrunan.namaProgram,
      subtitle: programUrunan.tujuan,
    },
    warga: {
      title: 'Direktori & Pendataan Warga',
      subtitle: `Data kependudukan ${wargaList.length} Kepala Keluarga di Paguyuban Pesona Kahuripan 8 Tahap 2`,
    },
    ronda: {
      title: 'Jadwal Siskamling Malam',
      subtitle: 'Rotasi 6 petugas jaga malam, pos gerbang utama, dan keamanan blok pemukiman',
    },
    pengumuman: {
      title: 'Papan Pengumuman & Kegiatan',
      subtitle: 'Agenda kerja bakti, rapat warga, dan informasi resmi Pengurus Paguyuban',
    },
  };

  const validWargaTabs = ['beranda', 'ipl', 'urunan', 'warga', 'ronda', 'pengumuman'];
  const currentTab = validWargaTabs.includes(activeTab) ? activeTab : 'beranda';
  const currentHeader = menuHeaderInfo[currentTab] || menuHeaderInfo.beranda;

  // Handler Submit Konfirmasi IPL Warga -> Buka Modal Konfirmasi Input Terlebih Dahulu
  const parsedDurasiNilai = Math.max(1, parseInt(bayarDurasiNilai, 10) || 1);
  const totalBulanIpl = bayarDurasiSatuan === 'Tahun' ? parsedDurasiNilai * 12 : parsedDurasiNilai;
  const computedBayarNominal = totalBulanIpl * tarifIpl;
  const computedDurasiLabel =
    bayarDurasiSatuan === 'Tahun'
      ? `${parsedDurasiNilai} Tahun (${totalBulanIpl} Bulan)`
      : `${parsedDurasiNilai} Bulan`;

  const handleBuktiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setBayarError('Ukuran file maksimal 10MB.');
      return;
    }
    setBayarError('');
    setBayarBuktiFileName(file.name);
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const reader = new FileReader();
    reader.onload = () => {
      const rawResult = typeof reader.result === 'string' ? reader.result : '';
      if (isPdf) {
        setBayarBuktiDataUrl(rawResult);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 900;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setBayarBuktiDataUrl(canvas.toDataURL('image/jpeg', 0.78));
        } else {
          setBayarBuktiDataUrl(rawResult);
        }
      };
      img.onerror = () => setBayarBuktiDataUrl(rawResult);
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };
  // Deteksi apakah warga memiliki catatan penolakan pembayaran IPL dari Admin
  const getRejectedIplReason = (w?: WargaRecord | null): string | null => {
    if (!w) return null;
    if (w.statusIpl === 'Lunas' || w.statusIpl === 'Menunggu Verifikasi') return null;
    if (w.catatan && /ditolak/i.test(w.catatan)) {
      return w.catatan.replace(/^pembayaran\s*ditolak\s*:\s*/i, '').trim() || 'Bukti bayar belum sesuai';
    }
    const rejectedTrx = transaksiList.find(
      (t) =>
        t.status === 'Ditolak' &&
        (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
          t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
    );
    if (rejectedTrx) {
      return (
        (rejectedTrx.keterangan || '')
          .replace(/^ditolak\s*:\s*/i, '')
          .trim() || 'Bukti transfer belum sesuai, silakan unggah ulang'
      );
    }
    return null;
  };

  const parseTrxMonths = (durasiStr: string, nominal: number): number => {
    const blnMatch = (durasiStr || '').match(/(\d+)\s*Bulan/i);
    if (blnMatch) return Math.max(1, parseInt(blnMatch[1], 10));
    const thnMatch = (durasiStr || '').match(/(\d+)\s*Tahun/i);
    if (thnMatch) return Math.max(1, parseInt(thnMatch[1], 10) * 12);
    return Math.max(1, Math.round((nominal || tarifIpl || 30000) / (tarifIpl || 30000)));
  };

  const formatTotalMonthsLabel = (m: number): string => {
    if (m === 12) return '1 Tahun (12 Bulan)';
    if (m > 12 && m % 12 === 0) return `${m / 12} Tahun (${m} Bulan)`;
    if (m > 12) return `${Math.floor(m / 12)} Thn ${m % 12} Bln (${m} Bulan)`;
    return `${m} Bulan`;
  };

  const getLatestIplTrx = (w?: WargaRecord | null): TransaksiIPL | undefined => {
    if (!w) return undefined;
    return transaksiList.find(
      (t) =>
        t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
        t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase()
    );
  };

  // Akumulasi seluruh pembayaran IPL Lunas & Deteksi Otomatis Jika Waktu 1 Bulan Sudah Lewat (Kelewat / Jatuh Tempo)
  const getWargaIplAccumulated = (w?: WargaRecord | null) => {
    if (!w) {
      return {
        paketLabel: '1 Bulan',
        nominalTotal: tarifIpl,
        lunasMonths: 0,
        lunasNominal: 0,
        isExpired: false,
        expiryNote: '',
        activeUntilText: '',
      };
    }
    const matching = transaksiList.filter(
      (t) =>
        t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
        t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase()
    );
    const lunasList = matching.filter((t) => t.status === 'Lunas');
    const pendingTrx = matching.find((t) => t.status === 'Menunggu Verifikasi');
    const lunasMonths = lunasList.reduce(
      (acc, t) => acc + parseTrxMonths(t.durasiPaket, t.nominalBayar),
      0
    );
    const lunasNominal = lunasList.reduce((acc, t) => acc + t.nominalBayar, 0);

    const isExpired =
      !pendingTrx &&
      ((w.catatan && /kelewat|habis/i.test(w.catatan)) ||
        (w.periodeTercover && /habis|kelewat/i.test(w.periodeTercover)) ||
        (lunasMonths > 0 &&
          lunasMonths <= 1 &&
          lunasList.every(
            (t) =>
              /sep|agu|jul|jun/i.test(t.tanggalPelunasan || '') ||
              /sep|agu|jul|jun/i.test(t.periodeTercover || '') ||
              /kelewat|habis/i.test(t.keterangan || '')
          )));

    if (pendingTrx) {
      const pendMonths = parseTrxMonths(pendingTrx.durasiPaket, pendingTrx.nominalBayar);
      if (lunasMonths > 0 && !isExpired) {
        return {
          paketLabel: `Lunas ${formatTotalMonthsLabel(lunasMonths)} + Verifikasi ${pendingTrx.durasiPaket}`,
          nominalTotal: lunasNominal + pendingTrx.nominalBayar,
          lunasMonths,
          lunasNominal,
          pendingMonths: pendMonths,
          isExpired: false,
          expiryNote: '',
          activeUntilText: '',
        };
      }
      return {
        paketLabel: pendingTrx.durasiPaket || w.periodeTercover || '1 Bulan',
        nominalTotal: pendingTrx.nominalBayar || w.nominalIpl || tarifIpl,
        lunasMonths: 0,
        lunasNominal: 0,
        isExpired: false,
        expiryNote: '',
        activeUntilText: '',
      };
    }

    if (isExpired) {
      return {
        paketLabel: '1 Bulan (Sep 2026 — Habis 30 Sep)',
        nominalTotal: tarifIpl,
        lunasMonths: 0,
        lunasNominal: 0,
        isExpired: true,
        expiryNote: 'Periode Sep Habis (30 Sep 2026) • Batas Bayar Okt: 31 Okt 2026',
        activeUntilText: 'Berakhir 30 Sep 2026',
      };
    }

    if (lunasMonths > 0) {
      const activeUntilText =
        lunasMonths >= 13
          ? 'Aktif s/d Akhir Bulan Okt 2027 (31 Okt 2027)'
          : lunasMonths === 12
          ? 'Aktif s/d Akhir Bulan Sep 2027 (30 Sep 2027)'
          : 'Aktif s/d Akhir Bulan (31 Okt 2026)';
      return {
        paketLabel: formatTotalMonthsLabel(lunasMonths),
        nominalTotal: lunasNominal,
        lunasMonths,
        lunasNominal,
        isExpired: false,
        expiryNote: '',
        activeUntilText,
      };
    }

    const tunggakanMatch =
      (w.periodeTercover || '').match(/(\d+)\s*Bulan/i) ||
      (w.catatan || '').match(/(\d+)\s*Bulan/i);
    const parsedTunggakanMonths =
      w.nominalIpl && w.nominalIpl > tarifIpl
        ? Math.max(1, Math.round(w.nominalIpl / tarifIpl))
        : tunggakanMatch
        ? Math.max(1, parseInt(tunggakanMatch[1], 10))
        : 1;

    const tunggakanPeriodText =
      parsedTunggakanMonths === 2
        ? 'Sep – Okt 2026'
        : parsedTunggakanMonths === 3
        ? 'Agu – Okt 2026'
        : parsedTunggakanMonths === 4
        ? 'Jul – Okt 2026'
        : parsedTunggakanMonths === 5
        ? 'Jun – Okt 2026'
        : 'Oktober 2026';

    return {
      paketLabel:
        parsedTunggakanMonths >= 2
          ? `Tunggakan ${parsedTunggakanMonths} Bulan (${tunggakanPeriodText})`
          : w.periodeTercover && w.periodeTercover !== 'Oktober 2026'
          ? w.periodeTercover
          : '1 Bulan',
      nominalTotal: parsedTunggakanMonths * tarifIpl,
      lunasMonths: 0,
      lunasNominal: 0,
      isExpired: false,
      expiryNote: '',
      activeUntilText: '',
      tunggakanMonths: parsedTunggakanMonths,
      tunggakanPeriodText,
    };
  };
  const normalizePersonName = (raw: string): string =>
    raw
      .split('(')[0]
      .trim()
      .toLowerCase()
      .replace(/^(bapak|pak|bp\.?|ibu|bu|mama|mamah|teh|om|mas|bang|kang|haji|h\.|hj\.)\s+/i, '')
      .trim();

  const getExistingWajibPju = (nama: string, lokasi?: string): ItemUrunanWarga | undefined => {
    const cleanN = normalizePersonName(nama);
    const cleanL = (lokasi || '').trim().toLowerCase();
    if (!cleanN) return undefined;
    const matches = urunanList.filter((u) => {
      const uName = u.namaWarga.toLowerCase();
      const normU = normalizePersonName(u.namaWarga);
      return (
        normU === cleanN ||
        uName === nama.trim().toLowerCase() ||
        (cleanL.length > 0 && uName.includes(cleanL))
      );
    });
    if (matches.length === 0) return undefined;
    const totalNom = matches.reduce((acc, m) => acc + m.nominal, 0);
    const wajibMatch = matches.find((m) => m.tipe === 'URUNAN_WAJIB') || matches[0];
    return { ...wajibMatch, nominal: totalNom };
  };

  // ===========================================================================
  // 🤖 AI SMART ANTI-DOUBLE DETECTOR (Fuzzy Levenshtein + Sapaan + Blok/WA)
  // ===========================================================================
  const computeTextSimilarity = (a: string, b: string): number => {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    return 1 - dp[m][n] / Math.max(m, n);
  };

  const aiSimilarWargaMatch = (() => {
    const cleanN = normalizePersonName(formNama);
    const cleanB = formBlok.trim().toUpperCase().replace(/^BLOK\s*/i, '');
    const cleanNo = formNoRumah.trim().replace(/^0+/, '');
    const cleanW = formWa.trim().replace(/\D/g, '');

    if (cleanNo.length > 0) {
      const byAddr = wargaList.find(
        (w) =>
          w.blok.trim().toUpperCase().replace(/^BLOK\s*/i, '') === cleanB &&
          (String(w.noRumah).trim().replace(/^0+/, '') || String(w.noRumah).trim()) === cleanNo
      );
      if (byAddr) {
        return {
          warga: byAddr,
          reason: `Alamat Blok ${cleanB} No. ${cleanNo} sudah terdaftar atas nama "${byAddr.namaLengkap}"`,
          score: 100,
        };
      }
    }

    if (cleanW.length >= 9) {
      const byWa = wargaList.find((w) => (w.noWhatsapp || '').replace(/\D/g, '') === cleanW);
      if (byWa) {
        return {
          warga: byWa,
          reason: `Nomor WhatsApp ${formWa.trim()} sudah terdaftar milik "${byWa.namaLengkap}" (${byWa.alamatRumah})`,
          score: 100,
        };
      }
    }

    if (cleanN.length >= 3) {
      let bestMatch: WargaRecord | null = null;
      let bestScore = 0;
      for (const w of wargaList) {
        const sim = computeTextSimilarity(cleanN, normalizePersonName(w.namaLengkap));
        if (sim > bestScore) {
          bestScore = sim;
          bestMatch = w;
        }
      }
      if (bestMatch && bestScore >= 0.78) {
        return {
          warga: bestMatch,
          reason: `Nama "${formNama.trim()}" sangat mirip (${Math.round(bestScore * 100)}%) dengan warga terdaftar "${bestMatch.namaLengkap}" (${bestMatch.alamatRumah})`,
          score: Math.round(bestScore * 100),
        };
      }
    }
    return null;
  })();
  const selectedWargaForPay = wargaList.find(
    (w) =>
      w.namaLengkap.toLowerCase() === bayarNama.trim().toLowerCase() &&
      w.alamatRumah.toLowerCase() === bayarLokasi.trim().toLowerCase()
  );
  const selectedLatestTrx = getLatestIplTrx(selectedWargaForPay);
  const selectedRejectedReason = getRejectedIplReason(selectedWargaForPay);

  // Handler Submit Konfirmasi IPL Warga -> Buka Modal Konfirmasi Input Terlebih Dahulu
  const handleSubmitBayarIpl = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedWarga = wargaList.find(
      (w) =>
        w.namaLengkap.toLowerCase() === bayarNama.trim().toLowerCase() &&
        w.alamatRumah.toLowerCase() === bayarLokasi.trim().toLowerCase()
    );
    if (!bayarNama.trim() || !matchedWarga) {
      setBayarError(
        'Warga belum terdaftar di Data Warga. Silakan daftar terlebih dahulu sebelum membayar IPL.'
      );
      return;
    }
    if (!isWargaLockedInForm && matchedWarga.statusIpl === 'Menunggu Verifikasi') {
      const pendingTrx = getLatestIplTrx(matchedWarga);
      setBayarError(
        `Pengajuan IPL untuk ${matchedWarga.namaLengkap} (${matchedWarga.alamatRumah}) sedang MENUNGGU VERIFIKASI (${pendingTrx?.durasiPaket || matchedWarga.periodeTercover || '1 Bulan'} • Rp ${(pendingTrx?.nominalBayar || matchedWarga.nominalIpl || tarifIpl).toLocaleString('id-ID')}). Tidak dapat input baru selama menunggu verifikasi — silakan kembali ke Daftar IPL lalu klik tombol "Ubah" pada kartu Anda jika ingin mengubah menjadi 1 Tahun.`
      );
      return;
    }
    if (!bayarBuktiDataUrl) {
      setBayarError('Mohon unggah foto bukti transfer / struk pembayaran terlebih dahulu.');
      return;
    }
    setBayarError('');
    setConfirmDialog({
      type: 'ipl',
      step: 'review',
      noTransaksi: `#IPL-${Date.now().toString().slice(-4)}`,
      namaWarga: bayarNama.trim(),
      lokasiRumah: bayarLokasi.trim(),
      nominal: computedBayarNominal,
      durasiPaket: computedDurasiLabel,
      metode: bayarMetode,
      buktiUrl: bayarBuktiDataUrl,
      buktiFileName: bayarBuktiFileName || 'struk-transfer.jpg',
    });
  };

  const handleSubmitBayarPju = (e: React.FormEvent) => {
    e.preventDefault();
    if (pjuTipe === 'URUNAN_WAJIB' && !pjuNama.trim()) {
      setPjuError('Silakan pilih nama warga terdaftar terlebih dahulu untuk Urunan Wajib.');
      return;
    }
    if (pjuTipe === 'URUNAN_WAJIB') {
      const existingWajib = getExistingWajibPju(pjuNama, pjuLokasi);
      if (existingWajib) {
        setPjuError(
          `Data Urunan Wajib PJU untuk ${pjuNama} (${pjuLokasi || 'Terdaftar'}) SUDAH MASUK & TERDATA di daftar penyetor (No. Urut #${existingWajib.noUrut} • Rp ${existingWajib.nominal.toLocaleString('id-ID')} via ${existingWajib.metode === 'Cash' ? 'Cash Tunai' : 'Transfer'}). Tidak bisa input Urunan Wajib dua kali (pilih ★ Donatur jika ingin menambah donasi sukarela).`
        );
        return;
      }
    }
    const nominalNum = parseInt(pjuNominal.replace(/\D/g, ''), 10) || 0;
    if (nominalNum <= 0) {
      setPjuError('Silakan masukkan nominal setoran terlebih dahulu.');
      return;
    }
    if (pjuTipe === 'URUNAN_WAJIB' && nominalNum < 115000) {
      setPjuError('Nominal Urunan Wajib PJU adalah Rp 115.000 / KK.');
      return;
    }
    setPjuError('');
    const finalNamaDonatur =
      pjuTipe === 'DONATUR'
        ? pjuNama.trim() || 'Donatur PK8 (Hamba Allah)'
        : pjuLokasi
        ? `${pjuNama} (${pjuLokasi})`
        : pjuNama;
    setConfirmDialog({
      type: 'pju',
      step: 'review',
      idSetoran: editingPjuId || `#PJU-${('000' + (urunanList.length + 1)).slice(-3)}`,
      namaPenyetor: finalNamaDonatur,
      tipe: pjuTipe,
      nominal: nominalNum,
      metode: pjuMetode,
      buktiBayar: pjuBuktiBase64 || pjuBuktiName || '-',
      buktiFileName: pjuBuktiName || '',
      keterangan: `Menunggu Verifikasi • ${pjuBuktiName ? `Bukti: ${pjuBuktiName}` : pjuTipe === 'DONATUR' ? 'Donatur PJU' : pjuLokasi || 'Urunan Wajib'}`,
    });
  };

  const handleConfirmSavePju = async () => {
    if (!confirmDialog || confirmDialog.type !== 'pju' || confirmDialog.step === 'syncing') return;
    setConfirmDialog({ ...confirmDialog, step: 'syncing' });
    setIsSyncingPju(true);
    try {
      const newItem: ItemUrunanWarga = {
        id: confirmDialog.idSetoran,
        noUrut: urunanList.filter((u) => u.tipe === confirmDialog.tipe).length + 1,
        programId: programUrunan.id || 'PRG-PJU-01',
        tipe: confirmDialog.tipe,
        namaWarga: confirmDialog.namaPenyetor,
        nominal: confirmDialog.nominal,
        metode: confirmDialog.metode,
        status: 'Menunggu Verifikasi',
        buktiBayar: confirmDialog.buktiBayar && confirmDialog.buktiBayar !== '-' ? confirmDialog.buktiBayar : undefined,
        keterangan: confirmDialog.keterangan,
        tanggal: '12 Okt 2026',
        waktuInput:
          new Date().toLocaleString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) + ' WIB',
      };
      await onAddUrunan?.(newItem);
      setOwnedPjuIds((prev) => (prev.includes(newItem.id) ? prev : [...prev, newItem.id]));
      setLiveActivityNotifs((prev) => [
        {
          id: `notif-pju-${Date.now()}`,
          title: `Urunan PJU: ${confirmDialog.namaPenyetor}`,
          desc: `${confirmDialog.tipe === 'DONATUR' ? 'Donatur PJU' : 'Urunan Wajib'} • Rp ${confirmDialog.nominal.toLocaleString('id-ID')} (${confirmDialog.metode})`,
          time: 'Baru saja',
          targetTab: 'urunan',
          cat: 'aktivitas',
        },
        ...prev,
      ]);
      setPjuNama('');
      setPjuLokasi('');
      setPjuBuktiName('');
      setEditingPjuId(null);
      setPjuSuccess(true);
      setTimeout(() => setPjuSuccess(false), 3500);
      // Langsung kembalikan tampilan latar ke daftar PJU agar tidak tertahan di form
      setUrunanMode('daftar');
      setUrunanFilter('ALL');
      setUrunanPage(1);
      setConfirmDialog((prev) => (prev ? { ...prev, step: 'done' } : null));
    } finally {
      setIsSyncingPju(false);
    }
  };

  const isSyncingSheets = confirmDialog?.step === 'syncing' || isSyncingEdit;

  // Hanya data yang baru diinput/diklaim di perangkat ini yang terbuka otomatis; sisanya wajib verifikasi PIN 4-Digit WA
  const isWargaOwnedByUser = (_w: WargaRecord): boolean => {
    return false;
  };

  // Verifikasi Kepemilikan Rumah dengan PIN 4-Digit (Diambil dari 4 Angka Belakang Nomor WhatsApp Terdaftar)
  // Verifikasi Kepemilikan Rumah dengan PIN Rahasia Warga (Tersimpan saat Pendaftaran atau 4 Angka Belakang WA)
  // Verifikasi Kepemilikan Rumah dengan Password / PIN Rahasia Warga (8 Karakter Huruf Besar, Kecil, Angka, Karakter)
  // Verifikasi Kepemilikan Rumah: Wajib DUA KUNCI (Password Rumah + 4 Digit Terakhir No. WA)
  const verifyHouseTwoFactor = async (
    w: WargaRecord,
    inputPassword: string,
    inputLast4Wa: string
  ): Promise<{ isValid: boolean; errorMsg?: string; isLocked?: boolean; remainingSeconds?: number }> => {
    const houseKey = w.id || w.alamatRumah;
    const rawPw = inputPassword.trim();
    const clean4 = inputLast4Wa.replace(/\D/g, '').slice(-4);

    // 0. CEK LOCKOUT AKTIF (Proteksi Brute-Force 5x salah = Bekukan 5 menit)
    const currentLock = getHouseLockoutState(houseKey);
    if (currentLock.isLocked) {
      const mins = Math.floor(currentLock.remainingSeconds / 60);
      const secs = currentLock.remainingSeconds % 60;
      const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
      return {
        isValid: false,
        errorMsg: `Akses dibekukan sementara (5x salah input). Silakan tunggu ${timeStr} untuk mencoba lagi.`,
        isLocked: true,
        remainingSeconds: currentLock.remainingSeconds,
      };
    }

    if (!rawPw && !clean4) {
      return { isValid: false, errorMsg: 'Mohon masukkan Password Rumah dan 4 digit terakhir No. WA Anda.' };
    }
    if (!rawPw) {
      return { isValid: false, errorMsg: 'Password Rumah wajib diisi.' };
    }
    if (clean4.length < 4) {
      return { isValid: false, errorMsg: '4 digit terakhir No. WA harus lengkap 4 angka.' };
    }

    // 1. Verifikasi Password Rumah (Mendukung SHA-256 Hash dan plaintext)
    const isPwCorrect = await verifyPasswordMatch(rawPw, w.pin, w.pinHash);

    // 2. Verifikasi 4 Angka Akhir Nomor WhatsApp (Sumber Resmi: Tab DATA_WARGA Google Sheets Kolom H & V)
    const cleanWaReg = (w.noWhatsapp || '').replace(/\D/g, '');
    const actualLast4 = cleanWaReg.slice(-4);
    const sheetKodeWa = (w.kodeWa || '').replace(/\D/g, '').slice(-4);
    const isWaCorrect =
      (actualLast4 && clean4 === actualLast4) ||
      (sheetKodeWa && clean4 === sheetKodeWa) ||
      (!actualLast4 && !sheetKodeWa);

    // JIKA SALAH: Catat percobaan gagal & aktifkan lockout jika sudah 5x berturut-turut
    if (!isPwCorrect || !isWaCorrect) {
      const updatedLock = recordHouseFailedAttempt(houseKey);
      if (updatedLock.isLocked) {
        const mins = Math.floor(updatedLock.remainingSeconds / 60);
        const secs = updatedLock.remainingSeconds % 60;
        const timeStr = `${mins}:${String(secs).padStart(2, '0')}`;
        return {
          isValid: false,
          errorMsg: `⚠️ Akses Dibekukan Selama 5 Menit: Terlalu banyak percobaan salah (5x). Silakan tunggu ${timeStr} atau hubungi Admin Paguyuban.`,
          isLocked: true,
          remainingSeconds: updatedLock.remainingSeconds,
        };
      }

      const sisa = 5 - updatedLock.failedAttempts;
      if (!isPwCorrect && !isWaCorrect) {
        return {
          isValid: false,
          errorMsg: `Password Rumah dan 4 Digit WA tidak cocok. (Sisa kesempatan: ${sisa}x lagi sebelum dibekukan 5 menit)`,
        };
      }
      if (!isPwCorrect) {
        return {
          isValid: false,
          errorMsg: `Password Rumah salah. (Sisa kesempatan: ${sisa}x lagi sebelum dibekukan 5 menit)`,
        };
      }
      if (!isWaCorrect) {
        return {
          isValid: false,
          errorMsg: `4 digit akhir No. WA tidak cocok. (Sisa kesempatan: ${sisa}x lagi sebelum dibekukan 5 menit)`,
        };
      }
    }

    // JIKA BERHASIL: Reset catatan percobaan gagal
    resetHouseLockout(houseKey);
    return { isValid: true };
  };

  const verifyHousePin4Digit = (w: WargaRecord, inputPinOrWa: string): boolean => {
    const raw = inputPinOrWa.trim();
    if (!raw) return false;
    if (w.pin && w.pin.trim() && raw === w.pin.trim()) return true;
    const clean = raw.replace(/\D/g, '');
    const last4 = (w.noWhatsapp || '').replace(/\D/g, '').slice(-4);
    const sheetKodeWa = (w.kodeWa || '').replace(/\D/g, '').slice(-4);
    return clean === last4 || (Boolean(sheetKodeWa) && clean === sheetKodeWa);
  };

  const validateNamaWarga = (nama: string) => {
    const trimmed = nama.trim();
    if (!trimmed) return { isValid: false, message: 'Wajib diisi (nama lengkap KK)' };
    if (trimmed.length < 3) return { isValid: false, message: 'Minimal 3 karakter huruf' };
    if (/\d/.test(trimmed)) return { isValid: false, message: 'Nama tidak boleh mengandung angka' };
    if (!/^[a-zA-Z\s.,'`-]+$/.test(trimmed)) return { isValid: false, message: 'Hanya huruf dan tanda baca nama' };
    return { isValid: true, message: 'Nama Kepala Keluarga Valid' };
  };

  const validateNomorWhatsApp = (wa: string) => {
    const clean = wa.replace(/\D/g, '');
    if (!clean) return { isValid: false, message: 'Wajib diisi (nomor WhatsApp)' };
    if (!clean.startsWith('08') && !clean.startsWith('628')) {
      return { isValid: false, message: 'Harus diawali 08xx atau 628xx (nomor seluler Indonesia)' };
    }
    const effectiveLen = clean.startsWith('628') ? clean.length - 1 : clean.length;
    if (effectiveLen < 10) return { isValid: false, message: 'Nomor terlalu pendek (min. 10 digit)' };
    if (effectiveLen > 13) return { isValid: false, message: 'Nomor terlalu panjang (maks. 13 digit)' };
    return { isValid: true, message: 'Format Nomor WhatsApp Valid' };
  };

  const validateSecurePassword = (pw: string) => {
    const hasMin8 = pw.length >= 8;
    const hasUpper = /[A-Z]/.test(pw);
    const hasLower = /[a-z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);
    const isValid = hasMin8 && hasUpper && hasLower && hasNumber && hasSpecial;
    return { hasMin8, hasUpper, hasLower, hasNumber, hasSpecial, isValid };
  };
  const handleOpenDetailWarga = (w: WargaRecord) => {
    setDetailWarga(w);
    setIsDetailModalUnlocked(false);
    setIsEditingOwned(false);
    setEditSyncDone(false);
    setShowVerifyWa(false);
    setVerifyWaInput('');
    setVerifyWaError('');
    setEditNama(w.namaLengkap);
    const rawBlok = (w.blok || '').toUpperCase().replace(/^BLOK\s*/i, '').trim();
    const letterMatch = rawBlok.match(/^[A-Z]/);
    const numMatch = rawBlok.match(/\d+$/);
    setEditBlok(letterMatch ? letterMatch[0] : 'D');
    setEditNoBlok(numMatch ? numMatch[0] : '');
    setEditNoRumah(w.noRumah);
    setEditWa(w.noWhatsapp || '');
    setEditDomisili(w.statusTempatTinggal);
    setEditJiwa(String(w.jmlJiwa || 1));
    setEditAnggota(w.anggotaKeluargaTambahan && w.anggotaKeluargaTambahan !== '-' ? w.anggotaKeluargaTambahan : '');
  };
  const handleSaveOwnedEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailWarga || !onUpdateWarga || isSyncingEdit) return;
    setIsSyncingEdit(true);
    try {
      const origKey = detailWarga.id || detailWarga.alamatRumah;
      const fullBlok = editNoBlok.trim()
        ? `${editBlok.trim().toUpperCase()}${editNoBlok.trim()}`
        : editBlok.trim().toUpperCase();
      const updatedRecord: WargaRecord = {
        ...detailWarga,
        namaLengkap: editNama.trim() || detailWarga.namaLengkap,
        blok: fullBlok,
        noRumah: editNoRumah.trim() || detailWarga.noRumah,
        alamatRumah: `Blok ${fullBlok} No. ${editNoRumah.trim() || detailWarga.noRumah}`,
        noWhatsapp: editWa.trim() || detailWarga.noWhatsapp,
        statusTempatTinggal: editDomisili,
        jmlJiwa: Math.max(1, parseInt(editJiwa, 10) || 1),
        anggotaKeluargaTambahan: editAnggota.trim() || '-',
      };
      await onUpdateWarga(origKey, {
        namaLengkap: updatedRecord.namaLengkap,
        blok: updatedRecord.blok,
        noRumah: updatedRecord.noRumah,
        noWhatsapp: updatedRecord.noWhatsapp,
        statusTempatTinggal: updatedRecord.statusTempatTinggal,
        jmlJiwa: updatedRecord.jmlJiwa,
        anggotaKeluargaTambahan: updatedRecord.anggotaKeluargaTambahan,
      });
      const logEntry = await generateSmartAuditLog({
        action: 'EDIT_WARGA',
        before: detailWarga,
        after: updatedRecord,
      });
      setAuditLogs(loadWargaAuditLogs());
      setLiveActivityNotifs((prev) => [
        {
          id: logEntry.id,
          title: `Log Edit Warga (${updatedRecord.alamatRumah})`,
          desc: logEntry.changes.join(' • '),
          time: 'Baru saja',
          targetTab: 'warga',
          cat: 'aktivitas',
        },
        ...prev,
      ]);
      setDetailWarga(updatedRecord);
      setIsEditingOwned(false);
      setEditSyncDone(true);
    } finally {
      setIsSyncingEdit(false);
    }
  };

  const handleConfirmSaveIpl = async () => {
    if (!confirmDialog || confirmDialog.type !== 'ipl' || confirmDialog.step === 'syncing') return;
    setConfirmDialog({ ...confirmDialog, step: 'syncing' });
    await onUploadBuktiIpl({
      noTransaksi: confirmDialog.noTransaksi,
      namaWarga: confirmDialog.namaWarga,
      lokasiRumah: confirmDialog.lokasiRumah,
      nominal: confirmDialog.nominal,
      durasiPaket: confirmDialog.durasiPaket,
      metode: confirmDialog.metode,
      buktiUrl: confirmDialog.buktiUrl,
    });
    const iplLog = await generateIplAuditLog({
      noTransaksi: confirmDialog.noTransaksi,
      namaWarga: confirmDialog.namaWarga,
      lokasiRumah: confirmDialog.lokasiRumah,
      nominal: confirmDialog.nominal,
      metode: confirmDialog.metode,
    });
    setAuditLogs(loadWargaAuditLogs());
    // Reset seluruh field form IPL & kunci kartu agar tidak tertinggal di form pengisian
    setBayarNama('');
    setBayarLokasi('');
    setIsWargaLockedInForm(false);
    setBayarBuktiDataUrl('');
    setBayarBuktiFileName('');
    setBayarError('');
    setIplMode('daftar');
    setBayarSuccess(true);
    setTimeout(() => setBayarSuccess(false), 3500);
    setLiveActivityNotifs((prev) => [
      {
        id: iplLog.id,
        title: `Log IPL: ${confirmDialog.namaWarga} (${confirmDialog.noTransaksi})`,
        desc: `${confirmDialog.lokasiRumah} • Rp ${confirmDialog.nominal.toLocaleString('id-ID')} (${confirmDialog.metode})`,
        time: 'Baru saja',
        targetTab: 'ipl',
        cat: 'aktivitas',
      },
      ...prev,
    ]);
    setConfirmDialog((prev) => (prev ? { ...prev, step: 'done' } : null));
  };

  // Reset dan Buka Form Pendaftaran Warga Baru ke Langkah 1 Bersih
  const handleOpenFormWarga = () => {
    setFormStep(1);
    setFormNama('');
    setFormNoRumah('');
    setFormWa('');
    setFormPin('');
    setFormConfirmPin('');
    setFormAnggota('');
    setFormWargaError('');
    setWargaMode('form');
  };

  // Handler Submit Pendaftaran Warga Baru -> Validasi Anti-Double (Blok+No, Nama, & No WA) sebelum Buka Modal Konfirmasi
  const handleSubmitWargaBaru = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNama = formNama.trim();
    const cleanBlokLetter = formBlok.trim().toUpperCase().replace(/^BLOK\s*/i, '');
    const cleanNoBlok = formNoBlok.trim();
    const fullBlok = cleanNoBlok ? `${cleanBlokLetter}${cleanNoBlok}` : cleanBlokLetter;
    const cleanNoRumah = (formNoRumah.trim() || cleanNoBlok);
    const cleanWa = formWa.trim().replace(/\D/g, '');
    const namaVal = validateNamaWarga(cleanNama);
    if (!namaVal.isValid) {
      setFormWargaError(`Nama Kepala Keluarga tidak valid: ${namaVal.message}`);
      return;
    }
    const waVal = validateNomorWhatsApp(formWa);
    if (!waVal.isValid) {
      setFormWargaError(`Nomor WhatsApp tidak valid: ${waVal.message}`);
      return;
    }
    if (!cleanNoRumah) {
      setFormWargaError('Mohon isi Nomor Rumah terlebih dahulu.');
      return;
    }
    const pwCheck = validateSecurePassword(formPin);
    if (!pwCheck.isValid) {
      setFormWargaError('Password minimal 8 karakter dengan kombinasi huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol khusus (!@#$).');
      return;
    }
    if (formPin !== formConfirmPin) {
      setFormWargaError('Konfirmasi Password tidak cocok.');
      return;
    }
    // 1. Cek Duplikat Alamat Rumah (Normalisasi ketat karakter, spasi, simbol, leading zeros)
    const cleanAddressKey = (blokStr: string, noStr: string) => {
      const b = blokStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const n = String(noStr).replace(/[^0-9]/g, '').replace(/^0+/, '') || '1';
      return `${b}-${n}`;
    };
    const targetAddrKey = cleanAddressKey(fullBlok, cleanNoRumah);
    const existingByAddr = wargaList.find((w) => {
      const existingKey = cleanAddressKey(w.blok, String(w.noRumah));
      return existingKey === targetAddrKey;
    });
    if (existingByAddr) {
      setFormWargaError(
        `Alamat Blok ${fullBlok} No. ${cleanNoRumah} sudah terdaftar a.n. ${existingByAddr.namaLengkap}. Satu alamat rumah tidak dapat didaftarkan ganda.`
      );
      return;
    }

    // 2. Cek Duplikat Nomor WhatsApp (Normalisasi awalan 08 / 628 / +628 & karakter pemisah)
    const normalizeWaDigits = (raw: string) => {
      let d = raw.replace(/\D/g, '');
      if (d.startsWith('62')) d = '0' + d.slice(2);
      return d;
    };
    const targetWaNorm = normalizeWaDigits(cleanWa);
    const existingByWa = wargaList.find((w) => {
      const normW = normalizeWaDigits(w.noWhatsapp || '');
      return normW.length >= 9 && normW === targetWaNorm;
    });
    if (existingByWa) {
      setFormWargaError(
        `Nomor WhatsApp "${formWa.trim()}" sudah terdaftar a.n. ${existingByWa.namaLengkap} (${existingByWa.alamatRumah}). Nomor WhatsApp tidak boleh digunakan ganda.`
      );
      return;
    }

    // 3. Cek Duplikat Nama Lengkap Kepala Keluarga (Normalisasi gelar & simbol)
    const strictNameNorm = (raw: string) => {
      return raw
        .toLowerCase()
        .replace(/^(bapak|ibu|pak|bu|bpk|haji|h\.|hj\.)\s+/gi, '')
        .replace(/[^a-z0-9]/g, '');
    };
    const targetNameNorm = strictNameNorm(cleanNama);
    const existingByName = wargaList.find((w) => {
      return strictNameNorm(w.namaLengkap) === targetNameNorm;
    });
    if (existingByName) {
      setFormWargaError(
        `Nama "${cleanNama}" terdeteksi sudah terdaftar di ${existingByName.alamatRumah}. Satu nama kepala keluarga tidak dapat didaftarkan ulang.`
      );
      return;
    }
    setFormWargaError('');
    setConfirmDialog({
      type: 'warga',
      step: 'review',
      namaLengkap: cleanNama,
      blok: fullBlok,
      noRumah: cleanNoRumah,
      noWhatsapp: formWa.trim() || '081200000000',
      statusTempatTinggal: formDomisili,
      jmlJiwa: parseInt(formJiwa, 10) || 1,
      anggotaKeluargaTambahan: formAnggota.trim() || '-',
    });
  };

  const handleConfirmSaveWarga = async () => {
    if (!confirmDialog || confirmDialog.type !== 'warga' || confirmDialog.step === 'syncing') return;
    setConfirmDialog({ ...confirmDialog, step: 'syncing' });
    const newWargaObj: WargaRecord = {
      namaLengkap: confirmDialog.namaLengkap,
      jenisKelamin: formGender,
      blok: confirmDialog.blok,
      noRumah: confirmDialog.noRumah,
      alamatRumah: `Blok ${confirmDialog.blok} No. ${confirmDialog.noRumah}`,
      noWhatsapp: confirmDialog.noWhatsapp,
      statusTempatTinggal: confirmDialog.statusTempatTinggal,
      pekerjaan: formPekerjaan.trim() || 'Wiraswasta',
      agama: formAgama,
      statusPernikahan: 'Menikah',
      statusDalamKeluarga: 'Kepala Keluarga',
      jmlJiwa: confirmDialog.jmlJiwa,
      anggotaKeluargaTambahan: confirmDialog.anggotaKeluargaTambahan || formAnggota.trim() || '-',
      statusIpl: 'Belum Bayar',
      nominalIpl: tarifIpl,
      tanggalUpdate: '12 Okt 2026',
      catatan: `Input Mandiri Warga • PIN Rahasia: ${formPin}`,
      pin: formPin,
    };
    await onAddWarga(newWargaObj);
    onClaimWargaOwnership?.(newWargaObj);
    const newLog = await generateSmartAuditLog({
      action: 'TAMBAH_WARGA',
      after: newWargaObj,
    });
    setAuditLogs(loadWargaAuditLogs());
    setFormNama('');
    setFormNoRumah('');
    setFormWa('');
    setFormPin('');
    setFormConfirmPin('');
    setFormAnggota('');
    setFormWargaError('');
    setFormStep(1);
    // Langsung kembalikan tampilan ke direktori warga agar tidak tertahan di form pendaftaran
    setWargaMode('direktori');
    setLiveActivityNotifs((prev) => [
      {
        id: newLog.id,
        title: `Log Warga Baru: ${confirmDialog.namaLengkap}`,
        desc: `Blok ${confirmDialog.blok} No. ${confirmDialog.noRumah} (${confirmDialog.statusTempatTinggal})`,
        time: 'Baru saja',
        targetTab: 'warga',
        cat: 'aktivitas',
      },
      ...prev,
    ]);
    setConfirmDialog((prev) => (prev ? { ...prev, step: 'done' } : null));
  };

  return (
    <div
      data-view="dashboard-warga"
      className="carlic-website-bg relative lg:fixed lg:inset-0 w-full max-w-full min-h-screen lg:h-full lg:overflow-hidden overflow-x-hidden p-1.5 sm:p-2 lg:p-2 flex flex-col items-center justify-start select-none"
    >
      {/* =================================================================== */}
      {/* FULL-WIDTH TRANSLUCENT GLASS BOARD OVER SCENIC WEBSITE BACKGROUND   */}
      {/* =================================================================== */}
      <div className="carlic-board w-full max-w-full lg:max-w-[1680px] min-h-screen lg:min-h-0 lg:h-full lg:flex-1 flex flex-col rounded-[18px] sm:rounded-[24px] p-2 sm:p-2.5 lg:p-2 overflow-x-hidden lg:overflow-hidden mb-8 lg:mb-0">
        {/* ================================================================= */}
        <header className="relative z-30 rounded-[18px] px-3.5 py-2 sm:px-4 sm:py-2 mb-2 flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Decorative Clipped Background Layer so Popover is Never Clipped */}
          <div className="pk-hero-banner absolute inset-0 rounded-[18px] overflow-hidden pointer-events-none">
            <img
              src="/logo-pesona-kahuripan.png"
              alt=""
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -bottom-10 w-36 h-36 object-cover opacity-15 rounded-full blur-[0.5px]"
            />
          </div>

          {/* Left: Official Pesona Kahuripan Logo + Title (Inline Badge, 2 Lines Total) */}
          <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
            <div
              onClick={() => {
                setIplMode('daftar');
                setUrunanMode('daftar');
                setWargaMode('direktori');
                setIsWargaLockedInForm(false);
                onSelectTab('beranda');
              }}
              className="cursor-pointer w-10 h-10 rounded-xl bg-[#0B484C] ring-2 ring-[#E5C158] shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden group"
              title="Ke Dashboard Utama Pesona Kahuripan"
            >
              <img
                src="/logo-pesona-kahuripan.png"
                alt="Pesona Kahuripan"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                  {currentHeader.title}
                </h1>
                <span className="hidden sm:inline-block text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 text-[#F3D37A] border border-[#E5C158]/40 whitespace-nowrap">
                  PESONA KAHURIPAN 8 • TAHAP 2
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/85 font-medium truncate">
                {currentHeader.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Pintasan Cepat Warga + Pusat Notifikasi Interaktif */}
          {(() => {
            const allNotifItems = [
              {
                id: 'notif-bayar-urunan-pju',
                title: '💡 Bayar Urunan Lampu PJU (Rp 115.000/KK)',
                desc: `${namaBank} ${noRek} a.n. ${atasNama} • Klik untuk Bayar & Masuk Menu PJU →`,
                time: 'Bayar PJU →',
                targetTab: 'urunan',
                openPjuForm: true,
                cat: 'pengumuman' as const,
              },
              ...liveActivityNotifs,
              {
                id: `notif-ronda-${tonightRonda?.id || 'tonight'}`,
                title: `Jadwal Siskamling (${tonightRonda?.hari || 'Malam Ini'})`,
                desc: `6 Petugas Jaga • Koordinator: ${tonightRonda?.petugas[0]?.namaLengkap || '-'}`,
                time: '21.00 WIB',
                targetTab: 'ronda',
                openPjuForm: false,
                cat: 'aktivitas' as const,
              },
              ...pengumumanList.map((p) => ({
                id: `notif-pgm-${p.id}`,
                title: p.judul,
                desc: `${p.kategori} • ${p.lokasi}`,
                time: p.tanggalAcara,
                targetTab: 'pengumuman',
                openPjuForm: false,
                pengumumanObj: p,
                cat: 'pengumuman' as const,
              })),
            ];
            const unreadCount = allNotifItems.filter((n) => !readNotifIds.includes(n.id)).length;
            const visibleNotifs = allNotifItems.filter(
              (n) => notifFilter === 'ALL' || n.cat === notifFilter
            );

            return (
              <div className="relative z-20 flex items-center gap-1.5 sm:gap-2 max-w-full justify-end">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenFormWarga();
                    onSelectTab('warga');
                  }}
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-full bg-white/95 hover:bg-white text-[#092C2E] text-xs font-extrabold shadow-md transition-colors items-center gap-1.5 flex-shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#0B484C]" />
                  <span>+ Isi Data Warga</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectTab('ipl')}
                  className="hidden sm:inline-flex pk-gold-gradient px-3.5 py-2 rounded-full text-[#062C2F] text-xs font-extrabold shadow-md hover:brightness-105 transition-all items-center gap-1.5 flex-shrink-0"
                >
                  <CreditCard className="w-3.5 h-3.5 text-[#062C2F]" />
                  <span>Bayar / Cek IPL</span>
                </button>

                {/* Tombol Tema Cepat di Mobile */}
                <button
                  type="button"
                  onClick={onToggleTheme}
                  title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                  className="sm:hidden w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white border border-[#E5C158]/40 backdrop-blur-xs flex items-center justify-center flex-shrink-0"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen((prev) => !prev)}
                    className={`relative w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform flex-shrink-0 ${
                      isNotifOpen
                        ? 'pk-gold-gradient text-[#062C2F]'
                        : 'bg-white/15 hover:bg-white/25 text-white border border-[#E5C158]/40 backdrop-blur-xs'
                    }`}
                    title="Pusat Notifikasi Paguyuban"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center absolute -top-1 -right-1 shadow-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Popover Dropdown Pusat Notifikasi */}
                  {isNotifOpen && (
                    <div className="absolute right-0 top-[calc(100%+10px)] w-80 sm:w-96 bg-white dark:bg-[#0B383B] rounded-3xl border border-[#D9B352]/55 shadow-2xl p-4 z-50 whitespace-normal animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100 dark:border-stone-800">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#092C2E] dark:text-white">
                            Notifikasi Paguyuban
                          </h4>
                          <p className="text-[11px] text-stone-400">
                            {unreadCount > 0
                              ? `${unreadCount} pemberitahuan belum dibaca`
                              : 'Semua pemberitahuan sudah dibaca'}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setReadNotifIds(allNotifItems.map((n) => n.id))}
                              className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] hover:underline"
                            >
                              Tandai dibaca
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setIsNotifOpen(false)}
                            className="w-7 h-7 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Filter Kategori Notifikasi */}
                      <div className="flex items-center gap-1.5 mb-3">
                        {[
                          { id: 'ALL', label: 'Semua' },
                          { id: 'pengumuman', label: 'Pengumuman' },
                          { id: 'aktivitas', label: 'Ronda & IPL' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setNotifFilter(tab.id as typeof notifFilter)}
                            className={`text-[11px] font-bold px-3 py-1 rounded-full transition-colors ${
                              notifFilter === tab.id
                                ? 'bg-[#0B484C] text-[#F3D37A]'
                                : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>

                      {/* Daftar Item Notifikasi */}
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {visibleNotifs.map((n) => {
                          const isUnread = !readNotifIds.includes(n.id);
                          return (
                            <div
                              key={n.id}
                              onClick={() => {
                                if (isUnread) {
                                  setReadNotifIds((prev) => [...prev, n.id]);
                                }
                                if (n.openPjuForm) {
                                  setUrunanMode('form');
                                }
                                if ('pengumumanObj' in n && n.pengumumanObj) {
                                  setDetailPengumuman(n.pengumumanObj);
                                }
                                onSelectTab(n.targetTab);
                                setIsNotifOpen(false);
                              }}
                              className={`cursor-pointer p-3 rounded-2xl transition-colors flex items-start justify-between gap-2.5 ${
                                isUnread
                                  ? 'bg-[#FEF9EB] dark:bg-[#0F494D] border border-[#D9B352]/40'
                                  : 'bg-[#F8F8F6] dark:bg-stone-800/60 hover:bg-stone-100'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-[#0B484C] dark:bg-[#F3D37A] flex-shrink-0" />
                                  )}
                                  <p className="text-xs font-extrabold text-[#092C2E] dark:text-white truncate">
                                    {n.title}
                                  </p>
                                </div>
                                <p className="text-[11px] text-stone-500 dark:text-stone-300 truncate mt-0.5">
                                  {n.desc}
                                </p>
                              </div>
                              <span className="text-[10px] font-bold text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
                                {n.time}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </header>

        {/* ================================================================= */}
        {/* 2. MAIN BODY: VERTICAL PILL SIDEBAR KIRI + KONTEN MENU KANAN      */}
        {/* ================================================================= */}
        <div className="flex flex-col lg:flex-row gap-2 sm:gap-2.5 items-stretch flex-1 min-h-0 w-full max-w-full overflow-x-hidden lg:overflow-hidden lg:h-full">
          {/* DESKTOP-ONLY VERTICAL PILL SIDEBAR */}
          <aside className="hidden lg:flex carlic-card lg:rounded-full px-2 py-3 flex-col items-center justify-between gap-2 lg:w-[58px] flex-shrink-0 lg:h-full">
            <nav className="flex flex-col items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isSyncingSheets}
                    onClick={() => {
                      if (!isSyncingSheets) {
                        setIplMode('daftar');
                        setUrunanMode('daftar');
                        setWargaMode('direktori');
                        setIsWargaLockedInForm(false);
                        onSelectTab(item.id);
                      }
                    }}
                    title={item.label}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isActive
                        ? 'bg-[#0B484C] text-[#F3D37A] ring-2 ring-[#D9B352]/60 shadow-sm scale-105'
                        : 'text-stone-400 hover:text-[#1C221E] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </nav>

            <div className="flex flex-col items-center gap-1.5 pt-2 mt-1 border-t border-stone-200/80 dark:border-stone-800">
              <button
                type="button"
                onClick={onToggleTheme}
                title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-[#1C221E] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={onOpenLoginModal}
                title="Login Pengurus Paguyuban"
                className="w-9 h-9 rounded-full flex items-center justify-center text-stone-400 hover:text-[#1C221E] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <LogIn className="w-4 h-4" />
              </button>
            </div>
          </aside>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 min-w-0 w-full max-w-full lg:h-full pb-20 lg:pb-0 overflow-y-auto pr-0.5">
            {/* MENU 1: BERANDA (TANPA DUPLIKASI ANGKA KAS & TANPA FINGERPRINT)*/}
            {/* ============================================================= */}
            {currentTab === 'beranda' && (
              <div className="lg:h-full flex flex-col justify-between gap-2.5">
                {/* ROW 1: 4 METRIK BERBEDA (COMPACT 52PX HEIGHT) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-2.5">
                  <div
                    onClick={() => onSelectTab('ipl')}
                    className="carlic-sage-card cursor-pointer px-3.5 py-2 text-white flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <div>
                      <span className="text-[10px] font-medium text-[#F3D37A]/90 block leading-tight">
                        Saldo Kas Paguyuban
                      </span>
                      <p className="text-base sm:text-lg font-extrabold text-white leading-tight mt-0.5">
                        Rp {sisaSaldo.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <Wallet className="w-5 h-5 text-[#F3D37A] flex-shrink-0" />
                  </div>

                  <div
                    onClick={() => onSelectTab('ipl')}
                    className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <div>
                      <span className="text-[10px] font-medium text-stone-400 block leading-tight">
                        Kepatuhan IPL Warga
                      </span>
                      <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
                        {lunasKK}/{totalKK} KK{' '}
                        <span className="text-xs font-bold text-[#0B484C]">({persentaseNum}%)</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div
                    onClick={() => onSelectTab('urunan')}
                    className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform border-[#D9B352]/60 bg-[#FEF9EB]/70 dark:bg-stone-800"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-extrabold text-[#9A7018] dark:text-[#F3D37A] block leading-tight truncate">
                        Urunan Lampu PJU ({persenUrunanPju}%)
                      </span>
                      <p className="text-sm sm:text-base font-extrabold text-[#0B484C] dark:text-white leading-tight mt-0.5 truncate">
                        Rp {totalUrunanPju.toLocaleString('id-ID')}{' '}
                        <span className="text-[10px] font-bold text-stone-500">({urunanList.length} Penyetor)</span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#0B484C] text-[#F3D37A] flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                  </div>

                  <div
                    onClick={() => onSelectTab('warga')}
                    className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
                  >
                    <div>
                      <span className="text-[10px] font-medium text-stone-400 block leading-tight">
                        Keluarga Terdata
                      </span>
                      <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
                        {totalKK} KK{' '}
                        <span className="text-[11px] font-semibold text-stone-400">
                          ({menetap} Menetap)
                        </span>
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="relative group/tip">
                    <div
                      onClick={() => onSelectTab('ronda')}
                      className="carlic-card cursor-pointer px-3.5 py-2 flex items-center justify-between gap-2 hover:-translate-y-0.5 transition-transform"
                    >
                      <div>
                        <span className="text-[10px] font-medium text-stone-400 block leading-tight">
                          Ronda Malam Ini
                        </span>
                        <p className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white leading-tight mt-0.5">
                          {rondaList && rondaList.length > 0 ? `${rondaList[0]?.petugas?.length || 0} Petugas` : '0 Petugas'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#FEF6DF] dark:bg-stone-800 text-[#B88B28] flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                      <p className="font-extrabold text-[#F3D37A] mb-1">
                        🛡️ Jadwal Siskamling Malam:
                      </p>
                      <p className="text-stone-200">
                        Patroli jam 21.00 s/d 04.00 WIB. Klik untuk membuka jadwal lengkap 4 minggu &amp; daftar petugas ronda harian.
                      </p>
                    </div>
                  </div>
                </div>

                {/* ROW 2: RINGKASAN KAS & REKENING 3D (8 COL) + MUTASI TERKINI (4 COL) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:flex-1 min-h-0">
                  <div className="lg:col-span-8 carlic-card p-3 sm:p-3.5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center overflow-hidden h-full">
                    <div className="md:col-span-8 flex flex-col justify-between text-left min-w-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold text-[#1C221E] dark:text-white truncate">
                            Ringkasan Kas, Urunan PJU &amp; Rekening Resmi Paguyuban
                          </h2>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 flex-shrink-0">
                            Transparan
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 truncate mt-0.5">
                          IPL Rp {tarifIpl.toLocaleString('id-ID')}/bln •{' '}
                          <strong className="text-[#0B484C] dark:text-[#F3D37A]">Urunan PJU Rp 115.000/KK</strong> •{' '}
                          <strong className="text-stone-600 dark:text-stone-300">{namaBank}</strong> ({noRek}) a.n. {atasNama}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 my-2">
                        <div className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60">
                          <span className="text-[10px] font-medium text-stone-400 block truncate">
                            Pemasukan IPL
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-[#F3D37A] block leading-tight">
                            Rp {pemasukan.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60">
                          <span className="text-[10px] font-medium text-stone-400 block truncate">
                            Pengeluaran Kas
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white block leading-tight">
                            Rp {pengeluaran.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div
                          onClick={() => onSelectTab('urunan')}
                          className="cursor-pointer px-2.5 py-1.5 rounded-xl bg-[#FEF9EB] dark:bg-amber-950/35 border border-[#D9B352]/60"
                        >
                          <span className="text-[10px] font-extrabold text-amber-800 dark:text-[#F3D37A] block truncate">
                            💡 Dana Urunan PJU ({donaturPjuCount}+{wajibPjuCount} KK)
                          </span>
                          <span className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-white block leading-tight">
                            Rp {totalUrunanPju.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectTab('ipl')}
                          className="carlic-sage-btn text-[#F3D37A] text-[11px] font-bold px-3 py-1.5 rounded-xl"
                        >
                          Konfirmasi Bayar IPL +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUrunanMode('form');
                            onSelectTab('urunan');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#FEF6DF] hover:bg-[#FCE8B2] text-[#092C2E] border border-[#D9B352]/70 text-[11px] font-extrabold flex items-center gap-1 transition-colors"
                        >
                          <Lightbulb className="w-3 h-3 text-[#0B484C]" />
                          <span>Bayar Urunan PJU +</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyRek}
                          className="px-2.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                          {copiedRek ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedRek ? 'Tersalin' : `Salin Rek (${noRek})`}</span>
                        </button>
                      </div>
                    </div>

                    {/* 3 Stacked Isometric 3D Cards (Scaled to h-28 so Row 2 is ultra-compact) */}
                    <div className="md:col-span-4 relative h-28 flex items-center justify-center">

                    {/* 3 Stacked Isometric 3D Cards (Scaled to h-28 so Row 2 is ultra-compact) */}

                      <div className="relative w-44 h-24 scale-90">
                        <div
                          style={{
                            transform: 'rotate(-14deg) skewX(14deg) translateY(26px)',
                          }}
                          className="absolute inset-x-0 h-24 rounded-2xl bg-[#062C2F] border border-[#D9B352]/30 p-3 text-white shadow-xl flex flex-col justify-between"
                        >
                          <div className="text-[8px] text-[#F3D37A] font-semibold">KAS PAGUYUBAN</div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono tracking-wider">{noRek}</span>
                            <div className="flex -space-x-1">
                              <span className="w-3 h-3 rounded-full bg-[#D9B352]" />
                              <span className="w-3 h-3 rounded-full bg-[#0F585D] border border-[#D9B352]" />
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            transform: 'rotate(-14deg) skewX(14deg) translateY(10px)',
                          }}
                          className="pk-gold-gradient absolute inset-x-0 h-24 rounded-2xl p-3 text-[#062C2F] shadow-lg flex flex-col justify-between"
                        >
                          <div className="text-[8px] text-[#062C2F]/80 font-extrabold truncate">
                            {atasNama.toUpperCase()}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold tracking-wider">
                              {noRek}
                            </span>
                            <div className="flex -space-x-1">
                              <span className="w-3 h-3 rounded-full bg-[#0B484C]" />
                              <span className="w-3 h-3 rounded-full bg-white/80" />
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            transform: 'rotate(-14deg) skewX(14deg) translateY(-6px)',
                          }}
                          className="absolute inset-x-0 h-24 rounded-2xl bg-white/90 dark:bg-[#0B383B]/90 backdrop-blur-md border border-[#D9B352]/60 p-3 text-[#092C2E] dark:text-white shadow-md flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-[#0B484C] dark:text-[#F3D37A] truncate">
                              {namaBank}
                            </span>
                            <span className="text-[8px] font-bold text-[#B88B28] truncate max-w-[65px]">
                              {catatanRek}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-extrabold tracking-widest font-mono text-[#0B484C] dark:text-white">
                              {noRek}
                            </p>
                            <p className="text-[7px] text-stone-500 dark:text-stone-300 truncate">
                              {atasNama.toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mutasi Kas Terkini (4 Col) */}
                  <div className="lg:col-span-4 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white">
                        Mutasi Kas &amp; PJU Terkini
                      </h3>
                      <button
                        type="button"
                        onClick={() => onSelectTab('urunan')}
                        className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] hover:underline"
                      >
                        Lihat Semua
                      </button>
                    </div>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                      {recentTransfers.length === 0 ? (
                        <div className="p-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/50 text-center">
                          <p className="text-[11px] font-bold text-stone-500">
                            Belum ada mutasi kas tercatat
                          </p>
                          <p className="text-[10px] text-stone-400 mt-0.5">
                            Mutasi otomatis muncul saat ada pembayaran IPL atau pengeluaran kas
                          </p>
                        </div>
                      ) : (
                        recentTransfers.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2 pl-2.5 py-0.5 border-l-2 border-[#D9B352]"
                          >
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-[#1C221E] dark:text-white truncate">
                                {item.title}
                              </p>
                              <p className="text-[9px] text-stone-400 truncate">{item.time}</p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                item.isPositive
                                  ? 'bg-[#0B484C]/10 text-[#0B484C] dark:bg-emerald-950 dark:text-[#F3D37A]'
                                  : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {item.badge}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ROW 3: PETUGAS RONDA (6 COL) + PENGUMUMAN (6 COL) — COMPACT 155PX HEIGHT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-stretch lg:flex-1 min-h-0">
                  <div className="lg:col-span-6 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                            Petugas Ronda ({tonightRonda?.hari})
                          </h3>
                          <span className="text-[10px] text-stone-400 truncate">
                            • {tonightRonda?.tanggal} (21.00 – 04.00 WIB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectTab('ronda')}
                          className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] inline-flex items-center gap-1 hover:underline flex-shrink-0"
                        >
                          <span>Jadwal Lengkap</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {tonightRonda?.petugas.slice(0, 6).map((p) => (
                          <div
                            key={p.slot}
                            className="px-2.5 py-1.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center flex-shrink-0 ${
                                  p.isKoordinator
                                    ? 'bg-[#0B484C] text-[#F3D37A]'
                                    : 'bg-white dark:bg-stone-700 text-[#1C221E] dark:text-white'
                                }`}
                              >
                                {p.slot}
                              </span>
                              <span className="text-[11px] font-extrabold text-[#1C221E] dark:text-white truncate">
                                {p.namaLengkap}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-stone-700 text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
                              {p.blokRumah}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6 carlic-card p-3 sm:p-3.5 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-baseline gap-2 min-w-0">
                          <h3 className="text-sm font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                            Pengumuman &amp; Kegiatan Warga
                          </h3>
                          <span className="text-[10px] text-stone-400 truncate">
                            • Pengurus Paguyuban PK8
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectTab('pengumuman')}
                          className="text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A] inline-flex items-center gap-1 hover:underline flex-shrink-0"
                        >
                          <span>Semua Info</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {pengumumanList.slice(0, 2).map((p) => (
                          <div
                            key={p.id}
                            onClick={() => setDetailPengumuman(p)}
                            className="cursor-pointer px-3 py-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/60 hover:bg-[#EFECE6] transition-colors"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[8px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 flex-shrink-0">
                                  {p.kategori}
                                </span>
                                <h4 className="text-xs font-extrabold text-[#1C221E] dark:text-white truncate">
                                  {p.judul}
                                </h4>
                              </div>
                              <span className="text-[10px] font-bold text-stone-400 whitespace-nowrap flex-shrink-0">
                                {p.tanggalAcara}
                              </span>
                            </div>
                            <p className="text-[10px] text-stone-500 dark:text-stone-400 line-clamp-1 mt-0.5">
                              {p.deskripsi}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* MENU 2: IURAN IPL & KAS LINGKUNGAN                            */}
            {/* ============================================================= */}
            {currentTab === 'ipl' && (() => {
              const filteredIpl = wargaList.filter((w) => {
                const matchSearch = aiFuzzyMatch(
                  iplSearch,
                  `${w.namaLengkap} ${w.alamatRumah} ${w.blok}`,
                  `${w.statusIpl} ${w.periodeTercover}`
                );
                const matchStatus = iplFilter === 'ALL' || w.statusIpl === iplFilter;
                return matchSearch && matchStatus;
              });
              const pageSize = 6;
              const totalPages = Math.max(1, Math.ceil(filteredIpl.length / pageSize));
              const pageItems = filteredIpl.slice((iplPage - 1) * pageSize, iplPage * pageSize);

              return (
                <div className="lg:h-full">
                  {/* TATA LETAK 2 KOLOM LEGA & RAMAH PENGGUNA: KIRI (8 COL DAFTAR KARTU WARGA <-> FORM BAYAR IPL) + KANAN (4 COL PENGELUARAN KAS) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:h-full">
                    {/* KOLOM KIRI (8 COL): DAFTAR STATUS IPL WARGA (GRID 2X3 = 6 KARTU) ATAU FORM KONFIRMASI BAYAR IPL */}
                    <div className="lg:col-span-8 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 overflow-visible">
                      {iplMode === 'daftar' ? (
                        <>
                          <div className="flex flex-col flex-1 min-h-0 min-w-0">
                            {/* Top Bar: Filter Status + Search + Tombol Bayar IPL */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 flex-shrink-0 max-w-full">
                              {/* Filter Tabs */}
                              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none flex-nowrap flex-shrink-0">
                                {(['ALL', 'Lunas', 'Menunggu Verifikasi', 'Belum Bayar'] as const).map((st) => {
                                  const pendingCount = wargaList.filter(
                                    (w) => w.statusIpl === 'Menunggu Verifikasi'
                                  ).length;
                                  const count =
                                    st === 'ALL'
                                      ? wargaList.length
                                      : wargaList.filter((w) => w.statusIpl === st).length;
                                  const label =
                                    st === 'ALL'
                                      ? `Semua (${count})`
                                      : st === 'Menunggu Verifikasi'
                                      ? `⏳ Verifikasi (${count})`
                                      : st === 'Lunas'
                                      ? `Lunas (${count})`
                                      : `Belum Bayar (${count})`;
                                  return (
                                    <div key={st} className="relative group/tip inline-flex">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIplFilter(st);
                                          setIplPage(1);
                                        }}
                                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                                          iplFilter === st
                                            ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                                            : st === 'Menunggu Verifikasi' && pendingCount > 0
                                            ? 'bg-amber-100 text-amber-800 border border-amber-300/80'
                                            : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                                        }`}
                                      >
                                        {label}
                                      </button>
                                      {st === 'Menunggu Verifikasi' && (
                                        <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                          <p className="font-extrabold text-[#F3D37A] mb-1">
                                            ⏳ Menunggu Verifikasi Ketua &amp; Admin:
                                          </p>
                                          <p className="text-stone-200">
                                            Bukti bayar warga sudah tercatat di sistem &amp; Google Sheets. Sedang diperiksa oleh <strong>Ketua Paguyuban &amp; Admin/Bendahara</strong> sebelum disahkan.
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto flex-shrink-0">
                                <div className="relative flex-1 sm:w-36">
                                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    name="sim_warga_ipl_filter_query_prevent_autofill"
                                    autoComplete="off"
                                    data-lpignore="true"
                                    data-form-type="other"
                                    value={iplSearch}
                                    onChange={(e) => {
                                      setIplSearch(e.target.value);
                                      setIplPage(1);
                                    }}
                                    placeholder="Cari warga / blok..."
                                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F8F8F6] dark:bg-stone-800 text-xs text-[#1C221E] dark:text-white focus:outline-none"
                                  />
                                </div>
                                <div className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsWargaLockedInForm(false);
                                      setBayarNama('');
                                      setBayarLokasi('');
                                      setBayarError('');
                                      setIplMode('form');
                                    }}
                                    className="carlic-sage-btn text-[#F3D37A] text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>Bayar / Upload Bukti IPL</span>
                                    <span className="w-4 h-4 rounded-full bg-white/20 text-[#F3D37A] text-[10px] font-black flex items-center justify-center ml-0.5">
                                      ?
                                    </span>
                                  </button>

                                  {/* Tooltip Panduan Penggunaan Tombol Bayar IPL */}
                                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+8px)] w-80 p-3.5 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                    <p className="font-extrabold text-[#F3D37A] mb-1.5 flex items-center gap-1.5">
                                      <span>📌 Panduan Tombol Bayar IPL:</span>
                                    </p>
                                    <ul className="space-y-1.5 text-stone-200">
                                      <li>
                                        • <strong>Khusus Warga Belum Bayar:</strong> Tombol ini hanya untuk pembayaran baru bagi warga yang statusnya <strong className="text-white">Belum Bayar</strong>.
                                      </li>
                                      <li>
                                        • <strong>Sudah Lunas &amp; Mau Tambah Durasi?</strong> Klik tombol <strong className="text-[#F3D37A]">&ldquo;+ Bayar Lagi →&rdquo;</strong> langsung pada <strong>Kartu Warga</strong> Anda di bawah.
                                      </li>
                                      <li>
                                        • <strong>Sedang Menunggu Verifikasi?</strong> Gunakan tombol <strong className="text-amber-300">&ldquo;Ubah&rdquo;</strong> pada kartu Anda.
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Grid 2 Kolom (Compact auto-rows-max: tidak pernah melar saat data sedikit) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-max content-start gap-2.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
                              {pageItems.map((w, i) => {
                                const rejectedReason = getRejectedIplReason(w);
                                const iplAcc = getWargaIplAccumulated(w);
                                const paketTercatat = iplAcc.paketLabel;
                                const nominalTercatat = iplAcc.nominalTotal;
                                return (
                                  <div
                                    key={w.id || i}
                                    className={`px-3.5 py-2.5 rounded-2xl flex flex-col justify-between h-auto min-h-[96px] transition-colors ${
                                      rejectedReason
                                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800'
                                        : iplAcc.isExpired
                                        ? 'bg-orange-50/90 dark:bg-orange-950/25 border border-orange-300 dark:border-orange-800'
                                        : w.statusIpl === 'Menunggu Verifikasi'
                                        ? 'bg-[#FEF9EB] dark:bg-amber-950/20 border border-[#D9B352]/65'
                                        : w.statusIpl === 'Lunas'
                                        ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80'
                                        : 'bg-[#F8F8F6] dark:bg-stone-800/60'
                                    }`}
                                  >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-8 h-8 rounded-full font-extrabold text-xs flex items-center justify-center flex-shrink-0 ${
                                            iplAcc.isExpired
                                              ? 'bg-orange-600 text-white ring-1 ring-orange-300'
                                              : 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                                          }`}
                                        >
                                          {w.blok}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white leading-snug">
                                            {w.namaLengkap}
                                          </h4>
                                          <span className="text-[10px] text-stone-500 dark:text-stone-300 font-semibold block leading-tight">
                                            {w.alamatRumah} •{' '}
                                            {iplAcc.isExpired ? (
                                              <strong className="text-orange-700 dark:text-orange-300">
                                                {iplAcc.expiryNote}
                                              </strong>
                                            ) : w.statusIpl === 'Menunggu Verifikasi' || w.statusIpl === 'Lunas' ? (
                                              <strong className="text-[#0B484C] dark:text-[#F3D37A]">
                                                Paket {paketTercatat} (Rp {nominalTercatat.toLocaleString('id-ID')})
                                              </strong>
                                            ) : (
                                              <span>
                                                {iplAcc.tunggakanMonths && iplAcc.tunggakanMonths >= 2 ? (
                                                  <strong className="text-amber-800 dark:text-amber-300">
                                                    Tunggakan {iplAcc.tunggakanMonths} Bulan ({iplAcc.tunggakanPeriodText})
                                                  </strong>
                                                ) : (
                                                  'Periode Oktober 2026'
                                                )}
                                              </span>
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      {iplAcc.isExpired ? (
                                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-300 whitespace-nowrap flex-shrink-0">
                                          ⏰ Kelewat 1 Bulan • Belum Bayar
                                        </span>
                                      ) : w.statusIpl === 'Lunas' ? (
                                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B484C] border border-emerald-300 whitespace-nowrap flex-shrink-0">
                                          ✓ Data Masuk &amp; Lunas
                                        </span>
                                      ) : w.statusIpl === 'Menunggu Verifikasi' ? (
                                        <div className="relative group/tip inline-flex">
                                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/80 whitespace-nowrap flex-shrink-0 cursor-help">
                                            ⏳ Masuk Sheet • Verifikasi ?
                                          </span>
                                          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                            <p className="font-extrabold text-[#F3D37A] mb-1">
                                              ⏳ Proses Verifikasi Paguyuban:
                                            </p>
                                            <p className="text-stone-200">
                                              Pembayaran ini sedang dalam antrean verifikasi oleh <strong>Ketua Paguyuban &amp; Admin/Bendahara</strong>. Anda dapat mengklik <strong>Ubah</strong> atau <strong>Hapus</strong> sebelum disahkan.
                                            </p>
                                          </div>
                                        </div>
                                      ) : rejectedReason ? (
                                        <div className="relative group/tip inline-flex">
                                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 whitespace-nowrap flex-shrink-0 cursor-help">
                                            ⚠️ Ditolak Admin ?
                                          </span>
                                          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 bottom-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                            <p className="font-extrabold text-rose-300 mb-1">
                                              ⚠️ Pembayaran Ditolak Pengurus:
                                            </p>
                                            <p className="text-stone-200">
                                              {rejectedReason}. Silakan klik tombol <strong>Upload Ulang</strong> untuk mengirimkan foto struk transfer yang jelas.
                                            </p>
                                          </div>
                                        </div>
                                      ) : iplAcc.tunggakanMonths && iplAcc.tunggakanMonths >= 2 ? (
                                        <div className="relative group/tip inline-flex">
                                          <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 cursor-help">
                                            ⚠️ Tunggakan ${iplAcc.tunggakanMonths} Bulan ?
                                          </span>
                                          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 bottom-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                            <p className="font-extrabold text-[#F3D37A] mb-1">
                                              ⚠️ Iuran IPL Melebihi Batas Jatuh Tempo:
                                            </p>
                                            <p className="text-stone-200">
                                              Iuran tertunggak ${iplAcc.tunggakanMonths} bulan (${iplAcc.tunggakanPeriodText}). Silakan klik tombol <strong>Bayar IPL (${iplAcc.tunggakanMonths} Bln)</strong> untuk melunasi tagihan komplek.
                                            </p>
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                          Belum Bayar
                                        </span>
                                      )}
                                    </div>

                                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700 flex items-center justify-between gap-2 text-[11px]">
                                      {rejectedReason ? (
                                        <>
                                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 truncate">
                                            Catatan: {rejectedReason}
                                          </span>
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <a
                                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                                `Halo Pengurus/Bendahara Paguyuban PK8, saya ${w.namaLengkap} (${w.alamatRumah}) ingin menanyakan perihal konfirmasi IPL yang ditolak (${rejectedReason}).`
                                              )}`}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="px-2 py-1 rounded-lg bg-white hover:bg-stone-100 text-rose-700 border border-rose-200 font-bold text-[10px] whitespace-nowrap"
                                            >
                                              Hubungi Pengurus
                                            </a>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setBayarNama(w.namaLengkap);
                                                setBayarLokasi(w.alamatRumah);
                                                setBayarError('');
                                                setIsWargaLockedInForm(true);
                                                setIplMode('form');
                                              }}
                                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] whitespace-nowrap"
                                            >
                                              Upload Ulang →
                                            </button>
                                          </div>
                                        </>
                                      ) : iplAcc.isExpired ? (
                                        <>
                                          <span className="text-orange-800 dark:text-orange-300 font-bold text-[10px] truncate">
                                            ⚠️ Lunas Sep Habis (30 Sep) • Tagihan Okt (s/d 31 Okt): Rp {tarifIpl.toLocaleString('id-ID')}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setBayarNama(w.namaLengkap);
                                              setBayarLokasi(w.alamatRumah);
                                              setBayarError('');
                                              setIsWargaLockedInForm(true);
                                              setIplMode('form');
                                            }}
                                            className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                                            title="Masa aktif 1 bulan sebelumnya sudah habis, klik untuk bayar bulan ini"
                                          >
                                            <span>Bayar Perpanjang</span>
                                            <ArrowRight className="w-2.5 h-2.5" />
                                          </button>
                                        </>
                                      ) : w.statusIpl === 'Lunas' ? (
                                        <>
                                          <span className="text-[#0B484C] dark:text-emerald-300 font-bold text-[10px] truncate">
                                            ✓ Lunas: {paketTercatat} • {iplAcc.activeUntilText || `Rp ${nominalTercatat.toLocaleString('id-ID')}`}
                                          </span>
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIplSecurityGate({
                                                  warga: w,
                                                  intendedAction: 'kwitansi_ipl',
                                                });
                                                setIplGatePassword('');
                                                setIplGateWa4('');
                                                setIplGateError('');
                                              }}
                                              className="px-2 py-1 rounded-lg bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-800 dark:text-emerald-300 border border-emerald-400/60 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                              title="Verifikasi Password & 4 Digit WA untuk Buka Kwitansi IPL Resmi"
                                            >
                                              <Lock className="w-2.5 h-2.5" />
                                              <span>Kwitansi</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIplSecurityGate({
                                                  warga: w,
                                                  intendedAction: 'edit_ipl',
                                                });
                                                setIplGatePassword('');
                                                setIplGateWa4('');
                                                setIplGateError('');
                                              }}
                                              className="px-2.5 py-1 rounded-lg bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                              title="Tambah pembayaran durasi IPL berikutnya khusus untuk kartu warga ini"
                                            >
                                              <span>+ Bayar Lagi</span>
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </>
                                      ) : w.statusIpl === 'Menunggu Verifikasi' ? (
                                        <>
                                          <span className="text-amber-900 dark:text-amber-200 font-bold text-[10px] truncate">
                                            ✓ Masuk: {paketTercatat} (Rp {nominalTercatat.toLocaleString('id-ID')})
                                          </span>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (isWargaOwnedByUser(w)) {
                                                  setBayarNama(w.namaLengkap);
                                                  setBayarLokasi(w.alamatRumah);
                                                  setBayarError('');
                                                  setIsWargaLockedInForm(true);
                                                  setIplMode('form');
                                                } else {
                                                  setIplSecurityGate({ warga: w, intendedAction: 'edit_ipl' });
                                                  setIplGateInput('');
                                                  setIplGateError('');
                                                }
                                              }}
                                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-400/70 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                              title="Ubah durasi paket (misal 1 Bulan ke 1 Tahun) atau ganti bukti transfer"
                                            >
                                              <Edit className="w-2.5 h-2.5" />
                                              <span>Ubah</span>
                                            </button>
                                            {onCancelPendingIpl && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (isWargaOwnedByUser(w)) {
                                                    setUserConfirmModal({
                                                      kind: 'delete',
                                                      title: 'Hapus Pengajuan IPL?',
                                                      subtitle: 'Pengajuan IPL yang sedang menunggu verifikasi ini akan dihapus:',
                                                      itemName: `${w.namaLengkap} (${w.alamatRumah})`,
                                                      detailText: `Paket: ${paketTercatat} • Nominal: Rp ${nominalTercatat.toLocaleString('id-ID')}`,
                                                      confirmLabel: 'Ya, Hapus',
                                                      onConfirm: () => onCancelPendingIpl(w.namaLengkap, w.alamatRumah),
                                                    });
                                                  } else {
                                                    setIplSecurityGate({ warga: w, intendedAction: 'cancel_ipl' });
                                                    setIplGateInput('');
                                                    setIplGateError('');
                                                  }
                                                }}
                                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-0.5"
                                                title="Batalkan / Hapus pengajuan IPL jika salah input"
                                              >
                                                <Trash2 className="w-2.5 h-2.5" />
                                                <span>Hapus</span>
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-stone-500 text-[10px] truncate">
                                            {iplAcc.tunggakanMonths && iplAcc.tunggakanMonths >= 2 ? (
                                              <>
                                                Tagihan {iplAcc.tunggakanMonths} Bln (s/d 31 Okt):{' '}
                                                <strong className="text-[#1C221E] dark:text-[#F3D37A]">
                                                  Rp {iplAcc.nominalTotal.toLocaleString('id-ID')}
                                                </strong>
                                              </>
                                            ) : (
                                              <>
                                                Tagihan Okt (s/d Akhir Bulan / 31 Okt):{' '}
                                                <strong className="text-[#1C221E] dark:text-[#F3D37A]">
                                                  Rp {tarifIpl.toLocaleString('id-ID')}
                                                </strong>
                                              </>
                                            )}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setBayarNama(w.namaLengkap);
                                              setBayarLokasi(w.alamatRumah);
                                              setBayarDurasiNilai(String(iplAcc.tunggakanMonths || 1));
                                              setBayarDurasiSatuan('Bulan');
                                              setBayarError('');
                                              setIsWargaLockedInForm(true);
                                              setIplMode('form');
                                            }}
                                            className="px-3 py-1 rounded-lg bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-bold text-[10px] whitespace-nowrap flex items-center gap-1"
                                          >
                                            <span>
                                              {iplAcc.tunggakanMonths && iplAcc.tunggakanMonths >= 2
                                                ? `Bayar IPL (${iplAcc.tunggakanMonths} Bln)`
                                                : 'Bayar IPL'}
                                            </span>
                                            <ArrowRight className="w-3 h-3" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 mt-2 border-t border-stone-200/80 dark:border-stone-800 text-xs flex-shrink-0 w-full">
                            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                              <span className="px-2.5 py-1 rounded-lg bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] font-extrabold text-[11px]">
                                Halaman {iplPage} dari {totalPages}
                              </span>
                              <span className="text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
                                Total <strong className="text-[#1C221E] dark:text-white">{filteredIpl.length} KK</strong>
                              </span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                              <button
                                type="button"
                                disabled={iplPage <= 1}
                                onClick={() => setIplPage((p) => Math.max(1, p - 1))}
                                className="h-8 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 font-extrabold text-[11px] text-stone-700 dark:text-stone-200 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Sebelumnya</span>
                              </button>

                              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                                <button
                                  key={pg}
                                  type="button"
                                  onClick={() => setIplPage(pg)}
                                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all flex items-center justify-center flex-shrink-0 ${
                                    iplPage === pg
                                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs ring-2 ring-[#D9B352]/60'
                                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#0B484C]'
                                  }`}
                                >
                                  {pg}
                                </button>
                              ))}

                              <button
                                type="button"
                                disabled={iplPage >= totalPages}
                                onClick={() => setIplPage((p) => Math.min(totalPages, p + 1))}
                                className={`h-8 px-2.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 transition-all flex-shrink-0 ${
                                  iplPage < totalPages
                                    ? 'bg-[#0B484C] text-[#F3D37A] hover:bg-[#08383B] shadow-xs'
                                    : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 opacity-40 cursor-not-allowed'
                                }`}
                              >
                                <span>Selanjutnya</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* MODE FORMULIR KONFIRMASI BAYAR IPL (PROPORSIONAL PENUH TANPA RUANG KOSONG MENGGANTUNG) */
                        <div className="flex flex-col gap-3.5 h-auto min-h-0 lg:h-full lg:justify-between w-full max-w-full">
                          {/* 1. Header Bar (1 Baris Rapi) */}
                          <div className="flex items-center justify-between gap-3 flex-shrink-0">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white truncate">
                                Formulir Konfirmasi Pembayaran IPL
                              </h3>
                              <p className="text-xs text-stone-400 truncate">
                                Lengkapi rincian pembayaran iuran warga dan lampirkan bukti transfer resmi
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setIplMode('daftar');
                                setIsWargaLockedInForm(false);
                                setBayarNama('');
                                setBayarLokasi('');
                                setBayarError('');
                              }}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 whitespace-nowrap flex-shrink-0"
                            >
                              ← Kembali ke Daftar IPL
                            </button>
                          </div>

                          {/* 2. Baris Ringkasan: Rekening Resmi Tujuan Transfer (Kiri) + Ringkasan Tagihan / Catatan Penolakan (Kanan) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-shrink-0">
                            <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                  Rekening Tujuan Transfer
                                </span>
                                <p className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-[#F3D37A] truncate mt-0.5">
                                  {namaBank} • <span className="font-mono">{noRek}</span>
                                </p>
                                <span className="text-[11px] text-stone-500 dark:text-stone-300 truncate block">
                                  a.n. {atasNama}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyRek}
                                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-[#0B484C] dark:text-[#F3D37A] text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
                              >
                                {copiedRek ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedRek ? 'Tersalin' : 'Salin Rek'}</span>
                              </button>
                            </div>

                            {selectedRejectedReason ? (
                              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                                    ⚠️ Catatan Penolakan Admin
                                  </span>
                                  <p className="text-xs font-bold text-rose-700 dark:text-rose-200 line-clamp-2 mt-0.5">
                                    &ldquo;{selectedRejectedReason}&rdquo;
                                  </p>
                                </div>
                                <a
                                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                                    `Halo Pengurus/Bendahara Paguyuban PK8, saya ${bayarNama} (${bayarLokasi}) ingin menanyakan konfirmasi pembayaran IPL saya yang ditolak dengan catatan: "${selectedRejectedReason}". Terima kasih.`
                                  )}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>WA Pengurus</span>
                                </a>
                              </div>
                            ) : (
                              <div className="p-3.5 rounded-2xl bg-[#FEF9EB] dark:bg-[#0B383B]/50 border border-[#D9B352]/50 flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <span className="text-[10px] font-bold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider block">
                                    {selectedWargaForPay?.statusIpl === 'Menunggu Verifikasi'
                                      ? '⏳ Ubah Paket / Bukti (Data Sebelumnya Sudah Masuk)'
                                      : 'Ringkasan Tagihan Terpilih'}
                                  </span>
                                  <p className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white truncate mt-0.5">
                                    {bayarNama || 'Pilih Warga'} {bayarLokasi ? `(${bayarLokasi})` : ''}
                                  </p>
                                  <span className="text-[11px] text-stone-500 dark:text-stone-300 block truncate">
                                    {selectedWargaForPay?.statusIpl === 'Menunggu Verifikasi' ? (
                                      <>
                                        Tercatat: <strong>{selectedLatestTrx?.durasiPaket || selectedWargaForPay.periodeTercover || '1 Bulan'}</strong> (Rp {(selectedLatestTrx?.nominalBayar || selectedWargaForPay.nominalIpl || tarifIpl).toLocaleString('id-ID')}) → Diganti ke <strong>{computedDurasiLabel}</strong>
                                      </>
                                    ) : (
                                      <>
                                        Durasi: <strong>{computedDurasiLabel}</strong> (@ Rp {tarifIpl.toLocaleString('id-ID')}/bln)
                                      </>
                                    )}
                                  </span>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <span className="text-[10px] font-bold text-stone-400 block">Total Bayar</span>
                                  <span className="text-sm sm:text-base font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                                    Rp {computedBayarNominal.toLocaleString('id-ID')}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {bayarError && (
                            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex-shrink-0">
                              {bayarError}
                            </div>
                          )}
                          {/* REAL-TIME VALIDASI STATUS PEMBAYARAN IPL */}
                          {selectedWargaForPay?.statusIpl === 'Menunggu Verifikasi' && !isWargaLockedInForm && (
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-start gap-2.5 flex-shrink-0 animate-in fade-in">
                              <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                              <div>
                                <strong>Peringatan Verifikasi Sedang Berjalan:</strong> Pengajuan pembayaran IPL untuk <u>{selectedWargaForPay.namaLengkap} ({selectedWargaForPay.alamatRumah})</u> saat ini sedang <strong>Menunggu Verifikasi</strong> admin ({selectedLatestTrx?.durasiPaket || selectedWargaForPay.periodeTercover}). Anda tidak dapat menginput transaksi baru ganda sebelum status sebelumnya diverifikasi.
                              </div>
                            </div>
                          )}
                          {selectedWargaForPay?.statusIpl === 'Lunas' && (
                            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-start gap-2.5 flex-shrink-0 animate-in fade-in">
                              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                              <div>
                                <strong>Status IPL Warga Sudah Lunas:</strong> Tagihan IPL untuk <u>{selectedWargaForPay.namaLengkap} ({selectedWargaForPay.alamatRumah})</u> saat ini tercatat <strong>Lunas ({selectedWargaForPay.periodeTercover})</strong>. Pembayaran yang diinput akan dicatat sebagai perpanjangan periode berikutnya.
                              </div>
                            </div>
                          )}

                          {/* 3. Form Input 2x2 Grid (Merentang Proporsional) */}
                          <form
                            id="form-konfirmasi-ipl"
                            onSubmit={handleSubmitBayarIpl}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs content-center"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <label className="font-bold text-stone-600 dark:text-stone-300 text-[11px]">
                                  1. Warga Terdaftar (Nama &amp; Blok) *
                                </label>
                                {isWargaLockedInForm ? (
                                  <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 whitespace-nowrap">
                                    <Lock className="w-3 h-3" /> Sesuai kartu dipilih
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => {
                                      handleOpenFormWarga();
                                      onSelectTab('warga');
                                    }}
                                    className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] hover:underline whitespace-nowrap"
                                  >
                                    Belum terdaftar? + Daftar Warga
                                  </button>
                                )}
                              </div>
                              {isWargaLockedInForm ? (
                                <div className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-2 select-none">
                                  <span className="text-xs font-extrabold text-[#092C2E] dark:text-white truncate">
                                    {bayarNama} — {bayarLokasi}
                                  </span>
                                  <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                                </div>
                              ) : (
                                <CustomSelect
                                  searchable={true}
                                  placeholder="Pilih warga berstatus Belum Bayar (Yang sudah Lunas gunakan +Bayar Lagi di Kartu)..."
                                  value={bayarNama ? `${bayarNama}|||${bayarLokasi}` : ''}
                                  onChange={(val) => {
                                    const [nama, lokasi] = val.split('|||');
                                    if (nama && lokasi) {
                                      setBayarNama(nama);
                                      setBayarLokasi(lokasi);
                                      setBayarError('');
                                    }
                                  }}
                                  options={[...wargaList]
                                    .sort((a, b) => {
                                      const rank = (s: string) => (s === 'Belum Bayar' ? 0 : s === 'Lunas' ? 1 : 2);
                                      return rank(a.statusIpl) - rank(b.statusIpl);
                                    })
                                    .map((w) => {
                                      const trx = getLatestIplTrx(w);
                                      const pkt = trx?.durasiPaket || w.periodeTercover || '1 Bulan';
                                      const nom = trx?.nominalBayar || w.nominalIpl || tarifIpl;
                                      const isLockedOption = w.statusIpl === 'Lunas' || w.statusIpl === 'Menunggu Verifikasi';
                                      return {
                                        value: `${w.namaLengkap}|||${w.alamatRumah}`,
                                        label: `${w.namaLengkap} — ${w.alamatRumah}`,
                                        disabled: isLockedOption,
                                        badge:
                                          w.statusIpl === 'Lunas'
                                            ? '🔒 Sudah Lunas (Klik +Bayar Lagi di Kartu)'
                                            : w.statusIpl === 'Menunggu Verifikasi'
                                            ? '⏳ Verifikasi (Klik Ubah di Kartu)'
                                            : '✓ Belum Bayar',
                                        description:
                                          w.statusIpl === 'Lunas'
                                            ? `Sudah Lunas (${pkt} • Rp ${nom.toLocaleString('id-ID')}) — Gunakan tombol "+ Bayar Lagi →" langsung di kartu warga`
                                            : w.statusIpl === 'Menunggu Verifikasi'
                                            ? `Sedang Menunggu Verifikasi — Gunakan tombol "Ubah" langsung di kartu warga`
                                            : `⚪ Belum Bayar IPL • Tagihan Rp ${tarifIpl.toLocaleString('id-ID')}/bln`,
                                      };
                                    })}
                                />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="font-bold text-stone-600 dark:text-stone-300 text-[11px]">
                                  2. Paket Durasi Iuran IPL (Bulan / Tahun) *
                                </label>
                                <span className="text-xs font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                                  Total: Rp {computedBayarNominal.toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="h-9 p-1 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center gap-1.5">
                                <input
                                  type="number"
                                  min={1}
                                  max={bayarDurasiSatuan === 'Tahun' ? 10 : 60}
                                  required
                                  value={bayarDurasiNilai}
                                  onChange={(e) => setBayarDurasiNilai(e.target.value)}
                                  className="w-16 h-full rounded-lg bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700 text-[#1C221E] dark:text-white font-extrabold text-center text-xs focus:outline-none"
                                />
                                <div className="flex-1 grid grid-cols-2 gap-1 h-full">
                                  {(['Bulan', 'Tahun'] as const).map((unit) => (
                                    <button
                                      key={unit}
                                      type="button"
                                      onClick={() => setBayarDurasiSatuan(unit)}
                                      className={`h-full rounded-lg text-[11px] font-extrabold transition-colors ${
                                        bayarDurasiSatuan === unit
                                          ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs'
                                          : 'text-stone-500 hover:text-[#1C221E] dark:hover:text-white'
                                      }`}
                                    >
                                      {unit}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <CustomSelect
                              label="3. Metode Pembayaran *"
                              searchable={false}
                              value={bayarMetode}
                              onChange={(val) => setBayarMetode(val)}
                              options={metodePembayaranList.map((m) => ({
                                value: m,
                                label: m,
                              }))}
                            />

                            <div>
                              <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1.5 text-[11px]">
                                4. Upload Bukti Bayar (Gambar / PDF) *
                              </label>
                              <label className="cursor-pointer w-full h-9 px-3 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-2 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*,.pdf,application/pdf"
                                  onChange={handleBuktiFileChange}
                                  className="hidden"
                                />
                                {bayarBuktiDataUrl ? (
                                  <div className="flex items-center gap-2 min-w-0">
                                    {bayarBuktiDataUrl.startsWith('data:application/pdf') ? (
                                      <div className="w-6 h-6 rounded-md bg-rose-600 text-white font-extrabold text-[8px] flex items-center justify-center flex-shrink-0">
                                        PDF
                                      </div>
                                    ) : (
                                      <img
                                        src={bayarBuktiDataUrl}
                                        alt="Preview Bukti"
                                        className="w-6 h-6 rounded-md object-cover ring-1 ring-[#D9B352]/60 flex-shrink-0"
                                      />
                                    )}
                                    <span className="text-[11px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] truncate">
                                      {bayarBuktiFileName || 'Bukti Terlampir'}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-stone-500 dark:text-stone-300 min-w-0">
                                    <UploadCloud className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0" />
                                    <span className="text-[11px] font-semibold truncate">
                                      Pilih Foto Struk / File PDF...
                                    </span>
                                  </div>
                                )}
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0">
                                  {bayarBuktiDataUrl ? 'Ganti' : 'Browse'}
                                </span>
                              </label>
                            </div>
                          </form>

                          {/* 4. Bottom Action Bar */}
                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                            <span className="text-xs text-stone-400">
                              Setelah dikirim, status otomatis menjadi <strong className="text-[#0B484C] dark:text-[#F3D37A]">Menunggu Verifikasi</strong> di Google Sheets.
                            </span>
                            {(() => {
                              const isIplConflict =
                                !isWargaLockedInForm &&
                                selectedWargaForPay?.statusIpl === 'Menunggu Verifikasi';
                              const isIplFormValid = Boolean(
                                bayarNama.trim() &&
                                  bayarLokasi.trim() &&
                                  (parseInt(bayarDurasiNilai, 10) || 0) >= 1 &&
                                  bayarMetode.trim() &&
                                  bayarBuktiDataUrl &&
                                  !isIplConflict
                              );
                              return (
                                <button
                                  type="submit"
                                  form="form-konfirmasi-ipl"
                                  disabled={!isIplFormValid}
                                  className={`font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs whitespace-nowrap transition-all ${
                                    isIplFormValid
                                      ? 'carlic-sage-btn text-[#F3D37A]'
                                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  <UploadCloud className="w-4 h-4" />
                                  <span>Kirim Konfirmasi Pembayaran IPL</span>
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* KOLOM KANAN (4 COL): TRANSPARANSI PENGELUARAN KAS KOMPLEK (TANPA LOG VERIFIKASI WARGA) */}
                    <div className="lg:col-span-4 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 overflow-hidden">
                      <div className="flex flex-col flex-1 min-h-0 min-w-0 w-full">
                        <div className="flex items-center justify-between gap-2 mb-0.5 flex-shrink-0">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white truncate">
                            Pengeluaran Kas Komplek
                          </h3>
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 whitespace-nowrap flex-shrink-0">
                            Rp {pengeluaran.toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 mb-2.5 truncate flex-shrink-0">
                          Rincian operasional kebersihan, keamanan pos, &amp; listrik fasum
                        </p>

                        <div className="flex flex-col justify-between gap-2 flex-1 min-h-0 min-w-0 w-full">
                          {pengeluaranList.length === 0 ? (
                            <div className="flex-1 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/50 p-4 flex flex-col items-center justify-center text-center">
                              <p className="text-xs font-extrabold text-stone-600 dark:text-stone-300">
                                Belum Ada Pengeluaran Kas Tercatat
                              </p>
                              <p className="text-[11px] text-stone-400 mt-1 max-w-xs">
                                Rincian pengeluaran operasional yang dicatat Bendahara akan tampil secara transparan di sini.
                              </p>
                            </div>
                          ) : (
                            pengeluaranList.slice(0, 4).map((item) => (
                              <div
                                key={item.id}
                                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/60 flex items-center justify-between gap-3 flex-1 min-h-0 min-w-0 overflow-hidden"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-extrabold text-[#1C221E] dark:text-white truncate">
                                    {item.keterangan}
                                  </p>
                                  <p className="text-[10px] text-stone-400 truncate mt-0.5">
                                    {item.kategori} • {item.penerima} ({item.tanggal})
                                  </p>
                                </div>
                                <span className="text-xs font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap flex-shrink-0">
                                  Rp {item.nominal.toLocaleString('id-ID')}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 text-xs text-stone-400 flex-shrink-0">
                        <span className="truncate">
                          Rekening Kas: <strong className="text-[#1C221E] dark:text-white">{noRek}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyRek}
                          className="font-bold text-[#0B484C] dark:text-[#F3D37A] hover:underline whitespace-nowrap flex-shrink-0"
                        >
                          {copiedRek ? '✓ Tersalin' : 'Salin Rek'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* MENU 3: PROGRAM URUNAN PJU (TANPA FORM INPUT BEBAS WARGA)     */}
            {/* ============================================================= */}
            {currentTab === 'urunan' && (() => {
              const totalTerkumpul = urunanList.reduce((a, b) => a + b.nominal, 0);
              const donaturCount = urunanList.filter((i) => i.tipe === 'DONATUR').length;
              const wajibCount = urunanList.filter((i) => i.tipe === 'URUNAN_WAJIB').length;

              // Gabungkan (Akumulasi) data PJU per Warga (sama seperti konsep kartu IPL: tampilkan seluruh KK + penyetor dengan 2 baris rapi tanpa tumpuk badge)
              type GroupedUrunanCard = {
                key: string;
                primaryId: string;
                pendingItem?: ItemUrunanWarga;
                ownedIds: string[];
                noUrut: number;
                namaWarga: string;
                alamatRumah: string;
                wargaRef?: WargaRecord;
                metode: string;
                hasWajib: boolean;
                wajibNominal: number;
                hasDonatur: boolean;
                donaturNominal: number;
                totalNominal: number;
                hasPending: boolean;
                hasRejected?: boolean;
                rejectedItem?: ItemUrunanWarga;
              };
              const groupedMap = new Map<string, GroupedUrunanCard>();
              urunanList.forEach((item) => {
                const cleanTitleName = item.namaWarga.split('(')[0].trim();
                const normKey = normalizePersonName(cleanTitleName) || item.id;
                const matchedW = wargaList.find(
                  (w) =>
                    normalizePersonName(w.namaLengkap) === normKey ||
                    item.namaWarga.toLowerCase().includes(w.alamatRumah.toLowerCase())
                );
                const isPend =
                  item.status === 'Menunggu Verifikasi' ||
                  /menunggu verifikasi/i.test(item.keterangan || '');
                const isRej =
                  item.status === 'Ditolak' ||
                  /ditolak/i.test(item.keterangan || '');
                const existing = groupedMap.get(normKey);
                if (!existing) {
                  groupedMap.set(normKey, {
                    key: normKey,
                    primaryId: item.id,
                    pendingItem: isPend ? item : undefined,
                    ownedIds: [item.id],
                    noUrut: groupedMap.size + 1,
                    namaWarga: matchedW ? matchedW.namaLengkap : cleanTitleName,
                    alamatRumah: matchedW ? matchedW.alamatRumah : 'Warga / Donatur PK8',
                    wargaRef: matchedW,
                    metode: item.metode,
                    hasWajib: item.tipe === 'URUNAN_WAJIB' && !isRej,
                    wajibNominal: item.tipe === 'URUNAN_WAJIB' && !isRej ? item.nominal : 0,
                    hasDonatur: item.tipe === 'DONATUR' && !isRej,
                    donaturNominal: item.tipe === 'DONATUR' && !isRej ? item.nominal : 0,
                    totalNominal: isRej ? 0 : item.nominal,
                    hasPending: isPend,
                    hasRejected: isRej,
                    rejectedItem: isRej ? item : undefined,
                  });
                } else {
                  existing.ownedIds.push(item.id);
                  if (isPend) {
                    existing.hasPending = true;
                    existing.pendingItem = item;
                  }
                  if (isRej) {
                    existing.hasRejected = true;
                    existing.rejectedItem = item;
                  }
                  if (!isRej) {
                    if (item.tipe === 'URUNAN_WAJIB') {
                      existing.hasWajib = true;
                      existing.wajibNominal += item.nominal;
                    } else {
                      existing.hasDonatur = true;
                      existing.donaturNominal += item.nominal;
                    }
                    existing.totalNominal = existing.wajibNominal + existing.donaturNominal;
                  }
                }
              });

              // Tambahkan juga warga terdaftar yang belum setor PJU Wajib agar tampil lengkap seperti kartu IPL
              wargaList.forEach((w) => {
                const normKey = normalizePersonName(w.namaLengkap);
                if (!groupedMap.has(normKey)) {
                  groupedMap.set(normKey, {
                    key: normKey,
                    primaryId: w.id || `warga-pju-${w.no}`,
                    ownedIds: [],
                    noUrut: groupedMap.size + 1,
                    namaWarga: w.namaLengkap,
                    alamatRumah: w.alamatRumah,
                    wargaRef: w,
                    metode: 'TF',
                    hasWajib: false,
                    wajibNominal: 0,
                    hasDonatur: false,
                    donaturNominal: 0,
                    totalNominal: 0,
                    hasPending: false,
                  });
                }
              });

              const groupedList = Array.from(groupedMap.values());
              const verifikasiCount = groupedList.filter((g) => g.hasPending).length;
              const filteredUrunan = groupedList
                .filter((g) => {
                  const matchTipe =
                    urunanFilter === 'ALL'
                      ? true
                      : urunanFilter === 'VERIFIKASI'
                      ? g.hasPending
                      : urunanFilter === 'DONATUR'
                      ? g.hasDonatur
                      : g.hasWajib;
                  const matchSearch = aiFuzzyMatch(
                    urunanSearch,
                    `${g.namaWarga} ${g.alamatRumah}`,
                    g.hasDonatur ? 'donatur' : 'wajib'
                  );
                  return matchTipe && matchSearch;
                })
                .map((g, idx) => ({ ...g, displayNo: idx + 1 }));

              const pageSize = 6;
              const totalPages = Math.max(1, Math.ceil(filteredUrunan.length / pageSize));
              const pageItems = filteredUrunan.slice(
                (urunanPage - 1) * pageSize,
                urunanPage * pageSize
              );
              const selectedExistingWajib = pjuNama ? getExistingWajibPju(pjuNama, pjuLokasi) : undefined;

              return (
                <div className="lg:h-full">
                  {/* DAFTAR KARTU PJU 2X3 SERAGAM DENGAN IPL (8 COL) + KETENTUAN RAPAT 6 JUNI 2026 (4 COL) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch lg:h-full">
                    <div className="lg:col-span-8 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 overflow-visible">
                      {urunanMode === 'daftar' ? (
                        <>
                          <div className="flex flex-col flex-1 min-h-0 min-w-0">
                            {/* Top Bar: Responsive flex-col di HP, flex-row di Desktop agar tidak pernah overflow horizontal */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 flex-shrink-0 max-w-full">
                              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none flex-nowrap flex-shrink-0">
                                {(
                                  [
                                    { id: 'ALL', label: `Semua (${groupedList.length})` },
                                    { id: 'VERIFIKASI', label: `⏳ Verifikasi (${verifikasiCount})` },
                                    { id: 'DONATUR', label: `🟡 Donatur (${donaturCount})` },
                                    { id: 'URUNAN_WAJIB', label: `🔵 Wajib (${wajibCount})` },
                                  ] as const
                                ).map((tab) => (
                                  <div key={tab.id} className="relative group/tip inline-flex">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUrunanFilter(tab.id);
                                        setUrunanPage(1);
                                      }}
                                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                                        urunanFilter === tab.id
                                          ? tab.id === 'VERIFIKASI' || tab.id === 'DONATUR'
                                          ? 'bg-amber-500 text-stone-950 shadow-xs'
                                          : 'bg-[#0B484C] text-[#F3D37A]'
                                        : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                                    }`}
                                  >
                                    {tab.label}
                                  </button>
                                  {tab.id === 'VERIFIKASI' && (
                                    <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                      <p className="font-extrabold text-[#F3D37A] mb-1">
                                        ⏳ Menunggu Verifikasi Ketua &amp; Admin:
                                      </p>
                                      <p className="text-stone-200">
                                        Setoran PJU warga telah tercatat di Google Sheets. Sedang dalam antrean pemeriksaan oleh <strong>Ketua Paguyuban &amp; Admin/Bendahara</strong> sebelum kwitansi disahkan.
                                      </p>
                                    </div>
                                  )}
                                </div>
                                ))}
                              </div>

                              <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto flex-shrink-0">
                                <div className="relative flex-1 sm:w-36">
                                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                  <input
                                    type="text"
                                    value={urunanSearch}
                                    onChange={(e) => {
                                      setUrunanSearch(e.target.value);
                                      setUrunanPage(1);
                                    }}
                                    placeholder="Cari warga / blok..."
                                    className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs text-[#1C221E] dark:text-white focus:outline-none"
                                  />
                                </div>
                                <div className="relative group/tip inline-flex">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPjuNama('');
                                      setPjuLokasi('');
                                      setPjuTipe('URUNAN_WAJIB');
                                      setPjuNominal('115000');
                                      setPjuError('');
                                      setIsWargaLockedInForm(false);
                                      setUrunanMode('form');
                                    }}
                                    className="carlic-sage-btn text-[#F3D37A] text-xs font-bold px-3.5 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
                                  >
                                    <UploadCloud className="w-3.5 h-3.5" />
                                    <span>+ Bayar PJU</span>
                                    <span className="w-4 h-4 rounded-full bg-white/20 text-[#F3D37A] text-[10px] font-black flex items-center justify-center ml-0.5">
                                      ?
                                    </span>
                                  </button>
                                  {/* Tooltip Panduan Fungsi & Verifikasi PJU */}
                                  <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+8px)] w-80 p-3.5 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                    <p className="font-extrabold text-[#F3D37A] mb-1.5 flex items-center gap-1.5">
                                      <span>💡 Panduan Setoran &amp; Donasi PJU:</span>
                                    </p>
                                    <ul className="space-y-1.5 text-stone-200">
                                      <li>
                                        • <strong>Urunan Wajib (Rp 115.000 / KK):</strong> Iuran 1x bayar khusus bagi warga yang status PJU-nya masih <strong>Belum Bayar</strong>.
                                      </li>
                                      <li>
                                        • <strong>Sudah Lunas Wajib &amp; Ingin Tambah Donasi?</strong> Silakan klik tombol <strong className="text-[#F3D37A]">&ldquo;+ Donatur&rdquo;</strong> langsung pada <strong>Kartu Warga</strong> Anda di bawah.
                                      </li>
                                      <li>
                                        • <strong>Diverifikasi Siapa?</strong> Semua setoran diperiksa dan disahkan oleh <strong>Ketua Paguyuban &amp; Admin/Bendahara</strong> sebelum dinyatakan lunas resmi.
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {pjuSuccess && (
                              <div className="mb-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center gap-2 flex-shrink-0">
                                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                                <span>Setoran Urunan PJU berhasil masuk ke antrean ⏳ Menunggu Verifikasi Pengurus &amp; tersimpan di Google Sheets!</span>
                              </div>
                            )}

                            {/* GRID KARTU PJU: Compact auto-rows-max (tidak pernah melar saat data sedikit) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 auto-rows-max content-start gap-2.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
                              {pageItems.map((item) => {
                                const isBoth = item.hasWajib && item.hasDonatur;
                                const isDonatur = item.hasDonatur;
                                const isWajib = item.hasWajib;
                                const isPend = item.hasPending;
                                const isRej = Boolean(item.hasRejected && !item.hasPending && !isWajib);
                                const isPaidAny = isWajib || isDonatur;
                                const ownedId = undefined;
                                const fallbackWarga: WargaRecord = item.wargaRef || {
                                  no: item.noUrut,
                                  id: item.primaryId,
                                  namaLengkap: item.namaWarga,
                                  jenisKelamin: 'Laki-laki',
                                  blok: 'D8',
                                  noRumah: '1',
                                  alamatRumah: item.alamatRumah,
                                  noWhatsapp: '081210001111',
                                  statusTempatTinggal: 'Menetap',
                                  pekerjaan: 'Karyawan Swasta',
                                  agama: 'Islam',
                                  statusPernikahan: 'Menikah',
                                  statusDalamKeluarga: 'Kepala Keluarga',
                                  jmlJiwa: 4,
                                  anggotaKeluargaTambahan: '-',
                                  statusIpl: 'Lunas',
                                  periodeTercover: 'Oktober 2026',
                                  nominalIpl: 30000,
                                  tanggalUpdate: '12 Okt 2026',
                                  catatan: '-',
                                };

                                return (
                                  <div
                                    key={item.key}
                                    className={`p-3 rounded-2xl border flex flex-col justify-between transition-all h-auto min-h-[96px] ${
                                      isRej
                                        ? 'bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800'
                                        : isPend
                                        ? 'bg-[#FFF9EA] dark:bg-amber-950/35 border-amber-400/90 shadow-xs'
                                        : isBoth
                                        ? 'bg-gradient-to-r from-[#FEF9EB] via-[#FFFDF7] to-[#EFF6FF] dark:from-amber-950/40 dark:to-sky-950/40 border-[#D9B352] shadow-2xs'
                                        : isPaidAny
                                        ? 'bg-[#F3F8F5] dark:bg-[#0B383B]/40 border-[#0B484C]/25 dark:border-[#D9B352]/30'
                                        : 'bg-[#F8F8F6] dark:bg-stone-800/50 border-stone-200/70 dark:border-stone-700/70'
                                    }`}
                                  >
                                    {/* BARIS ATAS KARTU: NOMOR + NAMA & SUBJUDUL BLOK DI KIRI | 1 BADGE STATUS DI KANAN */}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div
                                          className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center flex-shrink-0 ${
                                            isPend
                                              ? 'bg-amber-500 text-stone-950'
                                              : isBoth
                                              ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]'
                                              : isPaidAny
                                              ? 'bg-[#0B484C] text-[#F3D37A]'
                                              : 'bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200'
                                          }`}
                                        >
                                          {item.displayNo}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <h4 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white leading-snug">
                                            {item.namaWarga}
                                          </h4>
                                          <span className="text-[10px] text-stone-500 dark:text-stone-300 font-semibold block leading-tight">
                                            {item.alamatRumah} •{' '}
                                            {isBoth ? (
                                              <strong className="text-[#0B484C] dark:text-[#F3D37A]">
                                                Wajib 115rb + ★ Donatur {Math.round(item.donaturNominal / 1000)}rb
                                              </strong>
                                            ) : isDonatur ? (
                                              <strong className="text-amber-800 dark:text-[#F3D37A]">
                                                ★ Donatur (Rp {item.donaturNominal.toLocaleString('id-ID')})
                                              </strong>
                                            ) : isWajib ? (
                                              <strong className="text-[#0B484C] dark:text-[#F3D37A]">
                                                Wajib 1x Bayar (Rp {item.wajibNominal.toLocaleString('id-ID')})
                                              </strong>
                                            ) : (
                                              <span>Wajib PJU (1x Bayar)</span>
                                            )}
                                          </span>
                                        </div>
                                      </div>

                                      {isRej ? (
                                        <div className="relative group/tip inline-flex">
                                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 whitespace-nowrap flex-shrink-0 cursor-help">
                                            ⚠️ Ditolak Admin ?
                                          </span>
                                          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 bottom-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                            <p className="font-extrabold text-rose-300 mb-1">
                                              ⚠️ Setoran PJU Ditolak Pengurus:
                                            </p>
                                            <p className="text-stone-200">
                                              {item.rejectedItem?.keterangan || 'Bukti transfer buram'}. Silakan klik tombol <strong>Upload Ulang</strong> untuk mengirimkan foto struk transfer yang jelas.
                                            </p>
                                          </div>
                                        </div>
                                      ) : isPend ? (
                                        <div className="relative group/tip inline-flex">
                                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300/80 whitespace-nowrap flex-shrink-0 cursor-help">
                                            ⏳ Masuk Sheet • Verifikasi ?
                                          </span>
                                          <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 top-[calc(100%+6px)] w-72 p-3 rounded-2xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[11px] leading-relaxed">
                                            <p className="font-extrabold text-[#F3D37A] mb-1">
                                              ⏳ Diverifikasi Ketua &amp; Admin:
                                            </p>
                                            <p className="text-stone-200">
                                              Setoran ini sedang diverifikasi oleh <strong>Ketua Paguyuban &amp; Admin</strong>. Anda dapat mengklik <strong>Ubah</strong> atau <strong>Hapus</strong> dengan Password + 4 Digit WA jika ada kekeliruan.
                                            </p>
                                          </div>
                                        </div>
                                      ) : isBoth ? (
                                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-[#0B484C] border border-[#D9B352] whitespace-nowrap flex-shrink-0">
                                          ✓ Wajib + ★ Donatur
                                        </span>
                                      ) : isPaidAny ? (
                                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#0B484C] border border-emerald-300 whitespace-nowrap flex-shrink-0">
                                          ✓ Data Masuk &amp; Lunas
                                        </span>
                                      ) : (
                                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-200/80 dark:bg-stone-700 text-stone-700 dark:text-stone-200 whitespace-nowrap flex-shrink-0">
                                          Belum Bayar
                                        </span>
                                      )}
                                    </div>

                                    {/* BARIS BAWAH KARTU: TOTAL RINCIAN DI KIRI | TOMBOL AKSI DI KANAN */}
                                    <div className="pt-2 border-t border-stone-200/60 dark:border-stone-700 flex items-center justify-between gap-2 text-[11px]">
                                      {isRej && item.rejectedItem ? (
                                        <>
                                          <span className="text-rose-700 dark:text-rose-300 font-bold text-[10px] truncate">
                                            Catatan: {item.rejectedItem.keterangan}
                                          </span>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPjuNama(fallbackWarga.namaLengkap);
                                                setPjuLokasi(fallbackWarga.alamatRumah);
                                                setPjuTipe('URUNAN_WAJIB');
                                                setPjuNominal('115000');
                                                setPjuError('');
                                                setIsWargaLockedInForm(true);
                                                setUrunanMode('form');
                                              }}
                                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                            >
                                              <span>Upload Ulang →</span>
                                            </button>
                                          </div>
                                        </>
                                      ) : isPend && item.pendingItem ? (
                                        <>
                                          <span className="text-amber-900 dark:text-amber-200 font-bold text-[10px] truncate">
                                            {isBoth
                                              ? `✓ Wajib 115rb + ⏳ Donatur ${Math.round(item.donaturNominal / 1000)}rb (Rp ${item.totalNominal.toLocaleString('id-ID')})`
                                              : `✓ Masuk: ${item.pendingItem.tipe === 'DONATUR' ? '★ Donatur' : 'Urunan Wajib'} (Rp ${item.totalNominal.toLocaleString('id-ID')})`}
                                          </span>
                                          <div className="flex items-center gap-1 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const pend = item.pendingItem!;
                                                if (ownedId || isWargaOwnedByUser(fallbackWarga)) {
                                                  setEditingPjuId(pend.id);
                                                  setPjuNama(fallbackWarga.namaLengkap);
                                                  setPjuLokasi(fallbackWarga.alamatRumah);
                                                  setPjuTipe(pend.tipe);
                                                  setPjuNominal(String(pend.nominal));
                                                  setPjuError('');
                                                  setIsWargaLockedInForm(true);
                                                  setUrunanMode('form');
                                                  setIplSecurityGate({
                                                    warga: fallbackWarga,
                                                    intendedAction: 'edit_pju',
                                                    pjuItem: {
                                                      id: pend.id,
                                                      tipe: pend.tipe,
                                                      nominal: pend.nominal,
                                                      namaWarga: pend.namaWarga,
                                                    },
                                                  });
                                                  setIplGateInput('');
                                                  setIplGateError('');
                                                }
                                              }}
                                              className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-200 border border-amber-400/70 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                              title="Ubah setoran PJU yang sedang menunggu verifikasi pengurus"
                                            >
                                              <Edit className="w-2.5 h-2.5" />
                                              <span>Ubah</span>
                                            </button>
                                            {onDeleteUrunan && (
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const pend = item.pendingItem!;
                                                  if (ownedId || isWargaOwnedByUser(fallbackWarga)) {
                                                    setUserConfirmModal({
                                                      kind: 'delete',
                                                      title: 'Hapus Setoran PJU?',
                                                      subtitle: 'Setoran PJU yang sedang menunggu verifikasi ini akan dihapus:',
                                                      itemName: `${fallbackWarga.namaLengkap} (${fallbackWarga.alamatRumah})`,
                                                      detailText: `${pend.tipe === 'DONATUR' ? '🟡 ★ Donatur PJU' : '🔵 Urunan Wajib'} • Rp ${pend.nominal.toLocaleString('id-ID')}`,
                                                      confirmLabel: 'Ya, Hapus',
                                                      onConfirm: () => onDeleteUrunan(pend.id),
                                                    });
                                                  } else {
                                                    setIplSecurityGate({
                                                      warga: fallbackWarga,
                                                      intendedAction: 'cancel_pju',
                                                      pjuItem: {
                                                        id: pend.id,
                                                        tipe: pend.tipe,
                                                        nominal: pend.nominal,
                                                        namaWarga: pend.namaWarga,
                                                      },
                                                    });
                                                    setIplGateInput('');
                                                    setIplGateError('');
                                                  }
                                                }}
                                                className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                                title="Hapus / batalkan pengajuan PJU yang masih menunggu verifikasi"
                                              >
                                                <Trash2 className="w-2.5 h-2.5" />
                                                <span>Hapus</span>
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      ) : isPaidAny ? (
                                        <>
                                          <span className="text-[#0B484C] dark:text-emerald-300 font-bold text-[10px] truncate">
                                            {isBoth
                                              ? `✓ Total Wajib + Donatur: Rp ${item.totalNominal.toLocaleString('id-ID')}`
                                              : `✓ Lunas Wajib (1x Bayar): Rp ${item.totalNominal.toLocaleString('id-ID')}`}
                                          </span>
                                          <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setIplSecurityGate({
                                                  warga: fallbackWarga,
                                                  intendedAction: 'kwitansi_pju',
                                                  pjuItem: {
                                                    id: item.pendingItem?.id || '#PJU-001',
                                                    tipe: item.hasDonatur ? 'DONATUR' : 'URUNAN_WAJIB',
                                                    nominal: item.totalNominal,
                                                    namaWarga: item.namaWarga,
                                                  },
                                                });
                                                setIplGatePassword('');
                                                setIplGateWa4('');
                                                setIplGateError('');
                                              }}
                                              className="px-2 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/60 font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1"
                                              title="Verifikasi Password & 4 Digit WA untuk Buka Kwitansi PJU Resmi"
                                            >
                                              <Lock className="w-2.5 h-2.5" />
                                              <span>Kwitansi PJU</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setPjuNama(fallbackWarga.namaLengkap);
                                                setPjuLokasi(fallbackWarga.alamatRumah);
                                                setPjuTipe('DONATUR');
                                                setPjuNominal('');
                                                setPjuError('');
                                                setIsWargaLockedInForm(true);
                                                setUrunanMode('form');
                                              }}
                                              className="px-2.5 py-1 rounded-lg bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-extrabold text-[10px] whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                                              title="Kewajiban PJU (1x Bayar) sudah lunas — klik untuk menambah donasi sukarela (Donatur)"
                                            >
                                              <span>+ Donatur</span>
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-stone-500 text-[10px] truncate">
                                            Kewajiban PJU (1x Bayar): <strong className="text-[#1C221E] dark:text-white">Rp 115.000</strong>
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setPjuNama(fallbackWarga.namaLengkap);
                                              setPjuLokasi(fallbackWarga.alamatRumah);
                                              setPjuTipe('URUNAN_WAJIB');
                                              setPjuNominal('115000');
                                              setPjuError('');
                                              setIsWargaLockedInForm(true);
                                              setUrunanMode('form');
                                            }}
                                            className="px-3 py-1 rounded-lg bg-[#0B484C] hover:bg-[#093A3E] text-[#F3D37A] font-bold text-[10px] whitespace-nowrap flex items-center gap-1 flex-shrink-0"
                                          >
                                            <span>Bayar PJU</span>
                                            <ArrowRight className="w-3 h-3" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 mt-2 border-t border-stone-200/80 dark:border-stone-800 text-xs flex-shrink-0 w-full">
                            <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                              <span className="px-2.5 py-1 rounded-lg bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] font-extrabold text-[11px]">
                                Halaman {urunanPage} dari {totalPages}
                              </span>
                              <span className="text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
                                Total <strong className="text-[#1C221E] dark:text-white">{filteredUrunan.length} KK</strong> • Terkumpul: <strong className="text-[#0B484C] dark:text-[#F3D37A]">Rp {totalTerkumpul.toLocaleString('id-ID')}</strong>
                              </span>
                            </div>
                            <div className="flex items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                              <button
                                type="button"
                                disabled={urunanPage <= 1}
                                onClick={() => setUrunanPage((p) => Math.max(1, p - 1))}
                                className="h-8 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 font-extrabold text-[11px] text-stone-700 dark:text-stone-200 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>Sebelumnya</span>
                              </button>

                              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                                <button
                                  key={pg}
                                  type="button"
                                  onClick={() => setUrunanPage(pg)}
                                  className={`w-8 h-8 rounded-xl font-black text-xs transition-all flex items-center justify-center flex-shrink-0 ${
                                    urunanPage === pg
                                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs ring-2 ring-[#D9B352]/60'
                                      : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#0B484C]'
                                  }`}
                                >
                                  {pg}
                                </button>
                              ))}

                              <button
                                type="button"
                                disabled={urunanPage >= totalPages}
                                onClick={() => setUrunanPage((p) => Math.min(totalPages, p + 1))}
                                className={`h-8 px-2.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 transition-all flex-shrink-0 ${
                                  urunanPage < totalPages
                                    ? 'bg-[#0B484C] text-[#F3D37A] hover:bg-[#08383B] shadow-xs'
                                    : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 opacity-40 cursor-not-allowed'
                                }`}
                              >
                                <span>Selanjutnya</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* MODE FORMULIR PEMBAYARAN URUNAN PJU (MASUK KE MENU PJU & GOOGLE SHEETS — DENGAN VERIFIKASI PENGURUS) */
                        <div className="flex flex-col gap-3.5 h-auto min-h-0 lg:h-full lg:justify-between w-full max-w-full">
                          <div className="flex items-center justify-between gap-3 flex-shrink-0">
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white truncate">
                                Formulir Pembayaran Urunan PJU
                              </h3>
                              <p className="text-xs text-stone-400 truncate">
                                Hasil Rapat Sabtu, 6 Juni 2026 • Iuran Wajib Rp 115.000/KK (Cukup 1x Bayar) atau Tambah Donatur Sukarela
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setUrunanMode('daftar');
                                setPjuNama('');
                                setPjuLokasi('');
                                setPjuError('');
                                setIsWargaLockedInForm(false);
                              }}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 whitespace-nowrap flex-shrink-0"
                            >
                              ← Kembali ke Daftar PJU
                            </button>
                          </div>

                          {/* Baris Ringkasan Rekening Mandiri Dwi Saputra & Total Urunan */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-shrink-0">
                            <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                                  Rekening Bendahara PJU
                                </span>
                                <p className="text-xs sm:text-sm font-extrabold text-[#0B484C] dark:text-[#F3D37A] truncate mt-0.5">
                                  {namaBank} • <span className="font-mono">{noRek}</span>
                                </p>
                                <span className="text-[11px] text-stone-500 dark:text-stone-300 truncate block">
                                  a.n. {atasNama} (Note: Blok &amp; No. Rumah)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopyRek}
                                className="px-3 py-2 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-[#0B484C] dark:text-[#F3D37A] text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 flex-shrink-0 shadow-2xs"
                              >
                                {copiedRek ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiedRek ? 'Tersalin' : 'Salin Rek'}</span>
                              </button>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#FEF9EB] dark:bg-[#0B383B]/50 border border-[#D9B352]/50 flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <span className="text-[10px] font-bold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider block">
                                  Ringkasan Setoran PJU
                                </span>
                                <p className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white truncate mt-0.5">
                                  {pjuNama
                                    ? pjuLokasi
                                      ? `${pjuNama} (${pjuLokasi})`
                                      : pjuNama
                                    : 'Pilih Warga Terdaftar'}
                                </p>
                                <span className="text-[11px] text-stone-500 dark:text-stone-300 block">
                                  Kategori: <strong>{pjuTipe === 'DONATUR' ? '★ Donatur Sukarela' : 'Urunan Wajib KK (1x Bayar)'}</strong>
                                  {selectedExistingWajib && (
                                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                                      {' '}• ✓ Wajib Rp {selectedExistingWajib.nominal.toLocaleString('id-ID')} Sudah Terpenuhi
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-[10px] font-bold text-stone-400 block">Nominal Setor</span>
                                <span className="text-sm sm:text-base font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                                  Rp {(parseInt(pjuNominal.replace(/\D/g, ''), 10) || 0).toLocaleString('id-ID')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {selectedExistingWajib && (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 flex-shrink-0">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span>
                                Wajib PJU sudah lunas (Rp {selectedExistingWajib.nominal.toLocaleString('id-ID')}) — otomatis masuk sebagai <strong>★ Donatur</strong>.
                              </span>
                            </div>
                          )}

                          {pjuError && (
                            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex-shrink-0">
                              {pjuError}
                            </div>
                          )}

                          <form
                            id="form-bayar-pju"
                            onSubmit={handleSubmitBayarPju}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-xs content-center"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <label className="font-bold text-stone-600 dark:text-stone-300 text-[11px]">
                                  1. Pilih Warga Terdaftar (Nama &amp; Blok) *
                                </label>
                                {isWargaLockedInForm ? (
                                  <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1 whitespace-nowrap">
                                    <Lock className="w-3 h-3" /> Sesuai kartu dipilih
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleOpenFormWarga();
                                      onSelectTab('warga');
                                    }}
                                    className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] hover:underline whitespace-nowrap"
                                  >
                                    Belum terdaftar? + Daftar Warga
                                  </button>
                                )}
                              </div>
                              {isWargaLockedInForm ? (
                                <div className="w-full h-9 px-3 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-2 select-none">
                                  <span className="text-xs font-extrabold text-[#092C2E] dark:text-white truncate">
                                    {pjuNama} — {pjuLokasi}
                                  </span>
                                  <Lock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                                </div>
                              ) : (
                                <CustomSelect
                                  searchable={true}
                                  placeholder={
                                    pjuTipe === 'URUNAN_WAJIB'
                                      ? 'Pilih warga (yang sudah lunas Wajib terkunci)...'
                                      : 'Pilih warga untuk tambah ★ Donatur...'
                                  }
                                  value={pjuNama && pjuLokasi ? `${pjuNama}|||${pjuLokasi}` : ''}
                                  onChange={(val) => {
                                    const [nama, lokasi] = val.split('|||');
                                    if (nama && lokasi) {
                                      setPjuNama(nama);
                                      setPjuLokasi(lokasi);
                                      setPjuError('');
                                    }
                                  }}
                                  options={wargaList.map((w) => {
                                    const existingPju = getExistingWajibPju(w.namaLengkap, w.alamatRumah);
                                    const isDisabledInWajib = pjuTipe === 'URUNAN_WAJIB' && Boolean(existingPju);
                                    return {
                                      value: `${w.namaLengkap}|||${w.alamatRumah}`,
                                      label: `${w.namaLengkap} — ${w.alamatRumah}`,
                                      disabled: isDisabledInWajib,
                                      badge: existingPju
                                        ? isDisabledInWajib
                                          ? '🔒 Wajib Lunas'
                                          : '✓ Bisa +Donatur'
                                        : undefined,
                                      description: existingPju
                                        ? isDisabledInWajib
                                          ? `Sudah bayar Wajib — pilih ★ Donatur untuk tambah donasi`
                                          : `Wajib sudah lunas — pilih untuk tambah ★ Donatur`
                                        : `Belum bayar Wajib PJU (Rp 115.000)`,
                                    };
                                  })}
                                />
                              )}
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="font-bold text-stone-600 dark:text-stone-300 text-[11px]">
                                  2. Kategori &amp; Nominal Urunan PJU *
                                </label>
                                <span className="text-[11px] font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                                  Rp {(parseInt(pjuNominal.replace(/\D/g, ''), 10) || 0).toLocaleString('id-ID')}
                                </span>
                              </div>
                              <div className="h-9 p-1 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center gap-1.5">
                                <div className="grid grid-cols-2 gap-1 h-full flex-shrink-0">
                                  <button
                                    type="button"
                                    disabled={Boolean(selectedExistingWajib)}
                                    onClick={() => {
                                      if (selectedExistingWajib) return;
                                      setPjuTipe('URUNAN_WAJIB');
                                      setPjuNominal('115000');
                                      setPjuError('');
                                    }}
                                    title={
                                      selectedExistingWajib
                                        ? 'Warga yang dipilih sudah membayar Urunan Wajib — tidak bisa pilih Wajib lagi'
                                        : 'Bayar Urunan Wajib Rp 115.000/KK (Cukup 1x Bayar)'
                                    }
                                    className={`px-2.5 h-full rounded-lg text-[10px] font-extrabold transition-colors whitespace-nowrap ${
                                      selectedExistingWajib
                                        ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-not-allowed'
                                        : pjuTipe === 'URUNAN_WAJIB'
                                        ? 'bg-[#0B484C] text-[#F3D37A] shadow-2xs'
                                        : 'text-stone-500 hover:text-[#1C221E] dark:hover:text-white'
                                    }`}
                                  >
                                    {selectedExistingWajib ? '🔒 Wajib Lunas' : 'Wajib'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPjuTipe('DONATUR');
                                      setPjuNominal('');
                                      setPjuError('');
                                    }}
                                    className={`px-2.5 h-full rounded-lg text-[10px] font-extrabold transition-colors whitespace-nowrap ${
                                      pjuTipe === 'DONATUR'
                                        ? 'bg-[#0B484C] text-[#F3D37A] shadow-2xs'
                                        : 'text-stone-500 hover:text-[#1C221E] dark:hover:text-white'
                                    }`}
                                  >
                                    ★ Donatur
                                  </button>
                                </div>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  required
                                  value={pjuNominal}
                                  onChange={(e) => setPjuNominal(e.target.value.replace(/\D/g, ''))}
                                  placeholder={
                                    pjuTipe === 'DONATUR'
                                      ? 'Ketik nominal donasi sukarela...'
                                      : '115000'
                                  }
                                  className="flex-1 min-w-0 h-full px-2.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-700 text-[#1C221E] dark:text-white font-extrabold text-right text-xs placeholder:font-medium placeholder:text-stone-400 focus:outline-none"
                                />
                              </div>
                            </div>

                            <CustomSelect
                              label="3. Metode Pembayaran *"
                              searchable={false}
                              value={pjuMetode}
                              onChange={(val) => setPjuMetode(val as 'TF' | 'Cash')}
                              options={[
                                { value: 'TF', label: `Transfer ${namaBank} (${noRek})` },
                                { value: 'Cash', label: 'Cash / Tunai ke Bendahara' },
                              ]}
                            />

                            <div>
                              <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1.5 text-[11px]">
                                4. Upload Bukti Transfer (Gambar / PDF)
                              </label>
                              <label className="cursor-pointer w-full h-9 px-3 rounded-xl bg-[#F8F8F6] hover:bg-[#EFECE6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-2 transition-colors">
                                <input
                                  type="file"
                                  accept="image/*,.pdf,application/pdf"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                      setPjuBuktiName(f.name);
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        setPjuBuktiBase64(ev.target?.result as string);
                                      };
                                      reader.readAsDataURL(f);
                                    }
                                  }}
                                  className="hidden"
                                />
                                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-300 min-w-0">
                                  <UploadCloud className="w-4 h-4 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0" />
                                  <span className="text-[11px] font-semibold truncate">
                                    {pjuBuktiName || 'Pilih Foto Struk / File PDF...'}
                                  </span>
                                </div>
                                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-700 text-[#0B484C] dark:text-[#F3D37A] flex-shrink-0">
                                  {pjuBuktiName ? 'Ganti' : 'Browse'}
                                </span>
                              </label>
                            </div>
                          </form>

                          <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
                            <span className="text-xs text-stone-400">
                              Data pembayaran langsung tercatat di <strong className="text-[#0B484C] dark:text-[#F3D37A]">Menu Urunan PJU &amp; Google Sheets</strong>.
                            </span>
                            {(() => {
                              const pjuNomNum = parseInt(pjuNominal.replace(/\D/g, ''), 10) || 0;
                              const isPjuFormValid = Boolean(
                                pjuNama.trim() &&
                                  pjuLokasi.trim() &&
                                  (pjuTipe === 'URUNAN_WAJIB'
                                    ? pjuNomNum >= 115000 && !selectedExistingWajib
                                    : pjuNomNum > 0) &&
                                  pjuBuktiName.trim() &&
                                  !isSyncingPju
                              );
                              return (
                                <button
                                  type="submit"
                                  form="form-bayar-pju"
                                  disabled={!isPjuFormValid}
                                  className={`font-bold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs whitespace-nowrap transition-all ${
                                    isPjuFormValid
                                      ? 'carlic-sage-btn text-[#F3D37A]'
                                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  {isSyncingPju ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      <span>Menyimpan ke Google Sheets...</span>
                                    </>
                                  ) : (
                                    <>
                                      <UploadCloud className="w-4 h-4" />
                                      <span>Simpan &amp; Masukkan ke Daftar PJU</span>
                                    </>
                                  )}
                                </button>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right: Keputusan Rapat 6 Juni 2026 & Rekening Bendahara Mandiri Dwi Saputra */}
                    <div className="lg:col-span-4 carlic-card p-4 flex flex-col justify-between lg:h-full min-w-0 overflow-hidden">
                      {/* 1. Header Rapi */}
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white whitespace-nowrap">
                            Ketentuan Urunan PJU
                          </h3>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 whitespace-nowrap">
                            Rapat 6 Juni 2026
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 truncate">
                          Pemasangan lampu PJU jalan utama &amp; titik krusial PK8 Tahap 2
                        </p>
                      </div>

                      {/* 2. Dua Kartu Nominal Iuran (Wajib & Donatur) */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                            Iuran Wajib / KK
                          </span>
                          <p className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white mt-0.5">
                            Rp {programUrunan.tarifWajibPerWarga.toLocaleString('id-ID')}
                          </p>
                          <span className="text-[10px] text-stone-400 block mt-0.5">
                            Per Rumah / KK
                          </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#FEF9EB] dark:bg-[#0B383B]/50 border border-[#D9B352]/50">
                          <span className="text-[10px] font-bold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider block">
                            Donatur Sukarela
                          </span>
                          <p className="text-sm sm:text-base font-extrabold text-[#0B484C] dark:text-[#F3D37A] mt-0.5">
                            Seikhlasnya
                          </p>
                          <span className="text-[10px] text-stone-500 dark:text-stone-300 block mt-0.5">
                            Bebas Nominal (Kelebihan Rezeki)
                          </span>
                        </div>
                      </div>

                      {/* 3. Kartu Rekening Bendahara + Note Transfer */}
                      <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800/70 border border-stone-200/70 dark:border-stone-700 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                            Rekening Bendahara
                          </span>
                          <span className="text-[11px] font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                            {namaBank}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Nomor Rekening</span>
                          <span className="font-mono text-sm font-extrabold text-[#1C221E] dark:text-white tracking-wide">
                            {noRek}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-stone-400">Atas Nama</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {atasNama}
                          </span>
                        </div>
                        <div className="pt-2.5 border-t border-stone-200/70 dark:border-stone-700 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">
                            📌 Note Transfer:
                          </span>
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/40 whitespace-nowrap">
                            Blok &amp; No. Rumah (Cth: D13 No. 7)
                          </span>
                        </div>
                      </div>

                      {/* 4. Tombol Aksi */}
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleCopyRek}
                          className="w-full h-10 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-[#1C221E] dark:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          {copiedRek ? <Check className="w-4 h-4 text-[#0B484C]" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedRek ? 'Rekening Mandiri Tersalin!' : `Salin Rek Mandiri (${noRek})`}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setUrunanMode('form')}
                          className="w-full h-10 carlic-sage-btn text-[#F3D37A] font-bold rounded-xl text-xs flex items-center justify-center gap-2"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Bayar / Konfirmasi Urunan PJU</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* MENU 4: DATA WARGA & BLOK                                     */}
            {/* ============================================================= */}
            {currentTab === 'warga' && (() => {
              // Ekstrak blok-blok unik secara dinamis murni dari data warga aktif (Mendukung Blok A s/d Z)
              const uniqueBlocks = Array.from(
                new Set(
                  wargaList
                    .map((w) => (w.blok ? w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim() : ''))
                    .filter((b) => b.length > 0)
                )
              ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

              const filteredWargaList = wargaList.filter((w) => {
                const matchSearch = aiFuzzyMatch(
                  wargaSearch,
                  `${w.namaLengkap} ${w.alamatRumah} ${w.blok}`,
                  `${w.pekerjaan} ${w.statusTempatTinggal}`
                );
                const bClean = w.blok ? w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim() : '';
                let matchGroup = true;
                if (blokGroup !== 'ALL') {
                  matchGroup = bClean === blokGroup || bClean.startsWith(blokGroup);
                }
                return matchSearch && matchGroup;
              });
              const pageSize = 9;
              const totalPages = Math.max(1, Math.ceil(filteredWargaList.length / pageSize));
              const pageItems = filteredWargaList.slice(
                (wargaPage - 1) * pageSize,
                wargaPage * pageSize
              );

              return (
                <div className="lg:h-full">
                  {wargaMode === 'direktori' ? (
                    <div className="carlic-card p-4 lg:h-full flex flex-col justify-between">
                      <div className="flex flex-col flex-1 min-h-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 flex-shrink-0 max-w-full">
                          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none flex-nowrap sm:flex-wrap flex-shrink-0">
                            {/* Tombol Semua Blok */}
                            <button
                              type="button"
                              onClick={() => {
                                setBlokGroup('ALL');
                                setWargaPage(1);
                              }}
                              className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                                blokGroup === 'ALL'
                                  ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                                  : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#0B484C] dark:hover:text-white'
                              }`}
                            >
                              Semua Blok {wargaList.length > 0 ? `(${wargaList.length})` : ''}
                            </button>

                            {/* Tombol Blok Dinamis: Hanya muncul sesuai data warga aktif (Blok A sampai Z) */}
                            {uniqueBlocks.map((blk) => {
                              const countInBlock = wargaList.filter(
                                (w) => (w.blok ? w.blok.toUpperCase().replace(/^BLOK\s*/i, '').trim() : '') === blk
                              ).length;
                              return (
                                <button
                                  key={blk}
                                  type="button"
                                  onClick={() => {
                                    setBlokGroup(blk);
                                    setWargaPage(1);
                                  }}
                                  className={`text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors ${
                                    blokGroup === blk
                                      ? 'bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50'
                                      : 'bg-[#F4F4F0] dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:text-[#0B484C] dark:hover:text-white'
                                  }`}
                                >
                                  Blok {blk} ({countInBlock})
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center gap-2 justify-between sm:justify-end w-full sm:w-auto flex-shrink-0">
                            <div className="relative flex-1 sm:w-60">
                              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                value={wargaSearch}
                                onChange={(e) => {
                                  setWargaSearch(e.target.value);
                                  setWargaPage(1);
                                }}
                                placeholder="Cari nama atau blok..."
                                className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#F8F8F6] dark:bg-stone-800 text-xs text-[#1C221E] dark:text-white focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleOpenFormWarga}
                              className="carlic-sage-btn text-[#F3D37A] text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>+ Warga Baru</span>
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max content-start gap-2.5 flex-1 min-h-0 overflow-y-auto pr-0.5">
                          {pageItems.map((w, idx) => {
                            const isOwned = isWargaOwnedByUser(w);
                            return (
                              <div
                                key={w.id || idx}
                                onClick={() => handleOpenDetailWarga(w)}
                                className={`cursor-pointer px-3.5 py-2.5 rounded-2xl transition-colors flex flex-col justify-between h-auto min-h-[96px] ${
                                  isOwned
                                    ? 'bg-[#FEF9EB] dark:bg-[#0F494D]/60 border border-[#D9B352]/60 hover:bg-[#FAF1D6]'
                                    : 'bg-[#F8F8F6] dark:bg-stone-800/60 hover:bg-[#EFECE6] dark:hover:bg-stone-800'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-[#0B484C] text-[#F3D37A] ring-1 ring-[#D9B352]/50 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                      {w.namaLengkap.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <h4 className="text-xs sm:text-sm font-extrabold text-[#1C221E] dark:text-white truncate">
                                        {w.namaLengkap}
                                      </h4>
                                      <span className="text-[10px] text-stone-500 font-semibold block truncate">
                                        {w.jmlJiwa} Jiwa •{' '}
                                        <strong className="text-[#0B484C] dark:text-[#F3D37A]">
                                          ✓ Terdata di Sheet
                                        </strong>
                                      </span>
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white dark:bg-stone-700 text-[#1C221E] dark:text-white flex-shrink-0">
                                    {w.alamatRumah}
                                  </span>
                                </div>

                                <div className="pt-1.5 border-t border-stone-200/60 dark:border-stone-700 flex items-center justify-between text-[11px]">
                                  <span
                                    className={`font-bold ${
                                      w.statusTempatTinggal === 'Menetap'
                                        ? 'text-[#0B484C] dark:text-[#F3D37A]'
                                        : 'text-amber-700'
                                    }`}
                                  >
                                    ● {w.statusTempatTinggal}
                                  </span>
                                  {isOwned ? (
                                    <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] flex items-center gap-1">
                                      <Edit className="w-3 h-3" /> Data Anda • Edit
                                    </span>
                                  ) : (
                                    <span className="font-bold text-stone-500 flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> Detail
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 mt-2 border-t border-stone-200/80 dark:border-stone-800 text-xs flex-shrink-0 w-full">
                        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                          <span className="px-2.5 py-1 rounded-lg bg-[#0B484C]/10 dark:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] font-extrabold text-[11px]">
                            Halaman {wargaPage} dari {totalPages}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400 font-semibold text-[11px]">
                            Total <strong className="text-[#1C221E] dark:text-white">{filteredWargaList.length} KK</strong>
                          </span>
                        </div>
                        <div className="flex items-center justify-center sm:justify-end gap-1.5 w-full sm:w-auto overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                          <button
                            type="button"
                            disabled={wargaPage <= 1}
                            onClick={() => setWargaPage((p) => Math.max(1, p - 1))}
                            className="h-8 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 font-extrabold text-[11px] text-stone-700 dark:text-stone-200 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Sebelumnya</span>
                          </button>

                          {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
                            <button
                              key={pg}
                              type="button"
                              onClick={() => setWargaPage(pg)}
                              className={`w-8 h-8 rounded-xl font-black text-xs transition-all flex items-center justify-center flex-shrink-0 ${
                                wargaPage === pg
                                  ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs ring-2 ring-[#D9B352]/60'
                                  : 'bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-[#0B484C]'
                              }`}
                            >
                              {pg}
                            </button>
                          ))}

                          <button
                            type="button"
                            disabled={wargaPage >= totalPages}
                            onClick={() => setWargaPage((p) => Math.min(totalPages, p + 1))}
                            className={`h-8 px-2.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 transition-all flex-shrink-0 ${
                              wargaPage < totalPages
                                ? 'bg-[#0B484C] text-[#F3D37A] hover:bg-[#08383B] shadow-xs'
                                : 'bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-400 opacity-40 cursor-not-allowed'
                            }`}
                          >
                            <span>Selanjutnya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (() => {
                    // Hanya Huruf Murni Blok A sampai Blok Z (Nomor blok/rumah diisi user pada kolom nomor)
                    const allBlokAzOptions = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
                      value: letter,
                      label: `Blok ${letter}`,
                      description: `Wilayah Blok ${letter}`,
                    }));
                    // Helper normalisasi ketat untuk validasi duplikat data warga
                    const strictNameNorm = (raw: string) => {
                      return raw
                        .toLowerCase()
                        .replace(/^(bapak|ibu|pak|bu|bpk|haji|h\.|hj\.)\s+/gi, '')
                        .replace(/[^a-z0-9]/g, '');
                    };
                    const normalizeWaDigits = (raw: string) => {
                      let d = raw.replace(/\D/g, '');
                      if (d.startsWith('62')) d = '0' + d.slice(2);
                      return d;
                    };
                    const cleanAddressKey = (blokStr: string, noStr: string) => {
                      const b = blokStr.toUpperCase().replace(/[^A-Z0-9]/g, '');
                      const n = String(noStr).replace(/[^0-9]/g, '').replace(/^0+/, '') || '1';
                      return `${b}-${n}`;
                    };

                    // Real-time validasi Step 1: Format & Duplikasi Nama + WhatsApp
                    const namaVal = validateNamaWarga(formNama);
                    const waVal = validateNomorWhatsApp(formWa);
                    const targetNameNorm = strictNameNorm(formNama);
                    const duplicateNamaMatch = targetNameNorm.length >= 3
                      ? wargaList.find((w) => strictNameNorm(w.namaLengkap) === targetNameNorm)
                      : null;
                    const cleanWaDigits = normalizeWaDigits(formWa);
                    const duplicateWaMatch = cleanWaDigits.length >= 9
                      ? wargaList.find((w) => {
                          const normW = normalizeWaDigits(w.noWhatsapp || '');
                          return normW.length >= 9 && normW === cleanWaDigits;
                        })
                      : null;
                    const isStep1Valid = Boolean(
                      namaVal.isValid &&
                      waVal.isValid &&
                      !duplicateNamaMatch &&
                      !duplicateWaMatch
                    );

                    // Real-time validasi Step 2: Format & Duplikasi Alamat Rumah (Blok + No Rumah)
                    const cleanBlokLetter = formBlok.trim().toUpperCase().replace(/^BLOK\s*/i, '');
                    const cleanNoBlok = formNoBlok.trim();
                    const fullBlokInput = cleanNoBlok ? `${cleanBlokLetter}${cleanNoBlok}` : cleanBlokLetter;
                    const cleanNoRumahInput = (formNoRumah.trim() || cleanNoBlok);
                    const targetAddressKey = cleanBlokLetter && cleanNoRumahInput
                      ? cleanAddressKey(fullBlokInput, cleanNoRumahInput)
                      : '';
                    const duplicateAddressMatch = targetAddressKey
                      ? wargaList.find((w) => cleanAddressKey(w.blok, String(w.noRumah)) === targetAddressKey)
                      : null;
                    const isStep2Valid = Boolean(
                      formBlok.trim().length >= 1 &&
                      cleanNoRumahInput.length >= 1 &&
                      !duplicateAddressMatch &&
                      (parseInt(formJiwa, 10) || 0) >= 1
                    );

                    // Real-time validasi Step 3: Password & Simpan
                    const pwCheck = validateSecurePassword(formPin);
                    const isPinValid = pwCheck.isValid && formPin === formConfirmPin;
                    const pwMatches = Boolean(formPin && formConfirmPin && formPin === formConfirmPin);
                    const pwMismatch = Boolean(formPin && formConfirmPin && formPin !== formConfirmPin);

                    const criteriaCount = [
                      pwCheck.hasMin8,
                      pwCheck.hasUpper,
                      pwCheck.hasLower,
                      pwCheck.hasNumber,
                      pwCheck.hasSpecial,
                    ].filter(Boolean).length;

                    const strengthPercent = formPin.length === 0 ? 0 : Math.round((criteriaCount / 5) * 100);
                    const strengthLabel =
                      formPin.length === 0
                        ? 'Belum diisi'
                        : criteriaCount <= 2
                        ? 'Lemah'
                        : criteriaCount <= 4
                        ? 'Sedang'
                        : 'Sangat Aman ✓';
                    const strengthBarColor =
                      criteriaCount <= 2
                        ? 'bg-rose-500'
                        : criteriaCount <= 4
                        ? 'bg-amber-500'
                        : 'bg-emerald-500';

                    const isWargaFormComplete = Boolean(
                      isStep1Valid &&
                      isStep2Valid &&
                      isPinValid
                    );
                    const isWargaFormValid =
                      isWargaFormComplete && !formWargaError;
                    return (
                      <div className="carlic-card p-3.5 sm:p-5 h-auto min-h-0 lg:h-full flex flex-col justify-between w-full max-w-full">
                        {/* ========================================================= */}
                        {/* TOP SECTION: HEADER & TIMELINE STEPPER (FLEX-SHRINK-0)    */}
                        {/* ========================================================= */}
                        <div className="space-y-3 flex-shrink-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-200/70 dark:border-stone-800">
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] dark:bg-stone-800 dark:text-[#F3D37A]">
                                  Registrasi Mandiri Warga
                                </span>
                                <span className="text-xs text-stone-400">• Paguyuban PK8 Tahap 2</span>
                              </div>
                              <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white">
                                Formulir Pendaftaran Warga Baru
                              </h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setWargaMode('direktori');
                                setFormStep(1);
                                setFormNama('');
                                setFormNoRumah('');
                                setFormWa('');
                                setFormPin('');
                                setFormConfirmPin('');
                                setFormWargaError('');
                              }}
                              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 transition-colors whitespace-nowrap self-start sm:self-auto flex items-center gap-1.5"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Kembali ke Direktori</span>
                            </button>
                          </div>

                          {/* TIMELINE STEPPER */}
                          <div className="max-w-2xl mx-auto py-0.5">
                            <div className="flex items-center justify-between">
                              {/* STEP 1 */}
                              <button
                                type="button"
                                onClick={() => setFormStep(1)}
                                className="flex items-center gap-2 text-left group transition-all"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    formStep === 1
                                      ? 'bg-[#0B484C] text-[#F3D37A] ring-4 ring-[#0B484C]/15 shadow-sm'
                                      : isStep1Valid
                                      ? 'bg-emerald-600 text-white'
                                      : duplicateNamaMatch || duplicateWaMatch
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                                  }`}
                                >
                                  {isStep1Valid && formStep !== 1 ? '✓' : duplicateNamaMatch || duplicateWaMatch ? '✕' : '1'}
                                </div>
                                <div className="relative group/tip">
                                  <div className="hidden sm:block">
                                    <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">
                                      Langkah 1
                                    </span>
                                    <span
                                      className={`text-xs font-extrabold block leading-tight ${
                                        formStep === 1 ? 'text-[#0B484C] dark:text-[#F3D37A]' : 'text-stone-700 dark:text-stone-300'
                                      }`}
                                    >
                                      Identitas &amp; Kontak
                                    </span>
                                  </div>
                                  <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 bottom-[calc(100%+8px)] w-64 p-2.5 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[10px] leading-relaxed">
                                    <strong className="text-[#F3D37A] block mb-0.5">Langkah 1: Identitas &amp; Kontak</strong>
                                    Isi nama lengkap kepala keluarga dan nomor WhatsApp aktif diawali 08xx.
                                  </div>
                                </div>
                              </button>

                              <div
                                className={`flex-1 h-1 mx-3 sm:mx-4 rounded-full transition-all duration-300 ${
                                  isStep1Valid ? 'bg-emerald-500' : duplicateNamaMatch || duplicateWaMatch ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                                }`}
                              />

                              {/* STEP 2 */}
                              <button
                                disabled={!isStep1Valid}
                                onClick={() => setFormStep(2)}
                                className="flex items-center gap-2 text-left group transition-all disabled:opacity-50"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    formStep === 2
                                      ? 'bg-[#0B484C] text-[#F3D37A] ring-4 ring-[#0B484C]/15 shadow-sm'
                                      : isStep2Valid
                                      ? 'bg-emerald-600 text-white'
                                      : duplicateAddressMatch
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                                  }`}
                                >
                                  {isStep2Valid && formStep === 3 ? '✓' : duplicateAddressMatch ? '✕' : '2'}
                                </div>
                                <div className="relative group/tip">
                                  <div className="hidden sm:block">
                                    <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">
                                      Langkah 2
                                    </span>
                                    <span
                                      className={`text-xs font-extrabold block leading-tight ${
                                        formStep === 2 ? 'text-[#0B484C] dark:text-[#F3D37A]' : 'text-stone-700 dark:text-stone-300'
                                      }`}
                                    >
                                      Alamat &amp; Hunian
                                    </span>
                                  </div>
                                  <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 bottom-[calc(100%+8px)] w-64 p-2.5 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[10px] leading-relaxed">
                                    <strong className="text-[#F3D37A] block mb-0.5">Langkah 2: Alamat &amp; Hunian</strong>
                                    Tentukan blok (A–Z), nomor blok, nomor rumah, serta status domisili &amp; jumlah jiwa.
                                  </div>
                                </div>
                              </button>

                              <div
                                className={`flex-1 h-1 mx-3 sm:mx-4 rounded-full transition-all duration-300 ${
                                  isStep2Valid ? 'bg-emerald-500' : duplicateAddressMatch ? 'bg-rose-500' : 'bg-stone-200 dark:bg-stone-700'
                                }`}
                              />

                              {/* STEP 3 */}
                              <button
                                disabled={!isStep1Valid || !isStep2Valid}
                                onClick={() => setFormStep(3)}
                                className="flex items-center gap-2 text-left group transition-all disabled:opacity-50"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    formStep === 3
                                      ? 'bg-[#0B484C] text-[#F3D37A] ring-4 ring-[#0B484C]/15 shadow-sm'
                                      : isPinValid
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-stone-200 dark:bg-stone-700 text-stone-500'
                                  }`}
                                >
                                  {isPinValid ? '✓' : '3'}
                                </div>
                                <div className="relative group/tip">
                                  <div className="hidden sm:block">
                                    <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-wider block">
                                      Langkah 3
                                    </span>
                                    <span
                                      className={`text-xs font-extrabold block leading-tight ${
                                        formStep === 3 ? 'text-[#0B484C] dark:text-[#F3D37A]' : 'text-stone-700 dark:text-stone-300'
                                      }`}
                                    >
                                      Keamanan &amp; Simpan
                                    </span>
                                  </div>
                                  <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute right-0 bottom-[calc(100%+8px)] w-64 p-2.5 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-2xl z-50 text-[10px] leading-relaxed">
                                    <strong className="text-[#F3D37A] block mb-0.5">Langkah 3: Keamanan &amp; Simpan</strong>
                                    Buat password rahasia rumah (min. 8 karakter) untuk akses kwitansi &amp; simpan data ke Google Sheets.
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>

                          {/* ALERT PESAN KESALAHAN */}
                          {formWargaError && (
                            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center justify-between gap-3">
                              <span>⚠️ {formWargaError}</span>
                              <button
                                type="button"
                                onClick={() => setFormWargaError('')}
                                className="text-stone-400 hover:text-stone-600 text-sm font-bold"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </div>

                        {/* ========================================================= */}
                        {/* MIDDLE SECTION: FORM CONTENT (FLEX-1 CENTERED)            */}
                        {/* ========================================================= */}
                        <form
                          id="form-warga-baru"
                          onSubmit={handleSubmitWargaBaru}
                          className="flex-1 flex flex-col justify-center min-h-0 py-2"
                        >
                          {/* LANGKAH 1: IDENTITAS & KONTAK */}
                          {formStep === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                              {/* FIELD 1: NAMA LENGKAP */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5 h-4">
                                  <div className="flex items-center gap-1">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Nama Kepala Keluarga *
                                    </label>
                                    <div className="relative group/tip inline-flex">
                                      <span className="text-[10px] text-stone-400 font-bold cursor-help">(?)</span>
                                      <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 bottom-[calc(100%+4px)] w-56 p-2 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-xl z-50 text-[10px] leading-relaxed">
                                        Nama lengkap kepala keluarga sesuai KTP/KK (min. 3 huruf, tanpa angka).
                                      </div>
                                    </div>
                                  </div>
                                  {formNama.trim().length > 0 && (
                                    duplicateNamaMatch ? (
                                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                                        ⚠️ Sudah Terdaftar ({duplicateNamaMatch.alamatRumah})
                                      </span>
                                    ) : namaVal.isValid ? (
                                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        ✓ Nama Sah
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                                        ⚠️ {namaVal.message}
                                      </span>
                                    )
                                  )}
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={formNama}
                                  onChange={(e) => {
                                    setFormNama(e.target.value);
                                    setFormWargaError('');
                                  }}
                                  placeholder="Contoh: Bapak Budi Santoso"
                                  className={`w-full h-11 px-4 rounded-2xl border text-xs font-bold transition-all focus:outline-none ${
                                    formNama.trim().length > 0 && duplicateNamaMatch
                                      ? 'bg-rose-50/25 border-rose-400 focus:border-rose-500 text-rose-900 dark:text-rose-200'
                                      : formNama.trim().length > 0 && !namaVal.isValid
                                      ? 'bg-rose-50/20 border-rose-400 focus:border-rose-500 text-[#1C221E] dark:text-white'
                                      : formNama.trim().length > 0 && namaVal.isValid
                                      ? 'bg-emerald-50/15 border-emerald-400 focus:border-emerald-500 text-[#1C221E] dark:text-white'
                                      : 'bg-[#FBFBFA] dark:bg-stone-800/90 border-stone-200/90 dark:border-stone-700 text-[#1C221E] dark:text-white focus:border-[#0B484C] focus:bg-white'
                                  }`}
                                />
                              </div>

                              {/* FIELD 2: NOMOR WHATSAPP */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5 h-4">
                                  <div className="flex items-center gap-1">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Nomor WhatsApp Aktif *
                                    </label>
                                    <div className="relative group/tip inline-flex">
                                      <span className="text-[10px] text-stone-400 font-bold cursor-help">(?)</span>
                                      <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 bottom-[calc(100%+4px)] w-56 p-2 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-xl z-50 text-[10px] leading-relaxed">
                                        Wajib diawali 08xx/628xx (10–13 digit) sebagai kunci verifikasi akses data rumah.
                                      </div>
                                    </div>
                                  </div>
                                  {formWa.trim().length > 0 && (
                                    duplicateWaMatch ? (
                                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800 flex items-center gap-1">
                                        ⚠️ Sudah Terdaftar (a.n. {duplicateWaMatch.namaLengkap})
                                      </span>
                                    ) : waVal.isValid ? (
                                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                        ✓ WhatsApp Valid
                                      </span>
                                    ) : (
                                      <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                                        ⚠️ {waVal.message}
                                      </span>
                                    )
                                  )}
                                </div>
                                <input
                                  type="tel"
                                  inputMode="tel"
                                  required
                                  value={formWa}
                                  onChange={(e) => {
                                    setFormWa(e.target.value);
                                    setFormWargaError('');
                                  }}
                                  placeholder="Contoh: 081234567890"
                                  className={`w-full h-11 px-4 rounded-2xl border text-xs font-bold transition-all focus:outline-none ${
                                    formWa.trim().length > 0 && duplicateWaMatch
                                      ? 'bg-rose-50/25 border-rose-400 focus:border-rose-500 text-rose-900 dark:text-rose-200'
                                      : formWa.trim().length > 0 && !waVal.isValid
                                      ? 'bg-rose-50/20 border-rose-400 focus:border-rose-500 text-[#1C221E] dark:text-white'
                                      : formWa.trim().length > 0 && waVal.isValid
                                      ? 'bg-emerald-50/15 border-emerald-400 focus:border-emerald-500 text-[#1C221E] dark:text-white'
                                      : 'bg-[#FBFBFA] dark:bg-stone-800/90 border-stone-200/90 dark:border-stone-700 text-[#1C221E] dark:text-white focus:border-[#0B484C] focus:bg-white'
                                  }`}
                                />
                              </div>

                              {/* FIELD 3: JENIS KELAMIN */}
                              <div>
                                <div className="flex items-center justify-between mb-1.5 h-4">
                                  <div className="flex items-center gap-1">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Jenis Kelamin (Kepala Keluarga) *
                                    </label>
                                    <div className="relative group/tip inline-flex">
                                      <span className="text-[10px] text-stone-400 font-bold cursor-help">(?)</span>
                                      <div className="pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 absolute left-0 bottom-[calc(100%+4px)] w-56 p-2 rounded-xl bg-[#092C2E] text-white border border-[#D9B352]/70 shadow-xl z-50 text-[10px] leading-relaxed">
                                        Pilih jenis kelamin Kepala Keluarga (Bapak/KK atau Ibu/KK).
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <CustomSelect
                                  buttonClassName="h-11 px-4 rounded-2xl font-bold bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs text-[#1C221E] dark:text-white"
                                  searchable={false}
                                  value={formGender}
                                  onChange={(val) => setFormGender(val as JenisKelamin)}
                                  options={[
                                    { value: 'Laki-laki', label: 'Laki-laki (Bapak / KK)' },
                                    { value: 'Perempuan', label: 'Perempuan (Ibu / KK)' },
                                  ]}
                                />
                              </div>
                              {(duplicateNamaMatch || duplicateWaMatch) && (
                                <div className="col-span-1 md:col-span-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200 animate-in fade-in">
                                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                                  <div className="space-y-1">
                                    {duplicateNamaMatch && (
                                      <p>
                                        <strong>Peringatan Nama Duplikat:</strong> Nama <u>&quot;{formNama.trim()}&quot;</u> terdeteksi sudah terdaftar di <strong>{duplicateNamaMatch.alamatRumah}</strong> (ID: {duplicateNamaMatch.id}). Satu nama kepala keluarga tidak dapat didaftarkan ganda.
                                      </p>
                                    )}
                                    {duplicateWaMatch && (
                                      <p>
                                        <strong>Peringatan WhatsApp Duplikat:</strong> Nomor WhatsApp <u>{formWa.trim()}</u> sudah terdaftar milik <strong>{duplicateWaMatch.namaLengkap}</strong> ({duplicateWaMatch.alamatRumah}). Nomor WhatsApp tidak boleh digunakan ganda.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* LANGKAH 2: ALAMAT RUMAH & HUNIAN */}
                          {formStep === 2 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-150">
                              {/* 4. Blok & No. Rumah (Sederhana & Jelas 2 Kolom) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block mb-1.5">
                                    Pilih Blok *
                                  </label>
                                  <CustomSelect
                                    buttonClassName="h-11 px-3.5 rounded-2xl font-bold bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs text-[#1C221E] dark:text-white"
                                    searchable={true}
                                    dropUp={true}
                                    placeholder="Pilih Blok..."
                                    value={formBlok}
                                    onChange={(val) => {
                                      setFormBlok(val);
                                      setFormWargaError('');
                                    }}
                                    options={allBlokAzOptions}
                                  />
                                </div>
                                <div>
                                  <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block mb-1.5">
                                    Nomor Rumah *
                                  </label>
                                  <input
                                    type="text"
                                    required
                                    value={formNoRumah || formNoBlok}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/\D/g, '');
                                      setFormNoRumah(val);
                                      setFormNoBlok(val);
                                      setFormWargaError('');
                                    }}
                                    placeholder="Contoh: 8, 12, 15, 21"
                                    className={`w-full h-11 px-3.5 rounded-2xl border text-xs font-bold transition-all focus:outline-none ${
                                      duplicateAddressMatch
                                        ? 'bg-rose-50/25 border-rose-400 focus:border-rose-500 text-rose-900 dark:text-rose-200'
                                        : 'bg-[#FBFBFA] dark:bg-stone-800/90 border-stone-200/90 dark:border-stone-700 text-[#1C221E] dark:text-white focus:border-[#0B484C] focus:bg-white'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* 5. Status Hunian */}
                              <div>
                                <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block mb-1.5">
                                  Status Hunian Rumah *
                                </label>
                                <CustomSelect
                                  buttonClassName="h-11 px-4 rounded-2xl font-bold bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs text-[#1C221E] dark:text-white"
                                  searchable={false}
                                  value={formDomisili}
                                  onChange={(val) => setFormDomisili(val as StatusTempatTinggal)}
                                  options={[
                                    { value: 'Menetap', label: 'Menetap (Tinggal Permanen)' },
                                    { value: 'Pulang-Pergi', label: 'Pulang-Pergi (Akhir Pekan)' },
                                    { value: 'Belum menetap', label: 'Belum Menetap (Renovasi)' },
                                  ]}
                                />
                              </div>

                              {/* 6. Jml Jiwa & Pekerjaan */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block mb-1.5">
                                    Jml Jiwa (KK) *
                                  </label>
                                  <div className="h-11 p-1 rounded-2xl bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => setFormJiwa(String(Math.max(1, (parseInt(formJiwa, 10) || 1) - 1)))}
                                      className="w-8 h-full rounded-xl bg-white dark:bg-stone-900 font-extrabold text-stone-700 dark:text-stone-200 hover:bg-stone-100 shadow-xs transition-colors"
                                    >
                                      -
                                    </button>
                                    <span className="font-extrabold text-[#1C221E] dark:text-white text-xs">
                                      {formJiwa || 1} Jiwa
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setFormJiwa(String(Math.min(15, (parseInt(formJiwa, 10) || 1) + 1)))}
                                      className="w-8 h-full rounded-xl bg-[#0B484C] text-[#F3D37A] font-extrabold hover:bg-[#08383B] shadow-xs transition-colors"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs block mb-1.5">
                                    Pekerjaan
                                  </label>
                                  <input
                                    type="text"
                                    value={formPekerjaan}
                                    onChange={(e) => setFormPekerjaan(e.target.value)}
                                    placeholder="Wiraswasta / Karyawan"
                                    className="w-full h-11 px-3.5 rounded-2xl bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs font-bold text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C] focus:bg-white transition-all"
                                  />
                                </div>
                              </div>
                              {/* 7. Anggota Keluarga Tambahan (Kolom O di Google Sheets) */}
                              <div className="col-span-1 md:col-span-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Anggota Keluarga Tambahan
                                    </label>
                                    <span className="text-[10px] text-stone-400 font-bold">
                                      {parseInt(formJiwa, 10) > 1
                                        ? `(${parseInt(formJiwa, 10) - 1} jiwa selain KK)`
                                        : '(Opsional)'}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-stone-400">
                                    Kolom O di Google Sheets
                                  </span>
                                </div>
                                <input
                                  type="text"
                                  value={formAnggota}
                                  onChange={(e) => setFormAnggota(e.target.value)}
                                  placeholder="Contoh: Ibu Atalia (Istri), 2 Anak Kandung, 1 Lansia (Ibu Mertua)"
                                  className="w-full h-11 px-4 rounded-2xl bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs font-bold text-[#1C221E] dark:text-white placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:border-[#0B484C] focus:bg-white transition-all"
                                />
                              </div>
                              {duplicateAddressMatch && (
                                <div className="col-span-1 md:col-span-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-200 animate-in fade-in">
                                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
                                  <div>
                                    <strong>Peringatan Alamat Rumah Duplikat:</strong> Rumah <u>Blok {fullBlokInput} No. {cleanNoRumahInput}</u> sudah terdaftar atas nama <strong>{duplicateAddressMatch.namaLengkap}</strong> ({duplicateAddressMatch.statusTempatTinggal}). Satu alamat rumah tidak bisa didaftarkan ganda.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* LANGKAH 3: KEAMANAN PASSWORD & PRATINJAU KARTU */}
                          {formStep === 3 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto w-full items-center animate-in fade-in duration-150">
                              {/* KOLOM KIRI: PASSWORD & KONFIRMASI */}
                              <div className="space-y-3">
                                <div>
                                  <div className="flex items-center justify-between mb-1 h-4">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Buat Password Rumah (Min. 8 Karakter) *
                                    </label>
                                    {formPin ? (
                                      <span className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                                        {strengthLabel}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-400">Besar, kecil, angka, simbol</span>
                                    )}
                                  </div>
                                  <div className="relative">
                                    <input
                                      type={showFormPin ? 'text' : 'password'}
                                      required
                                      value={formPin}
                                      onChange={(e) => {
                                        setFormPin(e.target.value);
                                        setFormWargaError('');
                                      }}
                                      placeholder="Ketik password baru (min. 8 karakter)..."
                                      className="w-full h-10 pl-3.5 pr-10 rounded-xl bg-[#FBFBFA] dark:bg-stone-800/90 border border-stone-200/90 dark:border-stone-700 text-xs font-bold text-[#1C221E] dark:text-white placeholder:font-normal placeholder:text-stone-400 focus:outline-none focus:border-[#0B484C] focus:bg-white transition-all"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowFormPin(!showFormPin)}
                                      className="w-7 h-7 rounded-lg flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                    >
                                      {showFormPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                    {[
                                      { key: 'min8', ok: pwCheck.hasMin8, label: '8+ Karakter' },
                                      { key: 'upper', ok: pwCheck.hasUpper, label: 'Huruf Besar' },
                                      { key: 'lower', ok: pwCheck.hasLower, label: 'Huruf Kecil' },
                                      { key: 'number', ok: pwCheck.hasNumber, label: 'Angka' },
                                      { key: 'special', ok: pwCheck.hasSpecial, label: 'Simbol (!@#$)' },
                                    ].map((item) => {
                                      const isFilled = formPin.length > 0;
                                      const badgeClass = !isFilled
                                        ? 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500'
                                        : item.ok
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold'
                                        : 'bg-stone-100 text-stone-400 dark:bg-stone-800 dark:text-stone-500';
                                      return (
                                        <span key={item.key} className={`text-[9px] px-1.5 py-0.5 rounded-md ${badgeClass}`}>
                                          {!isFilled ? '○' : item.ok ? '✓' : '○'} {item.label}
                                        </span>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between mb-1 h-4">
                                    <label className="font-extrabold text-stone-700 dark:text-stone-200 text-xs">
                                      Konfirmasi Password Rumah *
                                    </label>
                                    {pwMatches ? (
                                      <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
                                        ✓ Password Cocok
                                      </span>
                                    ) : pwMismatch ? (
                                      <span className="text-[10px] font-extrabold text-rose-500">
                                        ✕ Belum Cocok
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-400">Ulangi password</span>
                                    )}
                                  </div>
                                  <input
                                    type={showFormPin ? 'text' : 'password'}
                                    required
                                    value={formConfirmPin}
                                    onChange={(e) => {
                                      setFormConfirmPin(e.target.value);
                                      setFormWargaError('');
                                    }}
                                    placeholder="Ketik ulang password di atas..."
                                    className={`w-full h-10 px-3.5 rounded-xl bg-[#FBFBFA] dark:bg-stone-800/90 border text-xs font-bold text-[#1C221E] dark:text-white placeholder:font-normal placeholder:text-stone-400 focus:outline-none transition-all ${
                                      pwMismatch
                                        ? 'border-rose-400 focus:border-rose-500'
                                        : 'border-stone-200/90 dark:border-stone-700 focus:border-[#0B484C] focus:bg-white'
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* KOLOM KANAN: KARTU WARGA DIGITAL RINGKAS */}
                              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#FEF9EB] via-[#FDF5DC] to-[#F5E6BF] dark:from-[#0B383B]/80 dark:to-stone-900 border border-[#D9B352]/70 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-extrabold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 dark:bg-stone-900/60">
                                    Kartu Warga Digital
                                  </span>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${isPinValid ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80 text-stone-500'}`}>
                                    {isPinValid ? '🔒 Password Siap ✓' : 'Password Belum Lengkap'}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-extrabold text-[#1C221E] dark:text-white truncate">
                                    {formNama || 'Nama Kepala Keluarga'}
                                  </h4>
                                  <p className="text-xs text-[#0B484C] dark:text-[#F3D37A] font-extrabold">
                                    Blok {formNoBlok.trim() ? `${formBlok}${formNoBlok.trim()}` : formBlok} No. {formNoRumah || '..'}
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-[#D9B352]/30 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300">
                                  <span>Hunian: <strong>{formDomisili} ({formJiwa} Jiwa)</strong></span>
                                  <span>WA: <strong>{formWa || '-'}</strong></span>
                                </div>
                              </div>
                            </div>
                          )}
                        </form>

                        {/* ========================================================= */}
                        {/* BOTTOM SECTION: FOOTER NAVIGATION (FLEX-SHRINK-0)         */}
                        {/* ========================================================= */}
                        <div className="pt-3 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-3 flex-shrink-0">
                          {formStep === 1 && (
                            <>
                              <span className="text-xs">
                                {duplicateNamaMatch || duplicateWaMatch ? (
                                  <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Data duplikat terdeteksi (Nama atau WA sudah terdaftar). Ganti data sebelum lanjut.</span>
                                  </span>
                                ) : isStep1Valid ? (
                                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                                    ✓ Identitas sah &amp; belum terdaftar. Klik Lanjut untuk mengisi alamat rumah.
                                  </span>
                                ) : (
                                  <span className="text-stone-400">
                                    Isi nama kepala keluarga &amp; nomor WhatsApp diawali 08xx untuk lanjut.
                                  </span>
                                )}
                              </span>
                              <button
                                type="button"
                                disabled={!isStep1Valid}
                                onClick={() => setFormStep(2)}
                                className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
                                  isStep1Valid
                                    ? 'carlic-sage-btn text-[#F3D37A]'
                                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <span>Lanjut ke Alamat Rumah</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {formStep === 2 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setFormStep(1)}
                                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold text-xs text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Kembali ke Identitas</span>
                              </button>
                              <div className="flex items-center gap-3">
                                {duplicateAddressMatch && (
                                  <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Alamat sudah terdaftar a.n. {duplicateAddressMatch.namaLengkap}</span>
                                  </span>
                                )}
                                <button
                                  type="button"
                                  disabled={!isStep2Valid}
                                  onClick={() => setFormStep(3)}
                                  className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all ${
                                    isStep2Valid
                                      ? 'carlic-sage-btn text-[#F3D37A]'
                                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                                  }`}
                                >
                                  <span>Lanjut ke Password &amp; Simpan</span>
                                  <ArrowRight className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}

                          {formStep === 3 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setFormStep(2)}
                                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold text-xs text-stone-600 dark:text-stone-300 transition-colors flex items-center gap-1.5"
                              >
                                <ChevronLeft className="w-4 h-4" />
                                <span>Kembali ke Alamat</span>
                              </button>
                              <button
                                type="submit"
                                form="form-warga-baru"
                                disabled={!isWargaFormValid}
                                className={`font-extrabold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 text-xs whitespace-nowrap transition-all ${
                                  isWargaFormValid
                                    ? 'carlic-sage-btn text-[#F3D37A]'
                                    : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <UserPlus className="w-4 h-4" />
                                <span>Simpan Pendaftaran Warga</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}

            {/* ============================================================= */}
            {/* MENU 5: JADWAL SISKAMLING MALAM                               */}
            {/* ============================================================= */}
            {currentTab === 'ronda' && (() => {
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
                          {visibleSchedules.map((r, idx) => {
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
                          /* TAMPILAN DINAMIS PETUGAS REGU (MENDUKUNG 6 PETUGAS MAUPUN LEBIH DARI 6 PETUGAS: 7, 8, 9, 12+ PETUGAS) */
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
            })()}

            {/* ============================================================= */}
            {/* MENU 6: PENGUMUMAN & KEGIATAN RT                              */}
            {/* ============================================================= */}
            {currentTab === 'pengumuman' && (() => {
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
                            {/* Smooth gradient fading into card body */}
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

                              {/* Description (2 lines, clean line-height) */}
                              <p className="text-xs text-stone-200/90 leading-relaxed line-clamp-2 font-medium">
                                {p.deskripsi.replace(/[┏┗━🛰️👨‍✈️📺📰]/g, '').trim()}
                              </p>

                              {/* 3 Pill Tags Row (Exact match of Image #1) */}
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

                            {/* Full-Width White Pill Button CTA (Matching Image #1 "Book now") */}
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
            })()}
          </div>
        </div>
      </div>


      {/* MODAL POPUP DETAIL PENGUMUMAN / JARKOMAN RESMI PAGUYUBAN */}
      {detailPengumuman && (() => {
        const urlMatch = detailPengumuman.deskripsi.match(/https?:\/\/[^\s\]*)]+/i);
        const externalUrl = urlMatch ? urlMatch[0] : null;
        const isPjuAnn = detailPengumuman.id === 'PGM-PJU-01';
        return (
          <div
            onClick={() => setDetailPengumuman(null)}
            className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="carlic-card max-w-2xl sm:max-w-3xl w-full p-4 sm:p-6 relative my-auto shadow-2xl rounded-[28px] flex flex-col gap-3.5 text-left bg-[#FBFBFA] dark:bg-[#072426] border border-stone-200/80 dark:border-[#D9B352]/30"
            >
              <button
                type="button"
                onClick={() => setDetailPengumuman(null)}
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
                        setDetailPengumuman(null);
                        setUrunanMode('form');
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
                    onClick={() => setDetailPengumuman(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#0B484C] text-[#F3D37A] font-bold text-xs hover:opacity-90 transition-opacity shadow-2xs"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* MODAL DETAIL & EDIT KHUSUS DATA WARGA MILIK SENDIRI (KECUALI STATUS IURAN IPL) */}
      {detailWarga && (() => {
        const isOwned = isDetailModalUnlocked;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <div className="carlic-card max-w-md w-full p-6 relative">
              {!isSyncingEdit && (
                <button
                  type="button"
                  onClick={() => setDetailWarga(null)}
                  className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center absolute top-5 right-5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-3.5 mb-4 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-[#0B484C] text-[#F3D37A] ring-2 ring-[#D9B352]/50 font-extrabold text-base flex items-center justify-center flex-shrink-0">
                  {detailWarga.blok}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#1C221E] dark:text-white truncate">
                      {detailWarga.namaLengkap}
                    </h3>
                    {isOwned && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018] border border-[#D9B352]/50 whitespace-nowrap">
                        Data Anda
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-400">{detailWarga.alamatRumah}</p>
                </div>
              </div>

              {editSyncDone && (
                <div className="mb-4 p-3 rounded-2xl bg-[#0B484C]/10 text-[#0B484C] dark:text-[#F3D37A] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Perubahan berhasil disimpan &amp; disinkronkan ke Google Sheets!</span>
                </div>
              )}

              {isOwned && isEditingOwned ? (
                /* FORM EDIT KHUSUS DATA MILIK SENDIRI (NAMA, BLOK/NO, STATUS HUNIAN, JUMLAH JIWA — STATUS IURAN IPL TERKUNCI) */
                <form onSubmit={handleSaveOwnedEdit} className="space-y-3 text-xs">
                  {isSyncingEdit ? (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#0B484C] text-[#F3D37A] flex items-center justify-center mx-auto">
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[#1C221E] dark:text-white">
                        Menyinkronkan ke Google Sheets...
                      </h4>
                      <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                        Mohon tunggu sampai proses update selesai. Jangan menutup atau meninggalkan halaman ini.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* AI SMART FILL (ISI CEPAT DENGAN KALIMAT BEBAS) */}
                      <div className="p-2.5 rounded-xl bg-[#FEF9EB] dark:bg-[#0B383B]/60 border border-[#D9B352]/50 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold text-[#0B484C] dark:text-[#F3D37A] flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" /> Asisten AI Isi Cepat &amp; Auto-Log
                          </span>
                          <span className="text-[9px] text-stone-400">Ketik bebas lalu klik Terapkan</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={aiQuickInput}
                            onChange={(e) => setAiQuickInput(e.target.value)}
                            placeholder="Cth: Ganti nama jadi Budi Santoso menetap 4 jiwa"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-stone-900 text-[11px] font-medium text-[#1C221E] dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              if (!aiQuickInput.trim()) return;
                              const parsed = await parseNaturalWargaInput(aiQuickInput, {
                                namaLengkap: editNama,
                                blok: editBlok,
                                noRumah: editNoRumah,
                                statusTempatTinggal: editDomisili,
                                jmlJiwa: editJiwa,
                              });
                              setEditNama(parsed.namaLengkap);
                              setEditBlok(parsed.blok);
                              setEditNoRumah(parsed.noRumah);
                              setEditDomisili(parsed.statusTempatTinggal);
                              setEditJiwa(parsed.jmlJiwa);
                              setAiQuickInput('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0B484C] text-[#F3D37A] font-bold text-[10px] whitespace-nowrap"
                          >
                            ✨ Terapkan
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1">
                          Nama Kepala Keluarga / Warga
                        </label>
                        <input
                          type="text"
                          required
                          value={editNama}
                          onChange={(e) => setEditNama(e.target.value)}
                          placeholder="Masukkan nama lengkap"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 text-[#1C221E] dark:text-white font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <CustomSelect
                          label="Blok (A–Z)"
                          searchable={true}
                          value={editBlok}
                          onChange={setEditBlok}
                          options={'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
                            value: letter,
                            label: `Blok ${letter}`,
                            description: `Wilayah Blok ${letter}`,
                          }))}
                        />
                        <div>
                          <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1 text-[11px]">
                            No. Blok
                          </label>
                          <input
                            type="text"
                            value={editNoBlok}
                            onChange={(e) => setEditNoBlok(e.target.value.replace(/\D/g, ''))}
                            placeholder="Cth: 8"
                            className="w-full h-9 px-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 text-[#1C221E] dark:text-white font-semibold focus:outline-none border border-stone-200/80 dark:border-stone-700"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1 text-[11px]">
                            No. Rumah *
                          </label>
                          <input
                            type="text"
                            required
                            value={editNoRumah}
                            onChange={(e) => setEditNoRumah(e.target.value.replace(/\D/g, ''))}
                            placeholder="Cth: 11"
                            className="w-full h-9 px-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 text-[#1C221E] dark:text-white font-semibold focus:outline-none border border-stone-200/80 dark:border-stone-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <CustomSelect
                          label="Status Hunian"
                          searchable={false}
                          value={editDomisili}
                          onChange={(val) => setEditDomisili(val as StatusTempatTinggal)}
                          options={[
                            { value: 'Menetap', label: 'Menetap' },
                            { value: 'Pulang-Pergi', label: 'Pulang-Pergi' },
                            { value: 'Belum menetap', label: 'Belum menetap' },
                          ]}
                        />
                        <div>
                          <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1 text-[11px]">
                            Jumlah Anggota Keluarga (Jiwa)
                          </label>
                          <input
                            type="number"
                            min={1}
                            required
                            value={editJiwa}
                            onChange={(e) => setEditJiwa(e.target.value)}
                            className="w-full h-9 px-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-[#1C221E] dark:text-white font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                        <div className="col-span-2">
                          <label className="font-bold text-stone-600 dark:text-stone-300 block mb-1 text-[11px]">
                            Anggota Keluarga Tambahan (Istri, Anak, dll.)
                          </label>
                          <input
                            type="text"
                            value={editAnggota}
                            onChange={(e) => setEditAnggota(e.target.value)}
                            placeholder="Contoh: Ibu Atalia (Istri), 2 Anak"
                            className="w-full h-9 px-3 rounded-xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 dark:border-stone-700 text-xs font-semibold text-[#1C221E] dark:text-white focus:outline-none"
                          />
                        </div>

                      <div className="grid grid-cols-2 gap-2.5 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsEditingOwned(false)}
                          className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold text-stone-700 dark:text-stone-300"
                        >
                          Batal
                        </button>
                        {(() => {
                          const isEditValid = Boolean(
                            editNama.trim().length >= 2 &&
                              editBlok.trim().length >= 1 &&
                              editNoRumah.trim().length >= 1 &&
                              (parseInt(editJiwa, 10) || 0) >= 1
                          );
                          return (
                            <button
                              type="submit"
                              disabled={!isEditValid}
                              className={`font-bold py-2.5 rounded-xl transition-all ${
                                isEditValid
                                  ? 'carlic-sage-btn text-[#F3D37A]'
                                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60'
                              }`}
                            >
                              Simpan &amp; Sync Sheets
                            </button>
                          );
                        })()}
                      </div>
                    </>
                  )}
                </form>
              ) : (
                /* TAMPILAN DETAIL (DENGAN TOMBOL EDIT HANYA JIKA DATA MILIK SENDIRI) */
                <div>
                  {isOwned ? (
                    <>
                      <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800">
                          <span className="text-stone-400 block text-[10px]">Status Hunian</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {detailWarga.statusTempatTinggal}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800">
                          <span className="text-stone-400 block text-[10px]">Jumlah Anggota Keluarga</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {detailWarga.jmlJiwa} Jiwa
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800">
                          <span className="text-stone-400 block text-[10px]">Nomor WhatsApp</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {detailWarga.noWhatsapp || '-'}
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800">
                          <span className="text-stone-400 block text-[10px]">Pekerjaan</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {detailWarga.pekerjaan || '-'}
                          </span>
                        </div>
                      </div>
                        <div className="p-3 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 col-span-2">
                          <span className="text-stone-400 block text-[10px]">Anggota Keluarga Tambahan (Kolom O di Google Sheets)</span>
                          <span className="font-extrabold text-[#1C221E] dark:text-white">
                            {detailWarga.anggotaKeluargaTambahan && detailWarga.anggotaKeluargaTambahan !== '-'
                              ? detailWarga.anggotaKeluargaTambahan
                              : 'Tinggal sendiri / Tidak ada anggota tambahan (-) '}
                          </span>
                        </div>

                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setDetailWarga(null)}
                          className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold text-stone-700 dark:text-stone-300"
                        >
                          Tutup
                        </button>
                        {onDeleteWarga && (
                          <button
                            type="button"
                            onClick={() => {
                              const target = detailWarga;
                              const key = target.id || target.alamatRumah;
                              setUserConfirmModal({
                                kind: 'delete',
                                title: 'Hapus Data Warga?',
                                subtitle: 'Data keluarga ini akan dihapus dari sistem & Google Sheets:',
                                itemName: `${target.namaLengkap} (${target.alamatRumah})`,
                                detailText: `Status Hunian: ${target.statusTempatTinggal} • ${target.jmlJiwa} Jiwa`,
                                confirmLabel: 'Ya, Hapus',
                                onConfirm: async () => {
                                  await onDeleteWarga(key);
                                  setDetailWarga(null);
                                },
                              });
                            }}
                            className="py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-extrabold flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus Data</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditSyncDone(false);
                            setIsEditingOwned(true);
                          }}
                          className="carlic-sage-btn text-[#F3D37A] font-bold py-2.5 rounded-xl flex items-center justify-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Data</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 space-y-2.5 border border-stone-200/80 dark:border-stone-700">
                          <div className="flex items-center gap-2 mb-0.5">
                            <div className="w-6 h-6 rounded-lg bg-[#0B484C] text-[#F3D37A] flex items-center justify-center flex-shrink-0">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-extrabold text-[#1C221E] dark:text-white">
                                Verifikasi Pemilik Data Rumah (2 Kunci)
                              </h4>
                              <p className="text-[10px] text-stone-400">
                                Masukkan Password Rumah &amp; 4 angka akhir No. Telepon Anda:
                              </p>
                            </div>
                          </div>
                          {/* BANNER LOCKOUT 5 MENIT JIKA 5X SALAH INPUT */}
                          {activeLockoutSecs > 0 && (
                            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-[11px] font-bold text-amber-800 dark:text-amber-200 flex items-start gap-2">
                              <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                              <div>
                                <p className="font-extrabold">Akses Dibekukan Sementara (5x Salah Input)</p>
                                <p className="text-[10px] font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                                  Form dikunci selama 5 menit demi keamanan. Tunggu{' '}
                                  <strong>
                                    {Math.floor(activeLockoutSecs / 60)}:
                                    {String(activeLockoutSecs % 60).padStart(2, '0')}
                                  </strong>{' '}
                                  untuk mencoba kembali.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* KUNCI 1: PASSWORD RUMAH */}
                          <div>
                            <label className="block text-[10px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                              1. Password Rumah *
                            </label>
                            <div className="relative">
                              <input
                                type={showDetailPassword ? 'text' : 'password'}
                                name="warga_resident_verify_house_pin_prevent_autofill"
                                autoComplete="new-password"
                                data-lpignore="true"
                                data-form-type="other"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                                disabled={activeLockoutSecs > 0}
                                value={verifyDetailPassword}
                                onChange={(e) => {
                                  setVerifyDetailPassword(e.target.value);
                                  setVerifyWaError('');
                                }}
                                placeholder={activeLockoutSecs > 0 ? 'Akses dibekukan...' : 'Ketik password rumah...'}
                                className={`w-full px-9 py-2 rounded-xl border text-xs font-extrabold text-center tracking-wider text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C] ${
                                  activeLockoutSecs > 0
                                    ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 opacity-60 cursor-not-allowed'
                                    : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'
                                }`}
                              />
                              <button
                                type="button"
                                disabled={activeLockoutSecs > 0}
                                onClick={() => setShowDetailPassword(!showDetailPassword)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 disabled:opacity-40"
                              >
                                {showDetailPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* KUNCI 2: 4 DIGIT AKHIR NO TELEPON */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[10px] font-bold text-stone-600 dark:text-stone-300">
                                2. 4 Digit Akhir No. Telepon (WA) *
                              </label>
                              <span className="text-[9px] text-stone-400">Cth: 7890</span>
                            </div>
                            <input
                              type="password"
                              name="warga_resident_verify_wa_4_prevent_autofill"
                              autoComplete="new-password"
                              data-lpignore="true"
                              data-form-type="other"
                              autoCorrect="off"
                              autoCapitalize="off"
                              spellCheck={false}
                              inputMode="numeric"
                              maxLength={4}
                              disabled={activeLockoutSecs > 0}
                              value={verifyDetailWa4}
                              onChange={(e) => {
                                setVerifyDetailWa4(e.target.value.replace(/\D/g, '').slice(0, 4));
                                setVerifyWaError('');
                              }}
                              placeholder="••••"
                              className={`w-full px-3 py-2 rounded-xl border text-xs font-extrabold text-center tracking-[0.35em] text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C] ${
                                activeLockoutSecs > 0
                                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 opacity-60 cursor-not-allowed'
                                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'
                              }`}
                            />
                          </div>

                          {/* LINK BANTUAN LUPA */}
                          <div className="flex items-center justify-between text-[10px] pt-1">
                            <span className="text-stone-400">Lupa password/nomor?</span>
                            <a
                              href={`https://api.whatsapp.com/send?phone=6281240010437&text=${encodeURIComponent(
                                `Halo Admin Paguyuban PK8, saya ${detailWarga.namaLengkap} (${detailWarga.alamatRumah}) ingin verifikasi akses data rumah saya namun lupa password atau nomor terdaftar. Mohon bantuannya. Terima kasih.`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] underline flex items-center gap-1 hover:text-[#9A7018]"
                            >
                              <span>Bantuan Admin WA</span>
                              <ArrowRight className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          {verifyWaError && (
                            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600">
                              ⚠️ {verifyWaError}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setDetailWarga(null);
                                setIsDetailModalUnlocked(false);
                                setVerifyDetailPassword('');
                                setVerifyDetailWa4('');
                                setVerifyWaError('');
                              }}
                              className="py-2 rounded-xl bg-stone-200/70 dark:bg-stone-700 font-bold text-stone-700 dark:text-stone-200 text-[11px]"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={activeLockoutSecs > 0}
                              onClick={async () => {
                                if (activeLockoutSecs > 0) return;
                                const res = await verifyHouseTwoFactor(detailWarga, verifyDetailPassword, verifyDetailWa4);
                                if (res.isValid) {
                                  setIsDetailModalUnlocked(true);
                                  onClaimWargaOwnership?.(detailWarga);
                                  setVerifyDetailPassword('');
                                  setVerifyDetailWa4('');
                                  setVerifyWaError('');
                                  setActiveLockoutSecs(0);
                                } else {
                                  setVerifyWaError(res.errorMsg || 'Verifikasi gagal.');
                                  if (res.isLocked && res.remainingSeconds) {
                                    setActiveLockoutSecs(res.remainingSeconds);
                                  }
                                }
                              }}
                              className={`font-bold py-2 rounded-xl text-[11px] transition-all ${
                                activeLockoutSecs > 0
                                  ? 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed opacity-60'
                                  : 'carlic-sage-btn text-[#F3D37A]'
                              }`}
                            >
                              {activeLockoutSecs > 0 ? 'Terkunci Sementara' : 'Buka Data Rumah'}
                            </button>
                          </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* MODAL KONFIRMASI INPUT DATA (WAJIB TUNGGU GOOGLE SHEETS SYNC SEBELUM KELUAR) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="carlic-card max-w-md w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150">
            {confirmDialog.step !== 'syncing' && (
              <button
                type="button"
                onClick={() => {
                  const wasDone = confirmDialog.step === 'done';
                  setConfirmDialog(null);
                  if (wasDone) {
                    setIplMode('daftar');
                    setUrunanMode('daftar');
                    setWargaMode('direktori');
                    setIsWargaLockedInForm(false);
                  }
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center absolute top-5 right-5"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {confirmDialog.step === 'review' ? (
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C221E] dark:text-white mb-1">
                  {confirmDialog.type === 'warga'
                    ? 'Konfirmasi Data Warga Baru'
                    : confirmDialog.type === 'pju'
                    ? 'Konfirmasi Pembayaran Urunan PJU'
                    : 'Konfirmasi Pembayaran IPL'}
                </h3>
                <p className="text-xs text-stone-400 mb-4">
                  Periksa rincian data sebelum disimpan:
                </p>
                {confirmDialog.type === 'warga' ? (
                  <div className="p-4 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 space-y-2.5 text-xs mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Nama Kepala Keluarga</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.namaLengkap}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Alamat Rumah</span>
                      <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                        Blok {confirmDialog.blok} No. {confirmDialog.noRumah}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">No. WhatsApp</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.noWhatsapp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Status Hunian</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.statusTempatTinggal}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Jumlah Anggota KK</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.jmlJiwa} Jiwa
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Anggota Tambahan (Kolom O)</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white truncate max-w-[200px]">
                        {confirmDialog.anggotaKeluargaTambahan || '-'}
                      </span>
                    </div>
                  </div>
                ) : confirmDialog.type === 'pju' ? (
                  <div className="p-4 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 space-y-2.5 text-xs mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Nama Penyetor / Donatur</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.namaPenyetor}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Kategori Urunan PJU</span>
                      <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                        {confirmDialog.tipe === 'DONATUR' ? '🟡 ★ Donatur Sukarela' : '🔵 Urunan Wajib KK'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Nominal Setoran</span>
                      <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                        Rp {confirmDialog.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Metode Penyetoran</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.metode === 'Cash' ? 'Cash Tunai' : 'Transfer Bank Mandiri'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 space-y-2.5 text-xs mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Nama Warga / KK</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.namaWarga}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Blok &amp; No. Rumah</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.lokasiRumah}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Durasi Paket IPL</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.durasiPaket}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Total Nominal IPL</span>
                      <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A]">
                        Rp {confirmDialog.nominal.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Metode Pembayaran</span>
                      <span className="font-extrabold text-[#1C221E] dark:text-white">
                        {confirmDialog.metode}
                      </span>
                    </div>
                    {confirmDialog.buktiUrl && (
                      <div className="pt-2 border-t border-stone-200/70 dark:border-stone-700 flex items-center justify-between gap-3">
                        <span className="text-stone-400">Bukti Bayar (Gambar/PDF)</span>
                        <div className="flex items-center gap-2">
                          {confirmDialog.buktiUrl.startsWith('data:application/pdf') ? (
                            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center flex-shrink-0">
                              PDF
                            </div>
                          ) : (
                            <img
                              src={confirmDialog.buktiUrl}
                              alt="Bukti Transfer"
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-[#D9B352]"
                            />
                          )}
                          <span className="font-bold text-[#0B484C] dark:text-[#F3D37A] truncate max-w-[140px]">
                            {confirmDialog.buktiFileName}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setConfirmDialog(null)}
                    className="py-3 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-bold text-stone-700 dark:text-stone-300"
                  >
                    Periksa Lagi
                  </button>
                  <button
                    type="button"
                    onClick={
                      confirmDialog.type === 'warga'
                        ? handleConfirmSaveWarga
                        : confirmDialog.type === 'pju'
                        ? handleConfirmSavePju
                        : handleConfirmSaveIpl
                    }
                    className="carlic-sage-btn py-3 rounded-xl text-[#F3D37A] font-bold"
                  >
                    Ya, Simpan Data
                  </button>
                </div>
              </div>
            ) : confirmDialog.step === 'syncing' ? (
              /* STEP 2: WAJIB TUNGGU PROSES UPDATE GOOGLE SHEETS SELESAI */
              <div className="py-6 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#0B484C] text-[#F3D37A] ring-2 ring-[#D9B352]/50 flex items-center justify-center mx-auto">
                  <RefreshCw className="w-7 h-7 animate-spin" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white">
                  Menyimpan ke Google Sheets...
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-300">
                  Mohon tunggu sebentar...
                </p>
              </div>
            ) : (
              /* STEP 3: BERHASIL TERSIMPAN DI GOOGLE SHEETS */
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#0B484C] text-[#F3D37A] ring-2 ring-[#D9B352]/50 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1C221E] dark:text-white mb-1">
                  {confirmDialog.type === 'warga'
                    ? 'Berhasil Diupdate ke Google Sheets!'
                    : confirmDialog.type === 'pju'
                    ? 'Setoran Urunan PJU Berhasil Dicatat!'
                    : 'Konfirmasi IPL Berhasil Dikirim!'}
                </h3>
                <p className="text-xs text-stone-400 mb-5">
                  Data berhasil disimpan dan disinkronkan ke Google Sheets.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog(null);
                      setIplMode('daftar');
                      setUrunanMode('daftar');
                      setWargaMode('direktori');
                      setIsWargaLockedInForm(false);
                    }}
                    className="py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 font-extrabold text-stone-700 dark:text-stone-200"
                  >
                    {confirmDialog.type === 'warga'
                      ? 'Lihat Direktori Warga'
                      : confirmDialog.type === 'pju'
                      ? 'Lihat Daftar Urunan PJU'
                      : 'Lihat Daftar Status IPL'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDialog(null);
                      setIplMode('daftar');
                      setUrunanMode('daftar');
                      setWargaMode('direktori');
                      setIsWargaLockedInForm(false);
                      onSelectTab('beranda');
                    }}
                    className="carlic-sage-btn py-3 px-4 rounded-xl text-[#F3D37A] font-extrabold"
                  >
                    ← Kembali ke Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL KEAMANAN VERIFIKASI PEMILIK RUMAH UNTUK UBAH / HAPUS IPL      */}
      {/* =================================================================== */}
      {iplSecurityGate && (
        <div
          onClick={() => setIplSecurityGate(null)}
          className="fixed inset-0 z-[65] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="carlic-card max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 border-2 border-[#D9B352]/55"
          >
            <button
              type="button"
              onClick={() => setIplSecurityGate(null)}
              className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center absolute top-4 right-4"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0B484C] text-[#F3D37A] flex items-center justify-center flex-shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FEF6DF] text-[#9A7018]">
                  Verifikasi Pemilik
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-[#1C221E] dark:text-white mt-0.5">
                  🔒 {iplSecurityGate.warga.namaLengkap} ({iplSecurityGate.warga.alamatRumah})
                </h3>
              </div>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-300 mb-2.5">
              Masukkan <strong>Password Rumah</strong> dan <strong>4 Digit Terakhir Nomor WhatsApp</strong> terdaftar:
            </p>
            {/* BANNER LOCKOUT 5 MENIT JIKA 5X SALAH INPUT */}
            {activeLockoutSecs > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-800 dark:text-amber-200 flex items-start gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-extrabold">Akses Dibekukan Sementara (5x Salah Input)</p>
                  <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 mt-0.5">
                    Form dikunci selama 5 menit demi keamanan. Tunggu{' '}
                    <strong>
                      {Math.floor(activeLockoutSecs / 60)}:
                      {String(activeLockoutSecs % 60).padStart(2, '0')}
                    </strong>{' '}
                    untuk mencoba kembali.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2.5 mb-2.5">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 dark:text-stone-300 mb-1">
                  1. Password Rumah *
                </label>
                <div className="relative">
                  <input
                    type={showIplGatePassword ? 'text' : 'password'}
                    name="warga_resident_gate_pin_prevent_autofill"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    disabled={activeLockoutSecs > 0}
                    value={iplGatePassword}
                    onChange={(e) => {
                      setIplGatePassword(e.target.value);
                      setIplGateError('');
                    }}
                    placeholder={activeLockoutSecs > 0 ? 'Akses dibekukan...' : 'Ketik password rumah...'}
                    className={`w-full h-10 px-10 rounded-xl border text-xs font-extrabold text-center tracking-wider text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C] ${
                      activeLockoutSecs > 0
                        ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 opacity-60 cursor-not-allowed'
                        : 'bg-[#F8F8F6] dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                    }`}
                  />
                  <button
                    type="button"
                    disabled={activeLockoutSecs > 0}
                    onClick={() => setShowIplGatePassword(!showIplGatePassword)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center absolute right-1.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 disabled:opacity-40"
                  >
                    {showIplGatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    2. 4 Digit Terakhir Nomor WhatsApp *
                  </label>
                  <span className="text-[10px] text-stone-400">Cth: 1111</span>
                </div>
                <input
                  type="password"
                  name="warga_resident_gate_wa4_prevent_autofill"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  inputMode="numeric"
                  maxLength={4}
                  disabled={activeLockoutSecs > 0}
                  value={iplGateWa4}
                  onChange={(e) => {
                    setIplGateWa4(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setIplGateError('');
                  }}
                  placeholder="••••"
                  className={`w-full h-10 px-3.5 rounded-xl border text-sm font-extrabold text-center tracking-[0.35em] text-[#1C221E] dark:text-white focus:outline-none focus:border-[#0B484C] ${
                    activeLockoutSecs > 0
                      ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 opacity-60 cursor-not-allowed'
                      : 'bg-[#F8F8F6] dark:bg-stone-800 border-stone-200 dark:border-stone-700'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] mb-2.5 px-1">
              <span className="text-stone-400">Lupa password?</span>
              <a
                href={`https://api.whatsapp.com/send?phone=6281240010437&text=${encodeURIComponent(
                  `Halo Admin Paguyuban PK8, saya ${iplSecurityGate.warga.namaLengkap} (${iplSecurityGate.warga.alamatRumah}) lupa password rahasia rumah saya. Mohon bantuan untuk cek atau reset password. Terima kasih.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] underline flex items-center gap-1 hover:text-[#9A7018]"
              >
                <span>Hubungi Admin WA</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
            {iplGateError && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-[11px] font-bold text-rose-600 mb-2.5">
                ⚠️ {iplGateError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 text-xs pt-1">
              <button
                type="button"
                onClick={() => setIplSecurityGate(null)}
                className="py-2.5 rounded-xl bg-stone-100 font-bold text-stone-700"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={activeLockoutSecs > 0}
                onClick={async () => {
                  if (activeLockoutSecs > 0) return;
                  const targetW = iplSecurityGate.warga;
                  const check = await verifyHouseTwoFactor(targetW, iplGatePassword, iplGateWa4);
                  if (!check.isValid) {
                    setIplGateError(check.errorMsg || 'Password atau 4 digit WA salah.');
                    if (check.isLocked && check.remainingSeconds) {
                      setActiveLockoutSecs(check.remainingSeconds);
                    }
                    return;
                  }
                  setActiveLockoutSecs(0);
                  const action = iplSecurityGate.intendedAction;
                  const pjuTarget = iplSecurityGate.pjuItem;
                  setIplSecurityGate(null);
                  if (action === 'edit_ipl') {
                    setBayarNama(targetW.namaLengkap);
                    setBayarLokasi(targetW.alamatRumah);
                    setBayarError('');
                    setIsWargaLockedInForm(true);
                    setIplMode('form');
                  } else if (action === 'cancel_ipl' && onCancelPendingIpl) {
                    const accInfo = getWargaIplAccumulated(targetW);
                    setUserConfirmModal({
                      kind: 'delete',
                      title: 'Hapus Pengajuan IPL?',
                      subtitle: 'Pengajuan IPL yang sedang menunggu verifikasi ini akan dihapus:',
                      itemName: `${targetW.namaLengkap} (${targetW.alamatRumah})`,
                      detailText: `Paket: ${accInfo.paketLabel} • Nominal: Rp ${accInfo.nominalTotal.toLocaleString('id-ID')}`,
                      confirmLabel: 'Ya, Hapus',
                      onConfirm: () => onCancelPendingIpl(targetW.namaLengkap, targetW.alamatRumah),
                    });
                  } else if (action === 'edit_pju' && pjuTarget) {
                    setEditingPjuId(pjuTarget.id);
                    setPjuNama(targetW.namaLengkap);
                    setPjuLokasi(targetW.alamatRumah);
                    setPjuTipe(pjuTarget.tipe);
                    setPjuNominal(String(pjuTarget.nominal));
                    setPjuError('');
                    setIsWargaLockedInForm(true);
                    setUrunanMode('form');
                    setUserConfirmModal({
                      kind: 'delete',
                      title: 'Hapus Setoran PJU?',
                      subtitle: 'Setoran PJU yang sedang menunggu verifikasi ini akan dihapus:',
                      itemName: pjuTarget.namaWarga,
                      detailText: `${pjuTarget.tipe === 'DONATUR' ? '🟡 ★ Donatur PJU' : '🔵 Urunan Wajib'} • Rp ${pjuTarget.nominal.toLocaleString('id-ID')}`,
                      confirmLabel: 'Ya, Hapus',
                      onConfirm: () => {
                        if (onDeleteUrunan) onDeleteUrunan(pjuTarget.id);
                      },
                    });
                  } else if (action === 'kwitansi_ipl') {
                    handleOpenKwitansiIpl(targetW);
                  } else if (action === 'kwitansi_pju' && pjuTarget) {
                    handleOpenKwitansiPju(
                      {
                        namaWarga: targetW.namaLengkap,
                        totalNominal: pjuTarget.nominal,
                        wajibNominal: 115000,
                        donaturNominal: Math.max(0, pjuTarget.nominal - 115000),
                        hasWajib: true,
                        hasDonatur: pjuTarget.nominal > 115000,
                      },
                      targetW
                    );
                  }
                }}
                className="carlic-sage-btn text-[#F3D37A] font-extrabold py-2.5 rounded-xl"
              >
                Verifikasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL POPUP KONFIRMASI HAPUS / BATALKAN DATA MILIK SENDIRI          */}
      {/* =================================================================== */}
      {userConfirmModal && (
        <div
          onClick={() => {
            if (userConfirmStep !== 'syncing') {
              setUserConfirmModal(null);
              setUserConfirmStep('review');
            }
          }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="carlic-card max-w-md w-full p-6 relative animate-in fade-in zoom-in-95 duration-150 border-2 border-[#D9B352]/55 shadow-2xl"
          >
            {userConfirmStep !== 'syncing' && (
              <button
                type="button"
                onClick={() => {
                  setUserConfirmModal(null);
                  setUserConfirmStep('review');
                }}
                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {userConfirmStep === 'review' ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 border border-rose-200 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                      Konfirmasi Penghapusan Data Anda
                    </span>
                    <h3 className="text-base font-extrabold text-[#1C221E] dark:text-white mt-0.5">
                      {userConfirmModal.title}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-300 mb-3 leading-relaxed">
                  {userConfirmModal.subtitle}
                </p>
                <div className="p-3.5 rounded-2xl bg-[#F8F8F6] dark:bg-stone-800 border border-stone-200/80 mb-5 text-xs">
                  <p className="font-extrabold text-[#1C221E] dark:text-white">
                    {userConfirmModal.itemName}
                  </p>
                  <p className="text-[11px] text-stone-500 mt-1">{userConfirmModal.detailText}</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setUserConfirmModal(null);
                      setUserConfirmStep('review');
                    }}
                    className="py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 font-extrabold text-stone-700"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      setUserConfirmStep('syncing');
                      try {
                        await userConfirmModal.onConfirm();
                        setUserConfirmStep('done');
                      } catch (err) {
                        setUserConfirmStep('review');
                        console.error(err);
                      }
                    }}
                    className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold shadow-sm"
                  >
                    {userConfirmModal.confirmLabel}
                  </button>
                </div>
              </>
            ) : userConfirmStep === 'syncing' ? (
              /* TAMPILAN LOADING PENUH SAMA SEPERTI ISI DATA */
              <div className="py-6 text-center space-y-3 animate-in fade-in">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto shadow-md ${
                    userConfirmModal.kind === 'delete'
                      ? 'bg-rose-600 text-white ring-4 ring-rose-200 dark:ring-rose-900/50'
                      : 'bg-[#0B484C] text-[#F3D37A] ring-4 ring-[#D9B352]/50'
                  }`}
                >
                  <RefreshCw className="w-7 h-7 animate-spin" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white">
                  {userConfirmModal.kind === 'delete'
                    ? 'Menghapus & Menyinkronkan ke Google Sheets...'
                    : 'Menyimpan & Menyinkronkan ke Google Sheets...'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-300 max-w-xs mx-auto leading-relaxed">
                  {userConfirmModal.kind === 'delete'
                    ? 'Mohon tunggu sebentar, data sedang dihapus dari database dan tab Google Sheets sedang diperbarui...'
                    : 'Mohon tunggu sebentar, data sedang diperbarui dan disinkronkan ke Google Sheets...'}
                </p>
              </div>
            ) : (
              /* TAMPILAN SELESAI */
              <div className="py-4 text-center animate-in fade-in">
                <div className="w-14 h-14 rounded-full bg-emerald-600 text-white ring-4 ring-emerald-200 dark:ring-emerald-900/50 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-[#1C221E] dark:text-white mb-1">
                  {userConfirmModal.kind === 'delete'
                    ? 'Data Berhasil Dihapus!'
                    : 'Perubahan Berhasil Disimpan!'}
                </h3>
                <p className="text-xs text-stone-400 mb-5">
                  {userConfirmModal.kind === 'delete'
                    ? 'Data telah dihapus dari sistem dan Google Sheets telah diperbarui secara langsung.'
                    : 'Data telah diperbarui dan Google Sheets telah disinkronkan secara langsung.'}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUserConfirmModal(null);
                    setUserConfirmStep('review');
                  }}
                  className="carlic-sage-btn text-[#F3D37A] font-extrabold px-6 py-2.5 rounded-xl text-xs w-full sm:w-auto shadow-sm"
                >
                  Selesai / Tutup
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* =================================================================== */}
      {/* MODAL KWITANSI RESMI BUKTI PELUNASAN DIGITAL (IPL & PJU)            */}
      {/* =================================================================== */}
      {kwitansiModal && (
        <div
          onClick={() => setKwitansiModal(null)}
          className="fixed inset-0 z-[75] flex items-center justify-center p-3 bg-black/65 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="print-kwitansi-sheet carlic-card max-w-2xl w-full p-4 sm:p-5 relative border-2 border-[#D9B352]/70 shadow-2xl bg-white dark:bg-[#0B383B]"
          >
            {/* Tombol Tutup (Non-Print) */}
            <button
              type="button"
              onClick={() => setKwitansiModal(null)}
              className="no-print w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 flex items-center justify-center absolute top-3.5 right-3.5"
            >
              <X className="w-4 h-4 text-stone-600 dark:text-stone-300" />
            </button>

            {/* Kop Surat Resmi Kwitansi Digital Paguyuban (Ringkas) */}
            <div className="flex items-center gap-3 pb-2.5 mb-2.5 border-b-2 border-[#D9B352]/50 pr-8">
              <div className="w-10 h-10 rounded-xl bg-[#0B484C] ring-2 ring-[#D9B352] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs">
                <img
                  src="/logo-pesona-kahuripan.png"
                  alt="Logo PK8"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#9A7018] dark:text-[#F3D37A] block">
                  Paguyuban Warga Pesona Kahuripan 8 Tahap 2 • RT 08
                </span>
                <h3 className="text-sm sm:text-base font-black text-[#1C221E] dark:text-white leading-tight truncate">
                  {kwitansiModal.type === 'ipl'
                    ? 'KWITANSI RESMI PELUNASAN IURAN IPL'
                    : 'KWITANSI RESMI SETORAN URUNAN PJU'}
                </h3>
                <p className="text-[10px] text-stone-500 dark:text-stone-300 truncate">
                  Surat Bukti Pelunasan Keuangan Sah Terverifikasi Bendahara Paguyuban
                </p>
              </div>
            </div>

            {/* Nomor Resi & Status Lunas */}
            <div className="px-3 py-2 rounded-xl bg-[#F8F8F6] dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700 flex items-center justify-between gap-3 mb-2.5 text-xs">
              <div>
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Nomor Kwitansi / Resi
                </span>
                <span className="font-mono font-extrabold text-[#0B484C] dark:text-[#F3D37A] text-xs sm:text-sm">
                  {kwitansiModal.resiNo}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider block">
                  Status Pembukuan Kas
                </span>
                <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-[#0B484C] border border-emerald-300 inline-block">
                  ✓ LUNAS TERVERIFIKASI
                </span>
              </div>
            </div>

            {/* Tabel Rincian Pelunasan Kwitansi (Baris Penuh Ringkas - Tanpa Potongan Teks & Tanpa Scroll) */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/90 dark:border-stone-700 text-xs mb-2.5 space-y-1">
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Nama Kepala Keluarga</span>
                <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
                  {kwitansiModal.namaWarga}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Alamat Rumah / Blok</span>
                <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] text-right">
                  {kwitansiModal.blokRumah}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Pos Pembayaran Kas</span>
                <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
                  {kwitansiModal.kategori}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Rincian Durasi / Program</span>
                <span className="font-extrabold text-[#1C221E] dark:text-white text-right">
                  {kwitansiModal.rincian}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Masa Aktif / Periode</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-300 text-right">
                  {kwitansiModal.masaAktif}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-400 whitespace-nowrap">Metode Penyetoran</span>
                <span className="font-bold text-stone-600 dark:text-stone-300 text-right">
                  {kwitansiModal.metode}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1.5">
                <div>
                  <span className="text-[11px] font-extrabold text-stone-600 dark:text-stone-300 uppercase block">
                    Total Jumlah Lunas
                  </span>
                  <span className="text-[10px] italic text-stone-400">
                    Terbilang: &ldquo;{kwitansiModal.terbilang}&rdquo;
                  </span>
                </div>
                <span className="text-base sm:text-lg font-black text-[#0B484C] dark:text-[#F3D37A] whitespace-nowrap">
                  Rp {kwitansiModal.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Cap Stempel Resmi Paguyuban & Tanda Tangan Bendahara */}
            <div className="grid grid-cols-2 gap-2 px-3 py-2 rounded-xl bg-[#FEF9EB] dark:bg-[#072B2E]/70 border border-[#D9B352]/50 text-xs mb-3 items-center">
              <div>
                <span className="text-[9px] font-extrabold text-[#9A7018] dark:text-[#F3D37A] uppercase tracking-wider block">
                  Pengesahan &amp; Verifikasi
                </span>
                <p className="font-bold text-[#1C221E] dark:text-white text-[11px] leading-tight">
                  {kwitansiModal.verifiedBy}
                </p>
                <span className="text-[9px] text-stone-400 block font-mono">
                  VALID-PK8-{kwitansiModal.type.toUpperCase()}-{kwitansiModal.resiNo.replace(/\D/g, '') || '2026'}
                </span>
              </div>
              <div className="text-right flex flex-col items-end gap-0.5">
                <div className="px-2 py-0.5 rounded-md border-2 border-rose-600 text-rose-600 font-black text-[9px] uppercase tracking-widest rotate-[-2deg] inline-block">
                  STEMPEL DIGITAL SAH • PK8
                </div>
                <span className="text-[9px] text-stone-500 dark:text-stone-300 font-semibold">
                  Tercatat Resmi di Google Sheets
                </span>
              </div>
            </div>

            {/* Tombol Aksi Download & Print (Non-Print) */}
            <div className="no-print grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDownloadSlipText(kwitansiModal)}
                className="py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-[#1C221E] dark:text-white font-extrabold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A]" />
                <span>Unduh Slip (.txt)</span>
              </button>
              <button
                type="button"
                disabled={isPrintingKwitansi}
                onClick={() => handlePrintKwitansiPdf(kwitansiModal)}
                className="carlic-sage-btn text-[#F3D37A] font-extrabold py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60 transition-all"
              >
                {isPrintingKwitansi ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#F3D37A]" />
                    <span>Menyiapkan Lembar Cetak...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setKwitansiModal(null)}
                className="py-2 px-2.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-700 font-bold text-stone-700 dark:text-stone-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MOBILE BOTTOM NAVIGATION BAR: Diletakkan di bawah rapi seperti standar mobile app */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-[#072426]/95 backdrop-blur-md border-t border-stone-200/90 dark:border-[#D9B352]/30 px-2 py-1.5 flex items-center justify-around shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              disabled={isSyncingSheets}
              onClick={() => {
                if (!isSyncingSheets) {
                  setIplMode('daftar');
                  setUrunanMode('daftar');
                  setWargaMode('direktori');
                  setIsWargaLockedInForm(false);
                  onSelectTab(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-[#0B484C] dark:text-[#F3D37A] font-extrabold scale-105'
                  : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-semibold'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[10px] leading-tight mt-0.5">{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenLoginModal}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 font-semibold transition-all"
        >
          <Settings className="w-5 h-5 stroke-2" />
          <span className="text-[10px] leading-tight mt-0.5">Admin</span>
        </button>
      </nav>

    </div>
  );
};
