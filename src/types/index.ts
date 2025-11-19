// Question types
export type QuestionType = 'multiple_choice' | 'text_input' | 'image_guess' | 'true_false'

export interface Question {
  id: number
  questionText: string
  questionType: QuestionType
  correctAnswer: string
  options?: string[]
  imageUrl?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  createdAt: string
}

export interface QuestionSet {
  id: number
  name: string
  description: string
  questions: Question[]
  createdAt: string
}

// Game types
export type GameStatus = 'waiting' | 'active' | 'paused' | 'finished'

export interface Game {
  id: number
  setId: number
  gameCode: string
  status: GameStatus
  startedAt?: string
  endedAt?: string
  createdAt: string
}

export interface Player {
  id: number
  gameId: number
  name: string
  score: number
  joinedAt: string
  isConnected: boolean
}

export interface Answer {
  id: number
  gameId: number
  playerId: number
  questionId: number
  answer: string
  isCorrect: boolean
  pointsEarned: number
  answeredAt: string
}

// WebSocket message types
export type MessageType =
  | 'player_join'
  | 'player_answer'
  | 'question_broadcast'
  | 'score_update'
  | 'game_start'
  | 'game_end'
  | 'player_disconnect'

export interface GameMessage {
  messageType: MessageType
  payload: unknown
}

export interface PlayerJoinPayload {
  playerName: string
  gameCode: string
}

export interface PlayerAnswerPayload {
  playerId: number
  questionId: number
  answer: string
  timeElapsed: number
}

export interface QuestionBroadcastPayload {
  question: Question
  timeLimit: number
  questionNumber: number
  totalQuestions: number
}

export interface ScoreUpdatePayload {
  players: Array<{
    id: number
    name: string
    score: number
  }>
}

// Mini-game types
export type MiniGameType = 'horse_race' | 'tug_of_war' | 'buzzer_battle'

export interface HorseRaceGame {
  type: 'horse_race'
  horses: Array<{
    id: number
    name: string
    color: string
    votes: number
  }>
  winner?: number
}

// UI State types
export interface HostState {
  currentGame?: Game
  players: Player[]
  currentQuestion?: Question
  questionIndex: number
  isServerRunning: boolean
}

export interface PlayerState {
  playerId?: number
  playerName?: string
  currentGame?: Game
  currentQuestion?: Question
  score: number
  hasAnswered: boolean
  isConnected: boolean
}
