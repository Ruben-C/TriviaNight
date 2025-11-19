# Trivia Night

A cross-platform trivia game application for your next game night.

**Host**: Desktop app (Windows, Mac, Linux) for game control and management
**Players**: Web browser on ANY device - phones, tablets, laptops (iOS, Android, etc.)

## Architecture

- **🖥️ Host Application**: Desktop app (Tauri) for Windows, macOS, and Linux
  - Manage questions and game settings
  - Control game flow
  - View player status and scores

- **📱 Player Interface**: Web-based (works on ANY device)
  - No installation required
  - Join via browser: phones, tablets, laptops
  - iOS, Android, Windows, Mac, Linux - all supported
  - Just scan QR code or visit URL

## Features

### Phase 1 (Current)

- **Host Desktop App**: Cross-platform (Windows, macOS, Linux)
- **Universal Player Access**: Web browser on any device - no app installation needed
- **Question Management**: Create, edit, and organize questions into sets
- **Multiple Question Types**:
  - Multiple Choice
  - Text Input
  - Image Guess
  - True/False
- **Question Management**: Create, edit, and organize questions into sets
- **Real-time Gameplay**: WebSocket-based communication for instant updates
- **Mini-Games**: Horse race with player voting
- **Local Network Support**: Players connect via LAN or WiFi
- **Lightweight**: Optimized to run smoothly on low-end hardware (quad-core CPU, 4GB RAM)

### Upcoming Features

- Hotspot creation for easy player connectivity
- Additional mini-games
- Question import/export
- Game statistics and history
- Custom themes and branding

## Technology Stack

### Host Application (Desktop)
- **Framework**: Tauri 2.0 (Rust + React)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand

### Player Interface (Web)
- **Frontend**: Vanilla JavaScript (lightweight)
- **Styling**: Tailwind CSS
- **Communication**: WebSocket API
- **Size**: < 100KB (fast mobile loading)

### Backend (Rust)
- **HTTP Server**: Axum (serves player web interface)
- **WebSocket**: tokio-tungstenite (real-time communication)
- **Database**: SQLite (embedded, no separate server)
- **Network Discovery**: mDNS (auto-discovery on local network)
- **QR Codes**: qrcode crate (easy mobile joining)

### Why This Stack?

- **Tauri**: ~600KB overhead vs Electron's ~100MB, uses native OS WebView
- **Rust Backend**: Minimal memory footprint, excellent performance
- **SQLite**: Embedded database, no separate server needed
- **Web Players**: Universal access from any device, no installation
- **Total Host Memory**: ~150-200MB vs Electron's 600MB+
- **Player Requirements**: Just a web browser (any modern device)

## Prerequisites

### Development Tools

1. **Node.js** (v18 or later)
   - Download from [nodejs.org](https://nodejs.org/)

2. **Rust** (latest stable)
   - Install from [rustup.rs](https://rustup.rs/)

3. **Platform-Specific Dependencies**:

   **Linux**:
   ```bash
   sudo apt update
   sudo apt install libwebkit2gtk-4.1-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

   **macOS**:
   ```bash
   xcode-select --install
   ```

   **Windows**:
   - Install [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
   - Install [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

## Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TriviaNight
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the development server:
```bash
npm run tauri:dev
```

This will start the Vite dev server and launch the Tauri application in development mode with hot-reload enabled.

### Building

**Important**: Before building, you need to generate application icons:

```bash
# Install Tauri CLI if not already installed
npm install -g @tauri-apps/cli

# Generate icons from a 1024x1024 PNG image
cargo tauri icon path/to/your-icon.png
```

Then build for production:
```bash
npm run tauri:build
```

The compiled application will be in `src-tauri/target/release/bundle/`.

**Note**: The build will fail without icons. See `src-tauri/icons/README.md` for more information.

## CI/CD Pipeline

This project uses GitHub Actions for continuous integration and deployment:

### Automated Workflows

1. **Test Workflow** (`test.yml`)
   - Runs on every push and pull request
   - Type checks TypeScript code
   - Builds frontend
   - Runs Rust tests and clippy checks
   - Ensures code quality before merging

2. **Build Workflow** (`build.yml`)
   - Builds for all platforms (Windows, macOS, Linux)
   - Runs on push to main and pull requests
   - Creates platform-specific installers:
     - **macOS**: `.dmg` and `.app`
     - **Linux**: `.deb` and `.AppImage`
     - **Windows**: `.msi` and `.exe` (NSIS)
   - Uploads artifacts for 7 days

3. **Release Workflow** (`release.yml`)
   - Triggered when a tag is pushed (e.g., `v1.0.0`)
   - Builds for all platforms
   - Creates a GitHub release with installers
   - Generates release notes automatically

### Creating a Release

To create a new release:

```bash
# Ensure you're on main with latest changes
git checkout main
git pull

# Create and push a version tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

The release workflow will automatically:
- Build for Windows, macOS, and Linux
- Create installers for each platform
- Create a draft release on GitHub
- Attach all installers to the release

### Build Status

Check the Actions tab on GitHub to see build status for all platforms.

## Project Structure

```
TriviaNight/
├── src/                      # HOST desktop app (React + Tauri)
│   ├── App.tsx              # Host main interface
│   ├── main.tsx             # React entry point
│   ├── index.css            # Global styles with Tailwind
│   └── types/               # TypeScript type definitions
│       └── index.ts         # Shared types
├── player-web/              # PLAYER web interface (served to browsers)
│   ├── index.html           # Player entry point
│   ├── app.js               # Player WebSocket client
│   ├── styles.css           # Player UI styles
│   └── assets/              # Images, icons
├── src-tauri/               # Backend (Rust)
│   ├── src/
│   │   ├── main.rs          # Main Tauri application
│   │   ├── lib.rs           # Library exports
│   │   ├── database.rs      # SQLite database logic
│   │   └── server.rs        # HTTP + WebSocket server
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # Tauri configuration
├── docs/
│   └── ARCHITECTURE.md      # Detailed architecture documentation
├── .github/workflows/       # CI/CD pipelines
├── index.html               # Host app entry point
├── package.json             # Node dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

## How to Use

### As a Host (Desktop App)

1. **Install** the Trivia Night desktop app on your computer (Windows, Mac, or Linux)
2. **Launch** the application
3. **Create** or select a question set
4. **Click "Start Server"** to begin hosting
5. **Display** the connection QR code and URL on your screen
6. **Wait** for players to join via their browsers
7. **Start** the game when ready
8. **Control** the game flow from your dashboard

### As a Player (Any Device with Browser)

**No installation required!** Just use your web browser:

1. **Open** your browser on any device (phone, tablet, laptop)
2. **Scan** the QR code shown by the host, OR
3. **Type** the URL shown (e.g., `http://192.168.1.100:3000`)
4. **Enter** your name
5. **Wait** for the host to start the game
6. **Answer** questions on your device
7. **Compete** and see your score in real-time!

**Supported Devices:**
- 📱 iPhone/iPad (Safari, Chrome)
- 📱 Android phones/tablets (Chrome, Firefox, etc.)
- 💻 Windows laptops (Edge, Chrome, Firefox)
- 💻 Mac laptops (Safari, Chrome)
- 🖥️ Any device with a modern web browser

## Development Roadmap

### Phase 1 (Weeks 1-11) - Current

- [x] Project setup and core infrastructure
- [x] Database schema and SQLite integration
- [x] Basic UI with mode selection
- [ ] Question management system
- [ ] WebSocket networking layer
- [ ] Game flow engine
- [ ] Host dashboard UI
- [ ] Player interface
- [ ] Horse race mini-game
- [ ] Cross-platform testing

### Phase 2 (Future)

- Network hotspot creation
- Additional mini-games
- Advanced question types
- Game analytics
- Cloud synchronization
- Mobile companion app

## Performance Targets

- **Startup Time**: < 2 seconds
- **Memory Usage**: < 200MB
- **CPU Usage**: < 5% idle, < 25% during gameplay
- **Network Latency**: < 100ms for local network
- **Supports**: Up to 20 concurrent players

## Database Schema

The application uses SQLite with the following main tables:

- `questions`: Question content and metadata
- `question_sets`: Collections of questions
- `set_questions`: Junction table for sets and questions
- `games`: Active and historical games
- `players`: Player information per game
- `answers`: Player answers and scoring

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Tauri](https://tauri.app/)
- UI powered by [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/)
- Database by [SQLite](https://www.sqlite.org/)
