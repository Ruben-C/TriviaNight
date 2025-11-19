# Trivia Night - Detailed Implementation Plan

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Styling**: Tailwind CSS 3.4
- **Build Tool**: Vite 6.0
- **State Management**: Zustand 5.0

### Backend
- **Runtime**: Tauri 2.0 (Rust)
- **Database**: SQLite with rusqlite
- **WebSocket**: tokio-tungstenite
- **Network Discovery**: mdns-sd

### Why This Stack?

1. **Performance on Low-End Hardware**
   - Tauri uses native OS WebView (~600KB overhead vs Electron's ~100MB)
   - Rust backend: minimal memory footprint (~10-20MB)
   - Total memory usage: ~150-200MB vs Electron's 600MB+
   - Fast startup: < 2 seconds on low-end hardware

2. **Cross-Platform Support**
   - Single codebase for Windows, macOS, and Linux
   - Native performance on all platforms
   - Consistent UI across platforms

3. **Development Experience**
   - Hot reload during development
   - TypeScript for type safety
   - Modern React with hooks
   - Tailwind for rapid UI development

## Project Structure

```
TriviaNight/
├── src/                           # Frontend React application
│   ├── components/                # React components (to be created)
│   │   ├── host/                  # Host-specific components
│   │   ├── player/                # Player-specific components
│   │   ├── shared/                # Shared UI components
│   │   └── minigames/             # Mini-game components
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand state stores
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Utility functions
│   ├── App.tsx                    # Main application component
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
│
├── src-tauri/                     # Tauri/Rust backend
│   ├── src/
│   │   ├── main.rs                # Main Tauri application
│   │   ├── lib.rs                 # Library exports
│   │   ├── database.rs            # SQLite database operations
│   │   ├── server.rs              # WebSocket server
│   │   ├── models.rs              # Data models (to be created)
│   │   └── commands.rs            # Tauri commands (to be created)
│   ├── Cargo.toml                 # Rust dependencies
│   └── tauri.conf.json            # Tauri configuration
│
├── public/                        # Static assets
├── docs/                          # Additional documentation
└── tests/                         # Test files (to be created)
```

## Phase 1: Core Infrastructure (COMPLETED)

### Week 1-2: Project Setup ✓

**Completed:**
- [x] Initialize Tauri + React + TypeScript project
- [x] Configure Vite build system
- [x] Set up Tailwind CSS
- [x] Create project structure
- [x] Configure TypeScript strict mode
- [x] Set up Git repository
- [x] Create .gitignore

**Completed Files:**
- package.json with all dependencies
- vite.config.ts
- tsconfig.json and tsconfig.node.json
- tailwind.config.js
- postcss.config.js
- index.html
- src/main.tsx
- src/App.tsx (basic mode selector UI)
- src/index.css
- src/types/index.ts (comprehensive type definitions)
- src-tauri/Cargo.toml
- src-tauri/tauri.conf.json
- src-tauri/build.rs
- src-tauri/src/main.rs
- src-tauri/src/lib.rs
- src-tauri/src/database.rs (with full schema)
- src-tauri/src/server.rs (basic structure)
- README.md
- .gitignore

### Week 2-3: Database & Models (IN PROGRESS)

**Database Schema (COMPLETED):**
- ✓ Questions table with support for multiple question types
- ✓ Question sets for organizing questions
- ✓ Games table for active and historical games
- ✓ Players table with game association
- ✓ Answers table for tracking responses
- ✓ Sample data insertion

**Next Steps:**
- [ ] Create Rust models matching database schema
- [ ] Implement CRUD operations for questions
- [ ] Implement CRUD operations for question sets
- [ ] Create Tauri commands for database operations
- [ ] Create TypeScript API client for database operations

## Phase 2: Question Management (Weeks 3-4)

### Features to Implement

1. **Question Editor UI**
   - Form for creating/editing questions
   - Question type selector
   - Options editor for multiple choice
   - Image upload for image-based questions
   - Validation

2. **Question Library**
   - List view of all questions
   - Filter by category, difficulty, type
   - Search functionality
   - Bulk actions (delete, duplicate)

3. **Question Set Manager**
   - Create/edit question sets
   - Drag-and-drop question ordering
   - Set preview
   - Import/export JSON

### Technical Tasks
- [ ] Create QuestionEditor component
- [ ] Create QuestionList component
- [ ] Create SetManager component
- [ ] Implement drag-and-drop with react-beautiful-dnd or similar
- [ ] Add form validation
- [ ] Create Tauri commands for question operations
- [ ] Implement file upload for images

## Phase 3: Networking Layer (Weeks 4-5)

### WebSocket Server Implementation

1. **Server Features**
   - WebSocket server using tokio-tungstenite
   - Connection management
   - Message routing
   - Game room management
   - Player authentication

2. **mDNS Discovery**
   - Broadcast game availability on local network
   - Service discovery for players
   - Game code generation

3. **Message Protocol**
   - Define message types (already started in types/index.ts)
   - Implement serialization/deserialization
   - Error handling
   - Reconnection logic

### Technical Tasks
- [ ] Implement full WebSocket server in server.rs
- [ ] Create connection pool management
- [ ] Implement message handlers for each message type
- [ ] Add mDNS service broadcasting
- [ ] Create WebSocket client in React
- [ ] Implement reconnection logic
- [ ] Add connection status indicators

## Phase 4: Game Flow Engine (Weeks 5-6)

### Game State Machine

States:
1. Lobby (waiting for players)
2. Starting (countdown)
3. Question Display
4. Answer Collection
5. Results Display
6. Leaderboard
7. Game End

### Features
- [ ] Game lifecycle management
- [ ] Question sequencing
- [ ] Timer system
- [ ] Answer validation
- [ ] Scoring algorithm
- [ ] Bonus points for speed
- [ ] Leaderboard calculation

### Technical Tasks
- [ ] Create GameEngine class/module
- [ ] Implement state machine
- [ ] Create timer component
- [ ] Implement scoring logic
- [ ] Create leaderboard component
- [ ] Add sound effects (optional)

## Phase 5: Host Interface (Weeks 6-7)

### Components to Build

1. **Game Setup Screen**
   - Select question set
   - Configure game settings (time limits, scoring)
   - Network setup (start server)
   - Game code display

2. **Lobby Screen**
   - Connected players list
   - Player approval/kick
   - Start game button
   - Preview questions

3. **Game Control Dashboard**
   - Current question display
   - Player answer status
   - Manual question control (next, skip)
   - Pause/resume game

4. **Results Screen**
   - Final leaderboard
   - Game statistics
   - Export results

### Technical Tasks
- [ ] Create HostSetup component
- [ ] Create HostLobby component
- [ ] Create HostDashboard component
- [ ] Create PlayerList component
- [ ] Create QuestionPreview component
- [ ] Create ResultsSummary component
- [ ] Add real-time player status updates

## Phase 6: Player Interface (Weeks 7-8)

### Components to Build

1. **Connection Screen**
   - Game code input
   - Player name input
   - Server discovery
   - Connection status

2. **Lobby Screen**
   - Waiting for game start
   - Player list
   - Game info display

3. **Question Screen**
   - Question display
   - Answer input (varies by question type)
   - Timer display
   - Submit button

4. **Results Screen**
   - Answer feedback (correct/incorrect)
   - Points earned
   - Current ranking
   - Leaderboard

### Technical Tasks
- [ ] Create PlayerConnect component
- [ ] Create PlayerLobby component
- [ ] Create QuestionDisplay component
- [ ] Create MultipleChoiceAnswer component
- [ ] Create TextInputAnswer component
- [ ] Create ImageGuessAnswer component
- [ ] Create PlayerResults component
- [ ] Create PlayerLeaderboard component

## Phase 7: Mini-Games (Weeks 8-9)

### Horse Race Implementation

1. **Features**
   - 4-6 horses with different colors
   - Player voting before race
   - Animated race
   - Random winner determination
   - Bonus points for correct predictions

2. **Components**
   - HorseRaceVoting
   - HorseRaceAnimation
   - HorseRaceResults

### Technical Tasks
- [ ] Design horse race UI
- [ ] Implement voting system
- [ ] Create animation with CSS/Canvas
- [ ] Add sound effects
- [ ] Integrate with game flow

### Future Mini-Games
- Tug of War (team-based)
- Buzzer Battle (first to answer)
- Word Scramble
- Number Estimation

## Phase 8: Hotspot Functionality (Weeks 9-10)

### Platform-Specific Implementation

1. **Windows**
   - Use netsh wlan commands
   - Create hosted network
   - Configure SSID and password

2. **macOS**
   - Use NetworkSetup framework
   - Create Internet Sharing configuration

3. **Linux**
   - Use NetworkManager D-Bus API
   - Configure access point mode

### Technical Tasks
- [ ] Create hotspot module in Rust
- [ ] Implement Windows hotspot creation
- [ ] Implement macOS hotspot creation
- [ ] Implement Linux hotspot creation
- [ ] Add UI for hotspot configuration
- [ ] Add fallback instructions for manual setup
- [ ] Test on all platforms

## Phase 9: Testing & Optimization (Weeks 10-11)

### Testing Strategy

1. **Unit Tests**
   - Database operations
   - Game logic
   - Scoring algorithms
   - Message parsing

2. **Integration Tests**
   - WebSocket communication
   - Game flow
   - Multi-player scenarios

3. **Performance Tests**
   - Memory usage monitoring
   - CPU usage during gameplay
   - Network latency
   - Concurrent player stress testing

### Optimization Tasks
- [ ] Profile memory usage
- [ ] Optimize React re-renders
- [ ] Optimize WebSocket message size
- [ ] Reduce bundle size
- [ ] Test on low-end hardware
- [ ] Fix performance bottlenecks

### Cross-Platform Testing
- [ ] Test on Windows 10/11
- [ ] Test on macOS (Intel and Apple Silicon)
- [ ] Test on Ubuntu Linux
- [ ] Test on other Linux distributions
- [ ] Fix platform-specific issues

## Phase 10: Polish & Release (Week 11)

### UI/UX Polish
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add animations
- [ ] Responsive design improvements
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

### Documentation
- [ ] User manual
- [ ] Host guide
- [ ] FAQ
- [ ] Troubleshooting guide
- [ ] API documentation

### Distribution
- [ ] Create application icons
- [ ] Set up auto-updater
- [ ] Create installers for all platforms
- [ ] Test installation process
- [ ] Create release notes
- [ ] Publish release

## Performance Targets

- **Startup Time**: < 2 seconds on target hardware
- **Memory Usage**: < 200MB total
- **CPU Usage**: < 5% idle, < 25% during active gameplay
- **Network Latency**: < 100ms for local network
- **Max Players**: 20 concurrent players
- **Question Load**: < 50ms to display new question
- **Answer Processing**: < 10ms per answer

## Security Considerations

1. **Input Validation**
   - Sanitize all user inputs
   - Validate question content
   - Prevent SQL injection
   - Limit file upload sizes

2. **Network Security**
   - Validate WebSocket messages
   - Rate limiting
   - Prevent cheating (timing attacks)
   - Secure game codes

3. **Data Privacy**
   - No personal data collection
   - Local-only storage
   - Optional game history

## Future Enhancements (Phase 2)

1. **Cloud Features**
   - Cloud save for questions
   - Online multiplayer
   - Question marketplace

2. **Advanced Features**
   - Team mode
   - Tournament brackets
   - Custom themes
   - Plugin system for question sources
   - Mobile companion app

3. **Content**
   - Pre-made question packs
   - Question generator AI
   - Import from Kahoot/Quizizz

4. **Analytics**
   - Detailed game statistics
   - Player performance tracking
   - Question difficulty analysis

## Development Guidelines

### Code Style
- Use TypeScript strict mode
- Follow React best practices
- Use functional components with hooks
- Keep components small and focused
- Write self-documenting code
- Add comments for complex logic

### Git Workflow
- Use feature branches
- Write descriptive commit messages
- Squash commits before merging
- Keep main branch stable

### Testing
- Write tests for critical functionality
- Test on target hardware regularly
- Test network disconnection scenarios
- Test with maximum player count

## Current Status

### Completed ✓
- Project initialization and configuration
- Database schema and SQLite setup
- Basic UI structure with mode selection
- TypeScript type definitions
- Core project documentation
- Build system verification

### Next Immediate Steps
1. Create Rust models and database operations
2. Build question management UI
3. Implement WebSocket server
4. Create host and player interfaces
5. Implement game flow logic
6. Add mini-games
7. Cross-platform testing
8. Polish and release

The foundation is now in place, and we're ready to build out the core features!
