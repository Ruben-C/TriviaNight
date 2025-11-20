import { useState, useEffect } from 'react'
import {
  getConnectedPlayers,
  broadcastGameStart,
  broadcastQuestion,
  broadcastGameEnd,
  getGameStateInfo,
  type ConnectedPlayer,
  type GameStateInfo,
} from '../api/game'
import { getAllQuestions, getAllQuestionSets, getQuestionsInSet, type Question, type QuestionSet } from '../api/questions'

export default function GameDashboard() {
  const [players, setPlayers] = useState<ConnectedPlayer[]>([])
  const [gameState, setGameState] = useState<GameStateInfo | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([])
  const [selectedSet, setSelectedSet] = useState<number | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [timeLimit, setTimeLimit] = useState(30)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    loadData()
    // Poll for updates every 2 seconds
    const interval = setInterval(loadData, 2000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    try {
      const [playerData, stateData, setsData] = await Promise.all([
        getConnectedPlayers(),
        getGameStateInfo(),
        getAllQuestionSets(),
      ])
      setPlayers(playerData)
      setGameState(stateData)
      setQuestionSets(setsData)
    } catch (err) {
      console.error('Failed to load data:', err)
    }
  }

  async function handleSetSelect(setId: number) {
    try {
      const questionsInSet = await getQuestionsInSet(setId)
      setQuestions(questionsInSet)
      setSelectedSet(setId)
      setCurrentQuestionIndex(0)
    } catch (err) {
      setError('Failed to load questions: ' + err)
    }
  }

  async function handleStartGame() {
    if (!selectedSet || questions.length === 0) {
      setError('Please select a question set first')
      return
    }

    setLoading(true)
    setError('')

    try {
      await broadcastGameStart()
      setGameStarted(true)
      setCurrentQuestionIndex(0)
    } catch (err) {
      setError('Failed to start game: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleBroadcastQuestion() {
    if (!gameStarted || currentQuestionIndex >= questions.length) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const question = questions[currentQuestionIndex]
      await broadcastQuestion(
        question.id,
        timeLimit,
        currentQuestionIndex + 1,
        questions.length
      )
    } catch (err) {
      setError('Failed to broadcast question: ' + err)
    } finally {
      setLoading(false)
    }
  }

  async function handleNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // End of questions
      await handleEndGame()
    }
  }

  async function handleEndGame() {
    setLoading(true)
    setError('')

    try {
      await broadcastGameEnd()
      setGameStarted(false)
      setCurrentQuestionIndex(0)
    } catch (err) {
      setError('Failed to end game: ' + err)
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[currentQuestionIndex]
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Game Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-400">Game Status</p>
            <p className="text-xl font-bold text-white">{gameState?.status || 'Unknown'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Players Connected</p>
            <p className="text-xl font-bold text-white">{players.length}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Game Controls */}
        <div className="space-y-6">
          {/* Question Set Selection */}
          {!gameStarted && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Select Question Set</h3>
              {questionSets.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No question sets available. Create one in the Questions tab.
                </p>
              ) : (
                <div className="space-y-2">
                  {questionSets.map((set) => (
                    <button
                      key={set.id}
                      onClick={() => handleSetSelect(set.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedSet === set.id
                          ? 'bg-blue-600 border-2 border-blue-400'
                          : 'bg-white/5 border border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <h4 className="font-bold text-white">{set.name}</h4>
                      <p className="text-sm text-gray-400">{set.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedSet && questions.length > 0 && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-300">
                    ✓ {questions.length} questions loaded
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Game Controls */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Game Controls</h3>

            {!gameStarted ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Time Limit per Question (seconds)
                  </label>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    min="10"
                    max="120"
                  />
                </div>
                <button
                  onClick={handleStartGame}
                  disabled={loading || !selectedSet || players.length === 0}
                  className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Starting...' : 'Start Game'}
                </button>
                {players.length === 0 && (
                  <p className="text-sm text-yellow-400 text-center">
                    Waiting for players to join...
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm text-gray-400">Current Question</p>
                  <p className="text-2xl font-bold text-white">
                    {currentQuestionIndex + 1} / {questions.length}
                  </p>
                </div>

                <button
                  onClick={handleBroadcastQuestion}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {loading ? 'Broadcasting...' : 'Broadcast Question'}
                </button>

                <button
                  onClick={handleNextQuestion}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'End Game'}
                </button>

                <button
                  onClick={handleEndGame}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all"
                >
                  Force End Game
                </button>
              </div>
            )}
          </div>

          {/* Current Question Preview */}
          {gameStarted && currentQuestion && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Current Question</h3>
              <div className="space-y-4">
                <p className="text-lg text-white">{currentQuestion.question_text}</p>
                <div className="flex gap-2 text-sm">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                    {currentQuestion.question_type}
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                    {currentQuestion.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                    {currentQuestion.category}
                  </span>
                </div>
                {currentQuestion.options && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">Options:</p>
                    {currentQuestion.options.map((option, i) => (
                      <div
                        key={i}
                        className="p-2 bg-white/5 border border-white/10 rounded text-white"
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
                <div className="p-3 bg-green-500/20 border border-green-500/30 rounded">
                  <p className="text-sm text-gray-400">Correct Answer:</p>
                  <p className="text-white font-medium">{currentQuestion.correct_answer}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Players & Scoreboard */}
        <div className="space-y-6">
          {/* Connected Players / Leaderboard */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              {gameStarted ? 'Live Leaderboard' : 'Connected Players'}
            </h3>
            {players.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No players connected yet</p>
            ) : (
              <div className="space-y-2">
                {sortedPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`p-4 rounded-lg border transition-all ${
                      index === 0 && gameStarted
                        ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {gameStarted && (
                          <span className="text-2xl font-bold text-white">
                            #{index + 1}
                          </span>
                        )}
                        <div>
                          <p className="font-medium text-white">{player.name}</p>
                          <p className="text-xs text-gray-400">{player.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">{player.score}</p>
                        <p className="text-xs text-gray-400">points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Game Statistics */}
          {gameStarted && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Game Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Questions Asked</p>
                  <p className="text-2xl font-bold text-white">{currentQuestionIndex}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Questions Remaining</p>
                  <p className="text-2xl font-bold text-white">
                    {questions.length - currentQuestionIndex}
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Active Players</p>
                  <p className="text-2xl font-bold text-white">{players.length}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-gray-400">Highest Score</p>
                  <p className="text-2xl font-bold text-white">
                    {sortedPlayers[0]?.score || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
