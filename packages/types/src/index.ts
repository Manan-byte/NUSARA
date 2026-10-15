/**
 * SIM-Warga Pesona Kahuripan 8 Tahap 2 - Data Contracts
 * Database: Google Sheets (Spreadsheet: 1ilMcUp9_zyjE3BfT9j0BFg-h8lrp9YCuObrS44DTUT0)
 */

export type JenisKelamin = 'Laki-laki' | 'Perempuan';

export type StatusTempatTinggal = 'Menetap' | 'Pulang-Pergi' | 'Belum menetap';

export type Agama =
  | 'Islam'
  | 'Kristen'
  | 'Katolik'
  | 'Hindu'
  | 'Buddha'
  | 'Konghucu'
  | 'Lainnya';

export type StatusPernikahan =
  | 'Belum menikah'
  | 'Menikah'
  | 'Cerai hidup'
  | 'Cerai mati';

export type StatusDalamKeluarga =
  | 'Kepala Keluarga'
  | 'Suami'
  | 'Istri'
  | 'Anak'
  | 'Lainnya';

export type StatusIPL = 'Lunas' | 'Belum Bayar' | 'Menunggu Verifikasi' | 'Ditolak';

/**
 * Akun Pengurus / Admin RT (Login & Manajemen Akun)
 */
export interface AdminAccount {
  id: string;
  nama: string;
  username: string;
  password: string;
  jabatan: 'Ketua Paguyuban' | 'Ketua RT' | 'Sekretaris' | 'Bendahara' | 'Seksi Keamanan' | 'Admin Sistem' | 'Master Pengawas AI & Blackbox';
  createdAt: string;
}

/**
 * 10 Kolom Asli Formulir Google Form Pesona Kahuripan 8 Tahap 2
 * Ditambah atribut pelengkap spreadsheet tab DATA_WARGA
 */
export interface WargaRecord {
  no?: number;
  id?: string;
  namaLengkap: string;
  jenisKelamin: JenisKelamin;
  blok: string;
  noRumah: string;
  alamatRumah: string;
  noWhatsapp: string;
  statusTempatTinggal: StatusTempatTinggal;
  pekerjaan: string;
  agama: Agama;
  statusPernikahan: StatusPernikahan;
  statusDalamKeluarga: StatusDalamKeluarga;
  jmlJiwa: number;
  anggotaKeluargaTambahan?: string;
  statusIpl: StatusIPL;
  periodeTercover?: string;
  nominalIpl?: number;
  tanggalUpdate?: string;
  catatan?: string;
  pin?: string;
  pinHash?: string;
  kodeWa?: string;
  waktuInput?: string;
}

/**
 * Kontrak Khusus 6 Slot Penugasan Ronda Siskamling (Locked Contract)
 */
export interface PetugasSlot {
  slot: number;
  namaLengkap: string;
  blokRumah: string;
  isKoordinator: boolean;
  noWhatsapp?: string;
}

export interface JadwalRondaRecord {
  id: string;
  mingguKe?: number;
  hari: string;
  tanggal: string;
  jamOperasional: string;
  lokasiPos: string;
  petugas: PetugasSlot[];
  catatan?: string;
}

/**
 * Transaksi Iuran Pengelolaan Lingkungan (Tab PEMBAYARAN_IPL)
 */
export interface TransaksiIPL {
  no?: number;
  noTransaksi: string;
  namaWarga: string;
  lokasiRumah: string;
  periodeTercover: string;
  durasiPaket: string;
  nominalBayar: number;
  status: StatusIPL;
  tanggalPelunasan?: string;
  metodePembayaran: string;
  buktiBayar?: string;
  keterangan?: string;
  waktuInput?: string;
}

/**
 * Pengumuman Kegiatan Warga (Tab PENGUMUMAN_KEGIATAN)
 * Mendukung upload gambar banner kegiatan
 */
export interface PengumumanRecord {
  id: string;
  judul: string;
  kategori: 'Info Warga & Fasum' | 'Sosial & Keamanan' | 'Sosial & Kerja Bakti' | 'Rapat Warga' | 'Keagamaan' | 'Keamanan & Ronda';
  tanggalAcara: string;
  waktu: string;
  lokasi: string;
  deskripsi: string;
  author: string;
  status: 'PUBLISHED' | 'DRAFT';
  gambarBanner?: string; // URL foto/banner kegiatan atau base64 image
  createdAt: string;
}

/**
 * Metrik Ringkasan Kas & Rekap Blok (Tab RINGKASAN_DASHBOARD)
 */
export interface RekapBlok {
  blok: string;
  jumlahRumah: number;
  menetap: number;
  pulangPergi: number;
  belumMenetap: number;
  targetIpl: number;
  realisasiMasuk: number;
  sisaTunggakan: number;
  status: string;
  persentase: string;
}

export interface DashboardSummary {
  pemasukanIpl: number;
  targetIpl: number;
  persentasePemasukan: string;
  rumahLunas: number;
  totalRumah: number;
  totalWarga?: number;
  pengeluaranKas: number;
  saldoAwalKas?: number;
  sisaSaldoKas: number;
  wargaMenetap: number;
  wargaPulangPergi: number;
  wargaBelumMenetap: number;
  rekapPerBlok: RekapBlok[];
}

/**
 * Pencatatan Pengeluaran Kas Lingkungan oleh Pengurus / Bendahara
 */
export interface PengeluaranKasRecord {
  id: string;
  tanggal: string;
  kategori: 'Sampah & Kebersihan' | 'Keamanan & Satpam' | 'Listrik & PJU' | 'Perbaikan Fasum' | 'Kegiatan Warga' | 'Lainnya';
  keterangan: string;
  nominal: number;
  penerima: string;
  createdAt?: string;
  waktuInput?: string;
}

/**
 * Informasi Rekening Bank Kas Pembayaran IPL
 */
export interface InfoRekeningBank {
  namaBank: string;
  noRekening: string;
  atasNama: string;
  catatan?: string;
  metodePembayaran?: string[];
}

/**
 * Program Penggalangan Dana Khusus / Urunan Warga (Crowdfunding RT 08)
 */
export interface ProgramUrunanRecord {
  id: string;
  namaProgram: string;
  tujuan: string;
  targetNominal: number;
  tarifWajibPerWarga: number;
  status: 'AKTIF' | 'SELESAI';
  tanggalMulai: string;
  rekeningTujuan?: string;
  catatan?: string;
}

export type TipeUrunan = 'DONATUR' | 'URUNAN_WAJIB';

export interface ItemUrunanWarga {
  id: string;
  noUrut: number;
  programId: string;
  tipe: TipeUrunan;
  namaWarga: string;
  nominal: number;
  metode: 'TF' | 'Cash' | string;
  status?: 'Lunas' | 'Menunggu Verifikasi' | 'Ditolak';
  buktiBayar?: string;
  tanggal?: string;
  keterangan?: string;
  waktuInput?: string;
}
