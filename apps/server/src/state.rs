use std::fs;
use std::path::Path;
use std::sync::Arc;
use std::collections::HashSet;
use tokio::sync::RwLock;
use serde::{Deserialize, Serialize};
use crate::models::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseState {
    pub warga: Vec<WargaRecord>,
    pub transaksi_ipl: Vec<TransaksiIPL>,
    pub pengeluaran: Vec<PengeluaranKasRecord>,
    pub urunan: Vec<ItemUrunanWarga>,
    pub ronda: Vec<JadwalRondaRecord>,
    pub pengumuman: Vec<PengumumanRecord>,
    pub admins: Vec<AdminAccount>,
    pub rekening_bank: InfoRekeningBank,
    pub tarif_ipl: i64,
    pub saldo_awal: i64,
    #[serde(skip, default)]
    pub active_tokens: HashSet<String>,
}

pub type SharedState = Arc<RwLock<DatabaseState>>;

impl DatabaseState {
    pub fn is_token_valid(&self, token: &str) -> bool {
        if token.trim().is_empty() {
            return false;
        }
        self.active_tokens.contains(token)
    }

    pub fn register_token(&mut self, token: String) {
        self.active_tokens.insert(token);
    }

    pub fn load_or_init() -> Self {
        let db_path = Path::new("data/database.json");
        if db_path.exists() {
            if let Ok(content) = fs::read_to_string(db_path) {
                if let Ok(state) = serde_json::from_str::<DatabaseState>(&content) {
                    tracing::info!("Loaded database state with {} residents from {:?}", state.warga.len(), db_path);
                    return state;
                }
            }
        }

        let state = Self::seed_default();
        let _ = state.save();
        state
    }

    pub fn save(&self) -> Result<(), std::io::Error> {
        if let Some(parent) = Path::new("data/database.json").parent() {
            fs::create_dir_all(parent)?;
        }
        let json = serde_json::to_string_pretty(self)?;
        fs::write("data/database.json", json)?;
        Ok(())
    }

    pub fn compute_summary(&self) -> DashboardSummary {
        let total_warga = self.warga.len() as i32;
        let warga_menetap = self.warga.iter().filter(|w| w.status_tempat_tinggal == "Menetap").count() as i32;
        let warga_pulang_pergi = self.warga.iter().filter(|w| w.status_tempat_tinggal == "Pulang-Pergi").count() as i32;
        let warga_belum_menetap = self.warga.iter().filter(|w| w.status_tempat_tinggal == "Belum menetap").count() as i32;
        
        let pemasukan_ipl: i64 = self.transaksi_ipl
            .iter()
            .filter(|t| t.status == "Lunas")
            .map(|t| t.nominal_bayar)
            .sum();

        let rumah_lunas = self.transaksi_ipl
            .iter()
            .filter(|t| t.status == "Lunas")
            .count() as i32;

        let total_rumah = total_warga;
        let target_ipl = (total_rumah as i64) * self.tarif_ipl;
        let persentase_pemasukan = if target_ipl > 0 {
            format!("{}%", (pemasukan_ipl * 100) / target_ipl)
        } else {
            "0%".to_string()
        };

        let pengeluaran_kas: i64 = self.pengeluaran.iter().map(|p| p.nominal).sum();
        let sisa_saldo_kas = (self.saldo_awal + pemasukan_ipl) - pengeluaran_kas;

        let blocks = vec!["A", "B", "C", "D", "E", "F"];
        let mut rekap_per_blok = Vec::new();
        for b in blocks {
            let count = self.warga.iter().filter(|w| w.blok == b).count() as i32;
            let m = self.warga.iter().filter(|w| w.blok == b && w.status_tempat_tinggal == "Menetap").count() as i32;
            let pp = self.warga.iter().filter(|w| w.blok == b && w.status_tempat_tinggal == "Pulang-Pergi").count() as i32;
            let bm = self.warga.iter().filter(|w| w.blok == b && w.status_tempat_tinggal == "Belum menetap").count() as i32;
            let target = (count as i64) * self.tarif_ipl;
            let real = self.transaksi_ipl.iter().filter(|t| t.lokasi_rumah.starts_with(b) && t.status == "Lunas").map(|t| t.nominal_bayar).sum::<i64>();
            rekap_per_blok.push(RekapBlok {
                blok: b.to_string(),
                jumlah_rumah: count,
                menetap: m,
                pulang_pergi: pp,
                belum_menetap: bm,
                target_ipl: target,
                realisasi_masuk: real,
                sisa_tunggakan: target.saturating_sub(real),
                status: if real >= target { "100% Lunas".to_string() } else { "Belum 100%".to_string() },
                persentase: if target > 0 { format!("{}%", (real * 100) / target) } else { "0%".to_string() },
            });
        }

        DashboardSummary {
            pemasukan_ipl,
            target_ipl,
            persentase_pemasukan,
            rumah_lunas,
            total_rumah,
            total_warga: Some(total_warga),
            pengeluaran_kas,
            saldo_awal_kas: Some(self.saldo_awal),
            sisa_saldo_kas: sisa_saldo_kas.max(0),
            warga_menetap,
            warga_pulang_pergi,
            warga_belum_menetap,
            rekap_per_blok,
        }
    }

    fn seed_default() -> Self {
        let admins = vec![
            AdminAccount {
                id: "adm-01".to_string(),
                nama: "Pengurus Utama RT 08".to_string(),
                username: "admin".to_string(),
                password: "admin123".to_string(),
                jabatan: "Ketua RT".to_string(),
                created_at: "09 Okt 2026".to_string(),
            },
            AdminAccount {
                id: "adm-02".to_string(),
                nama: "Bendahara Kas PK8".to_string(),
                username: "bendahara".to_string(),
                password: "admin123".to_string(),
                jabatan: "Bendahara".to_string(),
                created_at: "09 Okt 2026".to_string(),
            },
        ];

        let rekening_bank = InfoRekeningBank {
            nama_bank: "Bank Central Asia (BCA)".to_string(),
            no_rekening: "8820192839".to_string(),
            atas_nama: "Kas Paguyuban Warga PK8".to_string(),
            catatan: Some("Kas Paguyuban RT 08".to_string()),
        };

        // Seed sample residents
        let mut warga = Vec::new();
        let samples = vec![
            ("Ahmadi Pratama", "A", "01", "081234567890", "Menetap", "PNS", "Islam", 4),
            ("Bambang Hermawan", "A", "02", "081234567891", "Menetap", "Karyawan Swasta", "Islam", 3),
            ("Chandra Setiawan", "A", "03", "081234567892", "Pulang-Pergi", "Wiraswasta", "Islam", 2),
            ("Dedi Sulaeman", "B", "01", "081234567893", "Menetap", "TNI/Polri", "Islam", 4),
            ("Eko Prasetyo", "B", "02", "081234567894", "Belum menetap", "Arsitek", "Islam", 1),
            ("Fajar Nugroho", "B", "03", "081234567895", "Menetap", "Software Engineer", "Islam", 3),
            ("Gunawan Wibowo", "C", "01", "081234567896", "Menetap", "Guru", "Islam", 4),
            ("Hendra Kusuma", "C", "02", "081234567897", "Pulang-Pergi", "Konsultan", "Kristen", 2),
            ("Indra Saputra", "D", "01", "081234567898", "Menetap", "Dokter", "Islam", 5),
            ("Joko Widodo", "E", "01", "081234567899", "Menetap", "Pengusaha", "Islam", 4),
        ];

        for (i, (nama, blok, no, tel, st, pek, ag, jiwa)) in samples.into_iter().enumerate() {
            warga.push(WargaRecord {
                no: Some((i + 1) as i32),
                id: Some(format!("warga-{}-{}", blok.to_lowercase(), no)),
                nama_lengkap: nama.to_string(),
                jenis_kelamin: "Laki-laki".to_string(),
                blok: blok.to_string(),
                no_rumah: no.to_string(),
                alamat_rumah: format!("Blok {} No. {}", blok, no),
                no_whatsapp: tel.to_string(),
                status_tempat_tinggal: st.to_string(),
                pekerjaan: pek.to_string(),
                agama: ag.to_string(),
                status_pernikahan: "Menikah".to_string(),
                status_dalam_keluarga: "Kepala Keluarga".to_string(),
                jml_jiwa: jiwa,
                anggota_keluarga_tambahan: Some("-".to_string()),
                status_ipl: "Lunas".to_string(),
                periode_tercover: Some("Oktober 2026".to_string()),
                nominal_ipl: Some(50000),
                tanggal_update: Some("09 Okt 2026".to_string()),
                catatan: None,
            });
        }

        let transaksi_ipl = vec![
            TransaksiIPL {
                no: Some(1),
                no_transaksi: "#TRX-001".to_string(),
                nama_warga: "Ahmadi Pratama".to_string(),
                lokasi_rumah: "Blok A No. 01".to_string(),
                periode_tercover: "Oktober 2026".to_string(),
                durasi_paket: "1 Bulan".to_string(),
                nominal_bayar: 50000,
                status: "Lunas".to_string(),
                tanggal_pelunasan: Some("05 Okt 2026".to_string()),
                metode_pembayaran: "Transfer Bank".to_string(),
                bukti_bayar: Some("-".to_string()),
                keterangan: Some("Lunas via BCA".to_string()),
            },
        ];

        let pengeluaran = vec![
            PengeluaranKasRecord {
                id: "EXP-001".to_string(),
                tanggal: "02 Okt 2026".to_string(),
                kategori: "Sampah & Kebersihan".to_string(),
                keterangan: "Gaji Petugas Angkut Sampah Lingkungan".to_string(),
                nominal: 800000,
                penerima: "Pak Sutrisno".to_string(),
                created_at: Some("2026-10-02T10:00:00Z".to_string()),
            },
            PengeluaranKasRecord {
                id: "EXP-002".to_string(),
                tanggal: "04 Okt 2026".to_string(),
                kategori: "Listrik & PJU".to_string(),
                keterangan: "Pembelian Lampu LED PJU Jalan Blok B & D".to_string(),
                nominal: 350000,
                penerima: "Toko Listrik Abadi".to_string(),
                created_at: Some("2026-10-04T14:30:00Z".to_string()),
            },
        ];

        let urunan = vec![
            ItemUrunanWarga {
                id: "urunan-1".to_string(),
                no_urut: 1,
                program_id: "pju-2026".to_string(),
                tipe: "DONATUR".to_string(),
                nama_warga: "Bpk. Haji Sulaiman (A1/04)".to_string(),
                nominal: 500000,
                metode: "TF".to_string(),
                status: Some("Lunas".to_string()),
                bukti_bayar: None,
                tanggal: Some("07 Okt 2026".to_string()),
                keterangan: Some("Infaq PJU Blok A".to_string()),
            },
            ItemUrunanWarga {
                id: "urunan-2".to_string(),
                no_urut: 2,
                program_id: "pju-2026".to_string(),
                tipe: "URUNAN_WAJIB".to_string(),
                nama_warga: "Ibu Rahmawati (B2/08)".to_string(),
                nominal: 115000,
                metode: "Cash".to_string(),
                status: Some("Lunas".to_string()),
                bukti_bayar: None,
                tanggal: Some("08 Okt 2026".to_string()),
                keterangan: Some("Urunan Wajib PJU".to_string()),
            },
        ];
        let ronda = vec![
            JadwalRondaRecord {
                id: "ronda-1".to_string(),
                hari: "Senin".to_string(),
                tanggal: "12 Okt 2026".to_string(),
                jam_operasional: "22:00 - 04:00 WIB".to_string(),
                lokasi_pos: "Pos Kamling Utama Blok B".to_string(),
                petugas: vec![
                    PetugasSlot { slot: 1, nama_lengkap: "Ahmadi Pratama".to_string(), blok_rumah: "Blok A No. 01".to_string(), is_koordinator: true, no_whatsapp: Some("081234567890".to_string()) },
                    PetugasSlot { slot: 2, nama_lengkap: "Bambang Hermawan".to_string(), blok_rumah: "Blok A No. 02".to_string(), is_koordinator: false, no_whatsapp: None },
                    PetugasSlot { slot: 3, nama_lengkap: "Dedi Sulaeman".to_string(), blok_rumah: "Blok B No. 01".to_string(), is_koordinator: false, no_whatsapp: None },
                    PetugasSlot { slot: 4, nama_lengkap: "Fajar Nugroho".to_string(), blok_rumah: "Blok B No. 03".to_string(), is_koordinator: false, no_whatsapp: None },
                    PetugasSlot { slot: 5, nama_lengkap: "Gunawan Wibowo".to_string(), blok_rumah: "Blok C No. 01".to_string(), is_koordinator: false, no_whatsapp: None },
                    PetugasSlot { slot: 6, nama_lengkap: "Indra Saputra".to_string(), blok_rumah: "Blok D No. 01".to_string(), is_koordinator: false, no_whatsapp: None },
                ],
                catatan: Some("Siaga patroli malam komplek".to_string()),
            }
        ];

        let pengumuman = vec![
            PengumumanRecord {
                id: "ann-01".to_string(),
                judul: "Kerja Bakti Saluran Air & Fogging Nyamuk".to_string(),
                kategori: "Kerja Bakti & Lingkungan".to_string(),
                tanggal_acara: "Minggu, 18 Okt 2026".to_string(),
                waktu: "07:30 - 11:00 WIB".to_string(),
                lokasi: "Seluruh Blok A s/d F".to_string(),
                deskripsi: "Membersihkan saluran got utama dan fogging nyamuk DBD menjelang musim penghujan.".to_string(),
                author: "Pengurus RT 08".to_string(),
                status: "PUBLISHED".to_string(),
                gambar_banner: Some("/kerja-bakti.jpg".to_string()),
                created_at: "2026-10-09T08:00:00Z".to_string(),
            }
        ];

        Self {
            warga,
            transaksi_ipl,
            pengeluaran,
            urunan,
            ronda,
            pengumuman,
            admins,
            rekening_bank,
            tarif_ipl: 50000,
            saldo_awal: 2500000,
            active_tokens: HashSet::new(),
        }
    }
}
