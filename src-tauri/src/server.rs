use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MessageType {
    PlayerJoin,
    PlayerAnswer,
    QuestionBroadcast,
    ScoreUpdate,
    GameStart,
    GameEnd,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GameMessage {
    pub message_type: MessageType,
    pub payload: serde_json::Value,
}

#[derive(Debug)]
pub struct GameServer {
    pub port: u16,
    pub game_code: String,
    pub players: Arc<Mutex<Vec<String>>>,
}

impl GameServer {
    pub fn new(port: u16, game_code: String) -> Self {
        Self {
            port,
            game_code,
            players: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement WebSocket server
        // This will listen for connections and handle game messages
        println!("Game server would start on port {} with code {}", self.port, self.game_code);
        Ok(())
    }

    pub async fn stop(&self) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement server shutdown
        println!("Game server would stop");
        Ok(())
    }

    pub async fn broadcast(&self, message: GameMessage) -> Result<(), Box<dyn std::error::Error>> {
        // TODO: Implement message broadcasting to all connected players
        println!("Would broadcast message: {:?}", message);
        Ok(())
    }
}
