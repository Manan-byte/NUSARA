import { ProgramUrunanRecord, ItemUrunanWarga } from '@sim-warga/types';

export const initialProgramPJU: ProgramUrunanRecord = {
  id: 'PRG-PJU-01',
  namaProgram: 'Pengadaan Lampu Penerangan Jalan Umum (PJU) Pesona Kahuripan 8 Tahap 2',
  tujuan: 'Penerangan seluruh gang dan jalan utama Blok D & Blok E serta efisiensi token listrik bersama',
  targetNominal: 15000000,
  tarifWajibPerWarga: 115000,
  status: 'AKTIF',
  tanggalMulai: '15 Juni 2026',
  rekeningTujuan: 'Bank Mandiri : 1240010437979 A/N Dwi Saputra',
  catatan: 'Program resmi penerangan jalan umum Paguyuban PK8-2.'
};

// Kosong bersih - Hanya terisi jika warga mendaftar atau menyetor via form website/Google Sheets
export const initialUrunanList: ItemUrunanWarga[] = [];
