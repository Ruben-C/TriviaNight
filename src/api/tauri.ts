import { invoke } from '@tauri-apps/api/core'

export interface ServerInfo {
  is_running: boolean
  port: number | null
  game_code: string | null
}

/**
 * Start the trivia server
 * @param port - Port number to run the server on (default: 3000)
 * @returns Success message with port and game code
 */
export async function startServer(port: number = 3000): Promise<string> {
  return await invoke<string>('start_server', { port })
}

/**
 * Stop the trivia server
 * @returns Success message
 */
export async function stopServer(): Promise<string> {
  return await invoke<string>('stop_server')
}

/**
 * Get server running status
 * @returns True if server is running, false otherwise
 */
export async function getServerStatus(): Promise<boolean> {
  return await invoke<boolean>('get_server_status')
}

/**
 * Get detailed server information
 * @returns Server info including port, game code, and running status
 */
export async function getServerInfo(): Promise<ServerInfo> {
  return await invoke<ServerInfo>('get_server_info')
}

/**
 * Get the local IP address of this machine
 * @returns Local IP address (e.g., "192.168.1.100")
 */
export async function getLocalIp(): Promise<string> {
  return await invoke<string>('get_local_ip')
}

/**
 * Greet function (example)
 * @param name - Name to greet
 * @returns Greeting message
 */
export async function greet(name: string): Promise<string> {
  return await invoke<string>('greet', { name })
}
