use axum::{
    extract::{State, WebSocketUpgrade},
    http::{header, StatusCode},
    response::{Html, IntoResponse, Response},
    routing::get,
    Router,
};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::RwLock;
use tower_http::cors::CorsLayer;

use crate::websocket::{handle_socket, GameState};

/// HTTP server that serves the player web interface and handles WebSocket connections
pub struct TriviaServer {
    pub port: u16,
    pub game_state: Arc<RwLock<GameState>>,
}

impl TriviaServer {
    pub fn new(port: u16) -> Self {
        Self {
            port,
            game_state: Arc::new(RwLock::new(GameState::new())),
        }
    }

    /// Start the HTTP server
    pub async fn start(self) -> Result<(), Box<dyn std::error::Error>> {
        let addr = SocketAddr::from(([0, 0, 0, 0], self.port));

        // Build router
        let app = self.build_router();

        println!("🚀 Trivia server starting on http://{}", addr);

        // Start server
        let listener = tokio::net::TcpListener::bind(addr).await?;
        axum::serve(listener, app).await?;

        Ok(())
    }

    fn build_router(self) -> Router {
        let game_state = self.game_state.clone();

        Router::new()
            // WebSocket endpoint
            .route("/ws", get(websocket_handler))
            // API endpoints
            .route("/api/health", get(health_check))
            .route("/api/game/status", get(game_status))
            .route("/api/game/qr", get(qr_code))
            // Serve player web interface files (embedded in binary)
            .route("/", get(serve_index))
            .route("/styles.css", get(serve_styles))
            .route("/app.js", get(serve_app_js))
            // Add CORS for local development
            .layer(CorsLayer::permissive())
            // Share game state across handlers
            .with_state(game_state)
    }
}

/// WebSocket upgrade handler
async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(game_state): State<Arc<RwLock<GameState>>>,
) -> Response {
    ws.on_upgrade(|socket| handle_socket(socket, game_state))
}

/// Health check endpoint
async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

/// Game status endpoint
async fn game_status(State(game_state): State<Arc<RwLock<GameState>>>) -> impl IntoResponse {
    let state = game_state.read().await;
    let status = serde_json::json!({
        "game_code": state.game_code,
        "player_count": state.players.len(),
        "status": format!("{:?}", state.status),
    });
    axum::Json(status)
}

/// QR code generation endpoint
async fn qr_code() -> impl IntoResponse {
    // TODO: Generate actual QR code
    // For now, return a placeholder
    (StatusCode::NOT_IMPLEMENTED, "QR code generation coming soon")
}

/// Serve player web interface index.html
async fn serve_index() -> impl IntoResponse {
    // Embed the HTML file directly into the binary
    const INDEX_HTML: &str = include_str!("../../player-web/index.html");
    Html(INDEX_HTML)
}

/// Serve player web interface styles.css
async fn serve_styles() -> impl IntoResponse {
    // Embed the CSS file directly into the binary
    const STYLES_CSS: &str = include_str!("../../player-web/styles.css");
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "text/css")],
        STYLES_CSS,
    )
}

/// Serve player web interface app.js
async fn serve_app_js() -> impl IntoResponse {
    // Embed the JS file directly into the binary
    const APP_JS: &str = include_str!("../../player-web/app.js");
    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/javascript")],
        APP_JS,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_server_creation() {
        let server = TriviaServer::new(3000);
        assert_eq!(server.port, 3000);
    }
}
