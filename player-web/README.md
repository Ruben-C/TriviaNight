# Player Web Interface

This directory contains the lightweight web interface served to players during trivia games.

## Overview

The player interface is a simple, mobile-first web application that:
- Is served by the Rust backend HTTP server
- Connects via WebSocket for real-time gameplay
- Works on ANY device with a modern browser
- Requires no installation or app download

## Files

- **index.html**: Main player interface with all screens
- **styles.css**: Mobile-first responsive CSS (<50KB)
- **app.js**: WebSocket client and game logic (~20KB)
- **assets/**: Images and icons (if needed)

## Design Principles

1. **Minimal Size**: Target < 100KB total for fast mobile loading
2. **Mobile-First**: Optimized for small screens, scales up
3. **No Dependencies**: Vanilla JavaScript, no frameworks
4. **Progressive Enhancement**: Works on older browsers
5. **Responsive**: Adapts to any screen size (320px+)

## Screens

1. **Connect**: Enter name and game code
2. **Lobby**: Wait for game to start
3. **Question**: Answer trivia questions
4. **Results**: See if answer was correct
5. **Final**: View final scores and ranking
6. **Disconnected**: Handle connection loss

## Browser Support

- iOS Safari 12+
- Android Chrome 80+
- Desktop browsers (all modern versions)
- Any browser with WebSocket support

## WebSocket Protocol

The player interface communicates with the backend via WebSocket messages:

### Sent by Player
- `player_join`: Join game with name and code
- `player_answer`: Submit answer to question

### Received from Server
- `player_joined`: Confirmation of joining
- `lobby_update`: Player count updates
- `game_start`: Game is starting
- `question_broadcast`: New question
- `answer_result`: Whether answer was correct
- `score_update`: Updated leaderboard
- `game_end`: Final results

## Development

To test the player interface locally:

1. Start the Tauri dev server: `npm run tauri:dev`
2. The player interface will be served at `http://localhost:3000`
3. Open in browser or mobile device emulator
4. Use browser dev tools for debugging

## Deployment

The player interface is automatically included in the Tauri build:
- Files are bundled with the application
- Served by the embedded Axum HTTP server
- No separate deployment needed

## Performance

- **Load Time**: < 500ms on 3G
- **Memory**: < 10MB per player tab
- **WebSocket**: < 1KB per message
- **Offline Support**: None (requires active connection)

## Customization

The interface can be customized by editing:
- **styles.css**: Colors, fonts, layout
- **index.html**: Structure and text
- **app.js**: Behavior and logic

## Testing

Test on multiple devices:
- [ ] iPhone (Safari)
- [ ] Android phone (Chrome)
- [ ] iPad (Safari)
- [ ] Android tablet
- [ ] Windows laptop (Edge, Chrome)
- [ ] Mac laptop (Safari, Chrome)
- [ ] Small screen (320px width)

## Security

- No cookies or local storage used
- No personal data collection
- WebSocket only (no HTTP endpoints)
- Local network only (no internet exposure)
- Input validation on all fields

## Future Enhancements

- [ ] PWA support for offline capability
- [ ] Touch gestures for answers
- [ ] Haptic feedback on mobile
- [ ] Dark/light theme toggle
- [ ] Accessibility improvements (ARIA labels)
- [ ] Multi-language support
- [ ] Sound effects toggle
- [ ] Player avatars
