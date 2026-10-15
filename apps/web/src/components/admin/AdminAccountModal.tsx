import React, { useState } from 'react';
import { Modal } from '@sim-warga/ui';
import { UserPlus, Users, Trash2, ShieldCheck, Check, Eye, EyeOff, Sparkles, KeyRound } from 'lucide-react';
import { AdminAccount } from '@sim-warga/types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { CustomSelect } from '../common/CustomSelect';

export interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminAccounts: AdminAccount[];
  onCreateAccount: (account: AdminAccount) => void;
  onDeleteAccount: (id: string) => void;
  currentAdmin: AdminAccount | null;
}

export const AdminAccountModal: React.FC<AdminAccountModalProps> = ({
  isOpen,
  onClose,
  adminAccounts,
  onCreateAccount,
  onDeleteAccount,
  currentAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [accountToDelete, setAccountToDelete] = useState<AdminAccount | null>(null);

  const [nama, setNama] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [jabatan, setJabatan] = useState<AdminAccount['jabatan']>('Ketua Paguyuban');
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  // Validasi Password Baru: Minimal 8 karakter, huruf kecil, huruf besar, angka, dan karakter khusus
  const hasMinLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasLower && hasUpper && hasNumber && hasSpecial;

  // AI Generator Password Aman & Kuat
  const handleGenerateAiPassword = () => {
    const charsUpper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLower = 'abcdefghjkmnpqrstuvwxyz';
    const charsNum = '23456789';
    const charsSpec = '!@#$%^&*';

    let pass = '';
    pass += charsUpper[Math.floor(Math.random() * charsUpper.length)];
    pass += charsLower[Math.floor(Math.random() * charsLower.length)];
    pass += charsNum[Math.floor(Math.random() * charsNum.length)];
    pass += charsSpec[Math.floor(Math.random() * charsSpec.length)];

    const all = charsUpper + charsLower + charsNum + charsSpec;
    for (let i = 0; i < 6; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }
    // Shuffle
    const shuffled = pass.split('').sort(() => 0.5 - Math.random()).join('');
    setPassword(shuffled);
    setShowPassword(true);
    setErrorNotice('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice('');

    if (!nama.trim() || !username.trim() || !password) {
      setErrorNotice('Semua kolom wajib diisi.');
      return;
    }

    if (!isPasswordValid) {
      setErrorNotice(
        'Kata sandi belum memenuhi syarat keamanan. Wajib minimal 8 karakter, ada huruf besar (A-Z), huruf kecil (a-z), angka (0-9), dan simbol.'
      );
      return;
    }

    const usernameExists = adminAccounts.some(
      (a) => a.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (usernameExists) {
      setErrorNotice('Username tersebut sudah digunakan oleh pengurus lain.');
      return;
    }

    const newAcc: AdminAccount = {
      id: `adm-${Date.now()}`,
      nama: nama.trim(),
      username: username.trim().toLowerCase(),
      password,
      jabatan,
      createdAt: new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    };

    onCreateAccount(newAcc);
    setNama('');
    setUsername('');
    setPassword('');
    setSuccessNotice(`Akun ${newAcc.nama} (@${newAcc.username}) berhasil diterbitkan!`);
    setActiveTab('list');
    setTimeout(() => setSuccessNotice(''), 3000);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Manajemen Akun Pengurus / Admin"
        subtitle="Kelola akun resmi BPH Paguyuban Pesona Kahuripan 8 Tahap 2"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          {/* TAB SWITCHER DENGAN TEMA EMERALD & GOLD */}
          <div className="flex items-center justify-between border-b border-stone-200/80 dark:border-stone-800 pb-2.5 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-[#072B2E] border border-stone-200/60 dark:border-[#D9B352]/40/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('list');
                  setErrorNotice('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  activeTab === 'list'
                    ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs ring-1 ring-[#D9B352]/50'
                    : 'text-stone-600 dark:text-stone-300 hover:text-[#0B484C] dark:hover:text-[#F3D37A]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Daftar Pengurus ({adminAccounts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setErrorNotice('');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-extrabold text-xs transition-all ${
                  activeTab === 'create'
                    ? 'bg-[#0B484C] text-[#F3D37A] shadow-xs ring-1 ring-[#D9B352]/50'
                    : 'text-stone-600 dark:text-stone-300 hover:text-[#0B484C] dark:hover:text-[#F3D37A]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Buat Akun Baru</span>
              </button>
            </div>

            <span className="text-[10px] font-bold text-stone-400">
              Level Akses: BPH Paguyuban
            </span>
          </div>

          {successNotice && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 rounded-xl font-bold animate-in fade-in">
              <Check className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* TAB 1: LIST PENGURUS (KARTU PROFIL EKSEKUTIF) */}
          {activeTab === 'list' && (
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {adminAccounts.map((acc) => {
                const isCurrent = currentAdmin?.id === acc.id || currentAdmin?.username === acc.username;
                const isRoot = acc.username === 'admin';
                const isPwRevealed = Boolean(revealedPasswords[acc.id]);
                const initials = acc.nama
                  .replace(/^(Bapak|Ibu|Haji|H\.|Hj\.)\s+/i, '')
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'AD';

                return (
                  <div
                    key={acc.id}
                    className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-[#0B484C] dark:border-[#F3D37A] ring-1 ring-[#0B484C]/40 shadow-xs'
                        : 'bg-white dark:bg-[#072B2E]/90 border-stone-200/80 dark:border-[#D9B352]/40 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* LUXURY AVATAR */}
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0B484C] via-[#0D555A] to-[#073235] text-[#F3D37A] font-black text-sm flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-[#D9B352]/50">
                        {initials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-extrabold text-sm text-[#1C221E] dark:text-white truncate">
                            {acc.nama}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                              👑 Anda (Aktif)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-mono text-[11px] font-bold text-[#0B484C] dark:text-[#F3D37A]">
                            @{acc.username}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-stone-700 dark:text-stone-300">
                            {acc.jabatan}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100 dark:border-[#D9B352]/40">
                      {/* INTIP PASSWORD PENGURUS */}
                      <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200/80 dark:border-[#D9B352]/40">
                        <KeyRound className="w-3.5 h-3.5 text-stone-400" />
                        <span className={`text-[11px] font-mono ${isPwRevealed ? 'font-bold text-[#0B484C] dark:text-[#F3D37A]' : 'text-stone-400'}`}>
                          {isPwRevealed ? (acc.password || '••••••••') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setRevealedPasswords((prev) => ({ ...prev, [acc.id]: !prev[acc.id] }))}
                          className="p-1 rounded-md text-stone-400 hover:text-[#0B484C] dark:hover:text-[#F3D37A] transition-colors"
                          title={isPwRevealed ? 'Sembunyikan password' : 'Lihat password'}
                        >
                          {isPwRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-xl bg-[#FEF6DF] dark:bg-amber-950/50 text-[#9A7018] dark:text-[#F3D37A] border border-[#D9B352]/50 whitespace-nowrap">
                        {acc.jabatan}
                      </span>

                      {!isRoot && !isCurrent && adminAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setAccountToDelete(acc)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="Hapus akun pengurus ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: FORM BUAT AKUN PENGURUS BARU (DESAIN MODERN & AI ASSISTED) */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreate} className="space-y-3.5 pt-1">
              {errorNotice && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-bold leading-relaxed">
                  ⚠️ {errorNotice}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Nama Lengkap Pengurus *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bapak H. Ahmad Dahlan"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 dark:text-white bg-[#F8F8F6] dark:bg-[#051E20] border border-stone-200 dark:border-[#D9B352]/40 rounded-xl px-3.5 h-10 focus:outline-none focus:border-[#0B484C]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                    Username Login *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold">@</span>
                    <input
                      type="text"
                      required
                      placeholder="ahmaddahlan"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="w-full text-xs font-bold font-mono text-stone-900 dark:text-white bg-[#F8F8F6] dark:bg-[#051E20] border border-stone-200 dark:border-[#D9B352]/40 rounded-xl pl-8 pr-3.5 h-10 focus:outline-none focus:border-[#0B484C]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <CustomSelect
                  label="Jabatan di Paguyuban PK8 *"
                  required
                  value={jabatan}
                  onChange={(val) => setJabatan(val as AdminAccount['jabatan'])}
                  options={[
                    'Ketua Paguyuban',
                    'Wakil Ketua',
                    'Sekretaris',
                    'Bendahara',
                    'Seksi Keamanan & Ketertiban',
                    'Seksi Fasum & Kebersihan',
                    'Seksi Hubungan Warga',
                  ]}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-stone-700 dark:text-stone-300">
                    Kata Sandi / Password Baru *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAiPassword}
                    className="text-[10px] text-[#0B484C] dark:text-[#F3D37A] font-extrabold flex items-center gap-1 hover:underline"
                    title="Buat password kuat dan aman secara instan"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>✨ AI Generate Password Kuat</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Minimal 8 karakter, A-Z, a-z, 0-9, simbol..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full text-xs font-bold font-mono text-stone-900 dark:text-white bg-[#F8F8F6] dark:bg-[#051E20] border rounded-xl pl-3.5 pr-10 h-10 transition-all ${
                      password
                        ? isPasswordValid
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-amber-400 ring-2 ring-amber-500/20'
                        : 'border-stone-200 dark:border-[#D9B352]/40'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Real-time Checklist Ketentuan Password */}
                <div className="mt-2.5 p-3 bg-stone-50 dark:bg-[#072B2E] rounded-xl border border-stone-200 dark:border-[#D9B352]/40 space-y-1.5">
                  <span className="font-extrabold text-stone-700 dark:text-stone-300 block text-[11px]">
                    Ketentuan Keamanan Password (Wajib):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
                    <span className={`flex items-center gap-1 font-bold ${hasMinLength ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {hasMinLength ? '✓' : '•'} Min. 8 Karakter
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${hasUpper ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {hasUpper ? '✓' : '•'} Huruf Besar (A-Z)
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${hasLower ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {hasLower ? '✓' : '•'} Huruf Kecil (a-z)
                    </span>
                    <span className={`flex items-center gap-1 font-bold ${hasNumber && hasSpecial ? 'text-emerald-600' : 'text-stone-400'}`}>
                      {hasNumber && hasSpecial ? '✓' : '•'} Angka &amp; Simbol
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200/80 dark:border-[#D9B352]/40">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="carlic-sage-btn text-[#F3D37A] font-extrabold px-6 py-2.5 rounded-xl shadow-xs text-xs"
                >
                  Terbitkan Akun Pengurus Baru
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {accountToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          onClose={() => setAccountToDelete(null)}
          onConfirm={() => {
            onDeleteAccount(accountToDelete.id);
            setAccountToDelete(null);
            setSuccessNotice(`Akun ${accountToDelete.nama} berhasil dihapus.`);
            setTimeout(() => setSuccessNotice(''), 3000);
          }}
          title="Hapus Akun Pengurus Paguyuban"
          description={`Apakah Anda yakin ingin menghapus akun @${accountToDelete.username} (${accountToDelete.nama})? Pengurus ini tidak akan bisa login lagi.`}
        />
      )}
    </>
  );
};

export default AdminAccountModal;
