import React, { useState } from 'react';
import {
  AdminAccount,
  DashboardSummary,
  WargaRecord,
  TransaksiIPL,
  PengeluaranKasRecord,
  ProgramUrunanRecord,
  ItemUrunanWarga,
  PengumumanRecord,
  InfoRekeningBank,
} from '@sim-warga/types';
import { RondaWithStatus } from '../ronda/JadwalRondaCard';
import {
  LayoutGrid,
  Wallet,
  Users,
  Megaphone,
  Shield,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  Activity,
} from 'lucide-react';

import { AdminActionCenterTab } from './tabs/AdminActionCenterTab';
import { AdminFinanceTab } from './tabs/AdminFinanceTab';
import { AdminResidentsTab } from './tabs/AdminResidentsTab';
import { AdminPengumumanTab } from './tabs/AdminPengumumanTab';
import { AdminAuditLogTab } from './tabs/AdminAuditLogTab';

import { ProofPreviewModal } from './modals/ProofPreviewModal';
import { RejectReasonModal } from './modals/RejectReasonModal';
import { AddWargaModal } from './modals/AddWargaModal';
import { WargaEditModal } from './modals/WargaEditModal';
import { AddPengeluaranModal } from './modals/AddPengeluaranModal';
import { RondaEditModal } from './modals/RondaEditModal';
import { ConfirmActionModal } from './modals/ConfirmActionModal';
import { generateAdminAuditLog } from '../../services/aiAssistantService';

export interface DashboardAdminProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentAdmin: AdminAccount;
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
  onOpenAccountModal: () => void;
  onLogout: () => void;
  onSyncSheet: () => void;
  isSyncingSheet: boolean;
  onApproveIpl: (noTransaksi: string, namaWarga: string) => Promise<void> | void;
  onRejectIpl: (noTransaksi: string, catatan: string) => Promise<void> | void;
  onUpdateTarifIpl: (newTarif: number) => void;
  onUpdateRekeningBank: (newRek: InfoRekeningBank) => void;
  onAddPengeluaran: (item: PengeluaranKasRecord) => Promise<void> | void;
  onDeletePengeluaran: (id: string) => Promise<void> | void;
  onAddUrunan: (item: ItemUrunanWarga) => Promise<void> | void;
  onDeleteUrunan: (id: string) => Promise<void> | void;
  onApproveUrunan?: (id: string, namaWarga: string) => Promise<void> | void;
  onRejectUrunan?: (id: string, reason: string) => Promise<void> | void;
  onAddWarga: (newWarga: WargaRecord) => Promise<void> | void;
  onAdminUpdateWarga: (originalKey: string, updated: WargaRecord) => Promise<void> | void;
  onDeleteWarga: (key: string) => Promise<void> | void;
  onAddRonda: (newRonda: RondaWithStatus) => Promise<void> | void;
  onUpdateRonda: (updatedRonda: RondaWithStatus) => void;
  onDeleteRonda?: (id: string) => void;
  onAddPengumuman: (newP: PengumumanRecord) => Promise<void> | void;
  onUpdatePengumuman: (updated: PengumumanRecord) => void;
  onDeletePengumuman: (id: string) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({
  activeTab,
  onSelectTab,
  currentAdmin,
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
  onOpenAccountModal,
  onLogout,
  onSyncSheet,
  isSyncingSheet,
  onApproveIpl,
  onRejectIpl,
  onUpdateTarifIpl,
  onUpdateRekeningBank,
  onAddPengeluaran,
  onDeletePengeluaran,
  onAddUrunan,
  onDeleteUrunan,
  onApproveUrunan,
  onRejectUrunan,
  onAddWarga,
  onAdminUpdateWarga,
  onDeleteWarga,
  onUpdateRonda,
  onAddPengumuman,
  onUpdatePengumuman,
  onDeletePengumuman,
}) => {
  // Modal States
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [previewProof, setPreviewProof] = useState<{
    item: TransaksiIPL | ItemUrunanWarga;
    type: 'ipl' | 'urunan';
  } | null>(null);
  const [rejectModalItem, setRejectModalItem] = useState<{
    item: TransaksiIPL | ItemUrunanWarga;
    type: 'ipl' | 'urunan';
  } | null>(null);
  const [isAddWargaOpen, setIsAddWargaOpen] = useState<boolean>(false);
  const [editingWarga, setEditingWarga] = useState<WargaRecord | null>(null);
  const [isAddExpOpen, setIsAddExpOpen] = useState<boolean>(false);
  const [editingRonda, setEditingRonda] = useState<RondaWithStatus | null>(null);

  // Generic Confirmation Dialog State (for critical actions)
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    subtitle?: string;
    message?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Compute pending counts for badges
  const iplPendingCount = transaksiList.filter((t) => t.status === 'Menunggu Verifikasi').length;
  const pjuPendingCount = urunanList.filter((u) => u.status === 'Menunggu Verifikasi').length;
  const totalPendingAction = iplPendingCount + pjuPendingCount;

  // Detect Secret Master Auditor Session (Zero-Knowledge Verified)
  const isSecretAuditor =
    currentAdmin.id === 'adm-vault-master' ||
    currentAdmin.username === 'secret-master' ||
    (currentAdmin.jabatan || '').includes('Blackbox');

  // The Action Hubs: If Secret Auditor, ONLY show the Audit Log Blackbox menu!
  const navHubs = isSecretAuditor
    ? [
        {
          id: 'log',
          label: 'Log & Audit AI (Blackbox)',
          icon: Shield,
          badge: 0,
          tooltip: 'Konsol audit independen permanen dengan analisis anomali AI (data blackbox abadi tidak terhapus).',
        },
      ]
    : [
        {
          id: 'aksi',
          label: 'Pusat Aksi',
          icon: LayoutGrid,
          badge: totalPendingAction,
          tooltip: 'Pusat komando operasional, antrean verifikasi bukti bayar warga, dan pintasan cepat pengurus.',
        },
        {
          id: 'keuangan',
          label: 'Keuangan & Kas',
          icon: Wallet,
          badge: 0,
          tooltip: 'Rekapitulasi iuran IPL, program urunan PJU, belanja pengeluaran kas, dan pengaturan rekening bank resmi.',
        },
        {
          id: 'kependudukan',
          label: 'Kependudukan & Ronda',
          icon: Users,
          badge: 0,
          tooltip: 'Database 143 KK warga RT 08, intip Secret PIN, pendaftaran warga baru, dan kalender siskamling 4 minggu.',
        },
        {
          id: 'pengumuman',
          label: 'Jarkoman & Publikasi',
          icon: Megaphone,
          badge: 0,
          tooltip: 'Papan informasi resmi broadcast kegiatan, kerja bakti, dan agenda warga PK8.',
        },
        {
          id: 'log',
          label: 'Log & Audit AI',
          icon: Activity,
          badge: 0,
          tooltip: 'Pencatatan mutasi data warga & pengurus dengan analisis ringkas AI (otomatis bersih tiap 30 hari).',
        },
      ];

  // Resolve which hub is active based on activeTab
  const resolveActiveHub = (
    tab: string
  ): 'aksi' | 'keuangan' | 'kependudukan' | 'pengumuman' | 'log' => {
    if (isSecretAuditor) return 'log';
    if (tab === 'beranda' || tab === 'aksi') return 'aksi';
    if (tab === 'ipl' || tab === 'urunan' || tab === 'keuangan') return 'keuangan';
    if (tab === 'warga' || tab === 'ronda' || tab === 'kependudukan') return 'kependudukan';
    if (tab === 'pengumuman') return 'pengumuman';
    if (tab === 'log') return 'log';
    return 'aksi';
  };

  const activeHub = resolveActiveHub(activeTab);

  // --- Confirmation Handlers for Critical Actions ---
  const handleRequestApproveIpl = (noTransaksi: string, namaWarga: string) => {
    const trx = transaksiList.find((t) => t.noTransaksi === noTransaksi);
    const nominalBayar = trx?.nominalBayar || 30000;

    setConfirmDialog({
      title: 'Konfirmasi Persetujuan Pembayaran IPL',
      subtitle: `Setujui Transaksi ${noTransaksi} dari ${namaWarga}?`,
      message: `Status pembayaran akan diubah menjadi "Lunas" sebesar Rp ${nominalBayar.toLocaleString('id-ID')} dan mutasi kas tercatat resmi ke Google Sheets.`,
      confirmLabel: 'Ya, Setujui Pembayaran',
      isDestructive: false,
      onConfirm: async () => {
        await onApproveIpl(noTransaksi, namaWarga);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'IPL',
          action: 'APPROVE_IPL',
          targetTitle: `${namaWarga} (${noTransaksi})`,
          alamatRumah: trx?.lokasiRumah || '-',
          changes: ['Status: Lunas Terverifikasi', `Kas Masuk: Rp ${nominalBayar.toLocaleString('id-ID')}`],
        });
      },
    });
  };

  const handleRequestApproveUrunan = (id: string, namaWarga: string) => {
    const item = urunanList.find((u) => u.id === id);
    const nom = item?.nominal || 0;

    setConfirmDialog({
      title: 'Konfirmasi Persetujuan Urunan PJU',
      subtitle: `Setujui setoran donasi ${id} dari ${namaWarga}?`,
      message: `Setoran donasi sebesar Rp ${nom.toLocaleString('id-ID')} akan disetujui dan kas penerimaan PJU diperbarui.`,
      confirmLabel: 'Ya, Setujui Donasi',
      isDestructive: false,
      onConfirm: async () => {
        if (onApproveUrunan) await onApproveUrunan(id, namaWarga);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'PJU',
          action: 'APPROVE_PJU',
          targetTitle: `${namaWarga} (${id})`,
          alamatRumah: item?.keterangan || '-',
          changes: ['Status: Lunas Donasi PJU', `Nominal: Rp ${nom.toLocaleString('id-ID')}`],
        });
      },
    });
  };

  const handleRequestDeletePengeluaran = (id: string) => {
    const exp = pengeluaranList.find((e) => e.id === id);
    setConfirmDialog({
      title: 'Konfirmasi Hapus Pengeluaran Kas',
      subtitle: `Hapus catatan pengeluaran #${id}?`,
      message: `Catatan pengeluaran "${exp?.keterangan || ''}" sebesar Rp ${(exp?.nominal || 0).toLocaleString('id-ID')} akan dihapus permanen dari kas RT.`,
      confirmLabel: 'Ya, Hapus Pengeluaran',
      isDestructive: true,
      onConfirm: async () => {
        await onDeletePengeluaran(id);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'KAS',
          action: 'HAPUS_PENGELUARAN',
          targetTitle: `Pengeluaran #${id}`,
          changes: [`Keterangan: ${exp?.keterangan || ''}`, `Nominal: Rp ${(exp?.nominal || 0).toLocaleString('id-ID')}`],
        });
      },
    });
  };

  const handleRequestDeleteUrunan = (id: string) => {
    const item = urunanList.find((u) => u.id === id);
    setConfirmDialog({
      title: 'Konfirmasi Hapus Data Setoran PJU',
      subtitle: `Hapus data setoran #${id}?`,
      message: 'Catatan setoran urunan ini akan dihapus permanen dari daftar donatur.',
      confirmLabel: 'Ya, Hapus Setoran',
      isDestructive: true,
      onConfirm: async () => {
        await onDeleteUrunan(id);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'PJU',
          action: 'REJECT_PJU',
          targetTitle: `Urunan #${id}`,
          changes: [`Donatur: ${item?.namaWarga || ''}`, `Nominal: Rp ${(item?.nominal || 0).toLocaleString('id-ID')}`],
        });
      },
    });
  };

  const handleRequestDeletePengumuman = (id: string) => {
    const pgm = pengumumanList.find((p) => p.id === id);
    setConfirmDialog({
      title: 'Konfirmasi Hapus Jarkoman',
      subtitle: `Hapus pengumuman "${pgm?.judul || ''}"?`,
      message: 'Pengumuman ini akan ditarik permanen dan tidak lagi tampil pada papan informasi warga.',
      confirmLabel: 'Ya, Hapus Jarkoman',
      isDestructive: true,
      onConfirm: async () => {
        onDeletePengumuman(id);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'PENGUMUMAN',
          action: 'HAPUS_PENGELUARAN',
          targetTitle: pgm?.judul || `Jarkoman #${id}`,
          changes: ['Pengumuman ditarik dari publik'],
        });
      },
    });
  };

  const handleRequestDeleteWarga = (key: string) => {
    setConfirmDialog({
      title: 'Konfirmasi Hapus Data Warga',
      subtitle: `Hapus data KK warga ${key}?`,
      message: 'Data kepala keluarga ini akan dihapus dari sistem direktori warga.',
      confirmLabel: 'Ya, Hapus Data Warga',
      isDestructive: true,
      onConfirm: async () => {
        await onDeleteWarga(key);
        await generateAdminAuditLog({
          adminName: currentAdmin.nama,
          category: 'WARGA',
          action: 'HAPUS_PENGELUARAN',
          targetTitle: `Warga ${key}`,
          changes: ['Data warga dihapus dari direktori'],
        });
      },
    });
  };

  return (
    <div className="w-full max-w-full overflow-hidden h-screen max-h-screen bg-[#F4F4F0] dark:bg-[#031A1C] text-[#1C221E] dark:text-[#E8EFE9] flex flex-col antialiased selection:bg-[#0B484C] selection:text-[#F3D37A]">
      {/* =================================================================== */}
      {/* 1. TOP HEADER BAR                                                   */}
      {/* =================================================================== */}
      <header className="h-14 px-5 border-b border-stone-200/70 dark:border-[#D9B352]/20 flex items-center justify-between gap-4 flex-shrink-0 bg-white/70 dark:bg-black/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0B484C] text-[#F3D37A] font-black text-sm flex items-center justify-center ring-2 ring-[#D9B352]/60 shadow-xs">
            PK8
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-[#1C221E] dark:text-white leading-tight">
                SIM-Warga Pesona Kahuripan 8
              </h1>
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  isSecretAuditor
                    ? 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/40'
                    : 'bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/40'
                }`}
              >
                {isSecretAuditor ? 'MASTER BLACKBOX AUDITOR' : 'ADMIN PANEL'}
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-medium leading-tight hidden sm:block">
              Sistem Informasi &amp; Administrasi Digital RT 08 Tahap 2
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Sync Sheets Button */}
          <button
            type="button"
            onClick={onSyncSheet}
            disabled={isSyncingSheet}
            className="h-8 px-3 rounded-xl bg-stone-100 dark:bg-[#072426] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs flex items-center gap-1.5 border border-stone-200/80 dark:border-stone-700 transition-colors"
            title="Sinkronisasi Data Google Sheets"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-[#0B484C] dark:text-[#F3D37A] ${
                isSyncingSheet ? 'animate-spin' : ''
              }`}
            />
            <span className="hidden md:inline">
              {isSyncingSheet ? 'Sinkronisasi...' : 'Sync Data'}
            </span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-xl bg-stone-100 dark:bg-[#072426] hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center transition-colors border border-stone-200/80 dark:border-stone-700"
            title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-600" />
            )}
          </button>

          {/* Admin Profile & Account Modal */}
          <div className="flex items-center gap-2 pl-2 border-l border-stone-200/80 dark:border-stone-700">
            <button
              type="button"
              onClick={onOpenAccountModal}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              title="Pengaturan Akun Admin"
            >
              <div className="w-8 h-8 rounded-full bg-[#0B484C] text-[#F3D37A] font-black text-xs flex items-center justify-center ring-2 ring-[#D9B352]/60 shadow-xs">
                {currentAdmin.nama.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-extrabold text-[#1C221E] dark:text-white leading-tight">
                  {currentAdmin.nama}
                </p>
                <p className="text-[10px] text-stone-400 leading-tight">
                  {currentAdmin.jabatan}
                </p>
              </div>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center transition-colors border border-rose-200/80 dark:border-rose-900/60"
              title="Keluar dari Sesi Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. BODY: 5 ACTION HUBS SIDEBAR + MAIN WORKSPACE                    */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row flex-1 min-h-0 h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] w-full max-w-full overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-60 h-full max-h-full bg-white/70 dark:bg-[#052123]/80 border-r border-stone-200/70 dark:border-[#D9B352]/20 p-3 flex md:flex-col justify-between flex-shrink-0 overflow-y-auto">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible w-full">
            {navHubs.map((hub) => {
              const Icon = hub.icon;
              const isActive = activeHub === hub.id;

              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => onSelectTab(hub.id)}
                  title={hub.tooltip}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between text-xs font-extrabold transition-all ${
                    isActive
                      ? 'bg-[#0B484C] text-[#F3D37A] shadow-md shadow-[#0B484C]/20 scale-[1.02]'
                      : 'text-stone-600 dark:text-stone-400 hover:text-[#0B484C] hover:bg-stone-100/80 dark:hover:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{hub.label}</span>
                  </div>
                  {hub.badge > 0 ? (
                    <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] flex items-center justify-center shadow-xs">
                      {hub.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Motivational Plant Card or Secret Auditor Badge */}
          <div className="hidden md:block p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-[#FEF9EB] dark:from-[#0B383B]/60 dark:to-stone-800 border border-[#D9B352]/40 text-center">
            <span className="text-xl">{isSecretAuditor ? '🛡️' : '🌱'}</span>
            <p className="text-xs font-extrabold text-[#0B484C] dark:text-[#F3D37A] mt-1">
              {isSecretAuditor ? 'Master Blackbox Vault' : 'Guyub Rukun RT 08'}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
              {isSecretAuditor
                ? 'Sistem audit independen dengan analisis AI anomali data.'
                : 'Semua pencatatan disinkronkan otomatis dengan Google Sheets resmi.'}
            </p>
          </div>
        </aside>

        {/* WORKSPACE AREA (5 ACTION HUBS) */}
        <main className="flex-1 min-w-0 max-w-full h-full max-h-full overflow-hidden p-3 sm:p-4 flex flex-col">
          {activeHub === 'aksi' && (
            <AdminActionCenterTab
              currentAdmin={currentAdmin}
              summary={summary}
              wargaList={wargaList}
              transaksiList={transaksiList}
              pengeluaranList={pengeluaranList}
              programUrunan={programUrunan}
              urunanList={urunanList}
              onSelectTab={onSelectTab}
              onApproveIpl={handleRequestApproveIpl}
              onRejectIplModal={(trx) => setRejectModalItem({ item: trx, type: 'ipl' })}
              onPreviewTrx={(trx) => setPreviewProof({ item: trx, type: 'ipl' })}
              onApproveUrunan={handleRequestApproveUrunan}
              onRejectUrunanModal={(item) => setRejectModalItem({ item, type: 'urunan' })}
              onPreviewUrunan={(item) => setPreviewProof({ item, type: 'urunan' })}
              onOpenAddWarga={() => setIsAddWargaOpen(true)}
              onOpenAddExp={() => setIsAddExpOpen(true)}
              onSyncSheet={onSyncSheet}
              isSyncingSheet={isSyncingSheet}
            />
          )}

          {activeHub === 'keuangan' && (
            <AdminFinanceTab
              summary={summary}
              transaksiList={transaksiList}
              pengeluaranList={pengeluaranList}
              programUrunan={programUrunan}
              urunanList={urunanList}
              tarifIpl={tarifIpl}
              rekeningBank={rekeningBank}
              initialSubTab={activeTab === 'urunan' ? 'urunan' : 'ipl'}
              onApproveIpl={handleRequestApproveIpl}
              onRejectIplModal={(trx) => setRejectModalItem({ item: trx, type: 'ipl' })}
              onPreviewTrx={(trx) => setPreviewProof({ item: trx, type: 'ipl' })}
              onAddUrunan={async (item) => {
                await onAddUrunan(item);
                await generateAdminAuditLog({
                  adminName: currentAdmin.nama,
                  category: 'PJU',
                  action: 'TAMBAH_URUNAN',
                  targetTitle: `${item.namaWarga} (${item.id})`,
                  alamatRumah: item.keterangan || '-',
                  changes: [
                    `Donatur Baru: ${item.namaWarga}`,
                    `Tipe: ${item.tipe}`,
                    `Nominal: Rp ${item.nominal.toLocaleString('id-ID')}`,
                    `Metode: ${item.metode}`,
                  ],
                });
              }}
              onDeleteUrunan={handleRequestDeleteUrunan}
              onApproveUrunan={handleRequestApproveUrunan}
              onRejectUrunanModal={(item) => setRejectModalItem({ item, type: 'urunan' })}
              onPreviewUrunan={(item) => setPreviewProof({ item, type: 'urunan' })}
              onOpenAddExp={() => setIsAddExpOpen(true)}
              onDeletePengeluaran={handleRequestDeletePengeluaran}
              onUpdateTarifIpl={onUpdateTarifIpl}
              onUpdateRekeningBank={onUpdateRekeningBank}
            />
          )}

          {activeHub === 'kependudukan' && (
            <AdminResidentsTab
              wargaList={wargaList}
              rondaList={rondaList}
              initialSubTab={activeTab === 'ronda' ? 'ronda' : 'warga'}
              onOpenAddWarga={() => setIsAddWargaOpen(true)}
              onOpenEditWarga={(w) => setEditingWarga(w)}
              onOpenEditRonda={(r) => setEditingRonda(r)}
              onDeleteWarga={handleRequestDeleteWarga}
            />
          )}

          {activeHub === 'pengumuman' && (
            <AdminPengumumanTab
              pengumumanList={pengumumanList}
              currentAdmin={currentAdmin}
              onAddPengumuman={async (p) => {
                await onAddPengumuman(p);
                await generateAdminAuditLog({
                  adminName: currentAdmin.nama,
                  category: 'PENGUMUMAN',
                  action: 'BUAT_PENGUMUMAN',
                  targetTitle: p.judul,
                  alamatRumah: p.lokasi,
                  changes: [
                    `Judul: ${p.judul}`,
                    `Kategori: ${p.kategori}`,
                    `Tanggal Acara: ${p.tanggalAcara}`,
                    `Waktu: ${p.waktu}`,
                  ],
                });
              }}
              onUpdatePengumuman={onUpdatePengumuman}
              onDeletePengumuman={handleRequestDeletePengumuman}
            />
          )}

          {activeHub === 'log' && (
            <AdminAuditLogTab
              currentAdminName={currentAdmin.nama}
              isSecretAuditor={isSecretAuditor}
            />
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* 3. COORDINATED MODALS & DIALOGS LAYER                               */}
      {/* =================================================================== */}
      {previewProof && (
        <ProofPreviewModal
          item={previewProof.item}
          type={previewProof.type}
          onClose={() => setPreviewProof(null)}
        />
      )}

      {rejectModalItem && (
        <RejectReasonModal
          item={rejectModalItem.item}
          type={rejectModalItem.type}
          onClose={() => setRejectModalItem(null)}
          onConfirmReject={async (idOrNo, reason) => {
            if (rejectModalItem.type === 'ipl') {
              await onRejectIpl(idOrNo, reason);
              await generateAdminAuditLog({
                adminName: currentAdmin.nama,
                category: 'IPL',
                action: 'REJECT_IPL',
                targetTitle: `Transaksi ${idOrNo}`,
                changes: [`Alasan Penolakan: ${reason}`],
              });
            } else if (onRejectUrunan) {
              await onRejectUrunan(idOrNo, reason);
              await generateAdminAuditLog({
                adminName: currentAdmin.nama,
                category: 'PJU',
                action: 'REJECT_PJU',
                targetTitle: `Urunan #${idOrNo}`,
                changes: [`Alasan Penolakan: ${reason}`],
              });
            }
          }}
        />
      )}

      {isAddWargaOpen && (
        <AddWargaModal
          tarifIpl={tarifIpl}
          onClose={() => setIsAddWargaOpen(false)}
          onAddWarga={async (w) => {
            await onAddWarga(w);
            await generateAdminAuditLog({
              adminName: currentAdmin.nama,
              category: 'WARGA',
              action: 'TAMBAH_WARGA',
              targetTitle: w.namaLengkap,
              alamatRumah: w.alamatRumah,
              changes: [`Pendaftaran KK baru: ${w.namaLengkap}`, `Alamat: ${w.alamatRumah}`, `Status: ${w.statusIpl}`],
            });
          }}
        />
      )}

      {editingWarga && (
        <WargaEditModal
          warga={editingWarga}
          tarifIpl={tarifIpl}
          onClose={() => setEditingWarga(null)}
          onSave={async (origKey, updated) => {
            await onAdminUpdateWarga(origKey, updated);
            await generateAdminAuditLog({
              adminName: currentAdmin.nama,
              category: 'WARGA',
              action: 'EDIT_WARGA',
              targetTitle: updated.namaLengkap,
              alamatRumah: updated.alamatRumah,
              changes: [`Update data KK: ${updated.namaLengkap}`, `Status IPL: ${updated.statusIpl}`, `Catatan: ${updated.catatan}`],
            });
          }}
        />
      )}

      {isAddExpOpen && (
        <AddPengeluaranModal
          onClose={() => setIsAddExpOpen(false)}
          onAddPengeluaran={async (exp) => {
            await onAddPengeluaran(exp);
            await generateAdminAuditLog({
              adminName: currentAdmin.nama,
              category: 'KAS',
              action: 'CATAT_PENGELUARAN',
              targetTitle: exp.keterangan,
              changes: [`Kategori: ${exp.kategori}`, `Nominal: -Rp ${exp.nominal.toLocaleString('id-ID')}`, `Penerima: ${exp.penerima}`],
            });
          }}
        />
      )}

      {editingRonda && (
        <RondaEditModal
          ronda={editingRonda}
          wargaList={wargaList}
          onClose={() => setEditingRonda(null)}
          onSave={async (updated) => {
            onUpdateRonda(updated);
            await generateAdminAuditLog({
              adminName: currentAdmin.nama,
              category: 'RONDA',
              action: 'UPDATE_RONDA',
              targetTitle: `${updated.hari} (${updated.tanggal})`,
              changes: [`Plotting ${updated.petugas.length} slot petugas siskamling diperbarui`],
            });
          }}
        />
      )}

      {/* CONFIRMATION POPUP FOR CRITICAL ACTIONS (APPROVE, DELETE, ETC.) */}
      {confirmDialog && (
        <ConfirmActionModal
          title={confirmDialog.title}
          subtitle={confirmDialog.subtitle}
          message={confirmDialog.message}
          confirmLabel={confirmDialog.confirmLabel}
          isDestructive={confirmDialog.isDestructive}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}

      {showLogoutModal && (
        <ConfirmActionModal
          title="Konfirmasi Keluar Sesi Admin"
          subtitle="Apakah Anda yakin ingin keluar dari Panel Pengurus RT?"
          message="Sesi login admin Anda akan ditutup. Anda dapat masuk kembali sewaktu-waktu menggunakan username dan password admin."
          confirmLabel="Keluar Sesi"
          isDestructive={true}
          onConfirm={onLogout}
          onClose={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
};

export default DashboardAdmin;
