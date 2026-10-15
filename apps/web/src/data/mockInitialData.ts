import {
  WargaRecord,
  TransaksiIPL,
  PengeluaranKasRecord,
  PengumumanRecord,
  JadwalRondaRecord,
  DashboardSummary
} from '@sim-warga/types';

const HARI_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
];

export const getTodayRondaDate = () => {
  const d = new Date();
  const rawIso = d.toISOString().split('T')[0];
  const hari = HARI_NAMES[d.getDay()];
  const tanggal = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  return { rawIso, hari, tanggal };
};

export const getTomorrowRondaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const rawIso = d.toISOString().split('T')[0];
  const hari = HARI_NAMES[d.getDay()];
  const tanggal = `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
  return { rawIso, hari, tanggal };
};

export const initialDashboardSummary: DashboardSummary = {
  pemasukanIpl: 0,
  targetIpl: 0,
  persentasePemasukan: '0%',
  rumahLunas: 0,
  totalRumah: 0,
  totalWarga: 0,
  pengeluaranKas: 0,
  saldoAwalKas: 0,
  sisaSaldoKas: 0,
  wargaMenetap: 0,
  wargaPulangPergi: 0,
  wargaBelumMenetap: 0,
  rekapPerBlok: []
};

// Data master kosong bersih: hanya terisi jika diinput lewat formulir "+ Isi Data Warga" atau dari Google Sheets
export const initialWargaList: WargaRecord[] = [];
export const initialTransaksiIplList: TransaksiIPL[] = [];
export const initialPengeluaranKasList: PengeluaranKasRecord[] = [];

// Pengumuman Resmi Paguyuban PK8-2 (dengan dokumentasi foto asli)
export const initialPengumumanList: PengumumanRecord[] = [
  {
    id: 'PGM-001',
    judul: 'Surat Edaran: Himbauan Penggalangan Dana Satu Pintu HUT RI ke-81',
    kategori: 'Sosial & Keamanan',
    tanggalAcara: '17 Agustus 2026',
    waktu: '08:00 - Selesai WIB',
    lokasi: 'Fasum Lapangan Utama PK8-2',
    deskripsi: 'Nomor: [005/HMB/PK8-T2/VII/2026]. Disampaikan bahwa segala bentuk penggalangan dana HUT RI ke-81 resmi dikelola satu pintu oleh Panitia Ibu-Ibu didampingi Koordinator Bpk. Roland & Bpk. Syakur demi transparansi dan ketertiban bersama.',
    author: 'Paguyuban PK 8 Tahap 2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/informasi_4.jpg',
    createdAt: '05 Juli 2026'
  },
  {
    id: 'PGM-002',
    judul: 'Notulensi Rapat Pengurus: Legalitas Paguyuban & Ketentuan Tarif IPL',
    kategori: 'Rapat Warga',
    tanggalAcara: '04 Juli 2026',
    waktu: '20:00 - 23:00 WIB',
    lokasi: 'Balai Pertemuan Warga PK8-2',
    deskripsi: 'Hasil rapat: Legalitas paguyuban resmi per 1 Juli 2026, surat pengantar rekening bank terbit, dan ketentuan tarif resmi IPL: Rp 30.000/bln untuk Warga Menetap dan Rp 20.000/bln untuk Warga Pulang-Pergi/Belum Menetap.',
    author: 'Ketua Umum Rachmatullah Tiflen',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/informasi_5.jpg',
    createdAt: '04 Juli 2026'
  },
  {
    id: 'PGM-003',
    judul: 'Rundown & Semarak Acara Peringatan HUT RI ke-81 PK8-2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '15 - 16 Agustus 2026',
    waktu: '20:30 WIB s/d Selesai',
    lokasi: 'Fasum Lapangan Utama & Gang Warga',
    deskripsi: 'Rangkaian acara kemerdekaan: Lomba Catur (15 Ags), Karnaval Sepeda Hias & Lomba Anak/Dewasa (16 Ags), Cukur Rambut Gratis oleh Pak Beni & Pak Anggi (Blok E10/16), serta Atraksi Sulap Malam Puncak oleh Pak Nalam (Blok D16/7).',
    author: 'Panitia HUT RI PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_5.jpg',
    createdAt: '11 Juli 2026'
  },
  {
    id: 'PGM-004',
    judul: 'Kerja Bakti Lingkungan: Pembuatan Polisi Tidur & Hibah Mesin Pompa',
    kategori: 'Sosial & Kerja Bakti',
    tanggalAcara: '21 Juni 2026',
    waktu: '07:30 - 11:30 WIB',
    lokasi: 'Jalan Utama Gang Blok D & E',
    deskripsi: 'Apresiasi gotong royong warga PK8-2 dalam pembuatan polisi tidur di gang utama dan serah terima hibah mesin pompa air fasum dari Pak Boy untuk kenyamanan bersama. #Guyub #Asri ber#Sinergi #GASS.',
    author: 'Seksi Keamanan & Fasum',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_4.jpg',
    createdAt: '21 Juni 2026'
  }
];

// Template Rotasi Jadwal Siskamling (4 Hari per Minggu: Senin, Rabu, Jumat, Sabtu)
const weekDays = [
  { dayName: 'Senin', subText: 'Setiap Senin Malam', jam: '21:00 - 04:00 WIB', lokasi: 'Pos Keamanan & Gerbang Utama PK8-2' },
  { dayName: 'Rabu', subText: 'Setiap Rabu Malam', jam: '21:00 - 04:00 WIB', lokasi: 'Pos Keamanan & Keliling Blok D10 s/d D16' },
  { dayName: 'Jumat', subText: 'Setiap Jumat Malam', jam: '21:00 - 04:00 WIB', lokasi: 'Pos Keamanan & Keliling Blok E1 s/d E11' },
  { dayName: 'Sabtu', subText: 'Malam Minggu (Ronda Massal)', jam: '21:00 - 04:00 WIB', lokasi: 'Seluruh Wilayah RT 08 PK8-2' }
];

export const initialJadwalRondaList: (JadwalRondaRecord & { statusPublikasi: 'PUBLISHED' | 'DRAFT' })[] = [];
for (let mg = 1; mg <= 4; mg++) {
  weekDays.forEach((wd) => {
    initialJadwalRondaList.push({
      id: `RND-M${mg}-${wd.dayName.toUpperCase()}`,
      mingguKe: mg,
      hari: wd.dayName,
      tanggal: `${wd.subText} (Minggu ${mg})`,
      jamOperasional: wd.jam,
      lokasiPos: wd.lokasi,
      statusPublikasi: 'PUBLISHED',
      petugas: [
        { slot: 1, namaLengkap: 'Petugas Siaga 1 (Koordinator)', blokRumah: 'Pos Kamling', isKoordinator: true },
        { slot: 2, namaLengkap: 'Petugas Siaga 2', blokRumah: 'Pos Kamling', isKoordinator: false },
        { slot: 3, namaLengkap: 'Petugas Siaga 3', blokRumah: 'Pos Kamling', isKoordinator: false },
        { slot: 4, namaLengkap: 'Petugas Siaga 4', blokRumah: 'Pos Kamling', isKoordinator: false },
        { slot: 5, namaLengkap: 'Petugas Siaga 5', blokRumah: 'Pos Kamling', isKoordinator: false },
        { slot: 6, namaLengkap: 'Petugas Siaga 6', blokRumah: 'Pos Kamling', isKoordinator: false }
      ],
      catatan: 'Patroli lingkungan warga Pesona Kahuripan 8 Tahap 2'
    });
  });
}
