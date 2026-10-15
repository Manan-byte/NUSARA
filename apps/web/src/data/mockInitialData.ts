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

// Data master kosong bersih sesuai arahan pengguna (terisi jika diinput lewat formulir "+ Isi Data Warga")
export const initialWargaList: WargaRecord[] = [];
export const initialTransaksiIplList: TransaksiIPL[] = [];
export const initialPengeluaranKasList: PengeluaranKasRecord[] = [];

// Jadwal ronda kosong bersih
export const initialJadwalRondaList: (JadwalRondaRecord & { statusPublikasi: 'PUBLISHED' | 'DRAFT' })[] = [];

// SELURUH ARSIP RESMI PENGUMUMAN & KEGIATAN PAGUYUBAN PK8-2
// Sumber: Portal Resmi Paguyuban Pesona Kahuripan 8 Tahap 2 (https://sites.google.com/view/paguyubanpk8-2/)
export const initialPengumumanList: PengumumanRecord[] = [
  {
    id: 'PGM-001',
    judul: 'Notulensi Rapat Pengurus: Legalitas Paguyuban & Ketentuan Tarif IPL',
    kategori: 'Rapat Warga',
    tanggalAcara: '04 Juli 2026',
    waktu: '20:00 – 23:00 WIB',
    lokasi: 'Balai Pertemuan Warga PK8-2',
    deskripsi: `📋 NOTULENSI RESMI RAPAT PENGURUS PAGUYUBAN
• Hari / Tanggal : Sabtu Malam Minggu, 04 Juli 2026
• Waktu          : 20.00 – 23.00 WIB
• Tempat         : Balai Pertemuan Warga PK8-2
• Pimpinan Rapat : Bpk. Rachmatullah Tiflen (Ketua Umum)

HASIL NOTULENSI & KETETAPAN RAPAT:

1. Legalitas Paguyuban:
   Resmi keluar dan disahkan sejak Rabu, 1 Juli 2026.

2. Rekening Resmi Kas Paguyuban:
   Surat pengantar pembuatan rekening bank atas nama Paguyuban dari pihak Desa telah resmi diterbitkan.

3. Ketentuan Iuran Pengelolaan Lingkungan (IPL):
   • Warga Menetap (Huni) : Rp 30.000,- / bulan
   • Warga Pulang-Pergi / Belum Menetap : Rp 20.000,- / bulan

   Rincian Peruntukan Kas IPL:
   - Sarana dan prasarana keamanan lingkungan
   - Pemeliharaan (lampu jalan & token listrik utama)
   - Kas Dana Sosial warga

4. Jadwal Ronda Siskamling:
   Mulai berlaku efektif sejak Rabu, 8 Juli 2026. Ronda bergilir dilaksanakan 3x seminggu (Senin, Rabu, Jumat) dan Malam Minggu ronda massal bersama seluruh warga.

5. Kepanitiaan HUT RI ke-81:
   Kepanitiaan utama dipimpin oleh Ibu-Ibu PK8-2 didampingi koordinator bapak-bapak Bpk. Roland dan Bpk. Syakur.

Demikian notulensi ini disampaikan untuk diketahui seluruh warga.

Wassalamu’alaikum Warahmatullahi Wabarakatuh.
#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Ketua Umum Rachmatullah Tiflen',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/informasi_5.jpg',
    createdAt: '04 Juli 2026'
  },
  {
    id: 'PGM-002',
    judul: 'Surat Edaran: Himbauan Penggalangan Dana Satu Pintu HUT RI ke-81',
    kategori: 'Sosial & Keamanan',
    tanggalAcara: '05 Juli 2026',
    waktu: 'Surat Edaran Resmi Lingkungan',
    lokasi: 'Wilayah Lingkungan RT 08 PK8-2',
    deskripsi: `✉️ SURAT EDARAN RESMI PAGUYUBAN PK8-2
Nomor   : [005/HMB/PK8-T2/VII/2026]
Perihal : Himbauan Terkait Penggalangan Dana HUT RI ke-81
Tanggal : Bekasi, 5 Juli 2026

Kepada Yth. Seluruh Warga Pesona Kahuripan 8 Tahap 2

Dengan hormat,
Sehubungan dengan rencana peringatan HUT RI ke-81 pada bulan Agustus mendatang, berikut himbauan resmi pengurus:

1. Sistem Satu Pintu:
   Segala bentuk penggalangan dana dan iuran resmi dikelola satu pintu oleh Panitia Ibu-Ibu didampingi Koordinator Bpk. Roland & Bpk. Syakur demi menjaga ketertiban serta transparansi pembukuan.

2. Waspada Pihak Luar:
   Apabila ada pihak di luar kepanitiaan resmi yang meminta sumbangan mengatasnamakan kegiatan ini, mohon untuk TIDAK dilayani.

3. Koordinasi & Laporan:
   Jika ada keraguan atau pihak yang memaksa, mohon segera melaporkannya kepada Ketua Paguyuban atau Seksi Keamanan.

Mari kita jaga lingkungan kita agar tetap kondusif, guyub, dan kompak dalam merayakan hari bersejarah bangsa.

Salam hangat,
Pengurus Paguyuban PK 8 Tahap 2
#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Pengurus Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/informasi_4.jpg',
    createdAt: '05 Juli 2026'
  },
  {
    id: 'PGM-003',
    judul: 'Apresiasi & Ucapan Terima Kasih untuk Para Donatur HUT RI ke-81',
    kategori: 'Sosial & Keamanan',
    tanggalAcara: '17 Agustus 2026',
    waktu: 'Malam Puncak Kemerdekaan',
    lokasi: 'Panggung Utama Fasum PK8-2',
    deskripsi: `🇮🇩 APRESIASI SETINGGI-TINGGINYA UNTUK PARA DONATUR HUT RI KE-81
Komplek Perumahan Pesona Kahuripan 8 Tahap 2

Merdeka adalah saat kita mampu saling merangkul dan meringankan beban sesama sesama tetangga.

Melalui momentum HUT RI ke-81, kami segenap Panitia dan Pengurus Paguyuban menghaturkan rasa terima kasih yang tak terhingga atas kedermawanan luar biasa dari seluruh donatur dan warga sekalian.

Berkat uluran tangan Anda:
• Perayaan kemerdekaan perdana di komplek kita berlangsung meriah dan penuh kehangatan.
• Perlombaan anak-anak, remaja, dan bapak-ibu dapat terlaksana dengan hadiah yang berkesan.
• Memberikan hiburan dan mempererat tali silaturahmi antar blok perumahan.

Setiap rupiah dan tenaga yang Anda dedikasikan adalah investasi sosial yang sangat berharga demi senyum kemerdekaan warga. Semoga Allah SWT membalas segala kebaikan bapak/ibu sekalian dengan rezeki dan keberkahan yang berlipat ganda. Aamiin ya Rabbal 'Alamin.

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Panitia HUT RI & Pengurus Paguyuban',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/spanduk_donatur_hut_ri.jpg',
    createdAt: '17 Agustus 2026'
  },
  {
    id: 'PGM-004',
    judul: 'Susunan Kepanitiaan HUT RI ke-81 Pesona Kahuripan 8 Tahap 2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: 'Agustus 2026',
    waktu: 'Periode Kemerdekaan 2026',
    lokasi: 'Sekretariat Panitia PK8-2',
    deskripsi: `👥 SUSUNAN PANITIA HUT RI KE-81 TAHUN 2026
Paguyuban Pesona Kahuripan 8 Tahap 2

Terima kasih yang sebesar-besarnya kepada:
• Panitia Pelaksana HUT RI
• Pengurus Paguyuban PK8-2
• Para Donatur Warga
• Serta seluruh warga yang ikut bersinergi meluangkan Waktu, Harta, Pikiran, dan Tenaganya untuk mensukseskan acara kemerdekaan perdana ini.

STRUKTUR KEPANITIAAN:
• Penanggung Jawab : Bpk. Rachmatullah Tiflen (Ketua Paguyuban)
• Ketua Pelaksana  : Ibu-Ibu Paguyuban PK8-2
• Koordinator Acara: Bpk. Roland Fitzgerald Kerong (Blok E2/7)
• Koordinator Lapangan : Bpk. Syakur & Bpk. Ujang Piyan
• Koordinator Perlombaan : Seksi Pemuda & Ibu-Ibu RT 08

"Kedamaian lingkungan dimulai dari adab bertetangga yang baik, saling menghormati, dan saling mengingatkan dalam kebaikan."

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'BPH Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_4.jpg',
    createdAt: '10 Juli 2026'
  },
  {
    id: 'PGM-005',
    judul: 'Kegiatan Karnaval Sepeda Hias Anak-Anak Semarak Kemerdekaan',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '16 Agustus 2026',
    waktu: '07:30 – 09:30 WIB',
    lokasi: 'Keliling Jalur Utama Blok D & Blok E',
    deskripsi: `🚲 KARNAVAL SEPEDA HIAS ANAK-ANAK PK8-2
Hari / Tanggal : Minggu, 16 Agustus 2026
Titik Kumpul   : Lapangan Fasum Utama PK8-2

Rincian Kegiatan:
• Untuk memeriahkan HUT RI ke-81, panitia mengadakan jalan pagi dan pawai sepeda hias mengelilingi perumahan.
• Alat dan hiasan disediakan bersama oleh panitia dan dikerjakan secara gotong royong oleh pengurus dan warga setempat.
• Terima kasih yang luar biasa untuk bapak dan ibu yang sudah mendampingi dan ikut membantu menghias sepeda anak-anak dengan penuh kreativitas merah-putih.

Semoga menumbuhkan rasa cinta tanah air dan keceriaan bagi putra-putri generasi penerus lingkungan kita!

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Seksi Acara HUT RI',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_5.jpg',
    createdAt: '16 Agustus 2026'
  },
  {
    id: 'PGM-006',
    judul: 'Perlombaan Seru Kategori Dewasa HUT RI ke-81 PK8-2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '15 - 16 Agustus 2026',
    waktu: '13:00 – 17:30 WIB',
    lokasi: 'Fasum Utama & Lapangan Voli Warga',
    deskripsi: `🏆 PERLOMBAAN KATEGORI DEWASA HUT RI KE-81
Paguyuban Pesona Kahuripan 8 Tahap 2

Daftar Cabang Perlombaan Bapak-Bapak & Ibu-Ibu:
1. Turnamen Catur Antar Gang (Malam Minggu, 15 Agustus - 20.30 WIB)
2. Lomba Tarik Tambang Antar Blok (Blok D vs Blok E)
3. Lomba Estafet Tepung & Balap Karung Helm
4. Pertandingan Voli Santai Guyub Tetangga
5. Lomba Masak & Menghias Tumpeng Ibu-Ibu

Apresiasi untuk semangat sportivitas dan tawa canda kebersamaan warga yang luar biasa kompak!

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Panitia Lomba Dewasa',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_6.jpg',
    createdAt: '16 Agustus 2026'
  },
  {
    id: 'PGM-007',
    judul: 'Perlombaan Anak-Anak Semarak HUT RI ke-81 PK8-2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '16 Agustus 2026',
    waktu: '09:30 – 12:00 WIB',
    lokasi: 'Halaman Fasum PK8-2',
    deskripsi: `🎈 PERLOMBAAN ANAK-ANAK HUT RI KE-81
Kategori Usia: 3–7 Tahun & 8–14 Tahun

Tujuan Kegiatan:
• Menumbuhkan rasa nasionalisme dan cinta tanah air sejak usia dini.
• Mempererat persahabatan anak-anak antar tetangga di lingkungan baru.

Daftar Perlombaan:
• Lomba Makan Kerupuk Merah Putih
• Lomba Memasukkan Paku ke dalam Botol
• Lomba Balap Kelereng Sendok
• Lomba Memindahkan Bendera
• Lomba Mewarnai Tema Kemerdekaan

Seluruh peserta mendapatkan bingkisan kenang-kenangan dan piagam apresiasi dari panitia!`,
    author: 'Panitia Lomba Anak',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_7.jpg',
    createdAt: '16 Agustus 2026'
  },
  {
    id: 'PGM-008',
    judul: 'Atraksi Sulap Spektakuler di Malam Puncak HUT RI oleh Pak Nalam',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '16 Agustus 2026',
    waktu: '20:00 – 21:30 WIB',
    lokasi: 'Panggung Malam Puncak Fasum PK8-2',
    deskripsi: `🎩 ATRAKSI SULAP MALAM PUNCAK HUT RI PK8 TAHAP 2
Persembahan Spesial dari Bapak Nalam (Warga Blok D16 No. 7)

Atraksi sulap dari Bapak Nalam menjadi salah satu acara paling dinanti di malam puncak perayaan kemerdekaan, disamping pembagian doorprize utama dan penyerahan hadiah lomba.

Wajah anak-anak dan warga tampak sangat antusias dan bergembira menyaksikan trik-trik ilusi yang memukau.

Terima kasih banyak kepada Pak Nalam yang telah mendonasikan keahlian sulapnya untuk menghibur seluruh warga Pesona Kahuripan 8 Tahap 2. Bagi warga yang tertarik dengan jasa pertunjukan beliau untuk acara ulang tahun/keluarga, bisa langsung silaturahmi ke kediaman beliau di Blok D16/7.

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Panitia Malam Puncak HUT RI',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_8.jpg',
    createdAt: '16 Agustus 2026'
  },
  {
    id: 'PGM-009',
    judul: 'Program Cukur Rambut Gratis di Fasum Utama oleh Pak Beni & Pak Anggi',
    kategori: 'Sosial & Kerja Bakti',
    tanggalAcara: '16 Agustus 2026',
    waktu: '08:00 – 12:00 WIB',
    lokasi: 'Tenda Fasum Utama PK8-2',
    deskripsi: `✂️ PROGRAM CUKUR RAMBUT GRATIS WARGA PK8-2
Sedekah Tenaga & Keahlian dari Pak Beni & Pak Anggi (Warga Blok E10 No. 16)

Dalam momentum semarak kemerdekaan, Pak Beni dan Pak Anggi membuka stan cukur rambut gratis untuk warga dan anak-anak komplek di fasum utama.

Masyarakat antusias memanfaatkan kesempatan ini untuk merapikan rambut anak-anak dan keluarga tanpa dipungut biaya sepeser pun.

Terima kasih tak terhingga kepada Pak Beni dan Pak Anggi yang telah meluangkan waktu dan tenaganya serta mensedekahkan keahliannya demi kenyamanan sesama warga. Semoga menjadi ladang amal jariyah yang berlimpah berkah! Aamiin.

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Pengurus Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_8.jpg',
    createdAt: '16 Agustus 2026'
  },
  {
    id: 'PGM-010',
    judul: 'Rundown Lengkap & Susunan Acara Semarak HUT RI ke-81 PK8-2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '15 - 16 Agustus 2026',
    waktu: 'Jadwal Lengkap 2 Hari',
    lokasi: 'Seluruh Area Fasum PK8-2',
    deskripsi: `📢 SUSUNAN ACARA & RUNDOWN HUT RI 81
Siapkan semangatmu! Jangan sampai ketinggalan keseruannya:

🗓️ SABTU, 15 AGUSTUS 2026:
• 20.30 – 21.00 WIB : Registrasi Peserta Lomba Catur Dewasa
• 21.00 – 00.00 WIB : Babak Penyisihan & Final Catur

🗓️ MINGGU, 16 AGUSTUS 2026:
• 07.00 – 07.15 WIB : Pembukaan & Sambutan Pak Ketum Rachmatullah Tiflen
• 07.15 – 07.45 WIB : Registrasi & Pengarahan Teknis Perlombaan
• 07.45 – 09.30 WIB : Pawai Sepeda Hias Anak & Jalan Sehat Warga
• 08.00 – 12.00 WIB : Stan Cukur Rambut Gratis (Pak Beni & Pak Anggi)
• 09.30 – 12.00 WIB : Aneka Lomba Anak (Kategori 1: 3–7 th, Kategori 2: 8–14 th)
• 12.00 – 13.00 WIB : Istirahat & Sholat Dzuhur
• 13.00 – 17.30 WIB : Perlombaan Heboh Kategori Dewasa
• 19.30 – 20.30 WIB : Malam Puncak, Sambutan & Pemutaran Dokumentasi
• 20.30 – 21.15 WIB : Pertunjukan Sulap Eksklusif oleh Pak Nalam
• 21.15 – 22.30 WIB : Pembagian Hadiah, Trofi & Doorprize Utama
• 22.30 WIB         : Doa Bersama & Penutupan

Mari kita sukseskan bersama pesta kemerdekaan pertama di komplek kita!`,
    author: 'Panitia HUT RI PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_5.jpg',
    createdAt: '11 Juli 2026'
  },
  {
    id: 'PGM-011',
    judul: 'Serah Terima Hibah Mesin Pompa Air Fasum dari Pak Boy',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '19 Juli 2026',
    waktu: '10:00 WIB',
    lokasi: 'Balai Pertemuan & Pos Fasum',
    deskripsi: `💧 SERAH TERIMA HIBAH MESIN POMPA AIR FASUM
Apresiasi Warga untuk Kemaslahatan Bersama

Alhamdulillah telah terlaksana serah terima hibah 1 unit Mesin Pompa Air dari Pak Boy (warga komplek) kepada Pengurus Paguyuban yang diwakili langsung oleh Ketua Umum Bpk. Rachmatullah Tiflen.

Mesin pompa ini difungsikan untuk:
• Menjamin ketersediaan pasokan air bersih di fasilitas umum warga.
• Kebutuhan penyiraman taman dan kebersihan balai pertemuan.
• Fasilitas cuci tangan dan operasional kegiatan gotong royong.

Semoga membawa keberkahan dan menjadi amal jariyah yang pahalanya terus mengalir untuk Pak Boy dan keluarga. Aamiin Allahumma Aamiin.

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Pengurus Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_9.jpg',
    createdAt: '19 Juli 2026'
  },
  {
    id: 'PGM-012',
    judul: 'Kerja Bakti Lingkungan: Pembuatan Polisi Tidur & Tanggul Jalan',
    kategori: 'Sosial & Kerja Bakti',
    tanggalAcara: '21 Juni 2026',
    waktu: '07:30 – 11:30 WIB',
    lokasi: 'Jalan Utama Gang Blok D & E',
    deskripsi: `🚧 LAPORAN KERJA BAKTI PEMBUATAN POLISI TIDUR
Demi Keselamatan & Ketertiban Pengendara

Dalam rangka menjaga keselamatan warga dan anak-anak yang bermain di jalan gang, warga PK8-2 melaksanakan gotong royong pembuatan polisi tidur serta pemasangan tanggul penahan air.

Poin-Poin Pengerjaan:
1. Pemasangan tanggul semen di titik-titik persimpangan rawan laju kendaraan.
2. Pengecatan marka garis kejut agar terlihat jelas saat malam hari.
3. Pembersihan material sisa semen dan perapihan saluran drainase pinggir jalan.

Terima kasih untuk seluruh bapak-bapak yang telah meluangkan tenaga, alat, serta konsumsinya demi keselamatan lingkungan kita bersama.

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Seksi Keamanan & Fasum',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_4.jpg',
    createdAt: '21 Juni 2026'
  },
  {
    id: 'PGM-013',
    judul: 'Kerja Bakti Rutin Bergilir Pembersihan Gang Blok D8 s/d D13 No. 8',
    kategori: 'Sosial & Kerja Bakti',
    tanggalAcara: '02 Agustus 2026',
    waktu: '07:30 – 11:00 WIB',
    lokasi: 'Gang Blok D8 s/d D13 No. 8',
    deskripsi: `🌿 JADWAL KERJA BAKTI BERGILIR PER GANG
Fokus Area: Gang Blok D8 sampai Blok D13 No. 8

Mengingat cepatnya pertumbuhan rumput liar di setiap gang, baik di halaman depan rumah maupun di saluran air drainase, maka paguyuban membuatkan jadwal rutin kerja bakti bergilir antar gang.

Agenda Pembersihan:
• Pembabatan rumput liar di pinggir badan jalan.
• Pengerukan endapan lumpur dan pasir di selokan agar aliran lancar saat hujan.
• Pengangkutan sampah sisa rumput ke bak pembuangan utama.

Mari sempatkan hadir bersama tetangga satu gang, saling menyapa sembari menjaga kebersihan lingkungan kita!

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Koordinator Lingkungan',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_11.jpg',
    createdAt: '02 Agustus 2026'
  },
  {
    id: 'PGM-014',
    judul: 'Notulensi Rapat Pembahasan Acara HUT RI - 11 Juli 2026',
    kategori: 'Rapat Warga',
    tanggalAcara: '11 Juli 2026',
    waktu: '20:00 – 23:30 WIB',
    lokasi: 'Balai Warga PK8-2',
    deskripsi: `📝 NOTULENSI RAPAT PERSIAPAN HUT RI 81
Hari / Tanggal : Sabtu Malam Minggu, 11 Juli 2026
Peserta Rapat  : Pengurus, Panitia Pelaksana, & Perwakilan Warga

Agenda Pembahasan:
1. Pembahasan RAB (Rencana Anggaran Biaya) Perlombaan & Pesta Rakyat.
2. Penetapan cabang perlombaan untuk anak-anak, remaja, dan dewasa.
3. Sistem pendataan putra-putri warga yang akan mengikuti lomba sepeda hias.
4. Penetapan personil panitia perlengkapan, konsumsi, dan dokumentasi.
5. Rencana penyebaran proposal donasi sukarela kemerdekaan.

Rapat berjalan lancar dan penuh mufakat. Terima kasih atas partisipasi aktif seluruh perwakilan blok yang hadir.`,
    author: 'Sekretaris Panitia HUT RI',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/beranda_13.jpg',
    createdAt: '11 Juli 2026'
  },
  {
    id: 'PGM-015',
    judul: 'Pengajuan Fasilitas Penerangan Jalan Umum (PJU) ke Pihak Developer',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '25 Juni 2026',
    waktu: 'Pertemuan Resmi',
    lokasi: 'Kantor Pemasaran Developer Pesona Kahuripan',
    deskripsi: `💡 PENGAJUAN PENERANGAN JALAN KE DEVELOPER
Perwakilan Pengurus Paguyuban: Bang Dedy

Pengurus Paguyuban PK8-2 telah menyampaikan surat resmi permohonan penambahan titik tiang dan instalasi lampu jalan utama kepada pihak developer pengembang perumahan.

Poin Pengajuan:
1. Percepatan pemasangan lampu di jalur utama akses masuk warga.
2. Penambahan instalasi meteran listrik penerangan jalan komplek.
3. Koordinasi pemasangan lampu gang swadaya yang didukung oleh urunan warga.

Semoga proses koordinasi ini segera membuahkan hasil agar lingkungan komplek semakin terang benderang dan aman.`,
    author: 'Humas Paguyuban (Bang Dedy)',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_5.jpg',
    createdAt: '25 Juni 2026'
  },
  {
    id: 'PGM-016',
    judul: 'Rapat Perdana & Silaturahmi Ibu-Ibu Pesona Kahuripan 8 Tahap 2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '19 Juni 2026',
    waktu: '15:30 – 17:30 WIB',
    lokasi: 'Balai Pertemuan Warga PK8-2',
    deskripsi: `🌸 SILATURAHMI PERDANA IBU-IBU PK8 TAHAP 2
Pertemuan Perdana Pengurus dengan Ibu-Ibu Warga

Alhamdulillah telah terlaksana pertemuan perdana antara jajaran pengurus paguyuban dengan ibu-ibu warga perumahan Pesona Kahuripan 8 Tahap 2.

Agenda Pertemuan:
• Perkenalan dan ramah tamah antar tetangga baru.
• Penyampaian rencana pembentukan arisan dan senam sehat warga.
• Penunjukan perwakilan ibu-ibu sebagai motor penggerak acara kemerdekaan HUT RI ke-81.

Suasana pertemuan berlangsung hangat, akrab, dan penuh keceriaan. Guyub rukun selalu untuk keluarga besar PK8-2!`,
    author: 'Pengurus Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_7.jpg',
    createdAt: '19 Juni 2026'
  },
  {
    id: 'PGM-017',
    judul: 'Distribusi Stiker Resmi Identitas Kendaraan Warga Paguyuban PK8-2',
    kategori: 'Sosial & Keamanan',
    tanggalAcara: '15 Juni 2026',
    waktu: 'Distribusi Bertahap',
    lokasi: 'Pos Keamanan & Rumah Koordinator Bpk. Ujang',
    deskripsi: `🏷️ SERAH TERIMA & PEMBAGIAN STIKER KENDARAAN
Fungsi: Identitas Kendaraan Resmi Penghuni PK8 Tahap 2

Pengurus telah menyelesaikan pencetakan stiker resmi paguyuban untuk kendaraan roda dua maupun roda empat milik warga penghuni perumahan.

Mekanisme Distribusi:
• Stiker diserahkan oleh pengurus kepada Koordinator Lapangan Bpk. Ujang Piyan.
• Warga dapat mengambil stiker di pos keamanan gerbang utama dengan menunjukkan bukti domisili atau konfirmasi blok rumah.
• Stiker wajib ditempelkan di bagian depan motor / kaca mobil guna memudahkan petugas keamanan saat mengawasi kendaraan keluar-masuk.

Demi keamanan dan ketertiban lingkungan kita bersama, mohon kerjasama seluruh warga.`,
    author: 'Koordinator Lapangan (Bpk. Ujang Piyan)',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_8.jpg',
    createdAt: '15 Juni 2026'
  },
  {
    id: 'PGM-018',
    judul: 'Pembangunan Pos & Kantor Sekretariat Paguyuban PK8-2',
    kategori: 'Info Warga & Fasum',
    tanggalAcara: '14 Juni 2026',
    waktu: 'Tahap Pembangunan',
    lokasi: 'Area Gerbang Masuk & Pos Keamanan Utama',
    deskripsi: `🏠 PEMBUATAN KANTOR SEKRETARIAT PAGUYUBAN PK8-2
Pusat Administrasi & Layanan Warga

Sebagai wadah pelayanan administrasi, koordinasi keamanan, dan tempat pertemuan pengurus, telah dimulai pembangunan Pos & Kantor Sekretariat Paguyuban Pesona Kahuripan 8 Tahap 2.

Fungsi Kantor Sekretariat:
1. Pusat koordinasi regu ronda siskamling malam.
2. Pos pelayanan informasi, surat pengantar warga, dan pembayaran IPL kasir.
3. Tempat penyimpanan inventaris alat kerja bakti, genset, dan pompa air bersama.

"Sahabat sejati adalah warna paling indah yang memberi nyawa pada palet kehidupan di lingkungan baru kita."

#Guyub #Asri ber#Sinergi #GASS`,
    author: 'Pengurus Paguyuban PK8-2',
    status: 'PUBLISHED',
    gambarBanner: '/kegiatan/kegiatan_10.jpg',
    createdAt: '14 Juni 2026'
  }
];
