# NUSARA - SIM-Warga Digital RT 08 Pesona Kahuripan 8

> **Platform Sistem Informasi & Administrasi Warga Digital Modern**  
> Dirancang untuk transparansi kas, pengelolaan IPL, penggalangan dana urunan PJU, siskamling ronda malam, serta audit cerdas terintegrasi kecerdasan buatan (AI).

🌐 **Live Deployment**: [https://sim-warga.pages.dev/](https://sim-warga.pages.dev/)  
📁 **Repository**: [https://github.com/Manan-byte/NUSARA](https://github.com/Manan-byte/NUSARA)

---

## 🏛️ Arsitektur Monorepo

Proyek ini dibangun menggunakan **pnpm workspaces** + **Turborepo** dengan arsitektur *hybrid*:

```
sim-warga/
├── apps/
│   ├── web/               # Frontend React 18 + Vite 6 + Tailwind CSS (Bento Grid)
│   └── server/            # Backend REST API berbasis Rust (Axum 0.7 + Tokio)
├── packages/
│   ├── types/             # Kontrak tipe domain TypeScript (@sim-warga/types)
│   ├── ui/                # Library komponen UI bersama (@sim-warga/ui)
│   └── gas-backend/       # Google Apps Script Web App (Sinkronisasi Google Sheets)
└── data/
    ├── database.json      # Database persistent lokal JSON
    └── backups/           # Salinan cadangan database berkala
```

---

## ✨ Fitur-Fitur Utama

### 1. Dashboard Warga (Portal Mandiri)
- **Ringkasan Kas RT Real-Time**: Sisa saldo kas paguyuban, total pemasukan IPL, dan total pengeluaran operasional.
- **Iuran IPL Online**: Formulir setor mandiri dengan upload bukti transfer bank/QRIS, tracking status bayar (*Lunas, Menunggu Verifikasi, Ditolak*), dan unduhan resi digital.
- **Program Urunan PJU**: Crowdfunding pengadaan lampu penerangan jalan umum komplek dengan progres bar ketercapaian target.
- **Direktori Warga & Rumah**: Pencarian KK per blok dengan perlindungan sensor nomor telepon dan verifikasi Secret PIN.
- **Jadwal Siskamling**: Matriks rotasi 6 petugas jaga malam harian.
- **Papan Jarkoman Modern**: Kartu agenda kegiatan bergaya *boutique destination card* (3 kolom, floating bookmark, tag prioritas, dan tombol lihat detail).

### 2. Panel Pengurus / Admin (5 Hub Terpadu)
- **Pusat Aksi**: Antrean verifikasi bukti transfer (*IPL & PJU*) dengan aksi cepat *Approve/Reject* berhalaman (*mini-pagination*), grafik arus kas, dan pintasan aksi operasional.
- **Keuangan & Kas**: Tabel transaksi IPL lengkap (*filter status, search, bulk approve*), monitoring donatur PJU, pembukuan kas keluar, dan pengaturan tarif IPL serta rekening bank resmi RT 08.
- **Kependudukan & Ronda**: Direktori 143 KK dengan filter blok A–H, intip Secret PIN warga, pendaftaran warga baru 16 kolom, dan kalender siskamling 4 minggu (6 slot petugas seragam + Ronda Akbar).
- **Jarkoman & Publikasi**: Pengelolaan pengumuman broadcast dengan upload foto banner dari komputer atau gambar default resmi bebas figur manusia.
- **Log & Audit AI**: Analisis otomatis mutasi data warga dan admin bertenaga **Gemini AI + Smart NLP** (otomatis dibersihkan setiap 30 hari untuk pengurus biasa).

### 3. Akun Rahasia (Master Blackbox Auditor)
- **Zero-Knowledge Security**: Kredensial tidak tersimpan dalam bentuk teks biasa di kode sumber (terlindungi *salted hash* SHA-256 satu arah).
- **Vault Permanen**: Log mutasi data tersimpan selamanya tanpa batas waktu simpan (*never purged*).
- **Fitur Khusus**: Panel interaktif *Tanya AI Master Auditor* untuk deteksi anomali kas, serta tombol cetak laporan audit resmi format PDF (rekap bulanan atau per lembar log).

---

## 🔒 Standar Keamanan

1. **Popup Konfirmasi Mutasi**: Seluruh aksi penting (*Approve, Tolak, Hapus Kas, Hapus Warga, Hapus Pengumuman, Approve Masal*) dilindungi dialog konfirmasi untuk mencegah kesalahan klik.
2. **Anti-Brute Force Lockout**: 5x percobaan password salah mengunci formulir login admin selama 10 menit dengan hitung mundur real-time.
3. **Auto-Logout Sesi Idle**: 20 menit tanpa aktivitas mouse/keyboard otomatis menutup sesi admin demi keamanan fisik perangkat.
4. **Proteksi API Backend (Rust Axum)**: Endpoint mutasi data dilindungi otorisasi *Bearer Token Header* (permintaan liar di luar aplikasi ditolak HTTP 401 Unauthorized).
5. **Anti-Autofill Browser**: Mencegah browser menyuntikkan password admin ke formulir warga atau kotak pencarian.

---

## 🚀 Panduan Menjalankan Proyek

### Prasyarat
- Node.js >= 18
- pnpm >= 8 (`npm i -g pnpm`)
- Rust toolchain (opsional, untuk backend lokal `cargo`)

### Instalasi & Menjalankan Dev Server
```bash
# Clone repository
git clone https://github.com/Manan-byte/NUSARA.git
cd NUSARA

# Install seluruh dependensi monorepo
pnpm install

# Jalankan Frontend Web (port 3000)
pnpm dev

# Jalankan Backend Rust Server (port 3001)
pnpm server

# Atau jalankan keduanya sekaligus
pnpm dev:all
```

---

## 🔑 Kredensial Pengurus

| Tipe Akun | Username | Password | Hak Akses |
|---|---|---|---|
| **Ketua Paguyuban** | `admin` | `admin123` | Akses penuh 5 Hub Admin operasional |
| **Bendahara** | `bendahara` | `admin123` | Akses penuh 5 Hub Admin operasional |
| **Master Blackbox Auditor** | `auditor.pk8` | `Audit@PK8#Secret2026` | Akses eksklusif Vault Log Permanen & AI Inspector |

---

## 📄 Lisensi

Hak Cipta © 2026 Paguyuban Warga Pesona Kahuripan 8 Tahap 2. Seluruh hak cipta dilindungi undang-undang.
