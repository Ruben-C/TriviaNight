import { useState, useEffect } from 'react'
import { startServer, stopServer, getServerInfo, getLocalIp } from '../api/tauri'
import type { ServerInfo } from '../api/tauri'
import QuestionManager from './QuestionManager'
import GameDashboard from './GameDashboard'

type HostTab = 'setup' | 'questions' | 'dashboard'

export default function HostSetup() {
  const [activeTab, setActiveTab] = useState<HostTab>('setup')
  const [serverInfo, setServerInfo] = useState<ServerInfo>({
    is_running: false,
    port: null,
    game_code: null,
  })
  const [localIp, setLocalIp] = useState<string>('')
  const [port, setPort] = useState<number>(3000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadServerInfo()
    loadLocalIp()
  }, [])

  async function loadServerInfo() {
    try {
      const info = await getServerInfo()
      setServerInfo(info)
    } catch (err) {
      console.error('Failed to load server info:', err)
    }
  }

  async function loadLocalIp() {
    try {
      const ip = await getLocalIp()
      setLocalIp(ip)
    } catch (err) {
      console.error('Failed to get local IP:', err)
      setLocalIp('localhost')
    }
  }

  async function handleStartServer() {
    setLoading(true)
    setError('')

    try {
      await startServer(port)
      await loadServerInfo()
    } catch (err) {
      setError(err as string)
    } finally {
      setLoading(false)
    }
  }

  async function handleStopServer() {
    setLoading(true)
    setError('')

    try {
      await stopServer()
      await loadServerInfo()
    } catch (err) {
      setError(err as string)
    } finally {
      setLoading(false)
    }
  }

  const connectionUrl = serverInfo.is_running && serverInfo.port
    ? `http://${localIp}:${serverInfo.port}`
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Trivia Night Host
        </h1>
        <p className="text-xl text-center text-gray-300 mb-8">
          Control Panel
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('setup')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'setup'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Server Setup
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 px-6 py-3 rounded-lg font-bold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
            disabled={!serverInfo.is_running}
          >
            Game Dashboard
            {!serverInfo.is_running && <span className="text-xs ml-2">(Start server first)</span>}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'setup' && (
          <div>

        {/* Server Controls */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Server Controls</h2>

          {!serverInfo.is_running ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Port Number
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  min="1024"
                  max="65535"
                />
                <p className="text-sm text-gray-400 mt-1">
                  Default: 3000. Use ports above 1024.
                </p>
              </div>

              <button
                onClick={handleStartServer}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Starting...' : 'Start Server'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-400">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">Server Running</span>
              </div>

              <button
                onClick={handleStopServer}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Stopping...' : 'Stop Server'}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}
        </div>

        {/* Connection Information */}
        {serverInfo.is_running && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">
              Connection Information
            </h2>

            <div className="space-y-6">
              {/* Game Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game Code
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-500 rounded-lg">
                    <p className="text-4xl font-bold text-center text-white tracking-widest">
                      {serverInfo.game_code}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (serverInfo.game_code) {
                        navigator.clipboard.writeText(serverInfo.game_code)
                      }
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Players need this code to join the game
                </p>
              </div>

              {/* Connection URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Connection URL
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg">
                    <p className="text-lg text-white font-mono">
                      {connectionUrl}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(connectionUrl)
                    }}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Players can visit this URL in their browser
                </p>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR Code
                </label>
                <div className="flex justify-center p-8 bg-white rounded-lg">
                  <img
                    src={`${connectionUrl}/api/game/qr`}
                    alt="QR Code for player connection"
                    className="w-64 h-64"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <div className="hidden w-64 h-64 bg-white/10 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400 text-center">
                      QR Code<br />Loading...
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">
                  Players can scan this code to join instantly
                </p>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                  <span>📱</span>
                  How Players Join
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-300">
                  <li>Open a web browser on any device (phone, tablet, laptop)</li>
                  <li>Visit the connection URL shown above, OR scan the QR code</li>
                  <li>Enter their name and the game code: <strong className="text-white">{serverInfo.game_code}</strong></li>
                  <li>Wait for you to start the game!</li>
                </ol>
              </div>
            </div>
          </div>
        )}
          </div>
        )}

        {activeTab === 'questions' && (
          <QuestionManager />
        )}

        {activeTab === 'dashboard' && (
          <GameDashboard />
        )}
      </div>
    </div>
  )
}
