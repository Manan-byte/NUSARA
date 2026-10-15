import React, { useState } from 'react';
import { Eye, EyeOff, X, Lock, Check, ShieldAlert, Clock } from 'lucide-react';
import { AdminAccount } from '@sim-warga/types';
import { AdminOfficeIllustration } from './AdminOfficeIllustration';
import {
  verifySecretAuditorCredentials,
  getAdminLoginLockoutState,
  recordAdminFailedAttempt,
  resetAdminLoginLockout,
} from '../../utils/security';
import { setAdminAuthToken, RUST_API_BASE_URL } from '../../services/apiService';

export interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (admin: AdminAccount) => void;
  adminAccounts: AdminAccount[];
  onCreateAccount?: (account: AdminAccount) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  adminAccounts,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice] = useState('');
  const [lockoutSecs, setLockoutSecs] = useState<number>(0);

  React.useEffect(() => {
    if (isOpen) {
      const lock = getAdminLoginLockoutState();
      if (lock.isLocked && lock.remainingSeconds > 0) {
        setLockoutSecs(lock.remainingSeconds);
      } else {
        setLockoutSecs(0);
      }
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (lockoutSecs <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecs((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecs]);
  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSecs > 0) return;
    setErrorMessage('');

    // 1. Verifikasi Akun Rahasia Master Auditor via Irreversible SHA-256 Hash
    try {
      const isSecretMaster = await verifySecretAuditorCredentials(username, password);
      if (isSecretMaster) {
        resetAdminLoginLockout();
        try {
          const rustRes = await fetch(`${RUST_API_BASE_URL}/api/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          if (rustRes.ok) {
            const j = await rustRes.json();
            if (j.token) setAdminAuthToken(j.token);
          } else {
            setAdminAuthToken(`token-auditor-${crypto.randomUUID()}`);
          }
        } catch {
          setAdminAuthToken(`token-auditor-${crypto.randomUUID()}`);
        }
        onLoginSuccess({
          id: 'adm-vault-master',
          nama: 'Master Auditor Independen',
          username: 'secret-master',
          password: '***',
          jabatan: 'Master Pengawas AI & Blackbox',
          createdAt: '01 Okt 2026',
        });
        setUsername('');
        setPassword('');
        onClose();
        return;
      }
    } catch {
      // ignore
    }

    // 2. Verifikasi Akun Pengurus Biasa
    const matched = adminAccounts.find(
      (a) =>
        a.username.toLowerCase() === username.trim().toLowerCase() &&
        a.password === password
    );

    if (matched) {
      resetAdminLoginLockout();
      try {
        const rustRes = await fetch(`${RUST_API_BASE_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });
        if (rustRes.ok) {
          const j = await rustRes.json();
          if (j.token) setAdminAuthToken(j.token);
        } else {
          setAdminAuthToken(`token-${crypto.randomUUID()}`);
        }
      } catch {
        setAdminAuthToken(`token-${crypto.randomUUID()}`);
      }
      onLoginSuccess(matched);
      setUsername('');
      setPassword('');
      onClose();
    } else {
      const lockResult = recordAdminFailedAttempt();
      if (lockResult.isLocked) {
        setLockoutSecs(lockResult.remainingSeconds);
        setErrorMessage(
          'Akses login dibekukan selama 10 menit karena 5x salah memasukkan kata sandi. Silakan tunggu timer hitung mundur sebelum mencoba kembali.'
        );
      } else {
        const remaining = 5 - lockResult.failedAttempts;
        setErrorMessage(
          `Username atau kata sandi tidak cocok. Sisa kesempatan: ${remaining}x lagi sebelum akses dibekukan 10 menit.`
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#041E20]/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* WIDER 4XL MODAL SO NO TEXT WRAPS TOP-TO-BOTTOM */}
      <div className="relative w-full max-w-4xl flex flex-col bg-[#F7F5EE] dark:bg-[#07282B] rounded-3xl p-3 sm:p-4 shadow-2xl border-2 border-[#D9B352]/55 z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-[#092C2E] dark:text-stone-200 flex items-center justify-center shadow-xs z-30 transition-transform active:scale-90"
          title="Tutup Modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* LEFT PANEL: PESONA KAHURIPAN BRAND CARD (5 COL) */}
          <div className="hidden md:flex md:col-span-5 relative rounded-2xl overflow-hidden flex-col justify-between">
            <AdminOfficeIllustration className="w-full h-full" />
          </div>

          {/* RIGHT PANEL: LOGIN FORM PENGURUS PAGUYUBAN (7 COL) */}
          <div className="col-span-1 md:col-span-7 bg-white dark:bg-[#0B383B] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col justify-between border border-[#D9B352]/25">
            <div>
              {/* Top Badge Row */}
              <div className="flex items-center justify-between gap-2 pr-9 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#0B484C] dark:text-[#F3D37A] text-xs uppercase tracking-wider">
                    Portal Pengurus
                  </span>
                  <span className="text-xs text-stone-400 font-medium">
                    • Paguyuban PK8
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FEF6DF] rounded-full border border-[#D9B352]/45 text-[#9A7018] whitespace-nowrap">
                  <Lock className="w-3 h-3 text-[#9A7018]" />
                  <span className="text-[10px] font-bold">Resmi</span>
                </div>
              </div>

              {/* Single-Line Main Title */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#092C2E] dark:text-white tracking-tight leading-tight whitespace-nowrap mb-1">
                Login Pengurus Paguyuban
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-300 mb-5 leading-relaxed">
                Panel verifikasi iuran IPL, kas operasional, dan siskamling Pesona Kahuripan 8 Tahap 2.
              </p>

              {/* Error / Notice */}
              {errorMessage && (
                <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
              {successNotice && (
                <div className="mb-3.5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0B484C] text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              {/* Lockout Countdown Alert */}
              {lockoutSecs > 0 && (
                <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border-2 border-rose-300 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="font-black text-sm">Akses Login Dibekukan (5x Percobaan Salah)</p>
                    <p className="text-[11px] font-medium text-rose-700 dark:text-rose-300 mt-1">
                      Demi keamanan data warga, formulir dikunci sementara selama 10 menit.
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-900/80 font-mono font-black text-sm text-rose-900 dark:text-rose-100 border border-rose-300">
                      <Clock className="w-4 h-4 animate-spin text-rose-600" />
                      <span>
                        {Math.floor(lockoutSecs / 60)}:{String(lockoutSecs % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                    Username Pengurus
                  </label>
                  <input
                    type="text"
                    required
                    disabled={lockoutSecs > 0}
                    placeholder="Masukkan username (contoh: admin)"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full text-xs sm:text-sm font-semibold text-[#092C2E] dark:text-white bg-[#F8F8F6] dark:bg-stone-800/80 border-2 border-stone-300 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0B484C] focus:ring-2 focus:ring-[#D9B352]/40 placeholder:text-stone-400 transition-all ${
                      lockoutSecs > 0 ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 dark:text-stone-300 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      disabled={lockoutSecs > 0}
                      placeholder="Masukkan kata sandi"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full text-xs sm:text-sm font-semibold text-[#092C2E] dark:text-white bg-[#F8F8F6] dark:bg-stone-800/80 border-2 border-stone-300 dark:border-stone-700 rounded-xl pl-4 pr-11 py-3 focus:outline-none focus:border-[#0B484C] focus:ring-2 focus:ring-[#D9B352]/40 placeholder:text-stone-400 transition-all ${
                        lockoutSecs > 0 ? 'opacity-50 cursor-not-allowed bg-stone-100' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#0B484C] dark:hover:text-[#F3D37A] p-1"
                      title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={lockoutSecs > 0}
                  className={`w-full py-3 px-5 rounded-xl carlic-sage-btn text-[#F3D37A] font-extrabold text-xs sm:text-sm tracking-wide transition-all active:scale-98 mt-1 ${
                    lockoutSecs > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {lockoutSecs > 0 ? 'Akses Dibekukan Sementara' : 'Masuk ke Panel Pengurus'}
                </button>
              </form>
            </div>

            {/* Quick Login Bar (Single Line) */}
            <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800">
              <span>
                Pilih Akun Cepat (<strong className="text-[#092C2E] dark:text-stone-200">admin123</strong>):
              </span>
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setUsername('admin');
                    setPassword('admin123');
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F8F8F6] hover:bg-[#FEF6DF] dark:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] border border-[#D9B352]/40 transition-colors"
                >
                  Ketua Paguyuban
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('bendahara');
                    setPassword('admin123');
                  }}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#F8F8F6] hover:bg-[#FEF6DF] dark:bg-stone-800 text-[#0B484C] dark:text-[#F3D37A] border border-[#D9B352]/40 transition-colors"
                >
                  Bendahara
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
