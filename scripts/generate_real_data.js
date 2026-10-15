const fs = require('fs');
const path = require('path');

const extracted = JSON.parse(fs.readFileSync('D:/AI BUAT/sim-warga/extracted_real_data.json', 'utf8'));

// 1. Generate mockUrunanData.ts
const urunanList = extracted.urunanList.map((u, idx) => ({
  id: u.id || `#PJU-${('000' + (idx + 1)).slice(-3)}`,
  noUrut: idx + 1,
  programId: 'PRG-PJU-01',
  tipe: u.tipe,
  namaWarga: u.namaWarga,
  nominal: u.nominal,
  metode: u.metodeBayar && u.metodeBayar.toLowerCase().includes('kasir') ? 'Cash' : 'TF',
  status: 'Lunas',
  tanggal: u.tanggal || 'Juni - Juli 2026',
  keterangan: u.keterangan || (u.tipe === 'DONATUR' ? 'Donatur Utama Lampu Jalan' : 'Urunan Wajib PJU RT 08'),
  buktiBayar: u.buktiBayar || '/kegiatan/banner_donatur_lampu.jpg'
}));

const urunanContent = `import { ProgramUrunanRecord, ItemUrunanWarga } from '@sim-warga/types';

export const initialProgramPJU: ProgramUrunanRecord = {
  id: 'PRG-PJU-01',
  namaProgram: 'Pengadaan Lampu Penerangan Jalan Umum (PJU) Pesona Kahuripan 8 Tahap 2',
  tujuan: 'Penerangan seluruh gang dan jalan utama Blok D & Blok E serta efisiensi token listrik bersama',
  targetNominal: 15000000,
  tarifWajibPerWarga: 115000,
  status: 'AKTIF',
  tanggalMulai: '15 Juni 2026',
  rekeningTujuan: 'Bank Mandiri : 1240010437979 A/N Dwi Saputra',
  catatan: 'Rekap riil dari lembar Donatur Lampu Paguyuban PK8-2. Donasi >= Rp 200.000 tercatat sebagai Donatur Utama.'
};

export const initialUrunanList: ItemUrunanWarga[] = ${JSON.stringify(urunanList, null, 2)};
`;

fs.writeFileSync('D:/AI BUAT/sim-warga/apps/web/src/data/mockUrunanData.ts', urunanContent);
console.log('Successfully written apps/web/src/data/mockUrunanData.ts');

// 2. Generate mockInitialData.ts
const rawResidents = extracted.residents;

const wargaList = rawResidents.map(([name, blokRaw], index) => {
  const idNum = ('000' + (index + 1)).slice(-3);
  const id = `#WRG-${idNum}`;
  
  let blok = 'D';
  let noRumah = '1';
  const cleanBlok = blokRaw.replace(/no\.?/i, '').trim();
  const parts = cleanBlok.split(/[\/\s-]+/);
  if (parts.length >= 2) {
    blok = parts[0].toUpperCase();
    noRumah = parts[1];
  } else {
    blok = cleanBlok.slice(0, 3).toUpperCase();
    noRumah = cleanBlok.slice(3) || '1';
  }

  const isPP = (index % 7 === 0);
  const statusTempatTinggal = isPP ? 'Pulang-Pergi' : 'Menetap';
  const nominalIpl = isPP ? 20000 : 30000;

  const namaLengkap = name
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  const phoneSuffix = 1000 + index + 1;
  const noWhatsapp = `08129000${phoneSuffix}`;
  const pin = `${namaLengkap.split(' ')[0]}@${blok.replace(/\s+/g, '')}`;

  return {
    no: index + 1,
    id,
    namaLengkap: `Bapak/Ibu ${namaLengkap}`,
    jenisKelamin: (index % 4 === 0 ? 'Perempuan' : 'Laki-laki'),
    blok,
    noRumah,
    alamatRumah: `Blok ${blok} No. ${noRumah}`,
    noWhatsapp,
    statusTempatTinggal,
    pekerjaan: (index % 3 === 0 ? 'Karyawan Swasta' : index % 3 === 1 ? 'Wiraswasta / Usaha' : 'PNS / BUMN'),
    agama: 'Islam',
    statusPernikahan: 'Menikah',
    statusDalamKeluarga: 'Kepala Keluarga',
    jmlJiwa: 3 + (index % 3),
    anggotaKeluargaTambahan: '-',
    statusIpl: (index % 3 === 0 ? 'Lunas' : index % 3 === 1 ? 'Menunggu Verifikasi' : 'Belum Bayar'),
    periodeTercover: (index % 3 === 0 ? '1 Bulan (Juli 2026)' : '-'),
    nominalIpl,
    tanggalUpdate: 'Juli 2026',
    catatan: `Warga Paguyuban PK8-2 Tahap 2 (${statusTempatTinggal} - Tarif Rp ${nominalIpl.toLocaleString('id-ID')}/bln)`,
    pin
  };
});

// Generate Transaksi IPL
const transaksiList = [];
let trxCount = 1;
wargaList.forEach((w) => {
  if (w.statusIpl === 'Lunas' || w.statusIpl === 'Menunggu Verifikasi') {
    transaksiList.push({
      no: trxCount,
      noTransaksi: `#IPL-${('000' + trxCount).slice(-3)}`,
      namaWarga: w.namaLengkap,
      lokasiRumah: w.alamatRumah,
      periodeTercover: 'Juli 2026',
      durasiPaket: '1 Bulan',
      nominalBayar: w.nominalIpl,
      status: w.statusIpl,
      tanggalPelunasan: '10 Juli 2026',
      metodePembayaran: (trxCount % 2 === 0 ? 'Transfer Mandiri' : 'Tunai Kasir'),
      keterangan: `Iuran Pengelolaan Lingkungan (IPL) Periode Juli 2026 - ${w.statusTempatTinggal}`,
      buktiBayar: '/bukti-bayar/struk_ipl_01.png'
    });
    trxCount++;
  }
});

// Real Pengeluaran Kas Paguyuban PK8-2
const pengeluaranList = [
  {
    id: 'EXP-001',
    tanggal: '21 Juni 2026',
    kategori: 'Perbaikan Fasum',
    keterangan: 'Material Pembuatan Polisi Tidur & Tanggul Jalan Utama',
    nominal: 1250000,
    penerima: 'Bapak Roland Fitzgerald & Sie Keamanan'
  },
  {
    id: 'EXP-002',
    tanggal: '15 Juni 2026',
    kategori: 'Lainnya',
    keterangan: 'Pencetakan Stiker Identitas Kendaraan Warga PK8-2',
    nominal: 450000,
    penerima: 'Bapak Ujang Piyan (Koordinator)'
  },
  {
    id: 'EXP-003',
    tanggal: '19 Juli 2026',
    kategori: 'Perbaikan Fasum',
    keterangan: 'Operasional Kerja Bakti Perapihan Lahan Fasum & Instalasi Pompa Air',
    nominal: 850000,
    penerima: 'Pengurus Paguyuban (Ketum Rachmatullah T.)'
  }
];

// Real Announcements from Google Sites
const pengumumanList = [
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

// Real Ronda Schedule
const jadwalRondaList = [
  {
    id: 'RND-001',
    mingguKe: 1,
    hari: 'Senin',
    tanggal: 'Setiap Senin Malam',
    jamOperasional: '22:00 - 04:00 WIB',
    lokasiPos: 'Pos Keamanan & Keliling Seluruh Blok D & E',
    statusPublikasi: 'PUBLISHED',
    petugas: [
      { slot: 1, namaLengkap: 'Darisman', blokRumah: 'E4/5', isKoordinator: true },
      { slot: 2, namaLengkap: 'DASRIL', blokRumah: 'E6/33', isKoordinator: false },
      { slot: 3, namaLengkap: 'Demmi Ilham', blokRumah: 'E5/30', isKoordinator: false },
      { slot: 4, namaLengkap: 'Dwi Saputra', blokRumah: 'D13/7', isKoordinator: false },
      { slot: 5, namaLengkap: 'Edy Suyono', blokRumah: 'E1/13', isKoordinator: false },
      { slot: 6, namaLengkap: 'EKO PRIYANTO', blokRumah: 'D12/5', isKoordinator: false }
    ],
    catatan: 'Patroli jalur utama, pengecekan lampu jalan, dan gerbang masuk.'
  },
  {
    id: 'RND-002',
    mingguKe: 2,
    hari: 'Rabu',
    tanggal: 'Setiap Rabu Malam',
    jamOperasional: '22:00 - 04:00 WIB',
    lokasiPos: 'Pos Keamanan & Keliling Blok D10 s/d D16',
    statusPublikasi: 'PUBLISHED',
    petugas: [
      { slot: 1, namaLengkap: 'Aditia Dharmawan', blokRumah: 'D13/9', isKoordinator: true },
      { slot: 2, namaLengkap: 'Ahmad Fauzi', blokRumah: 'E6/31', isKoordinator: false },
      { slot: 3, namaLengkap: 'Aris Nurhidayat', blokRumah: 'D15/6', isKoordinator: false },
      { slot: 4, namaLengkap: 'Ali Nurdin Buyung', blokRumah: 'D13/10', isKoordinator: false },
      { slot: 5, namaLengkap: 'Yosef Putu', blokRumah: 'E10/3', isKoordinator: false },
      { slot: 6, namaLengkap: 'Anggi Nariyanto', blokRumah: 'E10/13', isKoordinator: false }
    ],
    catatan: 'Patroli gang blok D & pengecekan saluran air fasum.'
  },
  {
    id: 'RND-003',
    mingguKe: 3,
    hari: 'Jumat',
    tanggal: 'Setiap Jumat Malam',
    jamOperasional: '22:00 - 04:00 WIB',
    lokasiPos: 'Pos Keamanan & Keliling Blok E1 s/d E11',
    statusPublikasi: 'PUBLISHED',
    petugas: [
      { slot: 1, namaLengkap: 'YOGA SEPTI ANDIKA', blokRumah: 'E9/30', isKoordinator: true },
      { slot: 2, namaLengkap: 'UCOK SAYUR', blokRumah: 'Pedagang Warga', isKoordinator: false },
      { slot: 3, namaLengkap: 'ARIEF Licardo', blokRumah: 'E10/6', isKoordinator: false },
      { slot: 4, namaLengkap: 'Mahmad Zainuri', blokRumah: 'D11/7', isKoordinator: false },
      { slot: 5, namaLengkap: 'Ahmad Wasroi', blokRumah: 'E10/8', isKoordinator: false },
      { slot: 6, namaLengkap: 'ANDREA BAYU AGUSTORO', blokRumah: 'E8/10', isKoordinator: false }
    ],
    catatan: 'Patroli gang blok E & koordinasi logistik ronda.'
  },
  {
    id: 'RND-004',
    mingguKe: 4,
    hari: 'Sabtu',
    tanggal: 'Malam Minggu (Ronda Massal)',
    jamOperasional: '22:00 - 04:00 WIB',
    lokasiPos: 'Seluruh Wilayah RT 08 PK8-2',
    statusPublikasi: 'PUBLISHED',
    petugas: [
      { slot: 1, namaLengkap: 'Rachmatullah Tiflen', blokRumah: 'E8/4', isKoordinator: true },
      { slot: 2, namaLengkap: 'Roland Fitzgerald', blokRumah: 'E2/7', isKoordinator: false },
      { slot: 3, namaLengkap: 'Ujang Piyan', blokRumah: 'E1/24', isKoordinator: false },
      { slot: 4, namaLengkap: 'Teguh Sentosa', blokRumah: 'D10/1', isKoordinator: false },
      { slot: 5, namaLengkap: 'Bagus Gumelar', blokRumah: 'D15/9', isKoordinator: false },
      { slot: 6, namaLengkap: 'Warga Siskamling Bersama', blokRumah: 'RT 08', isKoordinator: false }
    ],
    catatan: 'Ronda massal seluruh warga paguyuban ditemani donasi konsumsi tetangga.'
  }
];

// Initial Dashboard Summary
const totalWarga = wargaList.length;
const totalMenetap = wargaList.filter(w => w.statusTempatTinggal === 'Menetap').length;
const totalPP = totalWarga - totalMenetap;
const kasMasukIPL = transaksiList.filter(t => t.status === 'Lunas').reduce((a, b) => a + b.nominalBayar, 0);
const totalPengeluaran = pengeluaranList.reduce((a, b) => a + b.nominal, 0);
const saldoAwalKas = 1500000;
const sisaSaldo = saldoAwalKas + kasMasukIPL - totalPengeluaran;

const initialDashboardSummary = {
  pemasukanIpl: kasMasukIPL,
  targetIpl: totalWarga * 30000,
  persentasePemasukan: `${Math.round((kasMasukIPL / (totalWarga * 30000)) * 100)}%`,
  rumahLunas: transaksiList.filter(t => t.status === 'Lunas').length,
  totalRumah: totalWarga,
  totalWarga,
  pengeluaranKas: totalPengeluaran,
  saldoAwalKas: saldoAwalKas,
  sisaSaldoKas: sisaSaldo,
  wargaMenetap: totalMenetap,
  wargaPulangPergi: totalPP,
  wargaBelumMenetap: 0,
  rekapPerBlok: [
    {
      blok: 'Blok D',
      jumlahRumah: wargaList.filter(w => w.blok.startsWith('D')).length,
      menetap: wargaList.filter(w => w.blok.startsWith('D') && w.statusTempatTinggal === 'Menetap').length,
      pulangPergi: wargaList.filter(w => w.blok.startsWith('D') && w.statusTempatTinggal !== 'Menetap').length,
      belumMenetap: 0,
      targetIpl: wargaList.filter(w => w.blok.startsWith('D')).length * 30000,
      realisasiMasuk: 360000,
      sisaTunggakan: 0,
      status: 'Aman',
      persentase: '100%'
    },
    {
      blok: 'Blok E',
      jumlahRumah: wargaList.filter(w => w.blok.startsWith('E')).length,
      menetap: wargaList.filter(w => w.blok.startsWith('E') && w.statusTempatTinggal === 'Menetap').length,
      pulangPergi: wargaList.filter(w => w.blok.startsWith('E') && w.statusTempatTinggal !== 'Menetap').length,
      belumMenetap: 0,
      targetIpl: wargaList.filter(w => w.blok.startsWith('E')).length * 30000,
      realisasiMasuk: 420000,
      sisaTunggakan: 0,
      status: 'Aman',
      persentase: '100%'
    }
  ]
};

const mockInitialDataContent = `import {
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
  const tanggal = \`\${d.getDate()} \${MONTH_NAMES[d.getMonth()]} \${d.getFullYear()}\`;
  return { rawIso, hari, tanggal };
};

export const getTomorrowRondaDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const rawIso = d.toISOString().split('T')[0];
  const hari = HARI_NAMES[d.getDay()];
  const tanggal = \`\${d.getDate()} \${MONTH_NAMES[d.getMonth()]} \${d.getFullYear()}\`;
  return { rawIso, hari, tanggal };
};

export const initialDashboardSummary: DashboardSummary = ${JSON.stringify(initialDashboardSummary, null, 2)};

export const initialWargaList: WargaRecord[] = ${JSON.stringify(wargaList, null, 2)};

export const initialTransaksiIplList: TransaksiIPL[] = ${JSON.stringify(transaksiList, null, 2)};

export const initialPengeluaranKasList: PengeluaranKasRecord[] = ${JSON.stringify(pengeluaranList, null, 2)};

export const initialPengumumanList: PengumumanRecord[] = ${JSON.stringify(pengumumanList, null, 2)};

export const initialJadwalRondaList: (JadwalRondaRecord & { statusPublikasi: 'PUBLISHED' | 'DRAFT' })[] = ${JSON.stringify(jadwalRondaList, null, 2)};
`;

fs.writeFileSync('D:/AI BUAT/sim-warga/apps/web/src/data/mockInitialData.ts', mockInitialDataContent);
console.log('Successfully written apps/web/src/data/mockInitialData.ts!');
