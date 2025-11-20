import { invoke } from '@tauri-apps/api/core'

export interface ConnectedPlayer {
  id: string
  name: string
  score: number
}

export interface GameStateInfo {
  status: string
  player_count: number
  game_code: string
}

/**
 * Get list of connected players
 */
export async function getConnectedPlayers(): Promise<ConnectedPlayer[]> {
  return await invoke<ConnectedPlayer[]>('get_connected_players')
}

/**
 * Broadcast game start to all players
 */
export async function broadcastGameStart(): Promise<string> {
  return await invoke<string>('broadcast_game_start')
}

/**
 * Broadcast a question to all players
 */
export async function broadcastQuestion(
  questionId: number,
  timeLimit: number,
  questionNumber: number,
  totalQuestions: number
): Promise<string> {
  return await invoke<string>('broadcast_question', {
    questionId,
    timeLimit,
    questionNumber,
    totalQuestions,
  })
}

/**
 * Broadcast game end to all players
 */
export async function broadcastGameEnd(): Promise<string> {
  return await invoke<string>('broadcast_game_end')
}

/**
 * Get current game state information
 */
export async function getGameStateInfo(): Promise<GameStateInfo> {
  return await invoke<GameStateInfo>('get_game_state_info')
}
