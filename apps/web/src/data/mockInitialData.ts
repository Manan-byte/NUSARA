import {
  WargaRecord,
  JadwalRondaRecord,
  PengumumanRecord,
  TransaksiIPL,
  DashboardSummary,
  PengeluaranKasRecord,
} from '@sim-warga/types';

export const initialDashboardSummary: DashboardSummary = {
  "pemasukanIpl": 3270000,
  "targetIpl": 900000,
  "persentasePemasukan": "363%",
  "rumahLunas": 12,
  "totalRumah": 30,
  "pengeluaranKas": 700000,
  "saldoAwalKas": 0,
  "sisaSaldoKas": 2570000,
  "wargaMenetap": 25,
  "wargaPulangPergi": 2,
  "wargaBelumMenetap": 3,
  "rekapPerBlok": []
};

export const initialWargaList: WargaRecord[] = [
  {
    "no": 1,
    "id": "#WRG-001",
    "namaLengkap": "Bapak Ridwan Kamil",
    "jenisKelamin": "Laki-laki",
    "blok": "A1",
    "noRumah": "5",
    "alamatRumah": "Blok A1 No. 5",
    "noWhatsapp": "081290001001",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "PNS / BUMN",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Atalia (Istri), 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Setor 1 Tahun via Transfer Mandiri",
    "pin": "Ridwan@A1"
  },
  {
    "no": 2,
    "id": "#WRG-002",
    "namaLengkap": "Bapak Dimas Pratama",
    "jenisKelamin": "Laki-laki",
    "blok": "B2",
    "noRumah": "8",
    "alamatRumah": "Blok B2 No. 8",
    "noWhatsapp": "081290001002",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Karyawan Swasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Maya (Istri), 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Paket Semester via QRIS",
    "pin": "Dimas@B2"
  },
  {
    "no": 3,
    "id": "#WRG-003",
    "namaLengkap": "Bapak Agus Wahyudi",
    "jenisKelamin": "Laki-laki",
    "blok": "C3",
    "noRumah": "3",
    "alamatRumah": "Blok C3 No. 3",
    "noWhatsapp": "081290001003",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 5,
    "anggotaKeluargaTambahan": "Ibu Rina (Istri), 3 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Triwulan via Transfer BCA",
    "pin": "Agus@C3"
  },
  {
    "no": 4,
    "id": "#WRG-004",
    "namaLengkap": "Bapak Hendra Kusuma",
    "jenisKelamin": "Laki-laki",
    "blok": "D4",
    "noRumah": "2",
    "alamatRumah": "Blok D4 No. 2",
    "noWhatsapp": "081290001004",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Guru / Dosen",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Siti (Istri), 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Bulan (Oktober)",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Bulanan via Transfer BRI",
    "pin": "Hendra@D4"
  },
  {
    "no": 5,
    "id": "#WRG-005",
    "namaLengkap": "Ibu Ratna Sari",
    "jenisKelamin": "Perempuan",
    "blok": "D9",
    "noRumah": "7",
    "alamatRumah": "Blok D9 No. 7",
    "noWhatsapp": "081290001005",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Dokter / Tenaga Medis",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "1 Anak, 1 Asisten Rumah Tangga",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Tahunan via Transfer BSI",
    "pin": "Ratna@D9"
  },
  {
    "no": 6,
    "id": "#WRG-006",
    "namaLengkap": "Bapak Eko Prasetyo",
    "jenisKelamin": "Laki-laki",
    "blok": "E3",
    "noRumah": "21",
    "alamatRumah": "Blok E3 No. 21",
    "noWhatsapp": "081290001006",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "TNI / POLRI",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Desi (Istri), 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Semester via Mandiri",
    "pin": "Eko@E3"
  },
  {
    "no": 7,
    "id": "#WRG-007",
    "namaLengkap": "Bapak Fajar Nugraha",
    "jenisKelamin": "Laki-laki",
    "blok": "F2",
    "noRumah": "11",
    "alamatRumah": "Blok F2 No. 11",
    "noWhatsapp": "081290001007",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Karyawan BUMN",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Dian (Istri), 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "3 Bulan",
    "nominalIpl": 90000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Triwulan via QRIS",
    "pin": "Fajar@F2"
  },
  {
    "no": 8,
    "id": "#WRG-008",
    "namaLengkap": "Ibu Siti Nurhaliza",
    "jenisKelamin": "Perempuan",
    "blok": "B3",
    "noRumah": "14",
    "alamatRumah": "Blok B3 No. 14",
    "noWhatsapp": "081290001008",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Suami, 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Bulan (Oktober)",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Bulanan via Transfer BCA",
    "pin": "Siti@B3"
  },
  {
    "no": 9,
    "id": "#WRG-009",
    "namaLengkap": "Bapak Wahyu Hidayat",
    "jenisKelamin": "Laki-laki",
    "blok": "G1",
    "noRumah": "9",
    "alamatRumah": "Blok G1 No. 9",
    "noWhatsapp": "081290001009",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Arsitek / Desainer",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Lilis (Istri), 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Setor 1 Tahun via Transfer BNI",
    "pin": "Wahyu@G1"
  },
  {
    "no": 10,
    "id": "#WRG-010",
    "namaLengkap": "Bapak Rizky Febrian",
    "jenisKelamin": "Laki-laki",
    "blok": "A2",
    "noRumah": "12",
    "alamatRumah": "Blok A2 No. 12",
    "noWhatsapp": "081290001010",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Karyawan Swasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Ibu Mahalini (Istri)",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Menunggu Verifikasi • Paket 6 Bulan via Transfer Mandiri",
    "pin": "Rizky@A2"
  },
  {
    "no": 11,
    "id": "#WRG-011",
    "namaLengkap": "Bapak Budi Santoso",
    "jenisKelamin": "Laki-laki",
    "blok": "D8",
    "noRumah": "1",
    "alamatRumah": "Blok D8 No. 1",
    "noWhatsapp": "081290001011",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Pengusaha",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Endang (Istri), 2 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun + Bonus 1 Bln (13 Bln)",
    "nominalIpl": 390000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Lunas IPL 13 Bulan • Terbit Kwitansi Resmi",
    "pin": "Budi@D8"
  },
  {
    "no": 12,
    "id": "#WRG-012",
    "namaLengkap": "Bapak Tri Wicaksono",
    "jenisKelamin": "Laki-laki",
    "blok": "C1",
    "noRumah": "4",
    "alamatRumah": "Blok C1 No. 4",
    "noWhatsapp": "081290001012",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Karyawan Swasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Tari (Istri), 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "10 Okt 2026",
    "catatan": "Lunas 1 Tahun",
    "pin": "Tri@C1"
  },
  {
    "no": 13,
    "id": "#WRG-013",
    "namaLengkap": "Bapak Asep Sunandar",
    "jenisKelamin": "Laki-laki",
    "blok": "B1",
    "noRumah": "6",
    "alamatRumah": "Blok B1 No. 6",
    "noWhatsapp": "081290001013",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Ceu Popon (Istri), 2 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "08 Okt 2026",
    "catatan": "Lunas Semester",
    "pin": "Asep@B1"
  },
  {
    "no": 14,
    "id": "#WRG-014",
    "namaLengkap": "Ibu Dewi Lestari",
    "jenisKelamin": "Perempuan",
    "blok": "E1",
    "noRumah": "10",
    "alamatRumah": "Blok E1 No. 10",
    "noWhatsapp": "081290001014",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Penulis / Freelancer",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Suami, 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "07 Okt 2026",
    "catatan": "Lunas 6 Bulan",
    "pin": "Dewi@E1"
  },
  {
    "no": 15,
    "id": "#WRG-015",
    "namaLengkap": "Bapak Joko Widodo",
    "jenisKelamin": "Laki-laki",
    "blok": "A3",
    "noRumah": "7",
    "alamatRumah": "Blok A3 No. 7",
    "noWhatsapp": "081290001015",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Pensiunan",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Ibu Iriana (Istri)",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "05 Okt 2026",
    "catatan": "Lunas 1 Tahun",
    "pin": "Joko@A3"
  },
  {
    "no": 16,
    "id": "#WRG-016",
    "namaLengkap": "Bapak Surya Paloh",
    "jenisKelamin": "Laki-laki",
    "blok": "H2",
    "noRumah": "3",
    "alamatRumah": "Blok H2 No. 3",
    "noWhatsapp": "081290001016",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Rosita (Istri), 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "04 Okt 2026",
    "catatan": "Lunas Triwulan",
    "pin": "Surya@H2"
  },
  {
    "no": 17,
    "id": "#WRG-017",
    "namaLengkap": "Bapak Sandiaga Uno",
    "jenisKelamin": "Laki-laki",
    "blok": "C2",
    "noRumah": "1",
    "alamatRumah": "Blok C2 No. 1",
    "noWhatsapp": "081290001017",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Pengusaha",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Nur Asia (Istri), 2 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "03 Okt 2026",
    "catatan": "Lunas 1 Tahun",
    "pin": "Sandi@C2"
  },
  {
    "no": 18,
    "id": "#WRG-018",
    "namaLengkap": "Ibu Sri Mulyani",
    "jenisKelamin": "Perempuan",
    "blok": "F1",
    "noRumah": "8",
    "alamatRumah": "Blok F1 No. 8",
    "noWhatsapp": "081290001018",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "PNS / Dosen",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Suami, 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "02 Okt 2026",
    "catatan": "Lunas 6 Bulan",
    "pin": "Sri@F1"
  },
  {
    "no": 19,
    "id": "#WRG-019",
    "namaLengkap": "Bapak Anies Baswedan",
    "jenisKelamin": "Laki-laki",
    "blok": "D1",
    "noRumah": "5",
    "alamatRumah": "Blok D1 No. 5",
    "noWhatsapp": "081290001019",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Akademisi / Peneliti",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Fery (Istri), 2 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "01 Okt 2026",
    "catatan": "Lunas 1 Tahun",
    "pin": "Anies@D1"
  },
  {
    "no": 20,
    "id": "#WRG-020",
    "namaLengkap": "Bapak Ganjar Pranowo",
    "jenisKelamin": "Laki-laki",
    "blok": "E2",
    "noRumah": "15",
    "alamatRumah": "Blok E2 No. 15",
    "noWhatsapp": "081290001020",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Hukum / Advokat",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Atikoh (Istri), 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "01 Okt 2026",
    "catatan": "Lunas Triwulan",
    "pin": "Ganjar@E2"
  },
  {
    "no": 21,
    "id": "#WRG-021",
    "namaLengkap": "Bapak Bambang Soesatyo",
    "jenisKelamin": "Laki-laki",
    "blok": "B4",
    "noRumah": "2",
    "alamatRumah": "Blok B4 No. 2",
    "noWhatsapp": "081290001021",
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Istri",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Belum Bayar • Status Pulang-Pergi (Tunggakan 1 Bulan)",
    "pin": "Bambang@B4"
  },
  {
    "no": 22,
    "id": "#WRG-022",
    "namaLengkap": "Bapak Prabowo Subianto",
    "jenisKelamin": "Laki-laki",
    "blok": "A4",
    "noRumah": "1",
    "alamatRumah": "Blok A4 No. 1",
    "noWhatsapp": "081290001022",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Purnawirawan",
    "agama": "Islam",
    "statusPernikahan": "Cerai hidup",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 1,
    "anggotaKeluargaTambahan": "-",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Belum Bayar • Rumah Renovasi Belum Ditempati",
    "pin": "Prabowo@A4"
  },
  {
    "no": 23,
    "id": "#WRG-023",
    "namaLengkap": "Bapak Erick Thohir",
    "jenisKelamin": "Laki-laki",
    "blok": "C4",
    "noRumah": "5",
    "alamatRumah": "Blok C4 No. 5",
    "noWhatsapp": "081290001023",
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Pengusaha",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Istri, 1 Anak",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Belum Bayar • Sering tugas dinas luar kota",
    "pin": "Erick@C4"
  },
  {
    "no": 24,
    "id": "#WRG-024",
    "namaLengkap": "Ibu Puan Maharani",
    "jenisKelamin": "Perempuan",
    "blok": "D3",
    "noRumah": "9",
    "alamatRumah": "Blok D3 No. 9",
    "noWhatsapp": "081290001024",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Pejabat Publik",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Suami",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Belum Bayar • Rumah Baru Serah Terima Kunci",
    "pin": "Puan@D3"
  },
  {
    "no": 25,
    "id": "#WRG-025",
    "namaLengkap": "Bapak Muhaimin Iskandar",
    "jenisKelamin": "Laki-laki",
    "blok": "E4",
    "noRumah": "8",
    "alamatRumah": "Blok E4 No. 8",
    "noWhatsapp": "081290001025",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Politisi",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Ditolak",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Ditolak: Nominal transfer kurang Rp 15.000 dari tarif paket",
    "pin": "Imin@E4"
  },
  {
    "no": 26,
    "id": "#WRG-026",
    "namaLengkap": "Bapak Gibran Rakabuming",
    "jenisKelamin": "Laki-laki",
    "blok": "F3",
    "noRumah": "4",
    "alamatRumah": "Blok F3 No. 4",
    "noWhatsapp": "081290001026",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Selvi (Istri), 2 Anak",
    "statusIpl": "Ditolak",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Ditolak: Bukti struk transfer buram tidak terbaca",
    "pin": "Gibran@F3"
  },
  {
    "no": 27,
    "id": "#WRG-027",
    "namaLengkap": "Bapak Mahfud MD",
    "jenisKelamin": "Laki-laki",
    "blok": "G2",
    "noRumah": "6",
    "alamatRumah": "Blok G2 No. 6",
    "noWhatsapp": "081290001027",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Ahli Hukum",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Zaizatun (Istri), 1 Anak",
    "statusIpl": "Ditolak",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Ditolak: Rekening tujuan keliru",
    "pin": "Mahfud@G2"
  },
  {
    "no": 28,
    "id": "#WRG-028",
    "namaLengkap": "Bapak Luhut Binsar Panjaitan",
    "jenisKelamin": "Laki-laki",
    "blok": "H1",
    "noRumah": "1",
    "alamatRumah": "Blok H1 No. 1",
    "noWhatsapp": "081290001028",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Purnawirawan / Penasihat",
    "agama": "Kristen",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Ibu Devi (Istri), 2 Asisten",
    "statusIpl": "Lunas",
    "periodeTercover": "2 Tahun (24 Bulan)",
    "nominalIpl": 720000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Warga Teladan • Lunas IPL 2 Tahun Penuh + Donatur PJU Rp 500.000",
    "pin": "Luhut@H1"
  },
  {
    "no": 29,
    "id": "#WRG-029",
    "namaLengkap": "Ibu Megawati Soekarnoputri",
    "jenisKelamin": "Perempuan",
    "blok": "A5",
    "noRumah": "3",
    "alamatRumah": "Blok A5 No. 3",
    "noWhatsapp": "081290001029",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Pensiunan",
    "agama": "Islam",
    "statusPernikahan": "Cerai mati",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "1 Kerabat Lansia",
    "statusIpl": "Lunas",
    "periodeTercover": "Bebas Iuran Paguyuban (Subsidi Lansia)",
    "nominalIpl": 0,
    "tanggalUpdate": "10 Okt 2026",
    "catatan": "Subsidi Paguyuban: Pembebasan Iuran IPL Warga Sepuh / Lansia RT 08",
    "pin": "Mega@A5"
  },
  {
    "no": 30,
    "id": "#WRG-030",
    "namaLengkap": "Bapak Kaesang Pangarep",
    "jenisKelamin": "Laki-laki",
    "blok": "B5",
    "noRumah": "10",
    "alamatRumah": "Blok B5 No. 10",
    "noWhatsapp": "081290001030",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Wiraswasta Muda",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Ibu Erina (Istri)",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "-",
    "nominalIpl": 30000,
    "tanggalUpdate": "14 Okt 2026",
    "catatan": "Warga Baru • Belum menetap, baru serah terima kunci komplek",
    "pin": "Kaesang@B5"
  }
];

export const initialTransaksiIplList: TransaksiIPL[] = [
  {
    "no": 1,
    "noTransaksi": "#TRX-001",
    "namaWarga": "Bapak Ridwan Kamil",
    "lokasiRumah": "Blok A1 No. 5",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Pengajuan pelunasan IPL 1 Tahun di muka"
  },
  {
    "no": 2,
    "noTransaksi": "#TRX-002",
    "namaWarga": "Bapak Dimas Pratama",
    "lokasiRumah": "Blok B2 No. 8",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "/bukti-bayar/struk_qris_01.png",
    "keterangan": "Setoran semester 6 bulan via QRIS"
  },
  {
    "no": 3,
    "noTransaksi": "#TRX-003",
    "namaWarga": "Bapak Agus Wahyudi",
    "lokasiRumah": "Blok C3 No. 3",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan",
    "nominalBayar": 90000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "/bukti-bayar/struk_transfer_wa1.jpg",
    "keterangan": "Bayar triwulan Okt-Des"
  },
  {
    "no": 4,
    "noTransaksi": "#TRX-004",
    "namaWarga": "Bapak Hendra Kusuma",
    "lokasiRumah": "Blok D4 No. 2",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BRI",
    "buktiBayar": "/bukti-bayar/struk_ipl_02.png",
    "keterangan": "Setoran rutin bulan Oktober"
  },
  {
    "no": 5,
    "noTransaksi": "#TRX-005",
    "namaWarga": "Ibu Ratna Sari",
    "lokasiRumah": "Blok D9 No. 7",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BSI",
    "buktiBayar": "/bukti-bayar/struk_ipl_03.png",
    "keterangan": "Setoran 1 tahun di muka via BSI Mobile"
  },
  {
    "no": 6,
    "noTransaksi": "#TRX-006",
    "namaWarga": "Bapak Eko Prasetyo",
    "lokasiRumah": "Blok E3 No. 21",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Paket 6 bulan via Livin Mandiri"
  },
  {
    "no": 7,
    "noTransaksi": "#TRX-007",
    "namaWarga": "Bapak Fajar Nugraha",
    "lokasiRumah": "Blok F2 No. 11",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan",
    "nominalBayar": 90000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "/bukti-bayar/struk_qris_02.png",
    "keterangan": "Pembayaran triwulan via QRIS"
  },
  {
    "no": 8,
    "noTransaksi": "#TRX-008",
    "namaWarga": "Ibu Siti Nurhaliza",
    "lokasiRumah": "Blok B3 No. 14",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "/bukti-bayar/struk_transfer_wa2.jpg",
    "keterangan": "Iuran IPL bulan Oktober 2026"
  },
  {
    "no": 9,
    "noTransaksi": "#TRX-009",
    "namaWarga": "Bapak Wahyu Hidayat",
    "lokasiRumah": "Blok G1 No. 9",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BNI",
    "buktiBayar": "/bukti-bayar/struk_ipl_02.png",
    "keterangan": "Pembayaran 1 Tahun penuh"
  },
  {
    "no": 10,
    "noTransaksi": "#TRX-010",
    "namaWarga": "Bapak Rizky Febrian",
    "lokasiRumah": "Blok A2 No. 12",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Setoran 6 bulan periode Okt-Mar"
  },
  {
    "no": 11,
    "noTransaksi": "#TRX-011",
    "namaWarga": "Bapak Budi Santoso",
    "lokasiRumah": "Blok D8 No. 1",
    "periodeTercover": "Aktif s/d 31 Okt 2027",
    "durasiPaket": "1 Tahun 1 Bln (13 Bulan)",
    "nominalBayar": 390000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer Bank Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Lunas terverifikasi kwitansi sah oleh Bendahara"
  },
  {
    "no": 12,
    "noTransaksi": "#TRX-012",
    "namaWarga": "Bapak Tri Wicaksono",
    "lokasiRumah": "Blok C1 No. 4",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Lunas",
    "tanggalPelunasan": "10 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "/bukti-bayar/struk_transfer_wa1.jpg",
    "keterangan": "Lunas 1 tahun di muka"
  },
  {
    "no": 13,
    "noTransaksi": "#TRX-013",
    "namaWarga": "Bapak Asep Sunandar",
    "lokasiRumah": "Blok B1 No. 6",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Lunas",
    "tanggalPelunasan": "08 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_02.png",
    "keterangan": "Lunas Semester 6 Bulan"
  },
  {
    "no": 14,
    "noTransaksi": "#TRX-014",
    "namaWarga": "Ibu Dewi Lestari",
    "lokasiRumah": "Blok E1 No. 10",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Lunas",
    "tanggalPelunasan": "07 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "/bukti-bayar/struk_qris_01.png",
    "keterangan": "Lunas via QRIS"
  },
  {
    "no": 15,
    "noTransaksi": "#TRX-015",
    "namaWarga": "Bapak Joko Widodo",
    "lokasiRumah": "Blok A3 No. 7",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Lunas",
    "tanggalPelunasan": "05 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "/bukti-bayar/struk_transfer_wa2.jpg",
    "keterangan": "Lunas Setahun di muka"
  },
  {
    "no": 16,
    "noTransaksi": "#TRX-016",
    "namaWarga": "Bapak Surya Paloh",
    "lokasiRumah": "Blok H2 No. 3",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan",
    "nominalBayar": 90000,
    "status": "Lunas",
    "tanggalPelunasan": "04 Okt 2026",
    "metodePembayaran": "Transfer BSI",
    "buktiBayar": "/bukti-bayar/struk_ipl_03.png",
    "keterangan": "Lunas Triwulan"
  },
  {
    "no": 17,
    "noTransaksi": "#TRX-017",
    "namaWarga": "Bapak Sandiaga Uno",
    "lokasiRumah": "Blok C2 No. 1",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Lunas",
    "tanggalPelunasan": "03 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Lunas 1 Tahun Penuh"
  },
  {
    "no": 18,
    "noTransaksi": "#TRX-018",
    "namaWarga": "Ibu Sri Mulyani",
    "lokasiRumah": "Blok F1 No. 8",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Lunas",
    "tanggalPelunasan": "02 Okt 2026",
    "metodePembayaran": "Transfer BRI",
    "buktiBayar": "/bukti-bayar/struk_ipl_02.png",
    "keterangan": "Lunas Semester via BRImo"
  },
  {
    "no": 19,
    "noTransaksi": "#TRX-019",
    "namaWarga": "Bapak Anies Baswedan",
    "lokasiRumah": "Blok D1 No. 5",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Lunas",
    "tanggalPelunasan": "01 Okt 2026",
    "metodePembayaran": "Transfer BSI",
    "buktiBayar": "/bukti-bayar/struk_ipl_03.png",
    "keterangan": "Lunas 1 Tahun"
  },
  {
    "no": 20,
    "noTransaksi": "#TRX-020",
    "namaWarga": "Bapak Ganjar Pranowo",
    "lokasiRumah": "Blok E2 No. 15",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan",
    "nominalBayar": 90000,
    "status": "Lunas",
    "tanggalPelunasan": "01 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "/bukti-bayar/struk_qris_02.png",
    "keterangan": "Lunas Triwulan via QRIS"
  },
  {
    "no": 21,
    "noTransaksi": "#TRX-021",
    "namaWarga": "Bapak Muhaimin Iskandar",
    "lokasiRumah": "Blok E4 No. 8",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan",
    "nominalBayar": 75000,
    "status": "Ditolak",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Ditolak: Nominal transfer kurang Rp 15.000 (Tertera Rp 75.000, seharusnya Rp 90.000 untuk 3 Bulan)"
  },
  {
    "no": 22,
    "noTransaksi": "#TRX-022",
    "namaWarga": "Bapak Gibran Rakabuming",
    "lokasiRumah": "Blok F3 No. 4",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Ditolak",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "/bukti-bayar/struk_qris_01.png",
    "keterangan": "Ditolak: Foto resi buram/terpotong, mohon unggah ulang tangkapan layar m-banking yang jelas"
  },
  {
    "no": 23,
    "noTransaksi": "#TRX-023",
    "namaWarga": "Bapak Mahfud MD",
    "lokasiRumah": "Blok G2 No. 6",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Ditolak",
    "tanggalPelunasan": "14 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "/bukti-bayar/struk_transfer_wa1.jpg",
    "keterangan": "Ditolak: Transfer tertuju ke rekening pihak ketiga lain, bukan rekening resmi kas Paguyuban PK8"
  },
  {
    "no": 24,
    "noTransaksi": "#TRX-024",
    "namaWarga": "Bapak Luhut Binsar Panjaitan",
    "lokasiRumah": "Blok H1 No. 1",
    "periodeTercover": "Okt 2026 - Sep 2028",
    "durasiPaket": "24 Bulan (2 Tahun)",
    "nominalBayar": 720000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "/bukti-bayar/struk_ipl_01.png",
    "keterangan": "Lunas 2 Tahun Sekaligus terverifikasi"
  },
  {
    "no": 25,
    "noTransaksi": "#TRX-025",
    "namaWarga": "Ibu Megawati Soekarnoputri",
    "lokasiRumah": "Blok A5 No. 3",
    "periodeTercover": "Bebas Iuran Seumur Hidup",
    "durasiPaket": "Subsidi Khusus",
    "nominalBayar": 0,
    "status": "Lunas",
    "tanggalPelunasan": "10 Okt 2026",
    "metodePembayaran": "Subsidi Kas Paguyuban",
    "buktiBayar": "/bukti-bayar/struk_ipl_02.png",
    "keterangan": "Subsidi resmi hasil musyawarah warga"
  }
];

export const initialPengeluaranKasList: PengeluaranKasRecord[] = [
  {
    "id": "#EXP-001",
    "tanggal": "05 Okt 2026",
    "kategori": "Listrik & PJU",
    "keterangan": "Beli Lampu LED PJU Tiang Blok A–H & Fitting Outdoor Waterproof",
    "nominal": 350000,
    "penerima": "Toko Listrik Sinar Jaya"
  },
  {
    "id": "#EXP-002",
    "tanggal": "08 Okt 2026",
    "kategori": "Keamanan & Satpam",
    "keterangan": "Honor Petugas Ronda Malam Minggu & Pengadaan Senter Patroli",
    "nominal": 200000,
    "penerima": "Seksi Keamanan & Ketertiban"
  },
  {
    "id": "#EXP-003",
    "tanggal": "11 Okt 2026",
    "kategori": "Sampah & Kebersihan",
    "keterangan": "Konsumsi & Logistik Kerja Bakti Pembersihan Saluran Air Musim Hujan",
    "nominal": 150000,
    "penerima": "Koordinator Lingkungan Hidup"
  }
];

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
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Ridwan Kamil",
        "blokRumah": "Blok A1 No. 5",
        "isKoordinator": true,
        "noWhatsapp": "081290001001"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Dimas Pratama",
        "blokRumah": "Blok B2 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001002"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "Blok C3 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001003"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "Blok D4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001004"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Ratna Sari",
        "blokRumah": "Blok D9 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001005"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": false,
        "noWhatsapp": "081290001006"
      }
    ]
  },
  {
    "id": "RND-M1-SELASA",
    "hari": "Selasa (MINGGU 1)",
    "tanggal": "02 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Dimas Pratama",
        "blokRumah": "Blok B2 No. 8",
        "isKoordinator": true,
        "noWhatsapp": "081290001002"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "Blok C3 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001003"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "Blok D4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001004"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Ratna Sari",
        "blokRumah": "Blok D9 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001005"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": false,
        "noWhatsapp": "081290001006"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": false,
        "noWhatsapp": "081290001007"
      }
    ]
  },
  {
    "id": "RND-M1-RABU",
    "hari": "Rabu (MINGGU 1)",
    "tanggal": "03 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "Blok C3 No. 3",
        "isKoordinator": true,
        "noWhatsapp": "081290001003"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "Blok D4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001004"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Ratna Sari",
        "blokRumah": "Blok D9 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001005"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": false,
        "noWhatsapp": "081290001006"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": false,
        "noWhatsapp": "081290001007"
      },
      {
        "slot": 6,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": false,
        "noWhatsapp": "081290001008"
      }
    ]
  },
  {
    "id": "RND-M1-KAMIS",
    "hari": "Kamis (MINGGU 1)",
    "tanggal": "04 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "Blok D4 No. 2",
        "isKoordinator": true,
        "noWhatsapp": "081290001004"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Ratna Sari",
        "blokRumah": "Blok D9 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001005"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": false,
        "noWhatsapp": "081290001006"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": false,
        "noWhatsapp": "081290001007"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": false,
        "noWhatsapp": "081290001008"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001009"
      }
    ]
  },
  {
    "id": "RND-M1-JUMAT",
    "hari": "Jumat (MINGGU 1)",
    "tanggal": "05 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Ibu Ratna Sari",
        "blokRumah": "Blok D9 No. 7",
        "isKoordinator": true,
        "noWhatsapp": "081290001005"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": false,
        "noWhatsapp": "081290001006"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": false,
        "noWhatsapp": "081290001007"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": false,
        "noWhatsapp": "081290001008"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001009"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": false,
        "noWhatsapp": "081290001010"
      }
    ]
  },
  {
    "id": "RND-M1-SABTU",
    "hari": "Sabtu (MINGGU 1)",
    "tanggal": "06 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "Blok E3 No. 21",
        "isKoordinator": true,
        "noWhatsapp": "081290001006"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": false,
        "noWhatsapp": "081290001007"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": false,
        "noWhatsapp": "081290001008"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001009"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": false,
        "noWhatsapp": "081290001010"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001011"
      }
    ]
  },
  {
    "id": "RND-M1-MINGGU",
    "hari": "Minggu (MINGGU 1)",
    "tanggal": "07 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 1,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Fajar Nugraha",
        "blokRumah": "Blok F2 No. 11",
        "isKoordinator": true,
        "noWhatsapp": "081290001007"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": false,
        "noWhatsapp": "081290001008"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001009"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": false,
        "noWhatsapp": "081290001010"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001011"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001012"
      }
    ]
  },
  {
    "id": "RND-M2-SENIN",
    "hari": "Senin (MINGGU 2)",
    "tanggal": "08 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "Blok B3 No. 14",
        "isKoordinator": true,
        "noWhatsapp": "081290001008"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001009"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": false,
        "noWhatsapp": "081290001010"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001011"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001012"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001013"
      }
    ]
  },
  {
    "id": "RND-M2-SELASA",
    "hari": "Selasa (MINGGU 2)",
    "tanggal": "09 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Wahyu Hidayat",
        "blokRumah": "Blok G1 No. 9",
        "isKoordinator": true,
        "noWhatsapp": "081290001009"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": false,
        "noWhatsapp": "081290001010"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001011"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001012"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001013"
      },
      {
        "slot": 6,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001014"
      }
    ]
  },
  {
    "id": "RND-M2-RABU",
    "hari": "Rabu (MINGGU 2)",
    "tanggal": "10 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Rizky Febrian",
        "blokRumah": "Blok A2 No. 12",
        "isKoordinator": true,
        "noWhatsapp": "081290001010"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001011"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001012"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001013"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001014"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001015"
      }
    ]
  },
  {
    "id": "RND-M2-KAMIS",
    "hari": "Kamis (MINGGU 2)",
    "tanggal": "11 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Budi Santoso",
        "blokRumah": "Blok D8 No. 1",
        "isKoordinator": true,
        "noWhatsapp": "081290001011"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001012"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001013"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001014"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001015"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001016"
      }
    ]
  },
  {
    "id": "RND-M2-JUMAT",
    "hari": "Jumat (MINGGU 2)",
    "tanggal": "12 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Tri Wicaksono",
        "blokRumah": "Blok C1 No. 4",
        "isKoordinator": true,
        "noWhatsapp": "081290001012"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001013"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001014"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001015"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001016"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001017"
      }
    ]
  },
  {
    "id": "RND-M2-SABTU",
    "hari": "Sabtu (MINGGU 2)",
    "tanggal": "13 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Asep Sunandar",
        "blokRumah": "Blok B1 No. 6",
        "isKoordinator": true,
        "noWhatsapp": "081290001013"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001014"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001015"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001016"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001017"
      },
      {
        "slot": 6,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001018"
      }
    ]
  },
  {
    "id": "RND-M2-MINGGU",
    "hari": "Minggu (MINGGU 2)",
    "tanggal": "14 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 2,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Ibu Dewi Lestari",
        "blokRumah": "Blok E1 No. 10",
        "isKoordinator": true,
        "noWhatsapp": "081290001014"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": false,
        "noWhatsapp": "081290001015"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001016"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001017"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001018"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001019"
      }
    ]
  },
  {
    "id": "RND-M3-SENIN",
    "hari": "Senin (MINGGU 3)",
    "tanggal": "15 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Joko Widodo",
        "blokRumah": "Blok A3 No. 7",
        "isKoordinator": true,
        "noWhatsapp": "081290001015"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001016"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001017"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001018"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001019"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": false,
        "noWhatsapp": "081290001020"
      }
    ]
  },
  {
    "id": "RND-M3-SELASA",
    "hari": "Selasa (MINGGU 3)",
    "tanggal": "16 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Surya Paloh",
        "blokRumah": "Blok H2 No. 3",
        "isKoordinator": true,
        "noWhatsapp": "081290001016"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001017"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001018"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001019"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": false,
        "noWhatsapp": "081290001020"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001021"
      }
    ]
  },
  {
    "id": "RND-M3-RABU",
    "hari": "Rabu (MINGGU 3)",
    "tanggal": "17 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Sandiaga Uno",
        "blokRumah": "Blok C2 No. 1",
        "isKoordinator": true,
        "noWhatsapp": "081290001017"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001018"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001019"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": false,
        "noWhatsapp": "081290001020"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001021"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001022"
      }
    ]
  },
  {
    "id": "RND-M3-KAMIS",
    "hari": "Kamis (MINGGU 3)",
    "tanggal": "18 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Ibu Sri Mulyani",
        "blokRumah": "Blok F1 No. 8",
        "isKoordinator": true,
        "noWhatsapp": "081290001018"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001019"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": false,
        "noWhatsapp": "081290001020"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001021"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001022"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001023"
      }
    ]
  },
  {
    "id": "RND-M3-JUMAT",
    "hari": "Jumat (MINGGU 3)",
    "tanggal": "19 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Anies Baswedan",
        "blokRumah": "Blok D1 No. 5",
        "isKoordinator": true,
        "noWhatsapp": "081290001019"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": false,
        "noWhatsapp": "081290001020"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001021"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001022"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001023"
      },
      {
        "slot": 6,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001024"
      }
    ]
  },
  {
    "id": "RND-M3-SABTU",
    "hari": "Sabtu (MINGGU 3)",
    "tanggal": "20 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Ganjar Pranowo",
        "blokRumah": "Blok E2 No. 15",
        "isKoordinator": true,
        "noWhatsapp": "081290001020"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": false,
        "noWhatsapp": "081290001021"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001022"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001023"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001024"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001025"
      }
    ]
  },
  {
    "id": "RND-M3-MINGGU",
    "hari": "Minggu (MINGGU 3)",
    "tanggal": "21 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 3,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Bambang Soesatyo",
        "blokRumah": "Blok B4 No. 2",
        "isKoordinator": true,
        "noWhatsapp": "081290001021"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001022"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001023"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001024"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001025"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001026"
      }
    ]
  },
  {
    "id": "RND-M4-SENIN",
    "hari": "Senin (MINGGU 4)",
    "tanggal": "22 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Prabowo Subianto",
        "blokRumah": "Blok A4 No. 1",
        "isKoordinator": true,
        "noWhatsapp": "081290001022"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001023"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001024"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001025"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001026"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001027"
      }
    ]
  },
  {
    "id": "RND-M4-SELASA",
    "hari": "Selasa (MINGGU 4)",
    "tanggal": "23 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Erick Thohir",
        "blokRumah": "Blok C4 No. 5",
        "isKoordinator": true,
        "noWhatsapp": "081290001023"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": false,
        "noWhatsapp": "081290001024"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001025"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001026"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001027"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001028"
      }
    ]
  },
  {
    "id": "RND-M4-RABU",
    "hari": "Rabu (MINGGU 4)",
    "tanggal": "24 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Ibu Puan Maharani",
        "blokRumah": "Blok D3 No. 9",
        "isKoordinator": true,
        "noWhatsapp": "081290001024"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001025"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001026"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001027"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001028"
      },
      {
        "slot": 6,
        "namaLengkap": "Ibu Megawati Soekarnoputri",
        "blokRumah": "Blok A5 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001029"
      }
    ]
  },
  {
    "id": "RND-M4-KAMIS",
    "hari": "Kamis (MINGGU 4)",
    "tanggal": "25 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Muhaimin Iskandar",
        "blokRumah": "Blok E4 No. 8",
        "isKoordinator": true,
        "noWhatsapp": "081290001025"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": false,
        "noWhatsapp": "081290001026"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001027"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001028"
      },
      {
        "slot": 5,
        "namaLengkap": "Ibu Megawati Soekarnoputri",
        "blokRumah": "Blok A5 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001029"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Kaesang Pangarep",
        "blokRumah": "Blok B5 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001030"
      }
    ]
  },
  {
    "id": "RND-M4-JUMAT",
    "hari": "Jumat (MINGGU 4)",
    "tanggal": "26 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Gibran Rakabuming",
        "blokRumah": "Blok F3 No. 4",
        "isKoordinator": true,
        "noWhatsapp": "081290001026"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": false,
        "noWhatsapp": "081290001027"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001028"
      },
      {
        "slot": 4,
        "namaLengkap": "Ibu Megawati Soekarnoputri",
        "blokRumah": "Blok A5 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001029"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Kaesang Pangarep",
        "blokRumah": "Blok B5 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001030"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Ridwan Kamil",
        "blokRumah": "Blok A1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001001"
      }
    ]
  },
  {
    "id": "RND-M4-SABTU",
    "hari": "Sabtu (MINGGU 4)",
    "tanggal": "27 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Mahfud MD",
        "blokRumah": "Blok G2 No. 6",
        "isKoordinator": true,
        "noWhatsapp": "081290001027"
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": false,
        "noWhatsapp": "081290001028"
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Megawati Soekarnoputri",
        "blokRumah": "Blok A5 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001029"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Kaesang Pangarep",
        "blokRumah": "Blok B5 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001030"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Ridwan Kamil",
        "blokRumah": "Blok A1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001001"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Dimas Pratama",
        "blokRumah": "Blok B2 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001002"
      }
    ]
  },
  {
    "id": "RND-M4-MINGGU",
    "hari": "Minggu (MINGGU 4)",
    "tanggal": "28 Okt 2026",
    "jamOperasional": "22:00 - 04:00 WIB",
    "lokasiPos": "Pos Keamanan Gerbang Utama PK8",
    "mingguKe": 4,
    "catatan": "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "Bapak Luhut Binsar Panjaitan",
        "blokRumah": "Blok H1 No. 1",
        "isKoordinator": true,
        "noWhatsapp": "081290001028"
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Megawati Soekarnoputri",
        "blokRumah": "Blok A5 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001029"
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Kaesang Pangarep",
        "blokRumah": "Blok B5 No. 10",
        "isKoordinator": false,
        "noWhatsapp": "081290001030"
      },
      {
        "slot": 4,
        "namaLengkap": "Bapak Ridwan Kamil",
        "blokRumah": "Blok A1 No. 5",
        "isKoordinator": false,
        "noWhatsapp": "081290001001"
      },
      {
        "slot": 5,
        "namaLengkap": "Bapak Dimas Pratama",
        "blokRumah": "Blok B2 No. 8",
        "isKoordinator": false,
        "noWhatsapp": "081290001002"
      },
      {
        "slot": 6,
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "Blok C3 No. 3",
        "isKoordinator": false,
        "noWhatsapp": "081290001003"
      }
    ]
  }
];

export const initialPengumumanList: PengumumanRecord[] = [
  {
    "id": "PGM-001",
    "judul": "Kerja Bakti Bersama Pembersihan Saluran Air Musim Hujan",
    "kategori": "Sosial & Kerja Bakti",
    "tanggalAcara": "Minggu, 18 Oktober 2026",
    "waktu": "07.30 - 11.00 WIB",
    "lokasi": "Lingkungan Blok A–H & Fasum Taman PK8",
    "deskripsi": "Dihimbau kepada seluruh bapak/ibu warga Pesona Kahuripan 8 Tahap 2 untuk berpartisipasi dalam kerja bakti massal pembersihan drainase dan fasilitas umum komplek.",
    "author": "Pengurus BPH Paguyuban",
    "status": "PUBLISHED",
    "createdAt": "12 Okt 2026"
  },
  {
    "id": "PGM-002",
    "judul": "Pemasangan Lampu LED Penerangan Jalan (PJU) Baru",
    "kategori": "Info Warga & Fasum",
    "tanggalAcara": "Sabtu, 17 Oktober 2026",
    "waktu": "09.00 - 16.00 WIB",
    "lokasi": "Tiang Jalan Utama & Gang Blok C–E",
    "deskripsi": "Update realisasi dana urunan PJU warga: Telah dipasang 12 unit lampu LED 50W hemat energi waterproof untuk meningkatkan keamanan penerangan jalan malam hari.",
    "author": "Seksi Fasum & Logistik",
    "status": "PUBLISHED",
    "createdAt": "12 Okt 2026"
  },
  {
    "id": "PGM-003",
    "judul": "Sosialisasi Siskamling & Pembaruan Jadwal Ronda Malam",
    "kategori": "Keamanan & Ronda",
    "tanggalAcara": "Jumat, 16 Oktober 2026",
    "waktu": "20.00 - 21.30 WIB",
    "lokasi": "Pos Keamanan Gerbang Utama PK8",
    "deskripsi": "Pertemuan koordinasi petugas ronda malam siskamling dan evaluasi keamanan komplek bersama satpam dan seluruh koordinator lapangan.",
    "author": "Seksi Keamanan & Ketertiban",
    "status": "PUBLISHED",
    "createdAt": "12 Okt 2026"
  }
];

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
