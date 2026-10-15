use axum::{
    extract::{FromRef, FromRequestParts, Path, State},
    http::{request::Parts, StatusCode},
    response::Json,
};
use uuid::Uuid;
use crate::models::*;
use crate::state::SharedState;
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct AdminClaims {
    pub token: String,
}

#[axum::async_trait]
impl<S> FromRequestParts<S> for AdminClaims
where
    S: Send + Sync,
    SharedState: axum::extract::FromRef<S>,
{
    type Rejection = (StatusCode, Json<ApiResponse<()>>);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get(axum::http::header::AUTHORIZATION)
            .and_then(|v| v.to_str().ok());

        let token = match auth_header {
            Some(h) if h.starts_with("Bearer ") => &h[7..],
            _ => {
                return Err((
                    StatusCode::UNAUTHORIZED,
                    Json(ApiResponse {
                        success: false,
                        data: None,
                        message: "401 Unauthorized: Header 'Authorization: Bearer <token>' wajib disertakan untuk mutasi data pengurus.".to_string(),
                    }),
                ));
            }
        };

        let shared_state = SharedState::from_ref(state);
        let read_lock = shared_state.read().await;

        if !read_lock.is_token_valid(token) {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(ApiResponse {
                    success: false,
                    data: None,
                    message: "401 Unauthorized: Token otorisasi pengurus tidak valid atau telah kedaluwarsa.".to_string(),
                }),
            ));
        }

        Ok(AdminClaims {
            token: token.to_string(),
        })
    }
}

pub async fn health_check() -> Json<serde_json::Value> {
    Json(serde_json::json!({
        "status": "online",
        "engine": "Rust Axum 0.7",
        "service": "SIM-Warga Pesona Kahuripan 8 Backend",
        "version": "1.0.0",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

// ----------------- WARGA HANDLERS -----------------

pub async fn list_warga(State(state): State<SharedState>) -> Json<Vec<WargaRecord>> {
    let read_lock = state.read().await;
    Json(read_lock.warga.clone())
}

pub async fn create_warga(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Json(mut new_warga): Json<WargaRecord>,
) -> (StatusCode, Json<ApiResponse<WargaRecord>>) {
    let mut write_lock = state.write().await;
    let next_no = (write_lock.warga.len() + 1) as i32;
    new_warga.no = Some(next_no);
    if new_warga.id.is_none() {
        new_warga.id = Some(format!("warga-{}", Uuid::new_v4().simple()));
    }
    
    write_lock.warga.insert(0, new_warga.clone());
    let _ = write_lock.save();

    (
        StatusCode::CREATED,
        Json(ApiResponse {
            success: true,
            data: Some(new_warga),
            message: "Warga berhasil ditambahkan ke database Rust!".to_string(),
        }),
    )
}

pub async fn delete_warga(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Path(id): Path<String>,
) -> (StatusCode, Json<ApiResponse<()>>) {
    let mut write_lock = state.write().await;
    write_lock.warga.retain(|w| w.id.as_deref() != Some(&id));
    let _ = write_lock.save();

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: None,
            message: "Data warga berhasil dihapus.".to_string(),
        }),
    )
}

// ----------------- IPL HANDLERS -----------------

pub async fn list_ipl(State(state): State<SharedState>) -> Json<Vec<TransaksiIPL>> {
    let read_lock = state.read().await;
    Json(read_lock.transaksi_ipl.clone())
}

pub async fn create_ipl(
    State(state): State<SharedState>,
    Json(mut new_ipl): Json<TransaksiIPL>,
) -> (StatusCode, Json<ApiResponse<TransaksiIPL>>) {
    let mut write_lock = state.write().await;
    let next_no = (write_lock.transaksi_ipl.len() + 1) as i32;
    new_ipl.no = Some(next_no);
    write_lock.transaksi_ipl.insert(0, new_ipl.clone());
    let _ = write_lock.save();

    (
        StatusCode::CREATED,
        Json(ApiResponse {
            success: true,
            data: Some(new_ipl),
            message: "Data pembayaran IPL berhasil dicatat!".to_string(),
        }),
    )
}

pub async fn approve_ipl(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Path(no_transaksi): Path<String>,
) -> (StatusCode, Json<ApiResponse<()>>) {
    let mut write_lock = state.write().await;
    let mut updated = false;
    for t in &mut write_lock.transaksi_ipl {
        if t.no_transaksi == no_transaksi {
            t.status = "Lunas".to_string();
            t.tanggal_pelunasan = Some(chrono::Local::now().format("%d %b %Y").to_string());
            updated = true;
            break;
        }
    }

    if updated {
        let _ = write_lock.save();
        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: None,
                message: format!("Transaksi {} disetujui (LUNAS)!", no_transaksi),
            }),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(ApiResponse {
                success: false,
                data: None,
                message: "Transaksi tidak ditemukan.".to_string(),
            }),
        )
    }
}

pub async fn reject_ipl(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Path(no_transaksi): Path<String>,
    Json(payload): Json<serde_json::Value>,
) -> (StatusCode, Json<ApiResponse<()>>) {
    let mut write_lock = state.write().await;
    let reason = payload.get("catatan").and_then(|v| v.as_str()).unwrap_or("Struk tidak cocok");

    let mut updated = false;
    for t in &mut write_lock.transaksi_ipl {
        if t.no_transaksi == no_transaksi {
            t.status = "Ditolak".to_string();
            t.keterangan = Some(format!("Ditolak: {}", reason));
            updated = true;
            break;
        }
    }

    if updated {
        let _ = write_lock.save();
        (
            StatusCode::OK,
            Json(ApiResponse {
                success: true,
                data: None,
                message: format!("Transaksi {} ditolak.", no_transaksi),
            }),
        )
    } else {
        (
            StatusCode::NOT_FOUND,
            Json(ApiResponse {
                success: false,
                data: None,
                message: "Transaksi tidak ditemukan.".to_string(),
            }),
        )
    }
}

// ----------------- PENGELUARAN HANDLERS -----------------

pub async fn list_pengeluaran(State(state): State<SharedState>) -> Json<Vec<PengeluaranKasRecord>> {
    let read_lock = state.read().await;
    Json(read_lock.pengeluaran.clone())
}

pub async fn create_pengeluaran(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Json(mut new_exp): Json<PengeluaranKasRecord>,
) -> (StatusCode, Json<ApiResponse<PengeluaranKasRecord>>) {
    let mut write_lock = state.write().await;
    if new_exp.id.is_empty() {
        new_exp.id = format!("EXP-{}", Uuid::new_v4().simple().to_string()[..6].to_uppercase());
    }
    new_exp.created_at = Some(chrono::Utc::now().to_rfc3339());
    write_lock.pengeluaran.insert(0, new_exp.clone());
    let _ = write_lock.save();

    (
        StatusCode::CREATED,
        Json(ApiResponse {
            success: true,
            data: Some(new_exp),
            message: "Pengeluaran kas berhasil dicatat!".to_string(),
        }),
    )
}

pub async fn delete_pengeluaran(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Path(id): Path<String>,
) -> (StatusCode, Json<ApiResponse<()>>) {
    let mut write_lock = state.write().await;
    write_lock.pengeluaran.retain(|p| p.id != id);
    let _ = write_lock.save();

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: None,
            message: "Data pengeluaran berhasil dihapus.".to_string(),
        }),
    )
}

// ----------------- URUNAN HANDLERS -----------------

pub async fn list_urunan(State(state): State<SharedState>) -> Json<Vec<ItemUrunanWarga>> {
    let read_lock = state.read().await;
    Json(read_lock.urunan.clone())
}

pub async fn create_urunan(
    State(state): State<SharedState>,
    Json(mut new_u): Json<ItemUrunanWarga>,
) -> (StatusCode, Json<ApiResponse<ItemUrunanWarga>>) {
    let mut write_lock = state.write().await;
    if new_u.id.is_empty() {
        new_u.id = format!("urunan-{}", Uuid::new_v4().simple());
    }
    write_lock.urunan.insert(0, new_u.clone());
    let _ = write_lock.save();

    (
        StatusCode::CREATED,
        Json(ApiResponse {
            success: true,
            data: Some(new_u),
            message: "Data urunan gotong royong berhasil dicatat!".to_string(),
        }),
    )
}

pub async fn delete_urunan(
    State(state): State<SharedState>,
    _auth: AdminClaims,
    Path(id): Path<String>,
) -> (StatusCode, Json<ApiResponse<()>>) {
    let mut write_lock = state.write().await;
    write_lock.urunan.retain(|u| u.id != id);
    let _ = write_lock.save();

    (
        StatusCode::OK,
        Json(ApiResponse {
            success: true,
            data: None,
            message: "Data urunan berhasil dihapus.".to_string(),
        }),
    )
}

// ----------------- RONDA & PENGUMUMAN -----------------

pub async fn list_ronda(State(state): State<SharedState>) -> Json<Vec<JadwalRondaRecord>> {
    let read_lock = state.read().await;
    Json(read_lock.ronda.clone())
}

pub async fn list_pengumuman(State(state): State<SharedState>) -> Json<Vec<PengumumanRecord>> {
    let read_lock = state.read().await;
    Json(read_lock.pengumuman.clone())
}

pub async fn get_dashboard_summary(State(state): State<SharedState>) -> Json<DashboardSummary> {
    let read_lock = state.read().await;
    Json(read_lock.compute_summary())
}

// ----------------- SECURE ADMIN AUTH -----------------

pub async fn admin_login(
    State(state): State<SharedState>,
    Json(payload): Json<LoginRequest>,
) -> (StatusCode, Json<LoginResponse>) {
    let read_lock = state.read().await;
    let matched = read_lock.admins.iter().find(|a| {
        a.username.eq_ignore_ascii_case(&payload.username) && a.password == payload.password
    });

    if let Some(admin) = matched {
        let admin_clone = admin.clone();
        drop(read_lock);

        let token = format!("token-{}", Uuid::new_v4());
        let mut write_lock = state.write().await;
        write_lock.register_token(token.clone());

        (
            StatusCode::OK,
            Json(LoginResponse {
                success: true,
                token: Some(token),
                admin: Some(admin_clone.clone()),
                message: format!("Selamat datang, {}!", admin_clone.nama),
            }),
        )
    } else {
        (
            StatusCode::UNAUTHORIZED,
            Json(LoginResponse {
                success: false,
                token: None,
                admin: None,
                message: "Username atau kata sandi pengurus salah.".to_string(),
            }),
        )
    }
}
