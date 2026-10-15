import { ProgramUrunanRecord, ItemUrunanWarga } from '@sim-warga/types';

export const initialProgramPJU: ProgramUrunanRecord = {
  id: 'PRG-PJU-01',
  namaProgram: 'Pemasangan Lampu PJU Jalan Utama & Titik Krusial',
  tujuan: 'Hasil Rapat Paguyuban Warga PK8 Tahap 2 (Sabtu, 6 Juni 2026): Biaya iuran pemasangan lampu PJU jalan utama & titik-titik krusial senilai Rp 115.000 / KK / Rumah (Cukup 1x Bayar Wajib + Donatur Sukarela).',
  targetNominal: 17500000,
  tarifWajibPerWarga: 115000,
  status: 'AKTIF',
  tanggalMulai: 'Sabtu, 6 Juni 2026',
  rekeningTujuan: 'Bank Mandiri : 1240010437979 A/n Dwi Saputra',
  catatan: 'Note transfer: Nomer blok rumah & Nomer rumah (Contoh: D8 No. 1). Bukti transfer diverifikasi pengurus.',
};

export const initialUrunanList: ItemUrunanWarga[] = [];
