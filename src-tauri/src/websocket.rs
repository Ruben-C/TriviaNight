use axum::extract::ws::{Message, WebSocket};
use futures::{sink::SinkExt, stream::StreamExt};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use uuid::Uuid;

/// Message types for WebSocket communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "payload")]
pub enum GameMessage {
    #[serde(rename = "player_join")]
    PlayerJoin { name: String, game_code: String },

    #[serde(rename = "player_joined")]
    PlayerJoined { player_id: String },

    #[serde(rename = "player_answer")]
    PlayerAnswer {
        player_id: String,
        answer: String,
        time_elapsed: u32,
    },

    #[serde(rename = "lobby_update")]
    LobbyUpdate { player_count: usize },

    #[serde(rename = "game_start")]
    GameStart,

    #[serde(rename = "question_broadcast")]
    QuestionBroadcast {
        question: Question,
        time_limit: u32,
        question_number: usize,
        total_questions: usize,
    },

    #[serde(rename = "answer_result")]
    AnswerResult {
        is_correct: bool,
        points_earned: u32,
        current_score: u32,
        correct_answer: Option<String>,
    },

    #[serde(rename = "score_update")]
    ScoreUpdate { players: Vec<PlayerScore> },

    #[serde(rename = "game_end")]
    GameEnd { final_scores: Vec<PlayerScore> },

    #[serde(rename = "error")]
    Error { message: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Question {
    pub id: u32,
    pub text: String,
    #[serde(rename = "type")]
    pub question_type: String,
    pub options: Option<Vec<String>>,
    pub image_url: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlayerScore {
    pub id: String,
    pub name: String,
    pub score: u32,
}

/// Player connection information
pub struct Player {
    pub id: String,
    pub name: String,
    pub score: u32,
    pub tx: mpsc::UnboundedSender<Message>,
}

/// Game status
#[derive(Debug, Clone, PartialEq)]
pub enum GameStatus {
    Lobby,
    InProgress,
    Finished,
}

/// Shared game state
pub struct GameState {
    pub game_code: String,
    pub status: GameStatus,
    pub players: HashMap<String, Player>,
    pub current_question: Option<Question>,
}

impl GameState {
    pub fn new() -> Self {
        Self {
            game_code: generate_game_code(),
            status: GameStatus::Lobby,
            players: HashMap::new(),
            current_question: None,
        }
    }

    /// Add a new player
    pub fn add_player(
        &mut self,
        name: String,
        tx: mpsc::UnboundedSender<Message>,
    ) -> String {
        let player_id = Uuid::new_v4().to_string();
        let player = Player {
            id: player_id.clone(),
            name,
            score: 0,
            tx,
        };
        self.players.insert(player_id.clone(), player);
        player_id
    }

    /// Remove a player
    pub fn remove_player(&mut self, player_id: &str) {
        self.players.remove(player_id);
    }

    /// Broadcast message to all players
    pub async fn broadcast(&self, message: GameMessage) {
        let json = serde_json::to_string(&message).unwrap();
        let msg = Message::Text(json);

        for player in self.players.values() {
            let _ = player.tx.send(msg.clone());
        }
    }

    /// Send message to specific player
    pub async fn send_to_player(&self, player_id: &str, message: GameMessage) {
        if let Some(player) = self.players.get(player_id) {
            let json = serde_json::to_string(&message).unwrap();
            let _ = player.tx.send(Message::Text(json));
        }
    }

    /// Get current player scores
    pub fn get_scores(&self) -> Vec<PlayerScore> {
        let mut scores: Vec<PlayerScore> = self
            .players
            .values()
            .map(|p| PlayerScore {
                id: p.id.clone(),
                name: p.name.clone(),
                score: p.score,
            })
            .collect();

        // Sort by score descending
        scores.sort_by(|a, b| b.score.cmp(&a.score));
        scores
    }
}

/// Generate a random 6-character game code
fn generate_game_code() -> String {
    use rand::Rng;
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let mut rng = rand::thread_rng();

    (0..6)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect()
}

/// Handle a WebSocket connection
pub async fn handle_socket(socket: WebSocket, game_state: Arc<RwLock<GameState>>) {
    let (mut sender, mut receiver) = socket.split();

    // Create channel for this player
    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();

    // Spawn task to send messages to this player
    let mut send_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    let mut player_id: Option<String> = None;

    // Handle incoming messages
    let mut recv_task = tokio::spawn({
        let game_state = game_state.clone();
        async move {
            while let Some(Ok(msg)) = receiver.next().await {
                if let Message::Text(text) = msg {
                    if let Ok(game_msg) = serde_json::from_str::<GameMessage>(&text) {
                        let mut state = game_state.write().await;

                        match game_msg {
                            GameMessage::PlayerJoin { name, game_code: _ } => {
                                // TODO: Validate game code
                                let id = state.add_player(name.clone(), tx.clone());
                                player_id = Some(id.clone());

                                // Send confirmation to player
                                state
                                    .send_to_player(
                                        &id,
                                        GameMessage::PlayerJoined {
                                            player_id: id.clone(),
                                        },
                                    )
                                    .await;

                                // Broadcast lobby update to all players
                                state
                                    .broadcast(GameMessage::LobbyUpdate {
                                        player_count: state.players.len(),
                                    })
                                    .await;

                                println!("✅ Player {} joined (ID: {})", name, id);
                            }

                            GameMessage::PlayerAnswer {
                                player_id,
                                answer,
                                time_elapsed,
                            } => {
                                println!(
                                    "📝 Player {} answered: {} (time: {}s)",
                                    player_id, answer, time_elapsed
                                );

                                // TODO: Validate answer and calculate score
                                // For now, just send a dummy response
                                state
                                    .send_to_player(
                                        &player_id,
                                        GameMessage::AnswerResult {
                                            is_correct: true,
                                            points_earned: 100,
                                            current_score: 100,
                                            correct_answer: None,
                                        },
                                    )
                                    .await;
                            }

                            _ => {
                                // Ignore other message types from client
                            }
                        }
                    }
                }
            }

            player_id
        }
    });

    // Wait for either task to finish
    tokio::select! {
        result = &mut send_task => {
            recv_task.abort();
            if let Some(id) = result.ok().flatten() {
                let mut state = game_state.write().await;
                state.remove_player(&id);
                println!("❌ Player {} disconnected", id);
            }
        }
        result = &mut recv_task => {
            send_task.abort();
            if let Some(id) = result.ok().flatten() {
                let mut state = game_state.write().await;
                state.remove_player(&id);
                println!("❌ Player {} disconnected", id);
            }
        }
    }
}
