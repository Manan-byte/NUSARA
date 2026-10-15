const fs = require('fs');
const path = require('path');

// 1. Definisikan 30 Warga & Transaksi
const wargaData = [
  // ==========================================
  // GRUP 1: 10 DATA MENUNGGU VERIFIKASI (1-10)
  // ==========================================
  {
    no: 1,
    id: "#WRG-001",
    namaLengkap: "Bapak Ridwan Kamil",
    jenisKelamin: "Laki-laki",
    blok: "A1",
    noRumah: "5",
    alamatRumah: "Blok A1 No. 5",
    noWhatsapp: "081290001001",
    statusTempatTinggal: "Menetap",
    pekerjaan: "PNS / BUMN",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Atalia (Istri), 2 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Setor 1 Tahun via Transfer Mandiri",
    pin: "Ridwan@A1",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Menunggu Verifikasi",
      keterangan: "Pengajuan pelunasan IPL 1 Tahun di muka"
    }
  },
  {
    no: 2,
    id: "#WRG-002",
    namaLengkap: "Bapak Dimas Pratama",
    jenisKelamin: "Laki-laki",
    blok: "B2",
    noRumah: "8",
    alamatRumah: "Blok B2 No. 8",
    noWhatsapp: "081290001002",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Karyawan Swasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Maya (Istri), 1 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Paket Semester via QRIS",
    pin: "Dimas@B2",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "QRIS",
      buktiBayar: "/bukti-bayar/struk_qris_01.png",
      status: "Menunggu Verifikasi",
      keterangan: "Setoran semester 6 bulan via QRIS"
    }
  },
  {
    no: 3,
    id: "#WRG-003",
    namaLengkap: "Bapak Agus Wahyudi",
    jenisKelamin: "Laki-laki",
    blok: "C3",
    noRumah: "3",
    alamatRumah: "Blok C3 No. 3",
    noWhatsapp: "081290001003",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 5,
    anggotaKeluargaTambahan: "Ibu Rina (Istri), 3 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "3 Bulan (Triwulan)",
    nominalIpl: 90000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Triwulan via Transfer BCA",
    pin: "Agus@C3",
    trx: {
      durasiPaket: "3 Bulan",
      periodeTercover: "Okt - Des 2026",
      nominalBayar: 90000,
      metodePembayaran: "Transfer BCA",
      buktiBayar: "/bukti-bayar/struk_transfer_wa1.jpg",
      status: "Menunggu Verifikasi",
      keterangan: "Bayar triwulan Okt-Des"
    }
  },
  {
    no: 4,
    id: "#WRG-004",
    namaLengkap: "Bapak Hendra Kusuma",
    jenisKelamin: "Laki-laki",
    blok: "D4",
    noRumah: "2",
    alamatRumah: "Blok D4 No. 2",
    noWhatsapp: "081290001004",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Guru / Dosen",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Siti (Istri), 2 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "1 Bulan (Oktober)",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Bulanan via Transfer BRI",
    pin: "Hendra@D4",
    trx: {
      durasiPaket: "1 Bulan",
      periodeTercover: "Oktober 2026",
      nominalBayar: 30000,
      metodePembayaran: "Transfer BRI",
      buktiBayar: "/bukti-bayar/struk_ipl_02.png",
      status: "Menunggu Verifikasi",
      keterangan: "Setoran rutin bulan Oktober"
    }
  },
  {
    no: 5,
    id: "#WRG-005",
    namaLengkap: "Ibu Ratna Sari",
    jenisKelamin: "Perempuan",
    blok: "D9",
    noRumah: "7",
    alamatRumah: "Blok D9 No. 7",
    noWhatsapp: "081290001005",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Dokter / Tenaga Medis",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "1 Anak, 1 Asisten Rumah Tangga",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Tahunan via Transfer BSI",
    pin: "Ratna@D9",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer BSI",
      buktiBayar: "/bukti-bayar/struk_ipl_03.png",
      status: "Menunggu Verifikasi",
      keterangan: "Setoran 1 tahun di muka via BSI Mobile"
    }
  },
  {
    no: 6,
    id: "#WRG-006",
    namaLengkap: "Bapak Eko Prasetyo",
    jenisKelamin: "Laki-laki",
    blok: "E3",
    noRumah: "21",
    alamatRumah: "Blok E3 No. 21",
    noWhatsapp: "081290001006",
    statusTempatTinggal: "Menetap",
    pekerjaan: "TNI / POLRI",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Desi (Istri), 2 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Semester via Mandiri",
    pin: "Eko@E3",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Menunggu Verifikasi",
      keterangan: "Paket 6 bulan via Livin Mandiri"
    }
  },
  {
    no: 7,
    id: "#WRG-007",
    namaLengkap: "Bapak Fajar Nugraha",
    jenisKelamin: "Laki-laki",
    blok: "F2",
    noRumah: "11",
    alamatRumah: "Blok F2 No. 11",
    noWhatsapp: "081290001007",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Karyawan BUMN",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Dian (Istri), 1 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "3 Bulan",
    nominalIpl: 90000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Triwulan via QRIS",
    pin: "Fajar@F2",
    trx: {
      durasiPaket: "3 Bulan",
      periodeTercover: "Okt - Des 2026",
      nominalBayar: 90000,
      metodePembayaran: "QRIS",
      buktiBayar: "/bukti-bayar/struk_qris_02.png",
      status: "Menunggu Verifikasi",
      keterangan: "Pembayaran triwulan via QRIS"
    }
  },
  {
    no: 8,
    id: "#WRG-008",
    namaLengkap: "Ibu Siti Nurhaliza",
    jenisKelamin: "Perempuan",
    blok: "B3",
    noRumah: "14",
    alamatRumah: "Blok B3 No. 14",
    noWhatsapp: "081290001008",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Suami, 2 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "1 Bulan (Oktober)",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Bulanan via Transfer BCA",
    pin: "Siti@B3",
    trx: {
      durasiPaket: "1 Bulan",
      periodeTercover: "Oktober 2026",
      nominalBayar: 30000,
      metodePembayaran: "Transfer BCA",
      buktiBayar: "/bukti-bayar/struk_transfer_wa2.jpg",
      status: "Menunggu Verifikasi",
      keterangan: "Iuran IPL bulan Oktober 2026"
    }
  },
  {
    no: 9,
    id: "#WRG-009",
    namaLengkap: "Bapak Wahyu Hidayat",
    jenisKelamin: "Laki-laki",
    blok: "G1",
    noRumah: "9",
    alamatRumah: "Blok G1 No. 9",
    noWhatsapp: "081290001009",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Arsitek / Desainer",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Lilis (Istri), 1 Anak",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Setor 1 Tahun via Transfer BNI",
    pin: "Wahyu@G1",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer BNI",
      buktiBayar: "/bukti-bayar/struk_ipl_02.png",
      status: "Menunggu Verifikasi",
      keterangan: "Pembayaran 1 Tahun penuh"
    }
  },
  {
    no: 10,
    id: "#WRG-010",
    namaLengkap: "Bapak Rizky Febrian",
    jenisKelamin: "Laki-laki",
    blok: "A2",
    noRumah: "12",
    alamatRumah: "Blok A2 No. 12",
    noWhatsapp: "081290001010",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Karyawan Swasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "Ibu Mahalini (Istri)",
    statusIpl: "Menunggu Verifikasi",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Menunggu Verifikasi • Paket 6 Bulan via Transfer Mandiri",
    pin: "Rizky@A2",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Menunggu Verifikasi",
      keterangan: "Setoran 6 bulan periode Okt-Mar"
    }
  },

  // ==========================================
  // GRUP 2: 10 DATA LUNAS TERVERIFIKASI (11-20)
  // ==========================================
  {
    no: 11,
    id: "#WRG-011",
    namaLengkap: "Bapak Budi Santoso",
    jenisKelamin: "Laki-laki",
    blok: "D8",
    noRumah: "1",
    alamatRumah: "Blok D8 No. 1",
    noWhatsapp: "081290001011",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Pengusaha",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Endang (Istri), 2 Anak",
    statusIpl: "Lunas",
    periodeTercover: "1 Tahun + Bonus 1 Bln (13 Bln)",
    nominalIpl: 390000,
    tanggalUpdate: "12 Okt 2026",
    catatan: "Lunas IPL 13 Bulan • Terbit Kwitansi Resmi",
    pin: "Budi@D8",
    trx: {
      durasiPaket: "1 Tahun 1 Bln (13 Bulan)",
      periodeTercover: "Aktif s/d 31 Okt 2027",
      nominalBayar: 390000,
      metodePembayaran: "Transfer Bank Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Lunas",
      tanggalPelunasan: "12 Okt 2026",
      keterangan: "Lunas terverifikasi kwitansi sah oleh Bendahara"
    }
  },
  {
    no: 12,
    id: "#WRG-012",
    namaLengkap: "Bapak Tri Wicaksono",
    jenisKelamin: "Laki-laki",
    blok: "C1",
    noRumah: "4",
    alamatRumah: "Blok C1 No. 4",
    noWhatsapp: "081290001012",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Karyawan Swasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Tari (Istri), 1 Anak",
    statusIpl: "Lunas",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "10 Okt 2026",
    catatan: "Lunas 1 Tahun",
    pin: "Tri@C1",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer BCA",
      buktiBayar: "/bukti-bayar/struk_transfer_wa1.jpg",
      status: "Lunas",
      tanggalPelunasan: "10 Okt 2026",
      keterangan: "Lunas 1 tahun di muka"
    }
  },
  {
    no: 13,
    id: "#WRG-013",
    namaLengkap: "Bapak Asep Sunandar",
    jenisKelamin: "Laki-laki",
    blok: "B1",
    noRumah: "6",
    alamatRumah: "Blok B1 No. 6",
    noWhatsapp: "081290001013",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Ceu Popon (Istri), 2 Anak",
    statusIpl: "Lunas",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "08 Okt 2026",
    catatan: "Lunas Semester",
    pin: "Asep@B1",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_02.png",
      status: "Lunas",
      tanggalPelunasan: "08 Okt 2026",
      keterangan: "Lunas Semester 6 Bulan"
    }
  },
  {
    no: 14,
    id: "#WRG-014",
    namaLengkap: "Ibu Dewi Lestari",
    jenisKelamin: "Perempuan",
    blok: "E1",
    noRumah: "10",
    alamatRumah: "Blok E1 No. 10",
    noWhatsapp: "081290001014",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Penulis / Freelancer",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Suami, 1 Anak",
    statusIpl: "Lunas",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "07 Okt 2026",
    catatan: "Lunas 6 Bulan",
    pin: "Dewi@E1",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "QRIS",
      buktiBayar: "/bukti-bayar/struk_qris_01.png",
      status: "Lunas",
      tanggalPelunasan: "07 Okt 2026",
      keterangan: "Lunas via QRIS"
    }
  },
  {
    no: 15,
    id: "#WRG-015",
    namaLengkap: "Bapak Joko Widodo",
    jenisKelamin: "Laki-laki",
    blok: "A3",
    noRumah: "7",
    alamatRumah: "Blok A3 No. 7",
    noWhatsapp: "081290001015",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Pensiunan",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "Ibu Iriana (Istri)",
    statusIpl: "Lunas",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "05 Okt 2026",
    catatan: "Lunas 1 Tahun",
    pin: "Joko@A3",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer BCA",
      buktiBayar: "/bukti-bayar/struk_transfer_wa2.jpg",
      status: "Lunas",
      tanggalPelunasan: "05 Okt 2026",
      keterangan: "Lunas Setahun di muka"
    }
  },
  {
    no: 16,
    id: "#WRG-016",
    namaLengkap: "Bapak Surya Paloh",
    jenisKelamin: "Laki-laki",
    blok: "H2",
    noRumah: "3",
    alamatRumah: "Blok H2 No. 3",
    noWhatsapp: "081290001016",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Rosita (Istri), 1 Anak",
    statusIpl: "Lunas",
    periodeTercover: "3 Bulan (Triwulan)",
    nominalIpl: 90000,
    tanggalUpdate: "04 Okt 2026",
    catatan: "Lunas Triwulan",
    pin: "Surya@H2",
    trx: {
      durasiPaket: "3 Bulan",
      periodeTercover: "Okt - Des 2026",
      nominalBayar: 90000,
      metodePembayaran: "Transfer BSI",
      buktiBayar: "/bukti-bayar/struk_ipl_03.png",
      status: "Lunas",
      tanggalPelunasan: "04 Okt 2026",
      keterangan: "Lunas Triwulan"
    }
  },
  {
    no: 17,
    id: "#WRG-017",
    namaLengkap: "Bapak Sandiaga Uno",
    jenisKelamin: "Laki-laki",
    blok: "C2",
    noRumah: "1",
    alamatRumah: "Blok C2 No. 1",
    noWhatsapp: "081290001017",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Pengusaha",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Nur Asia (Istri), 2 Anak",
    statusIpl: "Lunas",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "03 Okt 2026",
    catatan: "Lunas 1 Tahun",
    pin: "Sandi@C2",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Lunas",
      tanggalPelunasan: "03 Okt 2026",
      keterangan: "Lunas 1 Tahun Penuh"
    }
  },
  {
    no: 18,
    id: "#WRG-018",
    namaLengkap: "Ibu Sri Mulyani",
    jenisKelamin: "Perempuan",
    blok: "F1",
    noRumah: "8",
    alamatRumah: "Blok F1 No. 8",
    noWhatsapp: "081290001018",
    statusTempatTinggal: "Menetap",
    pekerjaan: "PNS / Dosen",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Suami, 1 Anak",
    statusIpl: "Lunas",
    periodeTercover: "6 Bulan",
    nominalIpl: 180000,
    tanggalUpdate: "02 Okt 2026",
    catatan: "Lunas 6 Bulan",
    pin: "Sri@F1",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "Transfer BRI",
      buktiBayar: "/bukti-bayar/struk_ipl_02.png",
      status: "Lunas",
      tanggalPelunasan: "02 Okt 2026",
      keterangan: "Lunas Semester via BRImo"
    }
  },
  {
    no: 19,
    id: "#WRG-019",
    namaLengkap: "Bapak Anies Baswedan",
    jenisKelamin: "Laki-laki",
    blok: "D1",
    noRumah: "5",
    alamatRumah: "Blok D1 No. 5",
    noWhatsapp: "081290001019",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Akademisi / Peneliti",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Fery (Istri), 2 Anak",
    statusIpl: "Lunas",
    periodeTercover: "1 Tahun (12 Bulan)",
    nominalIpl: 360000,
    tanggalUpdate: "01 Okt 2026",
    catatan: "Lunas 1 Tahun",
    pin: "Anies@D1",
    trx: {
      durasiPaket: "12 Bulan (1 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2027",
      nominalBayar: 360000,
      metodePembayaran: "Transfer BSI",
      buktiBayar: "/bukti-bayar/struk_ipl_03.png",
      status: "Lunas",
      tanggalPelunasan: "01 Okt 2026",
      keterangan: "Lunas 1 Tahun"
    }
  },
  {
    no: 20,
    id: "#WRG-020",
    namaLengkap: "Bapak Ganjar Pranowo",
    jenisKelamin: "Laki-laki",
    blok: "E2",
    noRumah: "15",
    alamatRumah: "Blok E2 No. 15",
    noWhatsapp: "081290001020",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Hukum / Advokat",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Atikoh (Istri), 1 Anak",
    statusIpl: "Lunas",
    periodeTercover: "3 Bulan (Triwulan)",
    nominalIpl: 90000,
    tanggalUpdate: "01 Okt 2026",
    catatan: "Lunas Triwulan",
    pin: "Ganjar@E2",
    trx: {
      durasiPaket: "3 Bulan",
      periodeTercover: "Okt - Des 2026",
      nominalBayar: 90000,
      metodePembayaran: "QRIS",
      buktiBayar: "/bukti-bayar/struk_qris_02.png",
      status: "Lunas",
      tanggalPelunasan: "01 Okt 2026",
      keterangan: "Lunas Triwulan via QRIS"
    }
  },

  // ==========================================
  // GRUP 3: 10 DATA BERBAGAI KONDISI (21-30)
  // ==========================================
  // 4 Belum Bayar (Tunggakan/Rumah Belum Huni/Pulang Pergi)
  {
    no: 21,
    id: "#WRG-021",
    namaLengkap: "Bapak Bambang Soesatyo",
    jenisKelamin: "Laki-laki",
    blok: "B4",
    noRumah: "2",
    alamatRumah: "Blok B4 No. 2",
    noWhatsapp: "081290001021",
    statusTempatTinggal: "Pulang-Pergi",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "Istri",
    statusIpl: "Belum Bayar",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Belum Bayar • Status Pulang-Pergi (Tunggakan 1 Bulan)",
    pin: "Bambang@B4",
    trx: null
  },
  {
    no: 22,
    id: "#WRG-022",
    namaLengkap: "Bapak Prabowo Subianto",
    jenisKelamin: "Laki-laki",
    blok: "A4",
    noRumah: "1",
    alamatRumah: "Blok A4 No. 1",
    noWhatsapp: "081290001022",
    statusTempatTinggal: "Belum menetap",
    pekerjaan: "Purnawirawan",
    agama: "Islam",
    statusPernikahan: "Cerai hidup",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 1,
    anggotaKeluargaTambahan: "-",
    statusIpl: "Belum Bayar",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Belum Bayar • Rumah Renovasi Belum Ditempati",
    pin: "Prabowo@A4",
    trx: null
  },
  {
    no: 23,
    id: "#WRG-023",
    namaLengkap: "Bapak Erick Thohir",
    jenisKelamin: "Laki-laki",
    blok: "C4",
    noRumah: "5",
    alamatRumah: "Blok C4 No. 5",
    noWhatsapp: "081290001023",
    statusTempatTinggal: "Pulang-Pergi",
    pekerjaan: "Pengusaha",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Istri, 1 Anak",
    statusIpl: "Belum Bayar",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Belum Bayar • Sering tugas dinas luar kota",
    pin: "Erick@C4",
    trx: null
  },
  {
    no: 24,
    id: "#WRG-024",
    namaLengkap: "Ibu Puan Maharani",
    jenisKelamin: "Perempuan",
    blok: "D3",
    noRumah: "9",
    alamatRumah: "Blok D3 No. 9",
    noWhatsapp: "081290001024",
    statusTempatTinggal: "Belum menetap",
    pekerjaan: "Pejabat Publik",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "Suami",
    statusIpl: "Belum Bayar",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Belum Bayar • Rumah Baru Serah Terima Kunci",
    pin: "Puan@D3",
    trx: null
  },
  // 3 Ditolak (Dengan Alasan Penolakan Jelas di Transaksi)
  {
    no: 25,
    id: "#WRG-025",
    namaLengkap: "Bapak Muhaimin Iskandar",
    jenisKelamin: "Laki-laki",
    blok: "E4",
    noRumah: "8",
    alamatRumah: "Blok E4 No. 8",
    noWhatsapp: "081290001025",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Politisi",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Istri, 2 Anak",
    statusIpl: "Ditolak",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "13 Okt 2026",
    catatan: "Ditolak: Nominal transfer kurang Rp 15.000 dari tarif paket",
    pin: "Imin@E4",
    trx: {
      durasiPaket: "3 Bulan",
      periodeTercover: "Okt - Des 2026",
      nominalBayar: 75000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Ditolak",
      keterangan: "Ditolak: Nominal transfer kurang Rp 15.000 (Tertera Rp 75.000, seharusnya Rp 90.000 untuk 3 Bulan)"
    }
  },
  {
    no: 26,
    id: "#WRG-026",
    namaLengkap: "Bapak Gibran Rakabuming",
    jenisKelamin: "Laki-laki",
    blok: "F3",
    noRumah: "4",
    alamatRumah: "Blok F3 No. 4",
    noWhatsapp: "081290001026",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Wiraswasta",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Selvi (Istri), 2 Anak",
    statusIpl: "Ditolak",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "13 Okt 2026",
    catatan: "Ditolak: Bukti struk transfer buram tidak terbaca",
    pin: "Gibran@F3",
    trx: {
      durasiPaket: "1 Bulan",
      periodeTercover: "Oktober 2026",
      nominalBayar: 30000,
      metodePembayaran: "QRIS",
      buktiBayar: "/bukti-bayar/struk_qris_01.png",
      status: "Ditolak",
      keterangan: "Ditolak: Foto resi buram/terpotong, mohon unggah ulang tangkapan layar m-banking yang jelas"
    }
  },
  {
    no: 27,
    id: "#WRG-027",
    namaLengkap: "Bapak Mahfud MD",
    jenisKelamin: "Laki-laki",
    blok: "G2",
    noRumah: "6",
    alamatRumah: "Blok G2 No. 6",
    noWhatsapp: "081290001027",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Ahli Hukum",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 3,
    anggotaKeluargaTambahan: "Ibu Zaizatun (Istri), 1 Anak",
    statusIpl: "Ditolak",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "13 Okt 2026",
    catatan: "Ditolak: Rekening tujuan keliru",
    pin: "Mahfud@G2",
    trx: {
      durasiPaket: "6 Bulan",
      periodeTercover: "Okt 2026 - Mar 2027",
      nominalBayar: 180000,
      metodePembayaran: "Transfer BCA",
      buktiBayar: "/bukti-bayar/struk_transfer_wa1.jpg",
      status: "Ditolak",
      keterangan: "Ditolak: Transfer tertuju ke rekening pihak ketiga lain, bukan rekening resmi kas Paguyuban PK8"
    }
  },
  // 3 Kondisi Khusus (Warga Teladan 2 Tahun, Lansia Subsidi, Warga PJU Donatur)
  {
    no: 28,
    id: "#WRG-028",
    namaLengkap: "Bapak Luhut Binsar Panjaitan",
    jenisKelamin: "Laki-laki",
    blok: "H1",
    noRumah: "1",
    alamatRumah: "Blok H1 No. 1",
    noWhatsapp: "081290001028",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Purnawirawan / Penasihat",
    agama: "Kristen",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 4,
    anggotaKeluargaTambahan: "Ibu Devi (Istri), 2 Asisten",
    statusIpl: "Lunas",
    periodeTercover: "2 Tahun (24 Bulan)",
    nominalIpl: 720000,
    tanggalUpdate: "12 Okt 2026",
    catatan: "Warga Teladan • Lunas IPL 2 Tahun Penuh + Donatur PJU Rp 500.000",
    pin: "Luhut@H1",
    trx: {
      durasiPaket: "24 Bulan (2 Tahun)",
      periodeTercover: "Okt 2026 - Sep 2028",
      nominalBayar: 720000,
      metodePembayaran: "Transfer Mandiri",
      buktiBayar: "/bukti-bayar/struk_ipl_01.png",
      status: "Lunas",
      tanggalPelunasan: "12 Okt 2026",
      keterangan: "Lunas 2 Tahun Sekaligus terverifikasi"
    }
  },
  {
    no: 29,
    id: "#WRG-029",
    namaLengkap: "Ibu Megawati Soekarnoputri",
    jenisKelamin: "Perempuan",
    blok: "A5",
    noRumah: "3",
    alamatRumah: "Blok A5 No. 3",
    noWhatsapp: "081290001029",
    statusTempatTinggal: "Menetap",
    pekerjaan: "Pensiunan",
    agama: "Islam",
    statusPernikahan: "Cerai mati",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "1 Kerabat Lansia",
    statusIpl: "Lunas",
    periodeTercover: "Bebas Iuran Paguyuban (Subsidi Lansia)",
    nominalIpl: 0,
    tanggalUpdate: "10 Okt 2026",
    catatan: "Subsidi Paguyuban: Pembebasan Iuran IPL Warga Sepuh / Lansia RT 08",
    pin: "Mega@A5",
    trx: {
      durasiPaket: "Subsidi Khusus",
      periodeTercover: "Bebas Iuran Seumur Hidup",
      nominalBayar: 0,
      metodePembayaran: "Subsidi Kas Paguyuban",
      buktiBayar: "/bukti-bayar/struk_ipl_02.png",
      status: "Lunas",
      tanggalPelunasan: "10 Okt 2026",
      keterangan: "Subsidi resmi hasil musyawarah warga"
    }
  },
  {
    no: 30,
    id: "#WRG-030",
    namaLengkap: "Bapak Kaesang Pangarep",
    jenisKelamin: "Laki-laki",
    blok: "B5",
    noRumah: "10",
    alamatRumah: "Blok B5 No. 10",
    noWhatsapp: "081290001030",
    statusTempatTinggal: "Belum menetap",
    pekerjaan: "Wiraswasta Muda",
    agama: "Islam",
    statusPernikahan: "Menikah",
    statusDalamKeluarga: "Kepala Keluarga",
    jmlJiwa: 2,
    anggotaKeluargaTambahan: "Ibu Erina (Istri)",
    statusIpl: "Belum Bayar",
    periodeTercover: "-",
    nominalIpl: 30000,
    tanggalUpdate: "14 Okt 2026",
    catatan: "Warga Baru • Belum menetap, baru serah terima kunci komplek",
    pin: "Kaesang@B5",
    trx: null
  }
];

// Buat array transaksi IPL (Total 25 transaksi: 10 Verifikasi, 10 Lunas, 3 Ditolak, 2 Khusus)
let trxCounter = 1;
const transaksiList = [];
wargaData.forEach((w) => {
  if (w.trx) {
    transaksiList.push({
      no: trxCounter,
      noTransaksi: `#TRX-${String(trxCounter).padStart(3, '0')}`,
      namaWarga: w.namaLengkap,
      lokasiRumah: w.alamatRumah,
      periodeTercover: w.trx.periodeTercover,
      durasiPaket: w.trx.durasiPaket,
      nominalBayar: w.trx.nominalBayar,
      status: w.trx.status,
      tanggalPelunasan: w.trx.tanggalPelunasan || "14 Okt 2026",
      metodePembayaran: w.trx.metodePembayaran,
      buktiBayar: w.trx.buktiBayar,
      keterangan: w.trx.keterangan
    });
    trxCounter++;
  }
});

// Hitung metrik Dashboard Summary
const rumahLunas = wargaData.filter(w => w.statusIpl === 'Lunas').length;
const totalRumah = wargaData.length;
const wargaMenetap = wargaData.filter(w => w.statusTempatTinggal === 'Menetap').length;
const wargaPulangPergi = wargaData.filter(w => w.statusTempatTinggal === 'Pulang-Pergi').length;
const wargaBelumMenetap = wargaData.filter(w => w.statusTempatTinggal === 'Belum menetap').length;

const totalPemasukanIpl = transaksiList
  .filter(t => t.status === 'Lunas')
  .reduce((sum, t) => sum + t.nominalBayar, 0);

const totalPengeluaran = 700000;
const sisaSaldoKas = totalPemasukanIpl - totalPengeluaran;

const summary = {
  pemasukanIpl: totalPemasukanIpl,
  targetIpl: totalRumah * 30000,
  persentasePemasukan: `${Math.round((totalPemasukanIpl / (totalRumah * 30000)) * 100)}%`,
  rumahLunas: rumahLunas,
  totalRumah: totalRumah,
  pengeluaranKas: totalPengeluaran,
  saldoAwalKas: 0,
  sisaSaldoKas: sisaSaldoKas,
  wargaMenetap: wargaMenetap,
  wargaPulangPergi: wargaPulangPergi,
  wargaBelumMenetap: wargaBelumMenetap,
  rekapPerBlok: []
};

// Buat jadwal ronda dengan 30 warga
const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const jadwalRonda = [];

for (let m = 1; m <= 4; m++) {
  days.forEach((day, dIdx) => {
    const rId = `RND-M${m}-${day.toUpperCase()}`;
    const startIdx = ((m - 1) * 7 + dIdx) % wargaData.length;
    
    const petugasSlot = [];
    for (let s = 1; s <= 6; s++) {
      const idx = (startIdx + s - 1) % wargaData.length;
      const wrg = wargaData[idx];
      petugasSlot.push({
        slot: s,
        namaLengkap: wrg.namaLengkap,
        blokRumah: wrg.alamatRumah,
        isKoordinator: s === 1,
        noWhatsapp: wrg.noWhatsapp
      });
    }

    jadwalRonda.push({
      id: rId,
      hari: `${day} (MINGGU ${m})`,
      tanggal: `${String((m - 1) * 7 + dIdx + 1).padStart(2, '0')} Okt 2026`,
      jamOperasional: "22:00 - 04:00 WIB",
      lokasiPos: "Pos Keamanan Gerbang Utama PK8",
      mingguKe: m,
      catatan: "Patroli keliling setiap 1 jam sekali, bawa senter dan HT siaga pos.",
      statusPublikasi: "PUBLISHED",
      petugas: petugasSlot
    });
  });
}

// 2. Tulis ke data/database.json
const dbPath = path.join(__dirname, '..', 'data', 'database.json');
const currentDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const cleanWargaOnly = wargaData.map(({ trx, ...w }) => w);

currentDb.warga = cleanWargaOnly;
currentDb.transaksi_ipl = transaksiList;
currentDb.ronda = jadwalRonda;

fs.writeFileSync(dbPath, JSON.stringify(currentDb, null, 2), 'utf8');
console.log('✅ data/database.json updated with 30 warga,', transaksiList.length, 'transactions, and 28 ronda shifts.');

// 3. Tulis ke apps/web/src/data/mockInitialData.ts
const mockPath = path.join(__dirname, '..', 'apps', 'web', 'src', 'data', 'mockInitialData.ts');

const mockContent = `import {
  WargaRecord,
  JadwalRondaRecord,
  PengumumanRecord,
  TransaksiIPL,
  DashboardSummary,
  PengeluaranKasRecord,
} from '@sim-warga/types';

export const initialDashboardSummary: DashboardSummary = ${JSON.stringify(summary, null, 2)};

export const initialWargaList: WargaRecord[] = ${JSON.stringify(cleanWargaOnly, null, 2)};

export const initialTransaksiIplList: TransaksiIPL[] = ${JSON.stringify(transaksiList, null, 2)};

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

export const initialJadwalRondaList: (JadwalRondaRecord & { statusPublikasi: 'PUBLISHED' | 'DRAFT' })[] = ${JSON.stringify(jadwalRonda, null, 2)};

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
    tanggal: \`\${d.getDate()} \${monthNames[d.getMonth()]} \${d.getFullYear()}\`,
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
    tanggal: \`\${d.getDate()} \${monthNames[d.getMonth()]} \${d.getFullYear()}\`,
  };
}
`;

fs.writeFileSync(mockPath, mockContent, 'utf8');
console.log('✅ apps/web/src/data/mockInitialData.ts updated successfully with 30 records.');
