import { useState } from 'react'

type AppMode = 'select' | 'host' | 'player'

function App() {
  const [mode, setMode] = useState<AppMode>('select')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {mode === 'select' && (
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trivia Night
            </h1>
            <p className="text-xl text-center text-gray-300 mb-12">
              Cross-platform trivia game for your next game night
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <button
                onClick={() => setMode('host')}
                className="group p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-6xl mb-4 text-center">🎮</div>
                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                  Host Game
                </h2>
                <p className="text-blue-100 text-center">
                  Create and manage a trivia game session
                </p>
              </button>

              <button
                onClick={() => setMode('player')}
                className="group p-8 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-6xl mb-4 text-center">🎯</div>
                <h2 className="text-3xl font-bold text-white mb-2 text-center">
                  Join Game
                </h2>
                <p className="text-purple-100 text-center">
                  Connect to a trivia game session
                </p>
              </button>
            </div>
          </div>
        )}

        {mode === 'host' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white">Host Dashboard</h2>
              <button
                onClick={() => setMode('select')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <p className="text-xl text-center">Host interface coming soon...</p>
            </div>
          </div>
        )}

        {mode === 'player' && (
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white">Join Game</h2>
              <button
                onClick={() => setMode('select')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white">
              <p className="text-xl text-center">Player interface coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
