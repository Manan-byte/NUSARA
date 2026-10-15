use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WargaRecord {
    #[serde(default)]
    pub no: Option<i32>,
    pub id: Option<String>,
    #[serde(rename = "namaLengkap")]
    pub nama_lengkap: String,
    #[serde(rename = "jenisKelamin")]
    pub jenis_kelamin: String,
    pub blok: String,
    #[serde(rename = "noRumah")]
    pub no_rumah: String,
    #[serde(rename = "alamatRumah")]
    pub alamat_rumah: String,
    #[serde(rename = "noWhatsapp")]
    pub no_whatsapp: String,
    #[serde(rename = "statusTempatTinggal")]
    pub status_tempat_tinggal: String,
    pub pekerjaan: String,
    pub agama: String,
    #[serde(rename = "statusPernikahan")]
    pub status_pernikahan: String,
    #[serde(rename = "statusDalamKeluarga")]
    pub status_dalam_keluarga: String,
    #[serde(rename = "jmlJiwa")]
    pub jml_jiwa: i32,
    #[serde(rename = "anggotaKeluargaTambahan")]
    pub anggota_keluarga_tambahan: Option<String>,
    #[serde(rename = "statusIpl")]
    pub status_ipl: String,
    #[serde(rename = "periodeTercover")]
    pub periode_tercover: Option<String>,
    #[serde(rename = "nominalIpl")]
    pub nominal_ipl: Option<i64>,
    #[serde(rename = "tanggalUpdate")]
    pub tanggal_update: Option<String>,
    pub catatan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransaksiIPL {
    #[serde(default)]
    pub no: Option<i32>,
    #[serde(rename = "noTransaksi")]
    pub no_transaksi: String,
    #[serde(rename = "namaWarga")]
    pub nama_warga: String,
    #[serde(rename = "lokasiRumah")]
    pub lokasi_rumah: String,
    #[serde(rename = "periodeTercover")]
    pub periode_tercover: String,
    #[serde(rename = "durasiPaket")]
    pub durasi_paket: String,
    #[serde(rename = "nominalBayar")]
    pub nominal_bayar: i64,
    pub status: String,
    #[serde(rename = "tanggalPelunasan")]
    pub tanggal_pelunasan: Option<String>,
    #[serde(rename = "metodePembayaran")]
    pub metode_pembayaran: String,
    #[serde(rename = "buktiBayar")]
    pub bukti_bayar: Option<String>,
    pub keterangan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PengeluaranKasRecord {
    pub id: String,
    pub tanggal: String,
    pub kategori: String,
    pub keterangan: String,
    pub nominal: i64,
    pub penerima: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ItemUrunanWarga {
    pub id: String,
    #[serde(rename = "noUrut")]
    pub no_urut: i32,
    #[serde(rename = "programId")]
    pub program_id: String,
    pub tipe: String,
    #[serde(rename = "namaWarga")]
    pub nama_warga: String,
    pub nominal: i64,
    pub metode: String,
    pub status: Option<String>,
    #[serde(rename = "buktiBayar")]
    pub bukti_bayar: Option<String>,
    pub tanggal: Option<String>,
    pub keterangan: Option<String>,
}
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PetugasSlot {
    pub slot: u8,
    #[serde(rename = "namaLengkap")]
    pub nama_lengkap: String,
    #[serde(rename = "blokRumah")]
    pub blok_rumah: String,
    #[serde(rename = "isKoordinator")]
    pub is_koordinator: bool,
    #[serde(rename = "noWhatsapp")]
    pub no_whatsapp: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JadwalRondaRecord {
    pub id: String,
    pub hari: String,
    pub tanggal: String,
    #[serde(rename = "jamOperasional")]
    pub jam_operasional: String,
    #[serde(rename = "lokasiPos")]
    pub lokasi_pos: String,
    pub petugas: Vec<PetugasSlot>,
    pub catatan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PengumumanRecord {
    pub id: String,
    pub judul: String,
    pub kategori: String,
    #[serde(rename = "tanggalAcara")]
    pub tanggal_acara: String,
    pub waktu: String,
    pub lokasi: String,
    pub deskripsi: String,
    pub author: String,
    pub status: String,
    #[serde(rename = "gambarBanner")]
    pub gambar_banner: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AdminAccount {
    pub id: String,
    pub nama: String,
    pub username: String,
    pub password: String,
    pub jabatan: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InfoRekeningBank {
    #[serde(rename = "namaBank")]
    pub nama_bank: String,
    #[serde(rename = "noRekening")]
    pub no_rekening: String,
    #[serde(rename = "atasNama")]
    pub atas_nama: String,
    pub catatan: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RekapBlok {
    pub blok: String,
    #[serde(rename = "jumlahRumah")]
    pub jumlah_rumah: i32,
    pub menetap: i32,
    #[serde(rename = "pulangPergi")]
    pub pulang_pergi: i32,
    #[serde(rename = "belumMenetap")]
    pub belum_menetap: i32,
    #[serde(rename = "targetIpl")]
    pub target_ipl: i64,
    #[serde(rename = "realisasiMasuk")]
    pub realisasi_masuk: i64,
    #[serde(rename = "sisaTunggakan")]
    pub sisa_tunggakan: i64,
    pub status: String,
    pub persentase: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DashboardSummary {
    #[serde(rename = "pemasukanIpl")]
    pub pemasukan_ipl: i64,
    #[serde(rename = "targetIpl")]
    pub target_ipl: i64,
    #[serde(rename = "persentasePemasukan")]
    pub persentase_pemasukan: String,
    #[serde(rename = "rumahLunas")]
    pub rumah_lunas: i32,
    #[serde(rename = "totalRumah")]
    pub total_rumah: i32,
    #[serde(rename = "totalWarga")]
    pub total_warga: Option<i32>,
    #[serde(rename = "pengeluaranKas")]
    pub pengeluaran_kas: i64,
    #[serde(rename = "saldoAwalKas")]
    pub saldo_awal_kas: Option<i64>,
    #[serde(rename = "sisaSaldoKas")]
    pub sisa_saldo_kas: i64,
    #[serde(rename = "wargaMenetap")]
    pub warga_menetap: i32,
    #[serde(rename = "wargaPulangPergi")]
    pub warga_pulang_pergi: i32,
    #[serde(rename = "wargaBelumMenetap")]
    pub warga_belum_menetap: i32,
    #[serde(rename = "rekapPerBlok")]
    pub rekap_per_blok: Vec<RekapBlok>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    pub token: Option<String>,
    pub admin: Option<AdminAccount>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub message: String,
}

impl<T> ApiResponse<T> {
    #[allow(dead_code)]
    pub fn ok(data: T, msg: impl Into<String>) -> (axum::http::StatusCode, axum::response::Json<Self>) {
        (axum::http::StatusCode::OK, axum::response::Json(Self { success: true, data: Some(data), message: msg.into() }))
    }

    pub fn created(data: T, msg: impl Into<String>) -> (axum::http::StatusCode, axum::response::Json<Self>) {
        (axum::http::StatusCode::CREATED, axum::response::Json(Self { success: true, data: Some(data), message: msg.into() }))
    }
}

impl ApiResponse<()> {
    pub fn success(msg: impl Into<String>) -> (axum::http::StatusCode, axum::response::Json<Self>) {
        (axum::http::StatusCode::OK, axum::response::Json(Self { success: true, data: None, message: msg.into() }))
    }

    pub fn not_found(msg: impl Into<String>) -> (axum::http::StatusCode, axum::response::Json<Self>) {
        (axum::http::StatusCode::NOT_FOUND, axum::response::Json(Self { success: false, data: None, message: msg.into() }))
    }

    pub fn unauthorized(msg: impl Into<String>) -> (axum::http::StatusCode, axum::response::Json<Self>) {
        (axum::http::StatusCode::UNAUTHORIZED, axum::response::Json(Self { success: false, data: None, message: msg.into() }))
    }
}
