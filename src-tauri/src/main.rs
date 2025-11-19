// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod server;

use tauri::Manager;

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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            start_server,
            stop_server,
            get_server_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Trivia Night!", name)
}

#[tauri::command]
async fn start_server(port: u16) -> Result<String, String> {
    // TODO: Implement server start logic
    Ok(format!("Server would start on port {}", port))
}

#[tauri::command]
async fn stop_server() -> Result<String, String> {
    // TODO: Implement server stop logic
    Ok("Server would stop".to_string())
}

#[tauri::command]
async fn get_server_status() -> Result<String, String> {
    // TODO: Implement server status check
    Ok("Server status: not running".to_string())
}
