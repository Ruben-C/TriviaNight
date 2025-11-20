// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod server;
mod http_server;
mod websocket;
mod game_engine;

use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Manager, State};
use tokio::sync::{Mutex, RwLock};

use http_server::TriviaServer;
use websocket::GameState;

/// Server state shared across the application
struct ServerState {
    handle: Mutex<Option<tokio::task::JoinHandle<()>>>,
    port: Mutex<Option<u16>>,
    game_code: RwLock<Option<String>>,
    game_state: RwLock<Option<Arc<RwLock<GameState>>>>,
}

/// Application state
struct AppState {
    db_path: PathBuf,
}

impl ServerState {
    fn new() -> Self {
        Self {
            handle: Mutex::new(None),
            port: Mutex::new(None),
            game_code: RwLock::new(None),
            game_state: RwLock::new(None),
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

            // Initialize state
            app.manage(ServerState::new());
            app.manage(AppState {
                db_path: db_path.clone(),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            start_server,
            stop_server,
            get_server_status,
            get_server_info,
            get_local_ip,
            get_connected_players,
            broadcast_game_start,
            broadcast_question,
            broadcast_game_end,
            get_game_state_info,
            get_all_questions,
            get_all_question_sets,
            get_questions_in_set,
            create_question,
            create_question_set
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
    let game_state_ref = server.game_state.clone();

    // Store game code and game state
    *state.game_code.write().await = Some(game_code.clone());
    *state.game_state.write().await = Some(game_state_ref);

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
        *state.game_state.write().await = None;
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

// Game Control Commands

#[tauri::command]
async fn get_connected_players(state: State<'_, ServerState>) -> Result<Vec<serde_json::Value>, String> {
    let game_state_lock = state.game_state.read().await;

    if let Some(game_state) = game_state_lock.as_ref() {
        let game = game_state.read().await;
        let players: Vec<serde_json::Value> = game
            .players
            .values()
            .map(|p| {
                serde_json::json!({
                    "id": p.id,
                    "name": p.name,
                    "score": p.score,
                })
            })
            .collect();
        Ok(players)
    } else {
        Err("Server not running".to_string())
    }
}

#[tauri::command]
async fn broadcast_game_start(state: State<'_, ServerState>) -> Result<String, String> {
    let game_state_lock = state.game_state.read().await;

    if let Some(game_state) = game_state_lock.as_ref() {
        let mut game = game_state.write().await;
        game.status = websocket::GameStatus::InProgress;
        game.broadcast(websocket::GameMessage::GameStart).await;
        Ok("Game started".to_string())
    } else {
        Err("Server not running".to_string())
    }
}

#[tauri::command]
async fn broadcast_question(
    state: State<'_, ServerState>,
    app_state: State<'_, AppState>,
    question_id: i64,
    time_limit: u32,
    question_number: usize,
    total_questions: usize,
) -> Result<String, String> {
    let game_state_lock = state.game_state.read().await;

    if let Some(game_state) = game_state_lock.as_ref() {
        // Load question from database
        let question = game_engine::get_question_by_id(&app_state.db_path, question_id)
            .map_err(|e| e.to_string())?;

        // Convert to WebSocket question format
        let ws_question = websocket::Question {
            id: question.id as u32,
            text: question.question_text,
            question_type: question.question_type.clone(),
            options: question.options.clone(),
            image_url: question.image_url.clone(),
            correct_answer: question.correct_answer,
        };

        // Update game state with current question
        let mut game = game_state.write().await;
        game.current_question = Some(ws_question.clone());
        game.broadcast(websocket::GameMessage::QuestionBroadcast {
            question: ws_question,
            time_limit,
            question_number,
            total_questions,
        })
        .await;

        Ok("Question broadcasted".to_string())
    } else {
        Err("Server not running".to_string())
    }
}

#[tauri::command]
async fn broadcast_game_end(state: State<'_, ServerState>) -> Result<String, String> {
    let game_state_lock = state.game_state.read().await;

    if let Some(game_state) = game_state_lock.as_ref() {
        let mut game = game_state.write().await;
        let final_scores = game.get_scores();
        game.status = websocket::GameStatus::Finished;
        game.current_question = None;
        game.broadcast(websocket::GameMessage::GameEnd { final_scores }).await;
        Ok("Game ended".to_string())
    } else {
        Err("Server not running".to_string())
    }
}

#[tauri::command]
async fn get_game_state_info(state: State<'_, ServerState>) -> Result<serde_json::Value, String> {
    let game_state_lock = state.game_state.read().await;

    if let Some(game_state) = game_state_lock.as_ref() {
        let game = game_state.read().await;
        Ok(serde_json::json!({
            "status": format!("{:?}", game.status),
            "player_count": game.players.len(),
            "game_code": game.game_code,
        }))
    } else {
        Err("Server not running".to_string())
    }
}

// Question Management Commands

#[tauri::command]
fn get_all_questions(app_state: State<'_, AppState>) -> Result<Vec<game_engine::Question>, String> {
    game_engine::get_all_questions(&app_state.db_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_all_question_sets(app_state: State<'_, AppState>) -> Result<Vec<game_engine::QuestionSet>, String> {
    game_engine::get_all_question_sets(&app_state.db_path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn get_questions_in_set(
    app_state: State<'_, AppState>,
    set_id: i64,
) -> Result<Vec<game_engine::Question>, String> {
    game_engine::get_questions_in_set(&app_state.db_path, set_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_question(
    app_state: State<'_, AppState>,
    question_text: String,
    question_type: String,
    correct_answer: String,
    options: Option<Vec<String>>,
    image_url: Option<String>,
    difficulty: String,
    category: String,
) -> Result<i64, String> {
    game_engine::create_question(
        &app_state.db_path,
        &question_text,
        &question_type,
        &correct_answer,
        options,
        image_url.as_deref(),
        &difficulty,
        &category,
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
fn create_question_set(
    app_state: State<'_, AppState>,
    name: String,
    description: String,
) -> Result<i64, String> {
    game_engine::create_question_set(&app_state.db_path, &name, &description)
        .map_err(|e| e.to_string())
}
