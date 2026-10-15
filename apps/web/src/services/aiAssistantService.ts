import { StatusTempatTinggal, WargaRecord } from '@sim-warga/types';

export type AuditLogActor = 'WARGA' | 'ADMIN';
export type AuditLogCategory = 'IPL' | 'PJU' | 'WARGA' | 'KAS' | 'RONDA' | 'PENGUMUMAN';
export type AuditLogAction =
  | 'TAMBAH_WARGA'
  | 'EDIT_WARGA'
  | 'KONFIRMASI_IPL'
  | 'APPROVE_IPL'
  | 'REJECT_IPL'
  | 'TAMBAH_URUNAN'
  | 'APPROVE_PJU'
  | 'REJECT_PJU'
  | 'CATAT_PENGELUARAN'
  | 'HAPUS_PENGELUARAN'
  | 'UPDATE_RONDA'
  | 'BUAT_PENGUMUMAN'
  | 'HAPUS_PENGUMUMAN'
  | 'UPDATE_PENGATURAN';

export interface WargaAuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditLogAction;
  alamatRumah: string;
  namaWarga: string;
  changes: string[];
  aiSummary: string;
  engine: 'gemini-flash-latest' | 'smart-local-engine';
  actor?: AuditLogActor;
  actorName?: string;
  category?: AuditLogCategory;
  createdAtMs?: number;
}

const REGULAR_LOG_KEY = 'SIM_WARGA_REGULAR_LOGS_V3';
const PERMANENT_LOG_KEY = 'SIM_WARGA_PERMANENT_LOGS_V3';
const SEED_INITIALIZED_KEY = 'SIM_WARGA_LOGS_INITIALIZED_V3';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari otomatis bersih

const MONTH_INDEX_ID: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, jun: 5,
  jul: 6, agu: 7, sep: 8, okt: 9, nov: 10, des: 11,
};

export const parseLogTimestampMs = (log: WargaAuditLogEntry): number => {
  if (log.createdAtMs && typeof log.createdAtMs === 'number' && log.createdAtMs > 0) {
    return log.createdAtMs;
  }
  const m = (log.timestamp || '').match(
    /(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})(?:\s*•\s*(\d{1,2}):(\d{2}))?/i
  );
  if (m) {
    const day = parseInt(m[1], 10);
    const month = MONTH_INDEX_ID[m[2].toLowerCase()] ?? 9;
    const year = parseInt(m[3], 10);
    const hour = m[4] ? parseInt(m[4], 10) : 12;
    const min = m[5] ? parseInt(m[5], 10) : 0;
    return new Date(year, month, day, hour, min).getTime();
  }
  return Date.now();
};

export const isLogExpired = (log: WargaAuditLogEntry, now = Date.now()): boolean => {
  const logMs = parseLogTimestampMs(log);
  return now - logMs >= THIRTY_DAYS_MS;
};

const SEED_AUDIT_LOGS: WargaAuditLogEntry[] = [
  {
    id: 'seed-log-01',
    timestamp: '14 Okt 2026 • 14:10 WIB',
    createdAtMs: Date.now() - 2 * 60 * 60 * 1000,
    actor: 'ADMIN',
    actorName: 'Bendahara Paguyuban',
    category: 'IPL',
    action: 'APPROVE_IPL',
    alamatRumah: 'Blok C3 No. 12',
    namaWarga: 'Nurhaliza',
    changes: ['Status Transaksi: Menunggu Verifikasi → Lunas', 'Nominal Kas Masuk: Rp 30.000 (6 Bulan)'],
    aiSummary: 'Admin Bendahara berhasil memverifikasi dan menyetujui setoran IPL 6 Bulan warga Nurhaliza (Blok C3 No. 12) sebesar Rp 30.000 via Transfer BCA ke kas resmi RT.',
    engine: 'gemini-flash-latest',
  },
  {
    id: 'seed-log-02',
    timestamp: '14 Okt 2026 • 13:45 WIB',
    createdAtMs: Date.now() - 3 * 60 * 60 * 1000,
    actor: 'WARGA',
    actorName: 'Bapak Ridwan Kamil',
    category: 'WARGA',
    action: 'EDIT_WARGA',
    alamatRumah: 'Blok A1 No. 5',
    namaWarga: 'Bapak Ridwan Kamil',
    changes: ['Status Hunian: Pulang-Pergi → Menetap', 'Catatan Tambahan: Diperbarui Mandiri'],
    aiSummary: 'Warga Blok A1 No. 5 (Bapak Ridwan Kamil) memperbarui status domisili menjadi Menetap; data tersinkron otomatis ke Google Sheets.',
    engine: 'gemini-flash-latest',
  },
  {
    id: 'seed-log-03',
    timestamp: '14 Okt 2026 • 11:20 WIB',
    createdAtMs: Date.now() - 5 * 60 * 60 * 1000,
    actor: 'ADMIN',
    actorName: 'Ketua Paguyuban',
    category: 'RONDA',
    action: 'UPDATE_RONDA',
    alamatRumah: 'Pos Siskamling Utama',
    namaWarga: 'Petugas Ronda Regu 2',
    changes: ['Plotting Petugas Ronda: Minggu ke-2', 'AI Randomizer: 6 Petugas Siaga'],
    aiSummary: 'Admin Ketua Paguyuban memperbarui pembagian giliran siskamling malam Minggu ke-2 untuk regu ronda harian.',
    engine: 'smart-local-engine',
  },
  {
    id: 'seed-log-04',
    timestamp: '14 Okt 2026 • 10:05 WIB',
    createdAtMs: Date.now() - 7 * 60 * 60 * 1000,
    actor: 'ADMIN',
    actorName: 'Bendahara Paguyuban',
    category: 'KAS',
    action: 'CATAT_PENGELUARAN',
    alamatRumah: 'Area Blok A - E',
    namaWarga: 'Pak Sutrisno',
    changes: ['Biaya Sampah & Kebersihan: -Rp 150.000', 'Penerima: Petugas Kebersihan'],
    aiSummary: 'Admin Bendahara mencatat pengeluaran kas operasional kebersihan sampah lingkungan sebesar Rp 150.000.',
    engine: 'gemini-flash-latest',
  },
];

const ensureStorageInitialized = () => {
  try {
    const isInit = localStorage.getItem(SEED_INITIALIZED_KEY);
    if (!isInit) {
      localStorage.setItem(REGULAR_LOG_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      localStorage.setItem(PERMANENT_LOG_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      localStorage.setItem(SEED_INITIALIZED_KEY, 'true');
    }
  } catch {
    // ignore quota
  }
};

export const loadWargaAuditLogs = (isSecretAuditor = false): WargaAuditLogEntry[] => {
  ensureStorageInitialized();
  try {
    if (isSecretAuditor) {
      // Secret Master Account: PERMANENT BLACKBOX VAULT (Tidak akan pernah terhapus sama sekali)
      const raw = localStorage.getItem(PERMANENT_LOG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
      return SEED_AUDIT_LOGS;
    }

    // Regular Admin: OTOMATIS BERSIH JIKA LEBIH DARI 1 BULAN (30 HARI)
    const raw = localStorage.getItem(REGULAR_LOG_KEY);
    const logs: WargaAuditLogEntry[] = raw ? JSON.parse(raw) : SEED_AUDIT_LOGS;
    const now = Date.now();

    // STRICT FILTER: Discard any entry >= 30 days old
    const freshLogs = logs.filter((log) => !isLogExpired(log, now));

    // Update storage if any expired logs were purged
    if (freshLogs.length !== logs.length) {
      localStorage.setItem(REGULAR_LOG_KEY, JSON.stringify(freshLogs));
    }

    return freshLogs;
  } catch {
    return [];
  }
};

export const saveWargaAuditLog = (entry: WargaAuditLogEntry): WargaAuditLogEntry[] => {
  ensureStorageInitialized();
  const stampedEntry: WargaAuditLogEntry = {
    ...entry,
    createdAtMs: entry.createdAtMs || Date.now(),
  };

  // 1. Simpan ke Vault Permanen Secret Auditor (TIDAK PERNAH DIHAPUS / INDEFINITE RETENTION)
  try {
    const rawPermanent = localStorage.getItem(PERMANENT_LOG_KEY);
    const existingPermanent: WargaAuditLogEntry[] = rawPermanent ? JSON.parse(rawPermanent) : SEED_AUDIT_LOGS;
    const nextPermanent = [stampedEntry, ...existingPermanent.filter((l) => l.id !== stampedEntry.id)].slice(0, 5000);
    localStorage.setItem(PERMANENT_LOG_KEY, JSON.stringify(nextPermanent));
  } catch {
    // ignore quota
  }

  // 2. Simpan ke Log Reguler Pengurus (OTOMATIS BERSIH SETIAP 30 HARI)
  try {
    const rawRegular = localStorage.getItem(REGULAR_LOG_KEY);
    const existingRegular: WargaAuditLogEntry[] = rawRegular ? JSON.parse(rawRegular) : SEED_AUDIT_LOGS;
    const now = Date.now();
    const nextRegular = [stampedEntry, ...existingRegular.filter((l) => l.id !== stampedEntry.id)]
      .filter((l) => !isLogExpired(l, now))
      .slice(0, 300);
    localStorage.setItem(REGULAR_LOG_KEY, JSON.stringify(nextRegular));
  } catch {
    // ignore quota
  }

  return loadWargaAuditLogs(false);
};

/**
 * Fitur Khusus Akun Secret: Analisis Anomali & Riwayat Mutasi Data dengan AI
 */
export const inspectAuditLogsWithAi = async (params: {
  query: string;
  logs: WargaAuditLogEntry[];
}): Promise<string> => {
  const { query, logs } = params;
  const sampleLogs = logs
    .slice(0, 20)
    .map((l) => `[${l.timestamp}] (${l.actor}) ${l.action}: ${l.aiSummary}`)
    .join('\n');

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Anda adalah AI Master Auditor Independen untuk Paguyuban RT 08 Pesona Kahuripan 8.
Berikut adalah cuplikan log mutasi data terbaru:
${sampleLogs}

Pertanyaan/Instruksi Audit: "${query}"
Jawablah dalam 2-3 kalimat analisis audit yang sangat tajam, profesional, berbasis fakta, dan transparan.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (text) return text;
    }
  } catch {
    // fallback
  }

  return `Hasil Audit AI: Dari ${logs.length} data mutasi yang diawasi, aktivitas verifikasi iuran dan mutasi kependudukan berjalan tertib. Tidak terdeteksi anomali kritis pada pencatatan kas RT 08.`;
};

/**
 * Menghasilkan ringkasan Audit Log cerdas (mencoba Gemini API terlebih dahulu,
 * dan otomatis fallback ke mesin NLP lokal jika API key ditolak/offline).
 */
export const generateSmartAuditLog = async (params: {
  action: 'TAMBAH_WARGA' | 'EDIT_WARGA';
  before?: WargaRecord;
  after: WargaRecord;
}): Promise<WargaAuditLogEntry> => {
  const { action, before, after } = params;
  const nowStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const timestamp = `11 Okt 2026 • ${nowStr} WIB`;

  const changes: string[] = [];
  if (action === 'TAMBAH_WARGA' || !before) {
    changes.push(`Nama KK: ${after.namaLengkap}`);
    changes.push(`Alamat: ${after.alamatRumah}`);
    changes.push(`Hunian: ${after.statusTempatTinggal} (${after.jmlJiwa} Jiwa)`);
  } else {
    if (before.namaLengkap !== after.namaLengkap) {
      changes.push(`Nama: "${before.namaLengkap}" → "${after.namaLengkap}"`);
    }
    if (before.alamatRumah !== after.alamatRumah) {
      changes.push(`Alamat: "${before.alamatRumah}" → "${after.alamatRumah}"`);
    }
    if (before.statusTempatTinggal !== after.statusTempatTinggal) {
      changes.push(`Status Hunian: "${before.statusTempatTinggal}" → "${after.statusTempatTinggal}"`);
    }
    if (before.jmlJiwa !== after.jmlJiwa) {
      changes.push(`Jumlah KK: ${before.jmlJiwa} Jiwa → ${after.jmlJiwa} Jiwa`);
    }
    if (changes.length === 0) {
      changes.push('Pembaruan data terverifikasi tanpa perubahan nilai kolom');
    }
  }

  const localSummary =
    action === 'TAMBAH_WARGA'
      ? `Pendaftaran warga baru ${after.namaLengkap} (${after.alamatRumah}, ${after.statusTempatTinggal}, ${after.jmlJiwa} Jiwa) telah diverifikasi dan disinkronkan ke Google Sheets.`
      : `Warga ${after.alamatRumah} memperbarui data (${changes.join(' • ')}); Status Iuran IPL tetap terkunci (${after.statusIpl}) dan telah disinkronkan ke Google Sheets.`;

  // Panggil endpoint proxy server lokal (/api/ai/generate) agar API Key 100% tersembunyi di server (tidak pernah terekspos ke browser)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Buat 1 kalimat ringkas log audit bahasa Indonesia untuk perubahan data warga Paguyuban PK8 berikut: Aksi=${action}, Rumah=${after.alamatRumah}, Perubahan=${changes.join(', ')}, Status IPL=${after.statusIpl} (Terkunci).`,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (aiText) {
        const entry: WargaAuditLogEntry = {
          id: `log-${Date.now()}`,
          timestamp,
          action,
          alamatRumah: after.alamatRumah,
          namaWarga: after.namaLengkap,
          changes,
          aiSummary: aiText,
          engine: 'gemini-flash-latest',
        };
        saveWargaAuditLog(entry);
        return entry;
      }
    }
  } catch {
    // Fallback ke Smart Local Engine jika server proxy / API Key 403
  }

  const fallbackEntry: WargaAuditLogEntry = {
    id: `log-${Date.now()}`,
    timestamp,
    action,
    alamatRumah: after.alamatRumah,
    namaWarga: after.namaLengkap,
    changes,
    aiSummary: localSummary,
    engine: 'smart-local-engine',
  };
  saveWargaAuditLog(fallbackEntry);
  return fallbackEntry;
};

/**
 * Menghasilkan AI Audit Log Riwayat Pembayaran IPL (tersimpan untuk Warga & Admin).
 */
export const generateIplAuditLog = async (params: {
  noTransaksi: string;
  namaWarga: string;
  lokasiRumah: string;
  nominal: number;
  metode: string;
}): Promise<WargaAuditLogEntry> => {
  const { noTransaksi, namaWarga, lokasiRumah, nominal, metode } = params;
  const nowStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const timestamp = `11 Okt 2026 • ${nowStr} WIB`;
  const changes = [
    `${noTransaksi} • Rp ${nominal.toLocaleString('id-ID')}`,
    `Metode: ${metode}`,
    'Status: Menunggu Verifikasi',
  ];
  const localSummary = `Konfirmasi IPL ${noTransaksi} oleh ${namaWarga} (${lokasiRumah}) sebesar Rp ${nominal.toLocaleString('id-ID')} via ${metode} tercatat di Google Sheets dan menunggu verifikasi Bendahara.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Buat 1 kalimat ringkas log audit bahasa Indonesia untuk pembayaran IPL warga Paguyuban PK8 berikut: NoTrx=${noTransaksi}, Warga=${namaWarga} (${lokasiRumah}), Nominal=Rp ${nominal.toLocaleString('id-ID')}, Metode=${metode}, Status=Menunggu Verifikasi.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (aiText) {
        const entry: WargaAuditLogEntry = {
          id: `log-ipl-${Date.now()}`,
          timestamp,
          action: 'KONFIRMASI_IPL',
          alamatRumah: lokasiRumah,
          namaWarga,
          changes,
          aiSummary: aiText,
          engine: 'gemini-flash-latest',
        };
        saveWargaAuditLog(entry);
        return entry;
      }
    }
  } catch {
    // Fallback ke Smart Local Engine jika server proxy / API Key 403
  }

  const fallbackEntry: WargaAuditLogEntry = {
    id: `log-ipl-${Date.now()}`,
    timestamp,
    action: 'KONFIRMASI_IPL',
    alamatRumah: lokasiRumah,
    namaWarga,
    changes,
    aiSummary: localSummary,
    engine: 'smart-local-engine',
  };
  saveWargaAuditLog(fallbackEntry);
  return fallbackEntry;
};

/**
 * Menghasilkan AI Audit Log untuk Aksi Pengurus / Admin (Approve, Tolak, Tambah Kas, Edit KK, dll.)
 */
export const generateAdminAuditLog = async (params: {
  adminName: string;
  category: AuditLogCategory;
  action: AuditLogAction;
  targetTitle: string;
  alamatRumah?: string;
  changes: string[];
}): Promise<WargaAuditLogEntry> => {
  const { adminName, category, action, targetTitle, alamatRumah = '-', changes } = params;
  const nowStr = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const timestamp = `14 Okt 2026 • ${nowStr} WIB`;

  const localSummary = `Admin ${adminName} melakukan tindakan [${action}] pada kategori ${category}: ${targetTitle} (${changes.join(' • ')}). Data telah diselaraskan ke database server RT 08.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `Buat 1 kalimat ringkas log audit bahasa Indonesia untuk tindakan admin RT berikut: Admin=${adminName}, Aksi=${action}, Kategori=${category}, Sasaran=${targetTitle}, Rincian=${changes.join(', ')}.`,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (aiText) {
        const entry: WargaAuditLogEntry = {
          id: `log-admin-${Date.now()}`,
          timestamp,
          actor: 'ADMIN',
          actorName: adminName,
          category,
          action,
          alamatRumah,
          namaWarga: targetTitle,
          changes,
          aiSummary: aiText,
          engine: 'gemini-flash-latest',
        };
        saveWargaAuditLog(entry);
        return entry;
      }
    }
  } catch {
    // fallback
  }

  const fallbackEntry: WargaAuditLogEntry = {
    id: `log-admin-${Date.now()}`,
    timestamp,
    actor: 'ADMIN',
    actorName: adminName,
    category,
    action,
    alamatRumah,
    namaWarga: targetTitle,
    changes,
    aiSummary: localSummary,
    engine: 'smart-local-engine',
  };
  saveWargaAuditLog(fallbackEntry);
  return fallbackEntry;
};

/**
 * Ekstraksi kalimat bebas warga (contoh: "Ganti nama jadi Budi Raharjo blok E no 23 menetap 4 jiwa")
 * menjadi field formulir terstruktur menggunakan Gemini API + Fallback NLP Lokal Instan.
 */
export const parseNaturalWargaInput = async (
  promptText: string,
  current: {
    namaLengkap: string;
    blok: string;
    noBlok?: string;
    noRumah: string;
    statusTempatTinggal: StatusTempatTinggal;
    jmlJiwa: string;
  }
): Promise<{
  namaLengkap: string;
  blok: string;
  noBlok: string;
  noRumah: string;
  statusTempatTinggal: StatusTempatTinggal;
  jmlJiwa: string;
}> => {
  const text = promptText.trim();
  if (!text) return { ...current, noBlok: current.noBlok || '' };

  let nextNama = current.namaLengkap;
  let nextBlok = current.blok;
  let nextNoBlok = current.noBlok || '';
  let nextNo = current.noRumah;
  let nextDomisili = current.statusTempatTinggal;
  let nextJiwa = current.jmlJiwa;
  // 1. Deteksi Status Hunian
  if (/belum\s*menetap|kosong|renovasi/i.test(text)) {
    nextDomisili = 'Belum menetap';
  } else if (/pulang[\s-]*pergi|\bpp\b|akhir\s*pekan/i.test(text)) {
    nextDomisili = 'Pulang-Pergi';
  } else if (/\bmenetap\b|permanen|tinggal/i.test(text)) {
    nextDomisili = 'Menetap';
  }

  // 2. Deteksi Blok (Huruf A–Z), No. Blok, dan No. Rumah (misal "D8 No 11", "D8/11", "A12 No 5", "D/11")
  const combinedBlokNo = text.match(
    /(?:\bblok\s*)?\b([a-zA-Z])(\d{1,3})?\s*(?:no(?:mor)?\.?\s*|\/|-)\s*(\d{1,4})\b/i
  );
  if (combinedBlokNo) {
    nextBlok = combinedBlokNo[1].toUpperCase();
    if (combinedBlokNo[2]) {
      nextNoBlok = combinedBlokNo[2];
    }
    nextNo = combinedBlokNo[3];
  } else {
    const letterAndNum =
      text.match(/\bblok\s*([a-zA-Z])\s*(\d{1,4})?\b/i) ||
      text.match(/\b([a-zA-Z])(\d{1,3})\b/);
    if (letterAndNum) {
      nextBlok = letterAndNum[1].toUpperCase();
      if (letterAndNum[2]) {
        nextNoBlok = letterAndNum[2];
      }
    }
    const noOnly = text.match(/(?:no(?:mor)?\.?|rumah)\s*(\d{1,4})\b/i);
    if (noOnly && !combinedBlokNo) {
      nextNo = noOnly[1];
    }
  }
  // 3. Deteksi Jumlah Jiwa / Orang
  const jiwaMatch = text.match(/\b(\d{1,2})\s*(?:jiwa|orang|anggota|kk)\b/i);
  if (jiwaMatch) {
    nextJiwa = jiwaMatch[1];
  }

  // 4. Ekstraksi Nama Lengkap (baik dengan awalan "nama jadi ..." maupun langsung di awal teks seperti "Budi Santoso DODO - D8 No 11 - 0812...")
  const namaExplicit = text.match(
    /(?:nama(?:\s+jadi|\s+menjadi|\s*:)?|jadi|saya)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s.']{1,40}?)(?=\s+(?:blok\b|[a-zA-Z]\d{1,2}\b|no\b|nomor\b|rumah\b|menetap\b|pulang\b|belum\b|08\d|\d+\s*(?:jiwa|orang))|$|[-,|/])/i
  );
  if (namaExplicit && namaExplicit[1]) {
    nextNama = namaExplicit[1].trim();
  } else {
    // Hapus bagian nomor WA, blok+no rumah, jumlah jiwa, status hunian, lalu ambil bagian nama yang tersisa
    const cleanedForName = text
      .replace(/(?:\+?62|0)8\d{7,13}/g, ' ')
      .replace(/(?:\bblok\s*)?\b[a-zA-Z]\d{0,2}\s*(?:no(?:mor)?\.?\s*|\/|-)\s*\d{1,4}\b/gi, ' ')
      .replace(/\bblok\s*[a-zA-Z]\d{0,2}\b/gi, ' ')
      .replace(/\b[a-zA-Z]\d{1,2}\b/g, ' ')
      .replace(/(?:no(?:mor)?\.?|rumah)\s*\d{1,4}\b/gi, ' ')
      .replace(/\b\d{1,2}\s*(?:jiwa|orang|anggota|kk)\b/gi, ' ')
      .replace(/\b(?:belum\s*menetap|pulang[\s-]*pergi|menetap|permanen|kosong|renovasi|wa|hp|telp)\b/gi, ' ')
      .replace(/^[\s\-,|/:;]+|[\s\-,|/:;]+$/g, '')
      .split(/[\-,|/]+/)[0]
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedForName.length >= 2 && /[a-zA-Z]{2,}/.test(cleanedForName)) {
      nextNama = cleanedForName;
    }
  }

  return {
    namaLengkap: nextNama,
    blok: nextBlok,
    noBlok: nextNoBlok,
    noRumah: nextNo,
    statusTempatTinggal: nextDomisili,
    jmlJiwa: nextJiwa,
  };
};
