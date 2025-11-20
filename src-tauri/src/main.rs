// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod server;
mod http_server;
mod websocket;

use std::sync::Arc;
use tauri::{Manager, State};
use tokio::sync::{Mutex, RwLock};

use http_server::TriviaServer;

/// Server state shared across the application
struct ServerState {
    handle: Mutex<Option<tokio::task::JoinHandle<()>>>,
    port: Mutex<Option<u16>>,
    game_code: RwLock<Option<String>>,
}

impl ServerState {
    fn new() -> Self {
        Self {
            handle: Mutex::new(None),
            port: Mutex::new(None),
            game_code: RwLock::new(None),
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize database
            let app_dir = app.path().app_data_dir()?;
            std::fs::create_dir_all(&app_dir)?;
            let db_path = app_dir.join("trivia.db");

            match database::init_database(&db_path) {
                Ok(_) => println!("Database initialized successfully"),
                Err(e) => eprintln!("Failed to initialize database: {}", e),
            }

            // Initialize server state
            app.manage(ServerState::new());

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            start_server,
            stop_server,
            get_server_status,
            get_server_info,
            get_local_ip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Trivia Night!", name)
}

#[tauri::command]
async fn start_server(
    port: u16,
    state: State<'_, ServerState>,
) -> Result<String, String> {
    let mut handle_lock = state.handle.lock().await;

    // Check if server is already running
    if handle_lock.is_some() {
        return Err("Server is already running".to_string());
    }

    // Create server
    let server = TriviaServer::new(port);
    let game_code = server.game_state.read().await.game_code.clone();

    // Store game code
    *state.game_code.write().await = Some(game_code.clone());

    // Start server in background task
    let server_handle = tokio::spawn(async move {
        if let Err(e) = server.start().await {
            eprintln!("Server error: {}", e);
        }
    });

    *handle_lock = Some(server_handle);
    *state.port.lock().await = Some(port);

    Ok(format!("Server started on port {} with code {}", port, game_code))
}

#[tauri::command]
async fn stop_server(state: State<'_, ServerState>) -> Result<String, String> {
    let mut handle_lock = state.handle.lock().await;

    if let Some(handle) = handle_lock.take() {
        handle.abort();
        *state.port.lock().await = None;
        *state.game_code.write().await = None;
        Ok("Server stopped".to_string())
    } else {
        Err("Server is not running".to_string())
    }
}

#[tauri::command]
async fn get_server_status(state: State<'_, ServerState>) -> Result<bool, String> {
    let handle_lock = state.handle.lock().await;
    Ok(handle_lock.is_some())
}

#[tauri::command]
async fn get_server_info(state: State<'_, ServerState>) -> Result<serde_json::Value, String> {
    let port_lock = state.port.lock().await;
    let game_code_lock = state.game_code.read().await;

    let is_running = state.handle.lock().await.is_some();

    Ok(serde_json::json!({
        "is_running": is_running,
        "port": *port_lock,
        "game_code": *game_code_lock,
    }))
}

#[tauri::command]
fn get_local_ip() -> Result<String, String> {
    use std::net::UdpSocket;

    // Trick to get local IP: connect to external IP (doesn't actually connect)
    let socket = UdpSocket::bind("0.0.0.0:0").map_err(|e| e.to_string())?;
    socket
        .connect("8.8.8.8:80")
        .map_err(|e| e.to_string())?;
    let addr = socket.local_addr().map_err(|e| e.to_string())?;

    Ok(addr.ip().to_string())
}
