import { useState } from 'react'
import HostSetup from './components/HostSetup'

type AppMode = 'select' | 'host' | 'player'

function App() {
  const [mode, setMode] = useState<AppMode>('select')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {mode === 'select' && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Trivia Night
            </h1>
            <p className="text-xl text-center text-gray-300 mb-12">
              Host trivia games - Players join from any browser
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
                  Player Info
                </h2>
                <p className="text-purple-100 text-center">
                  Learn how players connect via browser
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {mode === 'host' && (
        <div className="relative">
          <button
            onClick={() => setMode('select')}
            className="absolute top-4 left-4 z-10 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white rounded-lg transition-colors"
          >
            ← Back
          </button>
          <HostSetup />
        </div>
      )}

      {mode === 'player' && (
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-bold text-white">Player Information</h2>
              <button
                onClick={() => setMode('select')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                ← Back
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-white space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📱</span>
                  Players Connect via Web Browser
                </h3>
                <p className="text-gray-300 text-lg mb-4">
                  No app installation needed! Players can join from ANY device with a web browser.
                </p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h4 className="font-bold text-white mb-3">Supported Devices:</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>📱 iPhone/iPad (Safari, Chrome)</li>
                  <li>📱 Android phones/tablets (Chrome, Firefox)</li>
                  <li>💻 Windows laptops (Edge, Chrome, Firefox)</li>
                  <li>💻 Mac laptops (Safari, Chrome)</li>
                  <li>🖥️ Any device with a modern web browser</li>
                </ul>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                <h4 className="font-bold text-white mb-3">How to Join:</h4>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Host starts the server from the "Host Game" screen</li>
                  <li>Open a web browser on your device</li>
                  <li>Visit the URL shown by the host, OR scan the QR code</li>
                  <li>Enter your name and the game code</li>
                  <li>Start playing!</li>
                </ol>
              </div>

              <div className="text-center pt-4">
                <p className="text-gray-400 text-sm">
                  Players see a mobile-friendly interface optimized for phones and tablets
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
