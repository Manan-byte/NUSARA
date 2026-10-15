import {
  WargaRecord,
  JadwalRondaRecord,
  PengumumanRecord,
  TransaksiIPL,
  DashboardSummary,
  PengeluaranKasRecord,
} from '@sim-warga/types';

export const initialDashboardSummary: DashboardSummary = {
  pemasukanIpl: 1410000,
  targetIpl: 600000,
  persentasePemasukan: '235%',
  rumahLunas: 6,
  totalRumah: 20,
  pengeluaranKas: 700000,
  saldoAwalKas: 0,
  sisaSaldoKas: 710000,
  wargaMenetap: 13,
  wargaPulangPergi: 4,
  wargaBelumMenetap: 3,
  rekapPerBlok: [],
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
    "statusIpl": "Lunas",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Lunas IPL 1 Tahun • PJU: Lunas Wajib",
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
    "statusIpl": "Lunas",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Lunas IPL Semester • Donatur PJU Rp 250.000",
    "pin": "Dimas#B2"
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
    "pekerjaan": "Dokter Umum",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Ibu Dokter (Istri), 1 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Lunas IPL Triwulan (QRIS)",
    "pin": "Agus$C3"
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
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Konsultan IT",
    "agama": "Kristen",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Istri",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Pulang-pergi akhir pekan • Donatur PJU Utama",
    "pin": "Hendra!D4"
  },
  {
    "no": 5,
    "id": "#WRG-005",
    "namaLengkap": "Bapak Fajar Nugroho",
    "jenisKelamin": "Laki-laki",
    "blok": "D8",
    "noRumah": "10",
    "alamatRumah": "Blok D8 No. 10",
    "noWhatsapp": "081290001005",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Arsitek",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 1,
    "anggotaKeluargaTambahan": "-",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "Oktober 2026",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Sedang renovasi rumah",
    "pin": "Fajar#D8"
  },
  {
    "no": 6,
    "id": "#WRG-006",
    "namaLengkap": "Ibu Ratna Sari",
    "jenisKelamin": "Perempuan",
    "blok": "D9",
    "noRumah": "7",
    "alamatRumah": "Blok D9 No. 7",
    "noWhatsapp": "081290001006",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Guru SMA",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "2 Anak",
    "statusIpl": "Ditolak",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Ditolak: Foto struk buram, mohon upload ulang",
    "pin": "Ratna$D9"
  },
  {
    "no": 7,
    "id": "#WRG-007",
    "namaLengkap": "Bapak Surya Pratama",
    "jenisKelamin": "Laki-laki",
    "blok": "D10",
    "noRumah": "4",
    "alamatRumah": "Blok D10 No. 4",
    "noWhatsapp": "081290001007",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "IPL Lunas • Donatur PJU salah nominal",
    "pin": "Surya@D10"
  },
  {
    "no": 8,
    "id": "#WRG-008",
    "namaLengkap": "Bapak Joko Widodo",
    "jenisKelamin": "Laki-laki",
    "blok": "E1",
    "noRumah": "6",
    "alamatRumah": "Blok E1 No. 6",
    "noWhatsapp": "081290001008",
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Pengusaha Mebel",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "Oktober 2026",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Tagihan IPL berjalan",
    "pin": "Joko!E1"
  },
  {
    "no": 9,
    "id": "#WRG-009",
    "namaLengkap": "Bapak Bambang Hermawan",
    "jenisKelamin": "Laki-laki",
    "blok": "E2",
    "noRumah": "12",
    "alamatRumah": "Blok E2 No. 12",
    "noWhatsapp": "081290001009",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Direktur Perusahaan",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 5,
    "anggotaKeluargaTambahan": "Istri, 3 Anak",
    "statusIpl": "Lunas",
    "periodeTercover": "2 Tahun (24 Bulan)",
    "nominalIpl": 720000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Lunas 2 Tahun di Muka • Donatur Utama PJU",
    "pin": "Bambang#E2"
  },
  {
    "no": 10,
    "id": "#WRG-010",
    "namaLengkap": "Bapak Eko Prasetyo",
    "jenisKelamin": "Laki-laki",
    "blok": "E3",
    "noRumah": "8",
    "alamatRumah": "Blok E3 No. 8",
    "noWhatsapp": "081290001010",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Desainer Interior",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 2,
    "anggotaKeluargaTambahan": "Istri",
    "statusIpl": "Belum Bayar",
    "periodeTercover": "Oktober 2026",
    "nominalIpl": 30000,
    "tanggalUpdate": "12 Okt 2026",
    "catatan": "Rumah baru serah terima",
    "pin": "Eko$E3"
  },
  {
    "no": 11,
    "id": "#WRG-011",
    "namaLengkap": "Bapak Hendra Wijaya",
    "jenisKelamin": "Laki-laki",
    "blok": "D8",
    "noRumah": "1",
    "alamatRumah": "Blok D8 No. 1",
    "noWhatsapp": "081290001011",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Karyawan BUMN",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "IPL 1 Tahun Menunggu Verifikasi • PJU Wajib Menunggu Verifikasi",
    "pin": "Hendra@D8"
  },
  {
    "no": 12,
    "id": "#WRG-012",
    "namaLengkap": "Ibu Siti Nurhaliza",
    "jenisKelamin": "Perempuan",
    "blok": "C3",
    "noRumah": "12",
    "alamatRumah": "Blok C3 No. 12",
    "noWhatsapp": "081290001012",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Toko Kelontong",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 5,
    "anggotaKeluargaTambahan": "3 Anak, 1 Lansia",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "IPL Semester Menunggu Verifikasi • Donatur PJU Menunggu Verifikasi",
    "pin": "Siti#C3"
  },
  {
    "no": 13,
    "id": "#WRG-013",
    "namaLengkap": "Bapak Bambang Gunawan",
    "jenisKelamin": "Laki-laki",
    "blok": "D12",
    "noRumah": "3",
    "alamatRumah": "Blok D12 No. 3",
    "noWhatsapp": "081290001013",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Wiraswasta",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Istri, 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Bayar via QRIS Menunggu Verifikasi",
    "pin": "Bambang$D12"
  },
  {
    "no": 14,
    "id": "#WRG-014",
    "namaLengkap": "Bapak Antonius Wibowo",
    "jenisKelamin": "Laki-laki",
    "blok": "E1",
    "noRumah": "2",
    "alamatRumah": "Blok E1 No. 2",
    "noWhatsapp": "081290001014",
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Konsultan Keuangan",
    "agama": "Katolik",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Istri, 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Transfer Mandiri Menunggu Verifikasi",
    "pin": "Antonius!E1"
  },
  {
    "no": 15,
    "id": "#WRG-015",
    "namaLengkap": "Ibu Kartika Putri",
    "jenisKelamin": "Perempuan",
    "blok": "E2",
    "noRumah": "9",
    "alamatRumah": "Blok E2 No. 9",
    "noWhatsapp": "081290001015",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Dosen Perguruan Tinggi",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Suami, 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Bukti Transfer PDF Slip Mandiri Menunggu Verifikasi",
    "pin": "Kartika@E2"
  },
  {
    "no": 16,
    "id": "#WRG-016",
    "namaLengkap": "Bapak Hariyanto",
    "jenisKelamin": "Laki-laki",
    "blok": "E6",
    "noRumah": "15",
    "alamatRumah": "Blok E6 No. 15",
    "noWhatsapp": "081290001016",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Teknisi Mesin",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "QRIS Slip Menunggu Verifikasi",
    "pin": "Hariyanto#E6"
  },
  {
    "no": 17,
    "id": "#WRG-017",
    "namaLengkap": "Bapak Lukman Hakim",
    "jenisKelamin": "Laki-laki",
    "blok": "E8",
    "noRumah": "4",
    "alamatRumah": "Blok E8 No. 4",
    "noWhatsapp": "081290001017",
    "statusTempatTinggal": "Pulang-Pergi",
    "pekerjaan": "Akuntan Publik",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Istri, 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "6 Bulan",
    "nominalIpl": 180000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Transfer Mandiri PDF Menunggu Verifikasi",
    "pin": "Lukman$E8"
  },
  {
    "no": 18,
    "id": "#WRG-018",
    "namaLengkap": "Bapak Dedi Sulaeman",
    "jenisKelamin": "Laki-laki",
    "blok": "E9",
    "noRumah": "11",
    "alamatRumah": "Blok E9 No. 11",
    "noWhatsapp": "081290001018",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "TNI / Polri",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 4,
    "anggotaKeluargaTambahan": "Istri, 2 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "3 Bulan (Triwulan)",
    "nominalIpl": 90000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Bukti Struk WA Transfer BCA Menunggu Verifikasi",
    "pin": "Dedi!E9"
  },
  {
    "no": 19,
    "id": "#WRG-019",
    "namaLengkap": "Bapak Gunawan Wibowo",
    "jenisKelamin": "Laki-laki",
    "blok": "E10",
    "noRumah": "5",
    "alamatRumah": "Blok E10 No. 5",
    "noWhatsapp": "081290001019",
    "statusTempatTinggal": "Menetap",
    "pekerjaan": "Guru Olahraga",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 3,
    "anggotaKeluargaTambahan": "Istri, 1 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Bulan",
    "nominalIpl": 30000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Struk WA Mandiri Menunggu Verifikasi",
    "pin": "Gunawan@E10"
  },
  {
    "no": 20,
    "id": "#WRG-020",
    "namaLengkap": "Bapak Indra Saputra",
    "jenisKelamin": "Laki-laki",
    "blok": "E11",
    "noRumah": "14",
    "alamatRumah": "Blok E11 No. 14",
    "noWhatsapp": "081290001020",
    "statusTempatTinggal": "Belum menetap",
    "pekerjaan": "Dokter Spesialis",
    "agama": "Islam",
    "statusPernikahan": "Menikah",
    "statusDalamKeluarga": "Kepala Keluarga",
    "jmlJiwa": 5,
    "anggotaKeluargaTambahan": "Istri, 3 Anak",
    "statusIpl": "Menunggu Verifikasi",
    "periodeTercover": "1 Tahun (12 Bulan)",
    "nominalIpl": 360000,
    "tanggalUpdate": "13 Okt 2026",
    "catatan": "Dokumen PDF Donasi PJU & Struk IPL 1 Tahun Menunggu Verifikasi",
    "pin": "Indra#E11"
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
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1ZB7vqqmc2oxUIsr1bEX85cOyT_4pigby/view?usp=sharing",
    "keterangan": "Lunas 1 Tahun di muka"
  },
  {
    "no": 2,
    "noTransaksi": "#TRX-002",
    "namaWarga": "Bapak Dimas Pratama",
    "lokasiRumah": "Blok B2 No. 8",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "https://drive.google.com/file/d/1j1r1imdnKKn5Qe2PkP65Yo3IJffTgX2X/view?usp=sharing",
    "keterangan": "Lunas Semester"
  },
  {
    "no": 3,
    "noTransaksi": "#TRX-003",
    "namaWarga": "Bapak Agus Wahyudi",
    "lokasiRumah": "Blok C3 No. 3",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan (Triwulan)",
    "nominalBayar": 90000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "https://drive.google.com/file/d/1gt64gzQZd5aPUAXY65PyzoGEmDY9wraF/view?usp=sharing",
    "keterangan": "Lunas Triwulan via QRIS"
  },
  {
    "no": 4,
    "noTransaksi": "#TRX-004",
    "namaWarga": "Bapak Hendra Kusuma",
    "lokasiRumah": "Blok D4 No. 2",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Cash ke Bendahara",
    "buktiBayar": "https://drive.google.com/file/d/14zPqbSXt29qm95LhTdklGTmfZ4mYj-uy/view?usp=sharing",
    "keterangan": "Lunas Tunai"
  },
  {
    "no": 5,
    "noTransaksi": "#TRX-005",
    "namaWarga": "Ibu Ratna Sari",
    "lokasiRumah": "Blok D9 No. 7",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Ditolak",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1gt64gzQZd5aPUAXY65PyzoGEmDY9wraF/view?usp=sharing",
    "keterangan": "Ditolak Admin: Foto struk buram, mohon upload ulang"
  },
  {
    "no": 6,
    "noTransaksi": "#TRX-006",
    "namaWarga": "Bapak Surya Pratama",
    "lokasiRumah": "Blok D10 No. 4",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "https://drive.google.com/file/d/1CxZV5V9TbcMCJdKCdb3NXliSbuawJthh/view?usp=sharing",
    "keterangan": "Lunas Bulanan"
  },
  {
    "no": 7,
    "noTransaksi": "#TRX-007",
    "namaWarga": "Bapak Bambang Hermawan",
    "lokasiRumah": "Blok E2 No. 12",
    "periodeTercover": "Okt 2026 - Sep 2028",
    "durasiPaket": "2 Tahun (24 Bulan)",
    "nominalBayar": 720000,
    "status": "Lunas",
    "tanggalPelunasan": "12 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1a5kvC957x7aaeCjos1_8hCNp3MMP-HB1/view?usp=sharing",
    "keterangan": "Lunas 2 Tahun Penuh"
  },
  {
    "no": 8,
    "noTransaksi": "#TRX-IPL-801",
    "namaWarga": "Bapak Hendra Wijaya",
    "lokasiRumah": "Blok D8 No. 1",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1ZB7vqqmc2oxUIsr1bEX85cOyT_4pigby/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 1 Tahun via portal warga"
  },
  {
    "no": 9,
    "noTransaksi": "#TRX-IPL-802",
    "namaWarga": "Ibu Siti Nurhaliza",
    "lokasiRumah": "Blok C3 No. 12",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "https://drive.google.com/file/d/1CxZV5V9TbcMCJdKCdb3NXliSbuawJthh/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL Semester via portal warga"
  },
  {
    "no": 10,
    "noTransaksi": "#TRX-IPL-803",
    "namaWarga": "Bapak Bambang Gunawan",
    "lokasiRumah": "Blok D12 No. 3",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "https://drive.google.com/file/d/1j1r1imdnKKn5Qe2PkP65Yo3IJffTgX2X/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 1 Bulan via QRIS"
  },
  {
    "no": 11,
    "noTransaksi": "#TRX-IPL-804",
    "namaWarga": "Bapak Antonius Wibowo",
    "lokasiRumah": "Blok E1 No. 2",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan (Triwulan)",
    "nominalBayar": 90000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1Ae2Bs_6PVYVeO22kHYqgkw5Yy6Gr2AFX/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL Triwulan via portal warga"
  },
  {
    "no": 12,
    "noTransaksi": "#TRX-IPL-805",
    "namaWarga": "Ibu Kartika Putri",
    "lokasiRumah": "Blok E2 No. 9",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer Bank",
    "buktiBayar": "https://drive.google.com/file/d/1gtxDz7191xbgWqE0QYmxLT8Wk765A1zr/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 1 Tahun dengan slip bank PDF"
  },
  {
    "no": 13,
    "noTransaksi": "#TRX-IPL-806",
    "namaWarga": "Bapak Hariyanto",
    "lokasiRumah": "Blok E6 No. 15",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "https://drive.google.com/file/d/1gt64gzQZd5aPUAXY65PyzoGEmDY9wraF/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL via QRIS"
  },
  {
    "no": 14,
    "noTransaksi": "#TRX-IPL-807",
    "namaWarga": "Bapak Lukman Hakim",
    "lokasiRumah": "Blok E8 No. 4",
    "periodeTercover": "Okt 2026 - Mar 2027",
    "durasiPaket": "6 Bulan",
    "nominalBayar": 180000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1a5kvC957x7aaeCjos1_8hCNp3MMP-HB1/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 6 Bulan slip Mandiri PDF"
  },
  {
    "no": 15,
    "noTransaksi": "#TRX-IPL-808",
    "namaWarga": "Bapak Dedi Sulaeman",
    "lokasiRumah": "Blok E9 No. 11",
    "periodeTercover": "Okt - Des 2026",
    "durasiPaket": "3 Bulan (Triwulan)",
    "nominalBayar": 90000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer BCA",
    "buktiBayar": "https://drive.google.com/file/d/1gt64gzQZd5aPUAXY65PyzoGEmDY9wraF/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL Triwulan via BCA"
  },
  {
    "no": 16,
    "noTransaksi": "#TRX-IPL-809",
    "namaWarga": "Bapak Gunawan Wibowo",
    "lokasiRumah": "Blok E10 No. 5",
    "periodeTercover": "Oktober 2026",
    "durasiPaket": "1 Bulan",
    "nominalBayar": 30000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "Transfer Mandiri",
    "buktiBayar": "https://drive.google.com/file/d/1yQzVq-RrsTjW_7F8-tV3Nya_2LqSKuNw/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 1 Bulan via Mandiri"
  },
  {
    "no": 17,
    "noTransaksi": "#TRX-IPL-810",
    "namaWarga": "Bapak Indra Saputra",
    "lokasiRumah": "Blok E11 No. 14",
    "periodeTercover": "Okt 2026 - Sep 2027",
    "durasiPaket": "12 Bulan (1 Tahun)",
    "nominalBayar": 360000,
    "status": "Menunggu Verifikasi",
    "tanggalPelunasan": "13 Okt 2026",
    "metodePembayaran": "QRIS",
    "buktiBayar": "https://drive.google.com/file/d/1j1r1imdnKKn5Qe2PkP65Yo3IJffTgX2X/view?usp=sharing",
    "keterangan": "Menunggu Verifikasi: Pengajuan bayar IPL 1 Tahun via QRIS"
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
        "namaLengkap": "Bapak Dimas Pratama",
        "blokRumah": "B2/8",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "C3/3",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "D4/2",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "D4/2",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hendra Wijaya",
        "blokRumah": "D8/1",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": false
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
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Surya Pratama",
        "blokRumah": "D10/4",
        "isKoordinator": false
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
    "catatan": "Ronda akbar malam Minggu: seluruh bapak-bapak warga berkumpul di balai/pos kamling.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "SEMUA WARGA PAGUYUBAN PK8",
        "blokRumah": "Blok A–H",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Petugas Keamanan Reguler (Satpam)",
        "blokRumah": "Pos Satpam",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Agus Wahyudi",
        "blokRumah": "C3/3",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "D4/2",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Hendra Wijaya",
        "blokRumah": "D8/1",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hendra Wijaya",
        "blokRumah": "D8/1",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Surya Pratama",
        "blokRumah": "D10/4",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Bambang Hermawan",
        "blokRumah": "E2/12",
        "isKoordinator": false
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
    "catatan": "Ronda akbar malam Minggu: seluruh bapak-bapak warga berkumpul di balai/pos kamling.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "SEMUA WARGA PAGUYUBAN PK8",
        "blokRumah": "Blok A–H",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Petugas Keamanan Reguler (Satpam)",
        "blokRumah": "Pos Satpam",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hendra Kusuma",
        "blokRumah": "D4/2",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hendra Wijaya",
        "blokRumah": "D8/1",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": false
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
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Surya Pratama",
        "blokRumah": "D10/4",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Surya Pratama",
        "blokRumah": "D10/4",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Bambang Hermawan",
        "blokRumah": "E2/12",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Dedi Mulyadi",
        "blokRumah": "E4/18",
        "isKoordinator": false
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
    "catatan": "Ronda akbar malam Minggu: seluruh bapak-bapak warga berkumpul di balai/pos kamling.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "SEMUA WARGA PAGUYUBAN PK8",
        "blokRumah": "Blok A–H",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Petugas Keamanan Reguler (Satpam)",
        "blokRumah": "Pos Satpam",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Hendra Wijaya",
        "blokRumah": "D8/1",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Ibu Siti Nurhaliza",
        "blokRumah": "C3/12",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Bambang Gunawan",
        "blokRumah": "D12/3",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Antonius Wibowo",
        "blokRumah": "E1/2",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Fajar Nugroho",
        "blokRumah": "D8/10",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Joko Susilo",
        "blokRumah": "B5/4",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Eko Prasetyo",
        "blokRumah": "C7/8",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Hariyanto",
        "blokRumah": "E6/15",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Rudi Hermawan",
        "blokRumah": "A3/12",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Surya Pratama",
        "blokRumah": "D10/4",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Bambang Hermawan",
        "blokRumah": "E2/12",
        "isKoordinator": false
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
        "namaLengkap": "Bapak Bambang Hermawan",
        "blokRumah": "E2/12",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Bapak Dedi Mulyadi",
        "blokRumah": "E4/18",
        "isKoordinator": false
      },
      {
        "slot": 3,
        "namaLengkap": "Bapak Ridwan Kamil",
        "blokRumah": "A1/5",
        "isKoordinator": false
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
    "catatan": "Ronda akbar malam Minggu: seluruh bapak-bapak warga berkumpul di balai/pos kamling.",
    "statusPublikasi": "PUBLISHED",
    "petugas": [
      {
        "slot": 1,
        "namaLengkap": "SEMUA WARGA PAGUYUBAN PK8",
        "blokRumah": "Blok A–H",
        "isKoordinator": true
      },
      {
        "slot": 2,
        "namaLengkap": "Petugas Keamanan Reguler (Satpam)",
        "blokRumah": "Pos Satpam",
        "isKoordinator": false
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
