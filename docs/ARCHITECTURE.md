# Trivia Night - Revised Architecture

## Overview

The architecture has been updated to be more practical for real-world use:

- **Host Application**: Desktop app (Tauri) for Windows, macOS, and Linux
- **Player Interface**: Web-based, accessible from ANY device with a browser

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     HOST DEVICE                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Tauri Desktop App (Host Only)                 │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  React UI (Host Dashboard)                      │  │  │
│  │  │  - Question management                          │  │  │
│  │  │  - Game setup                                   │  │  │
│  │  │  - Player management                            │  │  │
│  │  │  - Game control                                 │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Rust Backend                                   │  │  │
│  │  │  - HTTP Server (serve player web interface)    │  │  │
│  │  │  - WebSocket Server (real-time communication)  │  │  │
│  │  │  - SQLite Database (questions, games, scores)  │  │  │
│  │  │  - mDNS Broadcasting (network discovery)       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                 │
│                    HTTP + WebSocket                          │
│                    Port: 3000 (configurable)                 │
└────────────────────────────┼────────────────────────────────┘
                             │
                    Local Network / WiFi
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│   PLAYER 1     │  │   PLAYER 2      │  │   PLAYER 3     │
│                │  │                 │  │                │
│  ┌──────────┐  │  │  ┌──────────┐   │  │  ┌──────────┐  │
│  │ Browser  │  │  │  │ Browser  │   │  │  │ Browser  │  │
│  │          │  │  │  │          │   │  │  │          │  │
│  │ Player   │  │  │  │ Player   │   │  │  │ Player   │  │
│  │ Web UI   │  │  │  │ Web UI   │   │  │  │ Web UI   │  │
│  └──────────┘  │  │  └──────────┘   │  │  └──────────┘  │
│                │  │                 │  │                │
│  iPhone        │  │  Android Tablet │  │  Windows       │
│  Safari        │  │  Chrome         │  │  Laptop        │
└────────────────┘  └─────────────────┘  └────────────────┘
```

## Key Architectural Decisions

### 1. Host: Desktop Application (Tauri)

**Purpose**: Game management and control

**Why Desktop App for Host:**
- Full control of game flow
- Persistent question database
- Better file management (import/export)
- Can run without internet connection
- Professional presentation on larger screen
- Offline capability

**Platforms**: Windows, macOS, Linux

### 2. Players: Web-Based Interface

**Purpose**: Lightweight, universal player access

**Why Web for Players:**
- **Universal Access**: Works on ANY device with a browser
  - iOS (iPhone, iPad) - Safari
  - Android (phones, tablets) - Chrome, Firefox, etc.
  - Windows (laptops, tablets) - Edge, Chrome, Firefox
  - macOS (MacBooks, iPads) - Safari, Chrome
  - Linux - Any browser
- **No Installation Required**: Players just visit a URL
- **Responsive Design**: Adapts to any screen size
- **Easy Updates**: Players always get latest version
- **Low Barrier to Entry**: Just open browser and go

**Connection**: Players navigate to `http://[host-ip]:3000` or use QR code

### 3. Backend Services (Rust)

**HTTP Server** (using `axum`):
- Serves static player web interface
- RESTful API for game data
- Handles CORS for browser security
- QR code generation for easy joining

**WebSocket Server**:
- Real-time bidirectional communication
- Game state synchronization
- Answer submission
- Score updates
- Player presence

**SQLite Database**:
- Question storage
- Game history
- Player scores
- Persistent settings

**mDNS Service**:
- Broadcast game on local network
- Auto-discovery for players
- Service name: `_trivianight._tcp`

## Technology Stack Updates

### Host Application (Desktop)
- **Framework**: Tauri 2.0
- **Frontend**: React + TypeScript + Tailwind CSS
- **Build**: Vite
- **State**: Zustand

### Player Web Interface (NEW)
- **Framework**: Vanilla HTML/CSS/JS or lightweight React build
- **Styling**: Tailwind CSS (same design system)
- **Size**: Target < 100KB for fast mobile loading
- **WebSocket Client**: Native WebSocket API
- **Responsive**: Mobile-first design

### Backend (Rust)
- **HTTP Server**: `axum` 0.7 (lightweight, fast)
- **WebSocket**: `tokio-tungstenite` + `axum` WebSocket support
- **Database**: `rusqlite` with connection pooling
- **mDNS**: `mdns-sd` for service discovery
- **JSON**: `serde_json` for serialization
- **QR Codes**: `qrcode` crate for easy joining

## Project Structure (Updated)

```
TriviaNight/
├── src/                          # HOST desktop app (Tauri window)
│   ├── App.tsx                  # Host main interface
│   ├── components/
│   │   ├── host/                # Host-only components
│   │   │   ├── GameSetup.tsx
│   │   │   ├── QuestionManager.tsx
│   │   │   ├── HostDashboard.tsx
│   │   │   └── PlayerList.tsx
│   │   └── shared/              # Shared UI components
│   └── types/
│
├── player-web/                   # PLAYER web interface (served by backend)
│   ├── index.html               # Player entry point
│   ├── app.js                   # Player app logic
│   ├── styles.css               # Player styles (Tailwind)
│   └── assets/                  # Images, fonts
│
├── src-tauri/                    # Backend (Rust)
│   ├── src/
│   │   ├── main.rs              # Tauri app initialization
│   │   ├── lib.rs               # Library exports
│   │   ├── database.rs          # SQLite operations
│   │   ├── http_server.rs       # NEW: HTTP server (axum)
│   │   ├── websocket.rs         # NEW: WebSocket handler
│   │   ├── game_engine.rs       # NEW: Game logic
│   │   ├── mdns_service.rs      # NEW: mDNS broadcasting
│   │   └── models.rs            # Data models
│   └── Cargo.toml
│
└── docs/
    └── ARCHITECTURE.md          # This file
```

## Network Communication

### Player Connection Flow

1. **Host Starts Game Server**
   ```
   Host clicks "Start Server"
   → Rust starts HTTP server on port 3000
   → Rust starts WebSocket server on port 3000/ws
   → Rust broadcasts mDNS service
   → Host displays: "Connect at http://192.168.1.100:3000"
   → Host displays QR code for easy mobile connection
   ```

2. **Player Joins**
   ```
   Player opens browser on phone/tablet
   → Scans QR code or types URL: http://192.168.1.100:3000
   → Browser loads player web interface (HTML/CSS/JS)
   → Player enters name
   → WebSocket connection established
   → Host sees new player in lobby
   ```

3. **Gameplay**
   ```
   Host starts game
   → WebSocket broadcasts question to all players
   → Players see question on their devices
   → Players submit answers via WebSocket
   → Host sees answer status
   → WebSocket broadcasts scores
   ```

### API Endpoints

**HTTP (REST)**:
- `GET /` - Serve player web interface
- `GET /api/game/status` - Get current game status
- `GET /api/game/qr` - Get QR code for joining
- `GET /api/health` - Health check

**WebSocket** (`ws://host:3000/ws`):
- `player_join` - Player joins game
- `player_answer` - Player submits answer
- `question_broadcast` - Host sends question
- `score_update` - Update leaderboard
- `game_start` - Game starting
- `game_end` - Game finished

## Message Protocol

### WebSocket Messages (JSON)

```typescript
// Player → Server
{
  "type": "player_join",
  "payload": {
    "name": "Alice",
    "game_code": "ABC123"
  }
}

{
  "type": "player_answer",
  "payload": {
    "player_id": 1,
    "question_id": 5,
    "answer": "Paris",
    "time_elapsed": 3.5
  }
}

// Server → Players
{
  "type": "question_broadcast",
  "payload": {
    "question": {
      "id": 5,
      "text": "What is the capital of France?",
      "type": "multiple_choice",
      "options": ["London", "Paris", "Berlin", "Madrid"]
    },
    "time_limit": 30,
    "question_number": 3,
    "total_questions": 10
  }
}

{
  "type": "score_update",
  "payload": {
    "players": [
      {"id": 1, "name": "Alice", "score": 350},
      {"id": 2, "name": "Bob", "score": 280}
    ]
  }
}
```

## Data Flow Examples

### Example 1: Starting a Game

```
1. Host: Selects question set
2. Host: Clicks "Start Server"
3. Rust Backend:
   - Starts HTTP server on port 3000
   - Starts WebSocket server
   - Generates game code: "XYZ789"
   - Broadcasts mDNS service
   - Inserts game record in database
4. Host UI: Shows connection info + QR code
5. Players: Connect via browser
6. Host: Clicks "Start Game"
7. Backend: Broadcasts first question to all connected players
```

### Example 2: Answering a Question

```
1. Player browser: Receives question via WebSocket
2. Player: Selects answer "Paris"
3. Browser: Sends answer via WebSocket
4. Backend:
   - Validates answer
   - Calculates points (correct + speed bonus)
   - Updates database
   - Sends confirmation to player
   - Updates host dashboard
5. All players: Receive score update
```

## Advantages of This Architecture

### For Players
✅ No app installation required
✅ Works on ANY device (phone, tablet, laptop)
✅ Instant access via QR code
✅ Always up-to-date (no app updates)
✅ Low bandwidth usage
✅ Responsive design for all screen sizes

### For Host
✅ Professional desktop app with full features
✅ Persistent local database
✅ Offline question management
✅ Easy game control
✅ Multi-platform (Windows, Mac, Linux)

### Technical
✅ Simple deployment (one server, many clients)
✅ Easy updates (server-side only)
✅ Efficient resource usage
✅ Standard web technologies
✅ WebSocket for real-time features
✅ Works on local network (no internet needed)

## Performance Considerations

### Target Specifications (Low-End Hardware)

**Host Machine**:
- CPU: Quad-core
- RAM: 4GB
- Storage: 100MB for app + database

**Target Performance**:
- Support 20 concurrent players
- WebSocket latency: < 50ms local network
- Question broadcast: < 100ms to all players
- Memory per player connection: < 5MB
- Total host memory: < 300MB with 20 players

**Player Requirements**:
- Any device with modern browser (2018+)
- Stable WiFi connection
- Screen size: 320px+ width (small phones supported)

### Optimizations

1. **Player Web Interface**:
   - Minimal dependencies (< 100KB total)
   - Aggressive caching
   - Lazy load images
   - Mobile-first CSS

2. **WebSocket**:
   - Binary protocol option for large data
   - Message batching
   - Compression for large payloads

3. **Backend**:
   - Async Rust (Tokio)
   - Connection pooling
   - Efficient JSON serialization
   - Static file caching

## Security Considerations

### Network Security
- Local network only (no internet exposure by default)
- Optional password protection for games
- Rate limiting on answer submission
- Input validation on all player data

### Data Privacy
- No personal data collected
- No analytics or tracking
- All data stays on host machine
- Optional game history deletion

## Future Enhancements

### Phase 2
- [ ] Optional internet mode (port forwarding/ngrok)
- [ ] Host hotspot creation for WiFi-less environments
- [ ] Native mobile apps (optional, for app stores)
- [ ] Progressive Web App (PWA) for offline player capability
- [ ] Team mode support
- [ ] Voice chat integration

### Phase 3
- [ ] Cloud question database sync
- [ ] Remote hosting (cloud server option)
- [ ] Spectator mode (watch-only connections)
- [ ] Twitch/YouTube streaming integration
- [ ] Mobile host companion app

## Migration from Original Plan

**Original**: Desktop app for both host and players
**New**: Desktop app for host + web interface for players

**Changes Required**:
1. ✅ Separate host UI from player UI
2. ⬜ Add HTTP server (axum)
3. ⬜ Create lightweight player web interface
4. ⬜ Update WebSocket implementation
5. ⬜ Add mDNS broadcasting
6. ⬜ Add QR code generation
7. ⬜ Update documentation

**Benefits**:
- Much more practical for real-world use
- Lower barrier to entry for players
- Better user experience
- Easier testing and development
- More scalable architecture

## Conclusion

This architecture provides the best balance of:
- **Ease of use**: Players just open a browser
- **Professional features**: Host has full desktop app control
- **Performance**: Optimized for low-end hardware
- **Flexibility**: Works on any player device
- **Simplicity**: Standard web technologies
- **Reliability**: Local network, no internet dependency

The host gets a powerful desktop application, while players get instant access from any device without installation barriers.
