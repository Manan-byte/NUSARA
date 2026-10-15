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
        Self {
            warga: Vec::new(),
            transaksi_ipl: Vec::new(),
            pengeluaran: Vec::new(),
            urunan: Vec::new(),
            ronda: Vec::new(),
            pengumuman: Vec::new(),
            admins: vec![
                AdminAccount {
                    id: "adm-01".to_string(),
                    nama: "Ketua Paguyuban PK8-2".to_string(),
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
            ],
            rekening_bank: InfoRekeningBank {
                nama_bank: "Bank Mandiri".to_string(),
                no_rekening: "1240010437979".to_string(),
                atas_nama: "Dwi Saputra".to_string(),
                catatan: Some("Kas Paguyuban RT 08".to_string()),
            },
            tarif_ipl: 30000,
            saldo_awal: 0,
            active_tokens: HashSet::new(),
        }
    }
}
