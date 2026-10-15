use std::sync::Arc;
use tokio::sync::RwLock;
use axum::{
    routing::{get, post, delete, put},
    Router,
};
use tower_http::cors::{Any, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod models;
mod state;
mod handlers;

use state::DatabaseState;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "sim_warga_server=debug,tower_http=debug,axum=trace".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    tracing::info!("🦀 Starting SIM-Warga Rust Axum Backend Server...");

    let state = DatabaseState::load_or_init();
    let shared_state = Arc::new(RwLock::new(state));

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // Health
        .route("/health", get(handlers::health_check))
        // Dashboard summary
        .route("/api/dashboard/summary", get(handlers::get_dashboard_summary))
        // Warga endpoints
        .route("/api/warga", get(handlers::list_warga).post(handlers::create_warga))
        .route("/api/warga/:id", delete(handlers::delete_warga))
        // Transaksi IPL endpoints
        .route("/api/ipl", get(handlers::list_ipl).post(handlers::create_ipl))
        .route("/api/ipl/:id/approve", put(handlers::approve_ipl))
        .route("/api/ipl/:id/reject", put(handlers::reject_ipl))
        // Pengeluaran Kas endpoints
        .route("/api/pengeluaran", get(handlers::list_pengeluaran).post(handlers::create_pengeluaran))
        .route("/api/pengeluaran/:id", delete(handlers::delete_pengeluaran))
        // Urunan endpoints
        .route("/api/urunan", get(handlers::list_urunan).post(handlers::create_urunan))
        .route("/api/urunan/:id", delete(handlers::delete_urunan))
        // Ronda & Pengumuman
        .route("/api/ronda", get(handlers::list_ronda))
        .route("/api/pengumuman", get(handlers::list_pengumuman))
        // Admin Auth
        .route("/api/admin/login", post(handlers::admin_login))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(shared_state);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3001".to_string());
    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await?;

    println!();
    println!("==========================================================");
    println!("🦀 SIM-WARGA RUST BACKEND BERHASIL AKTIF!");
    println!("📡 Listening on: http://{}", addr);
    println!("⚡ Framework: Axum 0.7 + Tokio Multithreaded Runtime");
    println!("==========================================================");
    println!();

    axum::serve(listener, app).await?;

    Ok(())
}
