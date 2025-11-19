// Trivia Night - Player Web Interface
// WebSocket-based real-time game client

class TriviaPlayer {
    constructor() {
        this.ws = null;
        this.playerId = null;
        this.playerName = null;
        this.gameCode = null;
        this.currentScore = 0;
        this.selectedAnswer = null;
        this.hasAnswered = false;
        this.timerInterval = null;

        this.init();
    }

    init() {
        // Get DOM elements
        this.screens = {
            connect: document.getElementById('connect-screen'),
            lobby: document.getElementById('lobby-screen'),
            question: document.getElementById('question-screen'),
            results: document.getElementById('results-screen'),
            final: document.getElementById('final-screen'),
            disconnected: document.getElementById('disconnected-screen')
        };

        // Set up event listeners
        document.getElementById('join-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.joinGame();
        });

        document.getElementById('reconnect-btn').addEventListener('click', () => {
            this.reconnect();
        });

        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });

        // Auto-fill game code from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const gameCode = urlParams.get('code');
        if (gameCode) {
            document.getElementById('game-code').value = gameCode.toUpperCase();
        }
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => screen.classList.remove('active'));
        this.screens[screenName].classList.add('active');
    }

    showStatus(message, type = 'error') {
        const statusEl = document.getElementById('connection-status');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
    }

    joinGame() {
        this.playerName = document.getElementById('player-name').value.trim();
        this.gameCode = document.getElementById('game-code').value.trim().toUpperCase();

        if (!this.playerName || !this.gameCode) {
            this.showStatus('Please enter your name and game code');
            return;
        }

        this.connect();
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        this.showStatus('Connecting...', 'info');

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.sendMessage('player_join', {
                name: this.playerName,
                game_code: this.gameCode
            });
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse message:', error);
            }
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.showStatus('Connection error. Please try again.');
        };

        this.ws.onclose = () => {
            console.log('WebSocket closed');
            this.handleDisconnect();
        };
    }

    reconnect() {
        this.showScreen('connect');
        if (this.playerName && this.gameCode) {
            document.getElementById('player-name').value = this.playerName;
            document.getElementById('game-code').value = this.gameCode;
        }
    }

    sendMessage(type, payload) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type,
                payload
            }));
        }
    }

    handleMessage(message) {
        console.log('Received message:', message);

        switch (message.type) {
            case 'player_joined':
                this.handlePlayerJoined(message.payload);
                break;
            case 'lobby_update':
                this.handleLobbyUpdate(message.payload);
                break;
            case 'game_start':
                this.handleGameStart(message.payload);
                break;
            case 'question_broadcast':
                this.handleQuestion(message.payload);
                break;
            case 'answer_result':
                this.handleAnswerResult(message.payload);
                break;
            case 'score_update':
                this.handleScoreUpdate(message.payload);
                break;
            case 'game_end':
                this.handleGameEnd(message.payload);
                break;
            case 'error':
                this.showStatus(message.payload.message || 'An error occurred', 'error');
                break;
        }
    }

    handlePlayerJoined(data) {
        this.playerId = data.player_id;
        document.getElementById('lobby-player-name').textContent = this.playerName;
        this.showScreen('lobby');
    }

    handleLobbyUpdate(data) {
        document.getElementById('player-count').textContent = data.player_count || 0;
    }

    handleGameStart(data) {
        console.log('Game starting!');
    }

    handleQuestion(data) {
        this.hasAnswered = false;
        this.selectedAnswer = null;

        // Update question info
        document.getElementById('current-question').textContent = data.question_number;
        document.getElementById('total-questions').textContent = data.total_questions;
        document.getElementById('question-text').textContent = data.question.text;

        // Handle question image
        const imageContainer = document.getElementById('question-image');
        if (data.question.image_url) {
            document.getElementById('question-img').src = data.question.image_url;
            imageContainer.style.display = 'block';
        } else {
            imageContainer.style.display = 'none';
        }

        // Create answer interface based on question type
        const answerSection = document.getElementById('answer-section');
        answerSection.innerHTML = '';

        switch (data.question.type) {
            case 'multiple_choice':
                this.createMultipleChoiceAnswers(data.question.options);
                break;
            case 'text_input':
                this.createTextInput();
                break;
            case 'true_false':
                this.createTrueFalseAnswers();
                break;
        }

        // Start timer
        this.startTimer(data.time_limit);

        // Show question screen
        this.showScreen('question');

        // Enable submit button
        document.getElementById('submit-answer').disabled = false;
        document.getElementById('answer-feedback').classList.remove('show');
    }

    createMultipleChoiceAnswers(options) {
        const answerSection = document.getElementById('answer-section');

        options.forEach((option, index) => {
            const button = document.createElement('div');
            button.className = 'answer-option';
            button.textContent = option;
            button.addEventListener('click', () => {
                document.querySelectorAll('.answer-option').forEach(btn => {
                    btn.classList.remove('selected');
                });
                button.classList.add('selected');
                this.selectedAnswer = option;
            });
            answerSection.appendChild(button);
        });
    }

    createTextInput() {
        const answerSection = document.getElementById('answer-section');

        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'answer-input';
        input.placeholder = 'Type your answer...';
        input.addEventListener('input', (e) => {
            this.selectedAnswer = e.target.value;
        });
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.submitAnswer();
            }
        });

        answerSection.appendChild(input);

        // Auto-focus on mobile
        setTimeout(() => input.focus(), 300);
    }

    createTrueFalseAnswers() {
        this.createMultipleChoiceAnswers(['True', 'False']);
    }

    startTimer(seconds) {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        const timerText = document.getElementById('timer-text');
        const timerProgress = document.getElementById('timer-progress');
        const circumference = 2 * Math.PI * 45;

        let timeLeft = seconds;
        timerText.textContent = timeLeft;
        timerProgress.style.strokeDashoffset = 0;

        this.timerInterval = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;

            const progress = timeLeft / seconds;
            const offset = circumference * (1 - progress);
            timerProgress.style.strokeDashoffset = offset;

            if (timeLeft <= 0) {
                clearInterval(this.timerInterval);
                if (!this.hasAnswered) {
                    this.submitAnswer();
                }
            }
        }, 1000);
    }

    submitAnswer() {
        if (this.hasAnswered) return;

        this.hasAnswered = true;
        clearInterval(this.timerInterval);

        // Disable submit button
        document.getElementById('submit-answer').disabled = true;

        // Send answer to server
        this.sendMessage('player_answer', {
            player_id: this.playerId,
            answer: this.selectedAnswer || '',
            time_elapsed: parseInt(document.getElementById('timer-text').textContent)
        });

        // Show feedback
        const feedback = document.getElementById('answer-feedback');
        feedback.textContent = 'Answer submitted! Waiting for results...';
        feedback.className = 'answer-feedback show';
    }

    handleAnswerResult(data) {
        // Show results screen
        const resultIcon = document.getElementById('answer-result');
        const pointsEarned = document.getElementById('points-earned');

        if (data.is_correct) {
            resultIcon.textContent = '✅ Correct!';
            resultIcon.className = 'result-indicator correct';
            pointsEarned.textContent = `+${data.points_earned} points`;
            pointsEarned.className = 'points-earned positive';
        } else {
            resultIcon.textContent = '❌ Incorrect';
            resultIcon.className = 'result-indicator incorrect';
            pointsEarned.textContent = '0 points';
            pointsEarned.className = 'points-earned zero';

            if (data.correct_answer) {
                pointsEarned.textContent += `\nCorrect answer: ${data.correct_answer}`;
            }
        }

        this.currentScore = data.current_score;
        document.getElementById('current-score').textContent = this.currentScore;

        this.showScreen('results');
    }

    handleScoreUpdate(data) {
        // Update leaderboard
        const leaderboard = document.getElementById('leaderboard-list');
        leaderboard.innerHTML = '';

        data.players.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            if (player.id === this.playerId) {
                item.classList.add('current-player');
            }

            if (index === 0) item.classList.add('rank-1');
            if (index === 1) item.classList.add('rank-2');
            if (index === 2) item.classList.add('rank-3');

            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${player.name}</span>
                <span class="leaderboard-score">${player.score}</span>
            `;

            leaderboard.appendChild(item);
        });
    }

    handleGameEnd(data) {
        // Find player rank
        const playerRank = data.final_scores.findIndex(p => p.id === this.playerId) + 1;

        // Set rank icon
        const rankIcon = document.getElementById('rank-icon');
        if (playerRank === 1) rankIcon.textContent = '🥇';
        else if (playerRank === 2) rankIcon.textContent = '🥈';
        else if (playerRank === 3) rankIcon.textContent = '🥉';
        else rankIcon.textContent = '🏆';

        document.getElementById('final-rank').textContent = `#${playerRank}`;
        document.getElementById('final-score').textContent = this.currentScore;

        // Update final leaderboard
        const finalLeaderboard = document.getElementById('final-leaderboard');
        finalLeaderboard.innerHTML = '';

        data.final_scores.forEach((player, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';

            if (player.id === this.playerId) {
                item.classList.add('current-player');
            }

            if (index === 0) item.classList.add('rank-1');
            if (index === 1) item.classList.add('rank-2');
            if (index === 2) item.classList.add('rank-3');

            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}</span>
                <span class="leaderboard-name">${player.name}</span>
                <span class="leaderboard-score">${player.score}</span>
            `;

            finalLeaderboard.appendChild(item);
        });

        this.showScreen('final');
    }

    handleDisconnect() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Only show disconnected screen if we were in a game
        if (this.playerId) {
            this.showScreen('disconnected');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TriviaPlayer();
});
