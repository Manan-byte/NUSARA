/**
 * Service penghubung ke Google Sheets & Google Apps Script Web App API
 * Spreadsheet ID: 1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0
 */

import { WargaRecord, TransaksiIPL, PengeluaranKasRecord, ItemUrunanWarga } from '@sim-warga/types';

export const DEFAULT_SPREADSHEET_ID = '1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0';

export function getSpreadsheetId(): string {
  const localId = localStorage.getItem('SIM_WARGA_SPREADSHEET_ID');
  if (localId && localId.trim().length > 0) {
    return localId.trim();
  }
  return DEFAULT_SPREADSHEET_ID;
}

export function setSpreadsheetId(id: string): void {
  localStorage.setItem('SIM_WARGA_SPREADSHEET_ID', id.trim());
}

export const SPREADSHEET_ID = DEFAULT_SPREADSHEET_ID;

const DEFAULT_GAS_URL =
  'https://script.google.com/macros/s/AKfycbw9v-Ihioux0HFuvq_CV-b1OkUSZ53IDUZBPJnE2ej21abxj_pKgSMbiSmPeko9zYmY/exec';

export function getGasApiUrl(): string {
  if (typeof window !== 'undefined') {
    const localUrl = localStorage.getItem('SIM_WARGA_GAS_URL');
    if (localUrl && localUrl.trim().length > 0) {
      return localUrl.trim();
    }
  }
  const envUrl = import.meta.env.VITE_GAS_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return DEFAULT_GAS_URL;
}

export function setGasApiUrl(url: string): void {
  localStorage.setItem('SIM_WARGA_GAS_URL', url.trim());
}
export const RUST_API_BASE_URL =
  import.meta.env.VITE_RUST_API_URL || 'http://localhost:3001';

export const ADMIN_AUTH_TOKEN_KEY = 'SIM_WARGA_ADMIN_AUTH_TOKEN';

export function getAdminAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return sessionStorage.getItem(ADMIN_AUTH_TOKEN_KEY) || '';
}

export function setAdminAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ADMIN_AUTH_TOKEN_KEY, token.trim());
}

export function clearAdminAuthToken(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
  localStorage.removeItem(ADMIN_AUTH_TOKEN_KEY);
}

export async function mutateRustApi<T = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body?: unknown
): Promise<{ success: boolean; data?: T; message?: string }> {
  try {
    const token = getAdminAuthToken();
    const res = await fetch(`${RUST_API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await res.json();
    return {
      success: res.ok,
      data: json.data,
      message: json.message,
    };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Koneksi ke backend Rust gagal.',
    };
  }
}
export async function fetchLiveFromRust(): Promise<LiveSheetData | null> {
  try {
    const [wargaRes, iplRes, expRes, urunanRes] = await Promise.all([
      fetch(`${RUST_API_BASE_URL}/api/warga`),
      fetch(`${RUST_API_BASE_URL}/api/ipl`),
      fetch(`${RUST_API_BASE_URL}/api/pengeluaran`),
      fetch(`${RUST_API_BASE_URL}/api/urunan`),
    ]);

    if (!wargaRes.ok || !iplRes.ok || !expRes.ok || !urunanRes.ok) {
      return null;
    }

    const [wargaList, transaksiList, pengeluaranList, urunanList] = await Promise.all([
      wargaRes.json(),
      iplRes.json(),
      expRes.json(),
      urunanRes.json(),
    ]);

    return {
      wargaList,
      transaksiList,
      pengeluaranList,
      urunanList,
    };
  } catch {
    return null;
  }
}

/**
 * Mengirim data ke Google Apps Script Web App
 */
export async function postToGas<T = unknown>(
  payload: Record<string, unknown>
): Promise<T | null> {
  const apiUrl = getGasApiUrl();
  if (apiUrl.length === 0) {
    console.warn('GAS API URL belum dikonfigurasi.');
    return null;
  }

  // 1. Kirim melalui Server Proxy (/api/sheets/sync) agar redirect Google Apps Script ditunggu sampai benar-benar selesai menulis ke Google Sheets
  try {
    const proxyRes = await fetch('/api/sheets/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetGasUrl: apiUrl,
        payload,
      }),
    });
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return data as T;
    }
  } catch {
    // Lanjut ke fallback direct fetch jika berjalan di static hosting tanpa proxy
  }

  // 2. Fallback direct POST ke Google Apps Script
  try {
    await fetch(apiUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return { success: true } as T;
  } catch (e) {
    console.warn('Gagal posting ke GAS API:', e);
    return null;
  }
}

/**
 * Mengambil data live real-time langsung dari Google Sheets via GViz API (Tanpa CORS, Cepat & Akurat)
 */
async function fetchGvizTable(sheetName: string): Promise<Record<string, unknown>[][]> {
  const currentSheetId = getSpreadsheetId();
  const url = `https://docs.google.com/spreadsheets/d/${currentSheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const match = text.match(/setResponse\((.*)\);/s);
    if (!match || !match[1]) return [];
    const data = JSON.parse(match[1]);
    const rows = data?.table?.rows || [];
    return rows.map((r: { c: Array<{ v?: unknown; f?: string } | null> }) => {
      return (r.c || []).map((cell) => (cell && cell.v !== undefined && cell.v !== null ? cell.v : ''));
    });
  } catch (err) {
    console.warn(`Gagal membaca tab ${sheetName} dari Google Sheets:`, err);
    return [];
  }
}

export interface LiveSheetData {
  wargaList: WargaRecord[];
  transaksiList: TransaksiIPL[];
  pengeluaranList: PengeluaranKasRecord[];
  urunanList: ItemUrunanWarga[];
}

export async function fetchLiveSheetData(): Promise<LiveSheetData | null> {
  try {
    // 1. PRIORITAS UTAMA: Ambil langsung dari Google Sheets GViz API (Real-Time Source of Truth)
    const [wargaRows, iplRows, expRows, urunanRows] = await Promise.all([
      fetchGvizTable('DATA_WARGA'),
      fetchGvizTable('PEMBAYARAN_IPL'),
      fetchGvizTable('PENGELUARAN_KAS'),
      fetchGvizTable('URUNAN_PJU'),
    ]);

    // Fallback ke Backend Rust lokal hanya jika Google Sheets sedang tidak terjangkau / offline
    if (wargaRows.length === 0) {
      const rustData = await fetchLiveFromRust();
      if (rustData && rustData.wargaList.length > 0) {
        return rustData;
      }
      return null;
    }

    // Filter header rows
    const cleanWargaRows = wargaRows.filter((vals) => {
      const v0 = String(vals[0] || '').trim().toLowerCase();
      const v1 = String(vals[1] || '').trim().toLowerCase();
      return v0 !== 'no.' && v1 !== 'nama lengkap' && v1 !== 'id warga' && v1.length > 0;
    });

    const cleanIplRows = iplRows.filter((vals) => {
      const v0 = String(vals[0] || '').trim().toLowerCase();
      const v1 = String(vals[1] || '').trim().toLowerCase();
      return v0 !== 'no.' && v1 !== 'no. transaksi' && v1.length > 0;
    });

    const cleanExpRows = expRows.filter((vals) => {
      const v0 = String(vals[0] || '').trim().toLowerCase();
      const v1 = String(vals[1] || '').trim().toLowerCase();
      return v0 !== 'no.' && v1 !== 'id pengeluaran' && v1.length > 0;
    });

    const cleanUrunanRows = urunanRows.filter((vals) => {
      const v0 = String(vals[0] || '').trim().toLowerCase();
      const v1 = String(vals[1] || '').trim().toLowerCase();
      const v2 = String(vals[2] || '').trim().toLowerCase();
      const v3 = String(vals[3] || '').trim().toLowerCase();
      // Cegah fallback Google GViz ke tab DATA_WARGA jika tab URUNAN_PJU belum ada di Spreadsheet
      if (v2 === 'laki-laki' || v2 === 'perempuan' || v2 === 'jenis kelamin' || v3 === 'laki-laki' || v3 === 'perempuan') {
        return false;
      }
      return v0 !== 'no.' && v1 !== 'nama warga / donatur' && v1 !== 'id transaksi pju' && v2 !== 'kategori setoran' && v1.length > 0;
    });
    // 1. Parsing DATA_WARGA (Auto-detect apakah Kolom B adalah ID Warga atau Nama Langsung)
    const wargaList: WargaRecord[] = cleanWargaRows.map((vals, idx) => {
      const val1 = String(vals[1] || '').trim();
      const isCol1Id = /^#?WRG-\d+$/i.test(val1);
      const rawNama = isCol1Id ? String(vals[2] || '').trim() : val1 || '-';
      const bracketMatch = rawNama.match(/^\[(#?WRG-\d+)\]\s*(.*)$/i);
      const nama = bracketMatch ? bracketMatch[2].trim() : rawNama;
      const jenisKelamin = isCol1Id
        ? (String(vals[3] || '').trim().toLowerCase().includes('perem') ? 'Perempuan' : 'Laki-laki')
        : (String(vals[2] || '').trim().toLowerCase().includes('perem') ? 'Perempuan' : 'Laki-laki');
      const blok = isCol1Id ? String(vals[4] || 'E').trim().toUpperCase() : String(vals[3] || 'E').trim().toUpperCase();
      const noRumah = isCol1Id
        ? (typeof vals[5] === 'number' ? String(Math.round(vals[5])) : String(vals[5] || '1').trim())
        : (typeof vals[4] === 'number' ? String(Math.round(vals[4])) : String(vals[4] || '1').trim());
      const alamatRumah = isCol1Id ? String(vals[6] || `Blok ${blok} No. ${noRumah}`).trim() : String(vals[5] || `Blok ${blok} No. ${noRumah}`).trim();
      let rawWa = isCol1Id ? String(vals[7] || '').trim() : String(vals[6] || '').trim();
      if (rawWa.startsWith("'")) rawWa = rawWa.slice(1);
      const waDigits = rawWa.replace(/\D/g, '');
      let noWa = rawWa;
      if (waDigits.startsWith('628')) {
        noWa = '08' + waDigits.slice(3);
      } else if (waDigits.startsWith('8')) {
        noWa = '0' + waDigits;
      } else if (waDigits.startsWith('08')) {
        noWa = waDigits;
      }
      const statusTempat = isCol1Id ? String(vals[8] || 'Menetap').trim() : String(vals[7] || 'Menetap').trim();
      const pekerjaan = isCol1Id ? String(vals[9] || '-').trim() : String(vals[8] || '-').trim();
      const agama = isCol1Id ? String(vals[10] || 'Islam').trim() : String(vals[9] || 'Islam').trim();
      const statusNikah = isCol1Id ? String(vals[11] || 'Menikah').trim() : String(vals[10] || 'Menikah').trim();
      const statusKeluarga = isCol1Id ? String(vals[12] || 'Kepala Keluarga').trim() : String(vals[11] || 'Kepala Keluarga').trim();
      const jmlJiwa = isCol1Id
        ? (typeof vals[13] === 'number' ? Math.round(vals[13]) : parseInt(String(vals[13]), 10) || 1)
        : (typeof vals[12] === 'number' ? Math.round(vals[12]) : parseInt(String(vals[12]), 10) || 1);
      const anggotaStr = isCol1Id ? String(vals[14] || '-').trim() : String(vals[13] || '-').trim();
      const statusIplRaw = isCol1Id ? String(vals[15] || 'Belum Bayar').trim() : String(vals[14] || 'Belum Bayar').trim();
      const statusIpl = statusIplRaw.includes('Lunas')
        ? 'Lunas'
        : statusIplRaw.includes('Menunggu')
        ? 'Menunggu Verifikasi'
        : 'Belum Bayar';

      const periode = isCol1Id ? String(vals[16] || 'Oktober 2026').trim() : String(vals[15] || 'Oktober 2026').trim();
      const nominal = isCol1Id
        ? (typeof vals[17] === 'number' ? Math.round(vals[17]) : parseInt(String(vals[17] || '').replace(/\D/g, ''), 10) || 30000)
        : (typeof vals[16] === 'number' ? Math.round(vals[16]) : parseInt(String(vals[16] || '').replace(/\D/g, ''), 10) || 30000);
      const tanggalUpdate = isCol1Id ? String(vals[18] || '-').trim() : String(vals[17] || '-').trim();
      const catatan = isCol1Id ? String(vals[19] || '-').trim() : String(vals[18] || '-').trim();
      let pin = isCol1Id ? String(vals[20] || '').trim() : String(vals[19] || '').trim();
      if (pin.startsWith("'")) pin = pin.slice(1);
      if (pin === '-') pin = '';
      if (!pin) {
        if (catatan.includes('Password:')) {
          const m = catatan.match(/Password:\s*([^\s•]+)/);
          if (m) pin = m[1];
        } else if (catatan.includes('PIN:')) {
          const m = catatan.match(/PIN:\s*([^\s•]+)/);
          if (m) pin = m[1];
        }
      }
      let kodeWa = isCol1Id ? String(vals[21] || '').trim() : String(vals[20] || '').trim();
      if (kodeWa.startsWith("'")) kodeWa = kodeWa.slice(1);
      if (kodeWa === '-') kodeWa = '';
      if (!kodeWa && waDigits.length >= 4) {
        kodeWa = waDigits.slice(-4);
      }
      return {
        no: idx + 1,
        id: (isCol1Id ? val1 : (bracketMatch ? bracketMatch[1].toUpperCase() : (catatan.match(/ID:\s*(#?WRG-\d+)/i)?.[1]?.toUpperCase() || `#WRG-${('000' + (idx + 1)).slice(-3)}`))),
        namaLengkap: nama,
        jenisKelamin: jenisKelamin as WargaRecord['jenisKelamin'],
        blok,
        noRumah,
        alamatRumah,
        noWhatsapp: noWa || '081200000000',
        statusTempatTinggal: (statusTempat as WargaRecord['statusTempatTinggal']) || 'Menetap',
        pekerjaan,
        agama: (agama as WargaRecord['agama']) || 'Islam',
        statusPernikahan: (statusNikah as WargaRecord['statusPernikahan']) || 'Menikah',
        statusDalamKeluarga: (statusKeluarga as WargaRecord['statusDalamKeluarga']) || 'Kepala Keluarga',
        jmlJiwa,
        anggotaKeluargaTambahan: anggotaStr,
        statusIpl,
        periodeTercover: periode,
        nominalIpl: nominal,
        tanggalUpdate,
        catatan,
        pin: pin || undefined,
        kodeWa: kodeWa || undefined,
        waktuInput: isCol1Id ? (vals[22] ? String(vals[22]).trim() : undefined) : (vals[21] ? String(vals[21]).trim() : undefined),
      };
    });
    // 2. Parsing PEMBAYARAN_IPL (Memisahkan Transaksi IPL Reguler & Setoran Urunan PJU #PJU-*)
    const pureIplRows = cleanIplRows.filter((vals) => {
      const noTrx = String(vals[1] || '').trim().toUpperCase();
      const periode = String(vals[4] || '').trim().toUpperCase();
      return !noTrx.startsWith('#PJU-') && !periode.includes('PJU');
    });

    const transaksiList: TransaksiIPL[] = pureIplRows.map((vals, idx) => {
      const noTrx = String(vals[1] || `#TRX-${('000' + (idx + 1)).slice(-3)}`).trim();
      const nama = String(vals[2] || '-').trim();
      const lokasi = String(vals[3] || '-').trim();
      let periode = String(vals[4] || 'Oktober 2026').trim();
      if (periode.startsWith('Date(')) periode = 'Oktober 2026';
      const durasi = String(vals[5] || '1 Bulan').trim();
      const nominal = typeof vals[6] === 'number' ? Math.round(vals[6]) : parseInt(String(vals[6] || '').replace(/\D/g, ''), 10) || 30000;
      const statusRaw = String(vals[7] || 'Lunas').trim();
      const status = statusRaw.includes('Lunas')
        ? 'Lunas'
        : statusRaw.includes('Menunggu')
        ? 'Menunggu Verifikasi'
        : 'Ditolak';

      let tanggalBayar = String(vals[8] || '-').trim();
      if (tanggalBayar.startsWith('Date(')) tanggalBayar = '09 Okt 2026';
      const metode = String(vals[9] || 'Transfer Bank Mandiri').trim();
      const bukti = String(vals[10] || '-').trim();
      const keterangan = String(vals[11] || '-').trim();

      return {
        no: idx + 1,
        noTransaksi: noTrx,
        namaWarga: nama,
        lokasiRumah: lokasi,
        periodeTercover: periode,
        durasiPaket: durasi,
        nominalBayar: nominal,
        status,
        tanggalPelunasan: tanggalBayar,
        metodePembayaran: metode,
        buktiBayar: bukti !== '-' ? bukti : undefined,
        keterangan,
        waktuInput: vals[12] ? String(vals[12]).trim() : undefined,
      };
    });
    const pengeluaranList: PengeluaranKasRecord[] = cleanExpRows.map((vals, idx) => {
      const expId = String(vals[1] || `EXP-${idx + 1}`).trim();
      let tgl = String(vals[2] || '09 Okt 2026').trim();
      if (tgl.startsWith('Date(')) tgl = '09 Okt 2026';
      const kategori = String(vals[3] || 'Lainnya').trim() as PengeluaranKasRecord['kategori'];
      const ket = String(vals[4] || '-').trim();
      const nom = typeof vals[5] === 'number' ? Math.round(vals[5]) : parseInt(String(vals[5] || '').replace(/\D/g, ''), 10) || 0;
      const penerima = String(vals[6] || 'Petugas Lingkungan').trim();

      return {
        id: expId.replace(/^#/, ''),
        tanggal: tgl,
        kategori,
        keterangan: ket,
        nominal: nom,
        penerima,
        waktuInput: vals[7] ? String(vals[7]).trim() : undefined,
      };
    });
    // 4. Parsing URUNAN_PJU (Auto-detect apakah Kolom B adalah ID Transaksi PJU atau Nama Warga)
    const urunanFromDedicatedTab: ItemUrunanWarga[] = cleanUrunanRows.map((vals, idx) => {
      const val1 = String(vals[1] || '').trim();
      const isCol1Id = /^#?PJU-[A-Z0-9_-]+$/i.test(val1);
      const rawNama = isCol1Id ? String(vals[2] || '').trim() : val1 || '-';
      const pjuBracket = rawNama.match(/^\[(#?PJU-[A-Z0-9_-]+)\]\s*(.*)$/i);
      const nama = pjuBracket ? pjuBracket[2].trim() : rawNama;
      const katRaw = isCol1Id ? String(vals[3] || '').trim().toLowerCase() : String(vals[2] || '').trim().toLowerCase();
      const tipe: 'DONATUR' | 'URUNAN_WAJIB' = katRaw.includes('donatur') ? 'DONATUR' : 'URUNAN_WAJIB';
      const nominal = isCol1Id
        ? (typeof vals[4] === 'number' ? Math.round(vals[4]) : parseInt(String(vals[4] || '').replace(/\D/g, ''), 10) || 115000)
        : (typeof vals[3] === 'number' ? Math.round(vals[3]) : parseInt(String(vals[3] || '').replace(/\D/g, ''), 10) || 115000);
      const metodeRaw = isCol1Id ? String(vals[5] || 'TF').trim() : String(vals[4] || 'TF').trim();
      const metode = metodeRaw.toLowerCase().includes('cash') || metodeRaw.toLowerCase().includes('tunai') ? 'Cash' : 'TF';
      // Auto-detect apakah Kolom 7 adalah Bukti Bayar (10 Kolom) atau Keterangan (Legacy 8 Kolom)
      const hasBuktiCol = isCol1Id ? vals.length >= 9 : vals.length >= 8;
      const buktiBayar = hasBuktiCol ? String(vals[6] || '-').trim() : '-';
      const keterangan = hasBuktiCol
        ? String(vals[7] || '-').trim()
        : (isCol1Id ? String(vals[6] || '-').trim() : String(vals[5] || '-').trim());
      let tanggal = hasBuktiCol
        ? String(vals[8] || '06 Jun 2026').trim()
        : (isCol1Id ? String(vals[7] || '06 Jun 2026').trim() : String(vals[6] || '06 Jun 2026').trim());
      if (tanggal.startsWith('Date(')) tanggal = '06 Jun 2026';
      const waktuInput = hasBuktiCol && vals[9] ? String(vals[9]).trim() : undefined;

      const status: 'Lunas' | 'Menunggu Verifikasi' | 'Ditolak' =
        /menunggu|verif|pending/i.test(keterangan) || /verif/i.test(val1)
          ? 'Menunggu Verifikasi'
          : /ditolak|reject/i.test(keterangan)
          ? 'Ditolak'
          : 'Lunas';

      return {
        id: (isCol1Id ? val1 : (pjuBracket ? pjuBracket[1].toUpperCase() : (keterangan.match(/ID:\s*(#?PJU-[A-Z0-9_-]+)/i)?.[1]?.toUpperCase() || `#PJU-${('000' + (idx + 1)).slice(-3)}`))),
        noUrut: idx + 1,
        programId: 'PRG-PJU-01',
        namaWarga: nama,
        tipe,
        nominal,
        metode,
        status,
        buktiBayar: buktiBayar !== '-' ? buktiBayar : undefined,
        keterangan,
        tanggal,
        waktuInput,
      };
    });
    let donIdx = 0;
    let wjbIdx = 0;
    const urunanList: ItemUrunanWarga[] = urunanFromDedicatedTab.map((item) => ({
      ...item,
      noUrut: item.tipe === 'DONATUR' ? ++donIdx : ++wjbIdx,
    }));
    // Deduplikasi: 1 Lokasi Rumah / Warga hanya memiliki 1 transaksi master (prioritaskan #TRX-xxx asli)
    const seenHouseTrx = new Set<string>();
    const dedupedTransaksiList = transaksiList.filter((t) => {
      const locKey = t.lokasiRumah.toLowerCase().trim();
      if (t.noTransaksi.startsWith('#IPL-')) {
        const hasMaster = transaksiList.some(
          (other) => other.noTransaksi.startsWith('#TRX-') && other.lokasiRumah.toLowerCase().trim() === locKey
        );
        if (hasMaster) return false;
      }
      if (seenHouseTrx.has(locKey)) return false;
      seenHouseTrx.add(locKey);
      return true;
    });
    const parseTrxMonths = (durasiStr: string, nominal: number): number => {
      const blnMatch = (durasiStr || '').match(/(\d+)\s*Bulan/i);
      if (blnMatch) return Math.max(1, parseInt(blnMatch[1], 10));
      const thnMatch = (durasiStr || '').match(/(\d+)\s*Tahun/i);
      if (thnMatch) return Math.max(1, parseInt(thnMatch[1], 10) * 12);
      return Math.max(1, Math.round((nominal || 30000) / 30000));
    };

    const formatTotalMonthsLabel = (m: number): string => {
      if (m === 12) return '1 Tahun (12 Bulan)';
      if (m > 12 && m % 12 === 0) return `${m / 12} Tahun (${m} Bulan)`;
      if (m > 12) return `${Math.floor(m / 12)} Thn ${m % 12} Bln (${m} Bulan)`;
      return `${m} Bulan`;
    };

    // Helper deteksi apakah masa aktif IPL (tanggal bayar + durasi bulan) sudah lewat/habis pada Oktober 2026
    const isLunasExpired = (lunasList: TransaksiIPL[], totalMonths: number, w: WargaRecord): boolean => {
      if (totalMonths <= 0) return false;
      if (w.catatan && /kelewat|habis/i.test(w.catatan) && totalMonths <= 1) return true;
      const allFromSepOrEarlier =
        lunasList.length > 0 &&
        lunasList.every(
          (t) =>
            /sep|agu|jul|jun/i.test(t.tanggalPelunasan || '') ||
            /sep|agu|jul|jun/i.test(t.periodeTercover || '') ||
            /kelewat|habis/i.test(t.keterangan || '')
        );
      return allFromSepOrEarlier && totalMonths <= 1;
    };

    // Sinkronkan statusIpl, akumulasi paket durasi, akumulasi nominal, & deteksi masa aktif habis (kelewat 1 bulan)
    const reconciledWargaList = wargaList.map((w) => {
      const lunasList = dedupedTransaksiList.filter(
        (t) =>
          t.status === 'Lunas' &&
          (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
      );
      const lunasMonths = lunasList.reduce(
        (acc, t) => acc + parseTrxMonths(t.durasiPaket, t.nominalBayar),
        0
      );
      const lunasNominal = lunasList.reduce((acc, t) => acc + t.nominalBayar, 0);
      const expired1Month = isLunasExpired(lunasList, lunasMonths, w);

      const pendingTrx = dedupedTransaksiList.find(
        (t) =>
          t.status === 'Menunggu Verifikasi' &&
          (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
      );
      if (pendingTrx) {
        return {
          ...w,
          statusIpl: 'Menunggu Verifikasi' as const,
          periodeTercover:
            lunasMonths > 0 && !expired1Month
              ? `Lunas ${formatTotalMonthsLabel(lunasMonths)} + Verifikasi ${pendingTrx.durasiPaket}`
              : pendingTrx.durasiPaket || w.periodeTercover,
          nominalIpl: (expired1Month ? 0 : lunasNominal) + (pendingTrx.nominalBayar || 0),
        };
      }
      if (expired1Month) {
        return {
          ...w,
          statusIpl: 'Belum Bayar' as const,
          periodeTercover: 'Periode Sep Habis (30 Sep 2026) • Batas Bayar Okt: 31 Okt 2026',
          nominalIpl: 30000,
          catatan: 'Kelewat 1 Bulan: Paket 1 Bulan (Sep 2026) berakhir per Akhir Bulan (30 Sep 2026) • Belum Bayar Okt 2026 (s/d 31 Okt)',
        };
      }
      if (lunasMonths > 0) {
        return {
          ...w,
          statusIpl: 'Lunas' as const,
          periodeTercover: formatTotalMonthsLabel(lunasMonths),
          nominalIpl: lunasNominal,
        };
      }
      const rejectedTrx = dedupedTransaksiList.find(
        (t) =>
          t.status === 'Ditolak' &&
          (t.namaWarga.toLowerCase() === w.namaLengkap.toLowerCase() ||
            t.lokasiRumah.toLowerCase() === w.alamatRumah.toLowerCase())
      );
      if (rejectedTrx && w.statusIpl !== 'Lunas') {
        const reason = (rejectedTrx.keterangan || '')
          .replace(/^ditolak\s*:\s*/i, '')
          .trim();
        return {
          ...w,
          statusIpl: 'Belum Bayar' as const,
          catatan:
            w.catatan && /ditolak/i.test(w.catatan)
              ? w.catatan
              : `Pembayaran ditolak: ${reason || 'Bukti bayar belum sesuai'}`,
        };
      }
      return w;
    });
    return {
      wargaList: reconciledWargaList,
      transaksiList: dedupedTransaksiList,
      pengeluaranList,
      urunanList,
    };
  } catch (err) {
    console.warn('Gagal sinkronisasi data live Google Sheets:', err);
    return null;
  }
}

export function formatPayloadForGas(
  updatedWarga: WargaRecord[],
  updatedTrx: TransaksiIPL[],
  updatedExp: PengeluaranKasRecord[] = [],
  updatedUrunan: ItemUrunanWarga[] = []
) {
  const nowWib =
    new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }) + ' WIB';

  const residents = updatedWarga.map((w, idx) => {
    const wrgId = w.id && w.id.startsWith('#WRG-') ? w.id : `#WRG-${('000' + (idx + 1)).slice(-3)}`;
    const cleanName = w.namaLengkap.replace(/^\[#WRG-\d+\]\s*/i, '').trim();
    const rawNote = (w.catatan || 'Warga Terdata').replace(/^ID:\s*#WRG-\d+\s*•\s*/i, '');
    const noteWithIdAndPw = `ID: ${wrgId} • ${rawNote}${rawNote.includes('Password:') || !w.pin ? '' : ` • Password: ${w.pin}`}`;

    return {
      id: wrgId,
      nama: cleanName,
      jenisKelamin: w.jenisKelamin,
      blok: w.blok,
      nomor: parseInt(String(w.noRumah), 10) || 1,
      blokNomor: w.alamatRumah,
      telepon: w.noWhatsapp,
      statusTempatTinggal: w.statusTempatTinggal,
      pekerjaan: w.pekerjaan,
      agama: w.agama,
      statusPernikahan: w.statusPernikahan,
      statusDalamKeluarga: w.statusDalamKeluarga,
      jumlahAnggota: w.jmlJiwa,
      anggotaKeluarga: w.anggotaKeluargaTambahan || '-',
      statusIpl: w.statusIpl,
      periodeIpl: w.periodeTercover || 'Oktober 2026',
      nominalIpl: w.nominalIpl || 30000,
      tanggalBayarIpl: w.tanggalUpdate || '-',
      catatan: noteWithIdAndPw,
      pin: w.pin || '-',
      waktuInput: w.waktuInput || nowWib,
    };
  });

  const iplRecords = updatedTrx.map((item, idx) => ({
    id: item.noTransaksi || `#IPL-${('000' + (idx + 1)).slice(-3)}`,
    nama: item.namaWarga,
    blokNomor: item.lokasiRumah,
    periode: item.periodeTercover || 'Oktober 2026',
    durasiLabel: item.durasiPaket || '1 Bulan',
    nominal: item.nominalBayar || 30000,
    status: item.status || 'Lunas',
    tanggalBayar: item.tanggalPelunasan || '-',
    metode: item.metodePembayaran || 'Transfer Bank',
    buktiBayar: item.buktiBayar || '-',
    keterangan: item.keterangan || 'Lunas',
    waktuInput: item.waktuInput || nowWib,
  }));

  const pengeluaranRecords = updatedExp.map((exp, idx) => ({
    id: exp.id || `#EXP-${('000' + (idx + 1)).slice(-3)}`,
    tanggal: exp.tanggal,
    kategori: exp.kategori,
    keterangan: exp.keterangan,
    nominal: exp.nominal,
    penerima: exp.penerima,
    createdAt: exp.createdAt || new Date().toISOString(),
    waktuInput: exp.waktuInput || exp.createdAt || nowWib,
  }));

  const urunanRecords = updatedUrunan.map((item, idx) => {
    const pjuId = item.id && item.id.startsWith('#PJU-') ? item.id : `#PJU-${('000' + (idx + 1)).slice(-3)}`;
    const cleanName = item.namaWarga.replace(/^\[#PJU-\d+\]\s*/i, '').trim();
    return {
      id: pjuId,
      noUrut: idx + 1,
      namaWarga: cleanName,
      kategori: item.tipe === 'DONATUR' ? 'Donatur Sukarela' : 'Iuran Wajib PJU',
      nominal: item.nominal,
      metode: item.metode || 'TF',
      status: item.status || 'Lunas',
      tanggal: item.tanggal || '14 Okt 2026',
      keterangan: item.keterangan || (item.tipe === 'DONATUR' ? 'Donasi Sukarela PJU' : 'Iuran Wajib Lampu PJU'),
      buktiBayar: item.buktiBayar || '-',
      waktuInput: item.waktuInput || nowWib,
    };
  });

  return { residents, iplRecords, pengeluaranRecords, urunanRecords };
}
