import {
  WargaRecord,
  JadwalRondaRecord,
  PengumumanRecord,
  TransaksiIPL,
  DashboardSummary,
  PengeluaranKasRecord,
} from '@sim-warga/types';

export const initialDashboardSummary: DashboardSummary = {
  pemasukanIpl: 0,
  targetIpl: 0,
  persentasePemasukan: "0%",
  rumahLunas: 0,
  totalRumah: 0,
  pengeluaranKas: 0,
  saldoAwalKas: 0,
  sisaSaldoKas: 0,
  wargaMenetap: 0,
  wargaPulangPergi: 0,
  wargaBelumMenetap: 0,
  rekapPerBlok: []
};

export const initialWargaList: WargaRecord[] = [];

export const initialTransaksiIplList: TransaksiIPL[] = [];

export const initialPengeluaranKasList: PengeluaranKasRecord[] = [];

export const initialJadwalRondaList: (JadwalRondaRecord & { statusPublikasi: 'PUBLISHED' | 'DRAFT' })[] = [
  {
    "id": "RND-M1-SENIN",
    "hari": "Senin (MINGGU 1)",
    "tanggal": "01 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": []
  }
];

export const initialPengumumanList: PengumumanRecord[] = [];

export function getTodayRondaDate() {
  const d = new Date();
  const hariNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return {
    rawIso: d.toISOString().split('T')[0],
    hari: hariNames[d.getDay()],
    tanggal: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
  };
}

export function getTomorrowRondaDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const hariNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return {
    rawIso: d.toISOString().split('T')[0],
    hari: hariNames[d.getDay()],
    tanggal: `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`,
  };
}
