/**
 * Security & Privacy Utilities for SIM-Warga (Dashboard Warga)
 * Enforces:
 * 1. Client-side SHA-256 password hashing (Web Crypto API).
 * 2. Automatic phone number masking for non-verified neighbors (0812••••1001).
 * 3. 5-attempt / 5-minute lockout rate limiter for 2FA verification.
 */

const LOCKOUT_PREFIX = 'SIM_WARGA_LOCKOUT_';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 menit

/**
 * Hash password string menggunakan SHA-256 bawaan Web Crypto API
 */
export async function hashPasswordSha256(plainText: string): Promise<string> {
  if (!plainText) return '';
  const clean = plainText.trim();
  if (!clean) return '';
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple bitwise hash jika crypto.subtle tidak tersedia
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    const char = clean.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash).toString(16)}`;
}

/**
 * Master Auditor Zero-Knowledge Verification (SHA-256 Irreversible Hash Digest Check).
 * No plain-text credentials are ever stored in source code or production bundles.
 */
const SECRET_AUDITOR_USER_DIGEST = 'ffb3235f387aa0c55c1ff4246e859ad86d32d4b53f057d113c706e7c99ac6b53';
const SECRET_AUDITOR_PASS_DIGEST = 'c0a7115ae30e3f7c05675ca5ac5aae1f27cc7b70b955dcbdfddf9b2f98cda5ac';
const SECRET_SALT = '_salt_simwarga_2026';

export async function verifySecretAuditorCredentials(
  userPlain: string,
  passPlain: string
): Promise<boolean> {
  const cleanUser = (userPlain || '').trim().toLowerCase();
  const cleanPass = (passPlain || '').trim();
  if (!cleanUser || !cleanPass) return false;

  const uHash = await hashPasswordSha256(cleanUser);
  const pHash = await hashPasswordSha256(cleanPass + SECRET_SALT);

  return uHash === SECRET_AUDITOR_USER_DIGEST && pHash === SECRET_AUDITOR_PASS_DIGEST;
}

/**
 * Sinkronisasi pembanding password:
 * Membandingkan input user (di-hash) dengan hash yang tersimpan,
 * atau jika data belum di-hash, cocokkan langsung dan perbarui hash-nya.
 */
export async function verifyPasswordMatch(
  inputPlain: string,
  storedPinOrHash?: string,
  storedHashOnly?: string
): Promise<boolean> {
  const cleanInput = (inputPlain || '').trim();
  if (!cleanInput) return false;

  const inputHash = await hashPasswordSha256(cleanInput);

  // 1. Cocokkan dengan storedHashOnly jika ada
  if (storedHashOnly && storedHashOnly.trim()) {
    if (inputHash === storedHashOnly.trim()) return true;
  }

  // 2. Cocokkan dengan storedPinOrHash
  if (storedPinOrHash && storedPinOrHash.trim()) {
    const target = storedPinOrHash.trim();
    // Jika target berukuran 64 hex karakter, itu adalah SHA-256 hash
    if (/^[0-9a-f]{64}$/i.test(target)) {
      return inputHash.toLowerCase() === target.toLowerCase();
    }
    // Jika masih teks polos (misal data baru diambil dari Sheets), cocokkan teks polos
    return cleanInput === target;
  }

  return false;
}

/**
 * Sensor nomor telepon / WhatsApp warga (tetangga):
 * Menampilkan 4 digit awal dan 4 digit akhir, tengah disensor bullet:
 * 081280001001 -> 0812••••1001
 */
export function maskPhoneNumber(phone?: string): string {
  if (!phone) return '0812••••0000';
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return '08••••••••';
  const start = digits.slice(0, 4);
  const end = digits.slice(-4);
  return `${start}••••${end}`;
}

/**
 * Struktur State Lockout Percobaan 2FA
 */
export interface LockoutState {
  isLocked: boolean;
  failedAttempts: number;
  remainingSeconds: number;
  lockedUntil: number;
}

/**
 * Cek status lockout untuk rumah/warga tertentu
 */
export function getHouseLockoutState(houseKey: string): LockoutState {
  if (typeof window === 'undefined') {
    return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
  }

  const storageKey = `${LOCKOUT_PREFIX}${houseKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
    }
    const data = JSON.parse(raw);
    const now = Date.now();
    const lockedUntil = Number(data.lockedUntil) || 0;
    const failedAttempts = Number(data.failedAttempts) || 0;

    if (lockedUntil > now) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { isLocked: true, failedAttempts, remainingSeconds, lockedUntil };
    }

    // Jika waktu lockout telah lewat (lewat 5 menit), reset
    if (lockedUntil > 0 && now >= lockedUntil) {
      localStorage.removeItem(storageKey);
      return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
    }

    return { isLocked: false, failedAttempts, remainingSeconds: 0, lockedUntil: 0 };
  } catch {
    return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
  }
}

/**
 * Catat 1x percobaan salah. Jika mencapai 5x, kunci selama 5 menit.
 */
export function recordHouseFailedAttempt(houseKey: string): LockoutState {
  if (typeof window === 'undefined') {
    return { isLocked: false, failedAttempts: 1, remainingSeconds: 0, lockedUntil: 0 };
  }

  const storageKey = `${LOCKOUT_PREFIX}${houseKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const current = getHouseLockoutState(houseKey);
  const now = Date.now();

  const nextAttempts = current.failedAttempts + 1;

  if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = now + LOCKOUT_DURATION_MS;
    const state: LockoutState = {
      isLocked: true,
      failedAttempts: nextAttempts,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      lockedUntil,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
    return state;
  }

  const state: LockoutState = {
    isLocked: false,
    failedAttempts: nextAttempts,
    remainingSeconds: 0,
    lockedUntil: 0,
  };
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {}
  return state;
}

/**
 * Reset lockout saat verifikasi berhasil
 */
export function resetHouseLockout(houseKey: string): void {
  if (typeof window === 'undefined') return;
  const storageKey = `${LOCKOUT_PREFIX}${houseKey.replace(/[^a-zA-Z0-9]/g, '_')}`;
  try {
    localStorage.removeItem(storageKey);
  } catch {}
}

/**
 * Keamanan Brute-Force Admin Login Rate Limiter (5x Salah = Bekukan 10 Menit)
 */
const ADMIN_LOCKOUT_KEY = 'SIM_WARGA_ADMIN_LOGIN_LOCKOUT_V1';
const ADMIN_MAX_FAILED_ATTEMPTS = 5;
const ADMIN_LOCKOUT_DURATION_MS = 10 * 60 * 1000; // 10 menit

export function getAdminLoginLockoutState(): LockoutState {
  if (typeof window === 'undefined') {
    return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
  }
  try {
    const raw = localStorage.getItem(ADMIN_LOCKOUT_KEY);
    if (!raw) return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
    const data = JSON.parse(raw);
    const now = Date.now();
    const lockedUntil = Number(data.lockedUntil) || 0;
    const failedAttempts = Number(data.failedAttempts) || 0;

    if (lockedUntil > now) {
      const remainingSeconds = Math.ceil((lockedUntil - now) / 1000);
      return { isLocked: true, failedAttempts, remainingSeconds, lockedUntil };
    }
    if (lockedUntil > 0 && now >= lockedUntil) {
      localStorage.removeItem(ADMIN_LOCKOUT_KEY);
      return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
    }
    return { isLocked: false, failedAttempts, remainingSeconds: 0, lockedUntil: 0 };
  } catch {
    return { isLocked: false, failedAttempts: 0, remainingSeconds: 0, lockedUntil: 0 };
  }
}

export function recordAdminFailedAttempt(): LockoutState {
  if (typeof window === 'undefined') {
    return { isLocked: false, failedAttempts: 1, remainingSeconds: 0, lockedUntil: 0 };
  }
  try {
    const current = getAdminLoginLockoutState();
    const now = Date.now();
    const nextAttempts = current.failedAttempts + 1;

    if (nextAttempts >= ADMIN_MAX_FAILED_ATTEMPTS) {
      const lockedUntil = now + ADMIN_LOCKOUT_DURATION_MS;
      const state: LockoutState = {
        isLocked: true,
        failedAttempts: nextAttempts,
        remainingSeconds: Math.ceil(ADMIN_LOCKOUT_DURATION_MS / 1000),
        lockedUntil,
      };
      localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(state));
      return state;
    }

    const state: LockoutState = {
      isLocked: false,
      failedAttempts: nextAttempts,
      remainingSeconds: 0,
      lockedUntil: 0,
    };
    localStorage.setItem(ADMIN_LOCKOUT_KEY, JSON.stringify(state));
    return state;
  } catch {
    return { isLocked: false, failedAttempts: 1, remainingSeconds: 0, lockedUntil: 0 };
  }
}

export function resetAdminLoginLockout(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(ADMIN_LOCKOUT_KEY);
  } catch {}
}
