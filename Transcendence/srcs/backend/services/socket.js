import jwt from 'jsonwebtoken';
import chatService from './global_chat.js';
import friendsService from './friends.js';
import gameRoomService from './game_room.js';
import playerStatsService from './player_stats.js';

// Store game state per room
const gameRooms = new Map();

// Store tetris duel rooms  { roomCode → Map<socketId, socket> }
const tetrisRooms = new Map();

// Matchmaking queue for tetris
const tetrisMatchmakingQueue = [];

// Store io instance globally for use in routes
let ioInstance = null;

export function getIO() {
	return ioInstance;
}

// Broadcast rooms list to all connected clients
async function broadcastRoomsList(io) {
	try {
		const rooms = await gameRoomService.listActiveRooms();
		io.emit('game-rooms-updated', { rooms });
	} catch (err) {
		console.error('Error broadcasting rooms list:', err);
	}
}

function startRoomTimer(io, roomId, seconds)
{
	const gameState = gameRooms.get(roomId);
	if (!gameState) return;

	if (gameState.timerInterval)
		clearInterval(gameState.timerInterval);

	gameState.timerSeconds = seconds;

	gameState.timerInterval = setInterval(() => {
		gameState.timerSeconds--;

		if (gameState.timerSeconds < 0)
			gameState.timerSeconds = 0;

		if (gameState.timerSeconds <= 0)
		{
			io.to(roomId).emit('game-timer-sync', {
				remaining: 0
			});
			clearInterval(gameState.timerInterval);
			gameState.timerInterval = null;
			io.to(roomId).emit('game-timer-ended', { message: 'Temps écoulé !' });

			gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
			const nextDrawer = gameState.players[gameState.currentPlayerIndex];
			gameState.drawer = nextDrawer;
			

			gameState.currentWord = '';
			gameState.revealedLetters = [];
			gameState.revealedWord = [];
			gameState.guessedLetters = [];
			gameState.wrongGuesses = 0;

			io.to(roomId).emit('game-new-round', {
				drawer: nextDrawer
			});
		}
		else
		{
			io.to(roomId).emit('game-timer-sync', {
				remaining: gameState.timerSeconds
			});
		}
	}, 1000);
}

function stopRoomTimer(roomId)
{
	const gameState = gameRooms.get(roomId);
	if (!gameState || !gameState.timerInterval) return;
	clearInterval(gameState.timerInterval);
	gameState.timerInterval = null;
}

// Check if a playing game has only 1 player left and auto-stop it
async function checkAndStopSinglePlayerGame(io, roomId, dbRoomId) {
	if (!dbRoomId) return;
	
	try {
		// Check if room is in 'playing' status
		const room = await gameRoomService.getRoomById(dbRoomId);
		if (!room || room.status !== 'playing') return;
		
		// Count remaining players
		const players = await gameRoomService.getRoomPlayers(dbRoomId);
		if (players.length <= 1) {
			console.log(`Room ${dbRoomId} has only ${players.length} player(s) left, ending game`);
			stopRoomTimer(roomId);
			
			// Update room status to 'ended'
			await gameRoomService.updateRoomStatus(dbRoomId, 'waiting');
            await gameRoomService.resetRoomScores(dbRoomId);
			
			// Remove from game state
			gameRooms.delete(roomId);
			
			// Notify remaining player(s)
			io.to(roomId).emit('game-ended');
			io.to(roomId).emit('game-message', {
				message: 'La partie s\'est terminée car il ne reste qu\'un seul joueur',
				type: 'info'
			});
			
			// Broadcast updated rooms list
			broadcastRoomsList(io);
		}
	} catch (err) {
		console.error('Error checking single player game:', err);
	}
}

// Save round points to database (only the difference from round start)
async function saveRoundPoints(currentScores, roundStartScores) {
	for (const [username, currentPoints] of Object.entries(currentScores)) {
		const startPoints = roundStartScores[username] || 0;
		const pointsEarned = currentPoints - startPoints;
		if (pointsEarned !== 0) {
			try {
				await playerStatsService.addPointsByUsername(username, pointsEarned);
				console.log(`Saved ${pointsEarned} points for ${username}`);
			} catch (err) {
				console.error(`Error saving points for ${username}:`, err);
			}
		}
	}
}

function setupSocketIO(io)
{
	ioInstance = io;
	io.use((socket, next) =>
	{
		const token = socket.handshake.auth.token;
		if (!token)
			return (next(new Error('Authentication error')));

		try
		{
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			socket.user = decoded;
			next();
		}
		catch(err)
		{
			next(new Error('Authentication error'));
		}
	});

	io.on('connection', async (socket) =>
	{
		console.log(`User connected: ${socket.user.username}`);

		socket.join('general-chat');

		// Send recent messages and friend IDs on connection
		try {
			const [recentMessages, friendIds] = await Promise.all([
				chatService.getRecentMessages(50),
				friendsService.getFriendIds(socket.user.userId)
			]);

			socket.emit('chat-init', {
				messages: recentMessages,
				friendIds: friendIds
			});
		} catch (err) {
			console.error('Error fetching initial data:', err);
		}

		socket.on('chat-message', async(data) =>
		{
			try
			{
				const message = await chatService.saveMessage(socket.user.userId, data.content);
				socket.broadcast.to('general-chat').emit('chat-message',
				{
					id: message.id,
					sender_id: socket.user.userId,
					username: socket.user.username,
					content: message.content,
					created_at: message.created_at
				});
			}
			catch (err)
			{
				console.error('Error saving message:', err);
				socket.emit('error', {message: 'Failed to send message'});
			}
		});

		// ============================================
		// GAME ROOM EVENTS
		// ============================================

		// Join a game room
		socket.on('game-join-room', async (data) => {
			console.log('Received game-join-room from', socket.user.username, 'data:', data);
			const roomId = `game-room-${data.roomId}`;
			socket.join(roomId);
			socket.gameRoomId = roomId;
			socket.gameRoomDbId = data.roomId;
			console.log(`${socket.user.username} joined ${roomId}, socket.gameRoomId set to:`, socket.gameRoomId);

			// Send confirmation to the socket that joined
			socket.emit('game-room-joined', {
				roomId: data.roomId,
				success: true
			});

			// Get updated player list from DB
			try {
				const players = await gameRoomService.getRoomPlayers(data.roomId);
				// Notify ALL players in the room (including the one who joined) with updated player list
				io.to(roomId).emit('game-players-updated', { players });
			} catch (err) {
				console.error('Error getting room players:', err);
			}

			// Notify others in the room that someone joined
			socket.to(roomId).emit('game-player-joined', {
				username: socket.user.username,
				userId: socket.user.userId
			});

			// Broadcast rooms list update to everyone
			broadcastRoomsList(io);

			// Send current game state if game is in progress
			const gameState = gameRooms.get(roomId);
			if (gameState && gameState.isPlaying) {
				socket.emit('game-state-sync', {
					isPlaying: gameState.isPlaying,
					drawer: gameState.drawer,
					wordLength: gameState.currentWord ? gameState.currentWord.length : 0,
					revealedLetters: gameState.revealedLetters,
					revealedWord: gameState.revealedWord || [],
					guessedLetters: gameState.guessedLetters,
					players: gameState.players,
					scores: gameState.scores || {},
					timer: gameState.timerSeconds || 0
				});
			}
		});

		// Leave a game room
		socket.on('game-leave-room', async () => {
			if (socket.gameRoomId) {
				const roomId = socket.gameRoomId;
				const dbRoomId = socket.gameRoomDbId;
				const userId = socket.user.userId;

				if (dbRoomId && userId) {
					try {
						await gameRoomService.leaveRoom(dbRoomId, userId);
					} catch (err) {
						console.error('Error removing player from room on socket leave:', err.message);
					}
				}

				socket.to(roomId).emit('game-player-left', {
					username: socket.user.username,
					userId: socket.user.userId
				});
				socket.leave(roomId);
				console.log(`${socket.user.username} left ${roomId}`);

				// Get updated player list and broadcast to remaining players
				if (dbRoomId) {
					try {
						const players = await gameRoomService.getRoomPlayers(dbRoomId);
						io.to(roomId).emit('game-players-updated', { players });
					} catch (err) {
						// Room may have been deleted
						console.log('Room may have been deleted:', err.message);
					}
				}

				socket.gameRoomId = null;
				socket.gameRoomDbId = null;

				// Check if game should auto-stop due to single player
				await checkAndStopSinglePlayerGame(io, roomId, dbRoomId);
				// Broadcast updated rooms list
				broadcastRoomsList(io);
			}
		});

		// Join a game room as spectator
		socket.on('game-spectate-room', async (data) => {
			console.log('Received game-spectate-room from', socket.user.username, 'data:', data);
			const roomId = `game-room-${data.roomId}`;
			
			// Verify room exists and is in playing status, and user is not already in a game
			try {
				const room = await gameRoomService.spectateRoom(data.roomId, socket.user.userId);
				
				socket.join(roomId);
				socket.gameRoomId = roomId;
				socket.gameRoomDbId = data.roomId;
				socket.isSpectator = true;
				console.log(`${socket.user.username} joined ${roomId} as spectator`);

				// Send confirmation
				socket.emit('game-spectate-joined', {
					roomId: data.roomId,
					success: true
				});

				// Notify others that a spectator joined
				socket.to(roomId).emit('game-spectator-joined', {
					username: socket.user.username
				});

				// Send current game state
				const gameState = gameRooms.get(roomId);
				if (gameState && gameState.isPlaying) {
					socket.emit('game-state-sync', {
						isPlaying: gameState.isPlaying,
						drawer: gameState.drawer,
						wordLength: gameState.currentWord ? gameState.currentWord.length : 0,
						revealedLetters: gameState.revealedLetters,
						revealedWord: gameState.revealedWord || [],
						guessedLetters: gameState.guessedLetters,
						players: gameState.players,
						scores: gameState.scores || {},
						timer: gameState.timerSeconds || 0
					});
				}
			} catch (err) {
				console.error('Error joining as spectator:', err);
				socket.emit('game-spectate-error', {
					error: err.message || 'Cannot spectate this room'
				});
			}
		});

		// Leave spectator mode
		socket.on('game-leave-spectate', () => {
			if (socket.gameRoomId && socket.isSpectator) {
				const roomId = socket.gameRoomId;
				
				socket.to(roomId).emit('game-spectator-left', {
					username: socket.user.username
				});
				
				socket.leave(roomId);
				console.log(`${socket.user.username} left spectator mode in ${roomId}`);
				
				socket.gameRoomId = null;
				socket.gameRoomDbId = null;
				socket.isSpectator = false;
			}
		});


		// Start the game
		socket.on('game-start', async (data) => {
			console.log('Received game-start event from', socket.user.username);
			console.log('socket.gameRoomId:', socket.gameRoomId);

			// Security check: need at least 2 players
			if (!data.players || data.players.length < 2) {
				console.log('Game start rejected: not enough players');
				socket.emit('game-start-error', {
					error: 'Il faut au moins 2 joueurs pour commencer'
				});
				return;
			}

			const gameStartedData = {
				drawer: data.drawer,
				players: data.players
			};

			const roomId = socket.gameRoomId;

			// If no roomId, still start the game for this socket only
			if (!roomId) {
				console.log('WARNING: No roomId for socket, starting game for this socket only');
				socket.emit('game-started', gameStartedData);
				return;
			}

			// Verify player count from database
			const dbRoomId = socket.gameRoomDbId;
			if (dbRoomId) {
				try {
					const players = await gameRoomService.getRoomPlayers(dbRoomId);
					if (players.length < 2) {
						console.log(`Game start rejected: only ${players.length} player(s) in room`);
						socket.emit('game-start-error', {
							error: 'Il faut au moins 2 joueurs pour commencer'
						});
						return;
					}
				} catch (err) {
					console.error('Error checking player count:', err);
				}
			}

			// Update room status to 'playing' in database
			if (dbRoomId) {
				try {
					await gameRoomService.updateRoomStatus(dbRoomId, 'playing');
					console.log(`Room ${dbRoomId} status updated to 'playing'`);
				} catch (err) {
					console.error('Error updating room status to playing:', err);
				}
			}

			// Initialize scores for all players
			const scores = {};
			data.players.forEach(p => scores[p] = 0);

			const gameState = {
				isPlaying: true,
				currentWord: '',
				revealedLetters: [],
				drawer: data.drawer,
				players: data.players,
				currentPlayerIndex: 0,
				guessedLetters: [],
				scores: scores,
				roundStartScores: { ...scores }
			};
			gameRooms.set(roomId, gameState);

			// Emit to OTHER players in the room
			socket.to(roomId).emit('game-started', gameStartedData);

			// Emit directly to this socket (the one who started the game)
			socket.emit('game-started', gameStartedData);

			console.log(`Game started in ${roomId} by ${socket.user.username}`);

			// Broadcast updated rooms list (this room should no longer appear)
			broadcastRoomsList(io);
		});

		// Drawer sets the word
		socket.on('game-set-word', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			const gameState = gameRooms.get(roomId);
			if (!gameState) return;

			startRoomTimer(io, roomId, 60);
			gameState.currentWord = data.word.toLowerCase();
			gameState.revealedLetters = new Array(data.word.length).fill(false);
			gameState.revealedWord = new Array(data.word.length).fill('_');
			gameState.guessedLetters = [];
			gameState.wrongGuesses = 0;

			// Initialize scores if not already done
			if (!gameState.scores) {
				gameState.scores = {};
				gameState.players.forEach(p => gameState.scores[p] = 0);
			}

			// Notify all players (without revealing the word)
			io.to(roomId).emit('game-word-set', {
				wordLength: data.word.length,
				drawer: socket.user.username,
				revealedWord: gameState.revealedWord,
				scores: gameState.scores
			});
		});

		// Drawing data (real-time)
		socket.on('game-draw', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			// Spectators cannot draw
			if (socket.isSpectator) {
				console.log(`Spectator ${socket.user.username} tried to draw - blocked`);
				return;
			}

			// Broadcast drawing to all other players in the room
			socket.to(roomId).emit('game-draw', {
				x1: data.x1,
				y1: data.y1,
				x2: data.x2,
				y2: data.y2,
				color: data.color,
				lineWidth: data.lineWidth
			});
		});

		// Clear canvas
		socket.on('game-clear-canvas', () => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			// Spectators cannot clear canvas
			if (socket.isSpectator) return;

			socket.to(roomId).emit('game-clear-canvas');
		});

		// Player makes a guess
		socket.on('game-guess', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			// Spectators cannot make guesses
			if (socket.isSpectator) {
				console.log(`Spectator ${socket.user.username} tried to guess - blocked`);
				return;
			}


			const gameState = gameRooms.get(roomId);
			if (!gameState || !gameState.currentWord) return;

			const guess = data.guess.toLowerCase();
			const isLetter = guess.length === 1;
			let success = false;
			let points = 0;
			const username = socket.user.username;

			// Initialize scores if needed
			if (!gameState.scores) {
				gameState.scores = {};
				gameState.players.forEach(p => gameState.scores[p] = 0);
			}
			if (!gameState.scores[username]) {
				gameState.scores[username] = 0;
			}

			if (isLetter) {
				// Check if letter was already guessed
				if (gameState.guessedLetters.includes(guess)) {
					socket.emit('game-guess-result', {
						guess,
						success: false,
						type: 'letter',
						message: 'Lettre deja proposee',
						username: username,
						scores: gameState.scores
					});
					return;
				}

				gameState.guessedLetters.push(guess);

				// Check each position and reveal the actual letter
				let lettersFound = 0;
				for (let i = 0; i < gameState.currentWord.length; i++) {
					if (gameState.currentWord[i] === guess) {
						gameState.revealedLetters[i] = true;
						gameState.revealedWord[i] = guess;
						success = true;
						lettersFound++;
					}
				}

				// Points: 10 per letter found, -5 for wrong guess
				if (success) {
					points = lettersFound * 10;
					gameState.scores[username] += points;
				} else {
					points = -5;
					gameState.scores[username] += points;
					gameState.wrongGuesses++;
				}
			} else {
				// Full word guess
				success = guess === gameState.currentWord;
				if (success) {
					gameState.revealedLetters = gameState.revealedLetters.map(() => true);
					gameState.revealedWord = gameState.currentWord.split('');
					// Bonus points for guessing the whole word
					const remainingLetters = gameState.revealedLetters.filter(r => !r).length;
					points = 50 + (remainingLetters * 5);
					gameState.scores[username] += points;
				} else {
					points = -10;
					gameState.scores[username] += points;
					gameState.wrongGuesses++;
				}
			}

			// Broadcast result to all players with the revealed word (actual letters)
			io.to(roomId).emit('game-guess-result', {
				guess,
				success,
				type: isLetter ? 'letter' : 'word',
				username: username,
				revealedLetters: gameState.revealedLetters,
				revealedWord: gameState.revealedWord,
				points: points,
				scores: gameState.scores
			});

			// Check if word is complete
			if (gameState.revealedLetters.every(r => r)) {
				// Bonus points for the drawer
				const drawerBonus = Math.max(0, 30 - (gameState.wrongGuesses * 5));
				if (gameState.scores[gameState.drawer]) {
					gameState.scores[gameState.drawer] += drawerBonus;
				}

				// Save points to database for all players
				saveRoundPoints(gameState.scores, gameState.roundStartScores || {});
				// Update round start scores for next round
				gameState.roundStartScores = { ...gameState.scores };

				stopRoomTimer(roomId);

				io.to(roomId).emit('game-word-found', {
					word: gameState.currentWord,
					winner: username,
					scores: gameState.scores,
					drawerBonus: drawerBonus
				});
			}
		});

		// Next round
		socket.on('game-next-round', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			const gameState = gameRooms.get(roomId);
			if (!gameState) return;

			gameState.currentWord = '';
			gameState.revealedLetters = [];
			gameState.guessedLetters = [];
			gameState.drawer = data.drawer;

			io.to(roomId).emit('game-new-round', {
				drawer: data.drawer
			});
		});

		socket.on('leave-room-during-game', async () => {
			const roomId = socket.gameRoomId;
			const dbRoomId = socket.gameRoomDbId;
			const userId = socket.user.userId;
			const username = socket.user.username;

			if (!roomId || !dbRoomId || !userId) return;

			console.log(`Player ${username} leaving room ${roomId} during game`);

			try
			{
				socket.leave(roomId);

				await gameRoomService.leaveRoom(dbRoomId, userId);

				io.to(roomId).emit('game-player-left', {
					username: username,
					message: `${username} a quitté la partie`
				});

				const gameState = gameRooms.get(roomId);
				if (gameState)
				{
					const wasDrawer = gameState.drawer === username;
					
					gameState.players = gameState.players.filter(p => p !== username);
					delete gameState.scores[username];

					io.to(roomId).emit('scores-updated', gameState.scores);

					// If the drawer left and there are still enough players, choose a new drawer
					if (wasDrawer && gameState.players.length >= 1)
					{
						stopRoomTimer(roomId);
						// Pick the next player as the new drawer
						gameState.currentPlayerIndex = gameState.currentPlayerIndex % gameState.players.length;
						const newDrawer = gameState.players[gameState.currentPlayerIndex];
						gameState.drawer = newDrawer;
						
						// Reset the word state for the new round
						gameState.currentWord = '';
						gameState.revealedLetters = [];
						gameState.revealedWord = [];
						gameState.guessedLetters = [];
						gameState.wrongGuesses = 0;

						console.log(`Drawer ${username} left, new drawer is ${newDrawer}`);

						io.to(roomId).emit('game-drawer-changed', {
							newDrawer: newDrawer,
							reason: 'drawer_left',
							message: `${username} (dessinateur) a quitté, ${newDrawer} devient le nouveau dessinateur`
						});
						startRoomTimer(io, roomId, 60);
					}
				}

				await checkAndStopSinglePlayerGame(io, roomId, dbRoomId);

				socket.gameRoomId = null;
				socket.gameRoomDbId = null;

				broadcastRoomsList(io);
			}
			catch (err)
			{
				console.error('Error leaving room during game:', err);
			}
		});

		// End game
		socket.on('game-end', async () => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;
			stopRoomTimer(roomId);

			// Update room status to 'waiting' in database
			const dbRoomId = socket.gameRoomDbId;
			if (dbRoomId) {
				try {
					await gameRoomService.updateRoomStatus(dbRoomId, 'waiting');
					await gameRoomService.resetRoomScores(dbRoomId);
					console.log(`Room ${dbRoomId} status updated to 'waiting'`);
				} catch (err) {
					console.error('Error updating room status to waiting:', err);
				}
			}

			gameRooms.delete(roomId);
			io.to(roomId).emit('game-ended');

			// Broadcast updated rooms list
			broadcastRoomsList(io);
		});

		// ============================================
		// TETRIS DUEL EVENTS
		// ============================================

		socket.on('tetris:join', ({ roomCode }) => {
			const code = String(roomCode).toUpperCase().slice(0, 8);

			// Quitter l'ancienne room tetris si besoin
			if (socket.tetrisRoomCode) {
				_tetrisLeave(socket);
			}

			if (!tetrisRooms.has(code)) {
				tetrisRooms.set(code, new Map());
			}
			const room = tetrisRooms.get(code);

			if (room.size >= 2) {
				socket.emit('tetris:room-status', { status: 'full', players: [] });
				return;
			}

			room.set(socket.id, socket);
			socket.tetrisRoomCode = code;

			const players = [...room.values()].map(s => s.user.username);

			if (room.size === 1) {
				socket.emit('tetris:room-status', { status: 'waiting', players });
			} else {
				// Notifier les deux joueurs
				for (const s of room.values()) {
					s.emit('tetris:room-status', { status: 'ready', players });
				}
				// Notifier l'adversaire qu'un nouveau joueur a rejoint
				for (const [id, s] of room) {
					if (id !== socket.id) {
						s.emit('tetris:opponent-joined', { username: socket.user.username });
					}
				}
			}
		});

		socket.on('tetris:leave', () => {
			_tetrisLeave(socket);
		});

		// Relay pur : grid-update → adversaire uniquement
		socket.on('tetris:grid-update', (data) => {
			if (data.score !== undefined) socket.tetrisLastScore = data.score;
			_tetrisRelayToOpponent(socket, 'tetris:grid-update', data);
		});

		// Relay pur : lines-cleared → adversaire uniquement
		socket.on('tetris:lines-cleared', (data) => {
			_tetrisRelayToOpponent(socket, 'tetris:lines-cleared', data);
		});

		// Relay pur : shield-activated → adversaire uniquement
		socket.on('tetris:shield-activated', () => {
			_tetrisRelayToOpponent(socket, 'tetris:shield-activated', {});
		});

		// Relay pur : shield-deactivated → adversaire uniquement
		socket.on('tetris:shield-deactivated', () => {
			_tetrisRelayToOpponent(socket, 'tetris:shield-deactivated', {});
		});

		// start-duel → relayé aux DEUX joueurs de la room (inclut l'émetteur)
		socket.on('tetris:start-duel', () => {
			const code = socket.tetrisRoomCode;
			if (!code) return;
			const room = tetrisRooms.get(code);
			if (!room || room.size < 2) return;
			for (const s of room.values()) {
				s.emit('tetris:start-duel');
			}
		});

		// pause → relayé aux DEUX joueurs de la room
		socket.on('tetris:pause', () => {
			const code = socket.tetrisRoomCode;
			if (!code) return;
			const room = tetrisRooms.get(code);
			if (!room) return;
			for (const s of room.values()) {
				s.emit('tetris:pause');
			}
		});

		// stop → relayé aux DEUX joueurs de la room
		socket.on('tetris:stop', () => {
			const code = socket.tetrisRoomCode;
			if (!code) return;
			const room = tetrisRooms.get(code);
			if (!room) return;
			for (const s of room.values()) {
				s.emit('tetris:stop');
			}
		});

		// settings → relayé aux DEUX joueurs de la room
		socket.on('tetris:settings', (data) => {
			const code = socket.tetrisRoomCode;
			if (!code) return;
			const room = tetrisRooms.get(code);
			if (!room) return;
			for (const s of room.values()) {
				s.emit('tetris:settings', data);
			}
		});

		// game-over → save stats + relay opponent-game-over
		socket.on('tetris:game-over', async (data) => {
			const loserId = socket.user.userId;
			try {
				await playerStatsService.updateTetrisBestScore(loserId, data.score || 0);
				await playerStatsService.incrementTetrisGamesPlayed(loserId);
				await playerStatsService.addTetrisGameHistory(loserId, data.score || 0, 'duel', 'loss');
			} catch (err) {
				console.error('Error saving tetris loser stats:', err);
			}

			const code = socket.tetrisRoomCode;
			if (code) {
				const room = tetrisRooms.get(code);
				if (room) {
					for (const [id, s] of room) {
						if (id !== socket.id) {
							s.emit('tetris:opponent-game-over', data);
							try {
								await playerStatsService.incrementTetrisWins(s.user.userId);
								await playerStatsService.incrementTetrisGamesPlayed(s.user.userId);
								const winnerScore = s.tetrisLastScore || 0;
								await playerStatsService.addTetrisGameHistory(s.user.userId, winnerScore, 'duel', 'win');
							} catch (err) {
								console.error('Error saving tetris winner stats:', err);
							}
						}
					}
				}
			}
		});

		// Matchmaking
		socket.on('tetris:matchmaking-join', () => {
			// Remove from queue if already there
			const idx = tetrisMatchmakingQueue.findIndex(s => s.id === socket.id);
			if (idx !== -1) tetrisMatchmakingQueue.splice(idx, 1);

			tetrisMatchmakingQueue.push(socket);
			socket.emit('tetris:matchmaking-status', { status: 'searching', position: tetrisMatchmakingQueue.length });

			if (tetrisMatchmakingQueue.length >= 2) {
				const player1 = tetrisMatchmakingQueue.shift();
				const player2 = tetrisMatchmakingQueue.shift();
				const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
				player1.emit('tetris:matched', { roomCode, opponent: player2.user.username });
				player2.emit('tetris:matched', { roomCode, opponent: player1.user.username });
			}
		});

		socket.on('tetris:matchmaking-leave', () => {
			const idx = tetrisMatchmakingQueue.findIndex(s => s.id === socket.id);
			if (idx !== -1) tetrisMatchmakingQueue.splice(idx, 1);
			socket.emit('tetris:matchmaking-status', { status: 'idle' });
		});

		socket.on('disconnect', async () =>
		{
			// Nettoyage matchmaking tetris
			const mqIdx = tetrisMatchmakingQueue.findIndex(s => s.id === socket.id);
			if (mqIdx !== -1) tetrisMatchmakingQueue.splice(mqIdx, 1);

			// Nettoyage room tetris
			if (socket.tetrisRoomCode) {
				_tetrisLeave(socket);
			}

			console.log(`User disconnected: ${socket.user.username}`);

			// Notify game room if player/spectator was in one
			if (socket.gameRoomId) {
				const roomId = socket.gameRoomId;
				const dbRoomId = socket.gameRoomDbId;

				// If spectator, just notify and leave
				if (socket.isSpectator) {
					socket.to(roomId).emit('game-spectator-left', {
						username: socket.user.username
					});
					console.log(`Spectator ${socket.user.username} disconnected from ${roomId}`);
				}
				else
				{
					if (dbRoomId && socket.user.userId) {
						try {
							await gameRoomService.leaveRoom(dbRoomId, socket.user.userId);
						} catch (err) {
							console.error('Error removing disconnected player from room:', err.message);
						}
					}

					// Regular player disconnect
					socket.to(roomId).emit('game-player-left', {
						username: socket.user.username,
						userId: socket.user.userId
					});

					// Get updated player list and broadcast
					if (dbRoomId) {
						try {
							const players = await gameRoomService.getRoomPlayers(dbRoomId);
							io.to(roomId).emit('game-players-updated', { players });
						} catch (err) {
							console.log('Room may have been deleted on disconnect:', err.message);
						}
					}

					// Check if game should auto-stop due to single player
					await checkAndStopSinglePlayerGame(io, roomId, dbRoomId);

					// Broadcast updated rooms list
					broadcastRoomsList(io);
				}
			}
		});
	});
}

// ── Helpers tetris duel ──────────────────────────────────────────────────

function _tetrisLeave(socket)
{
	const code = socket.tetrisRoomCode;
	if (!code) return;
	const room = tetrisRooms.get(code);
	if (room) {
		room.delete(socket.id);
		// Notifier l'adversaire restant
		for (const s of room.values()) {
			s.emit('tetris:opponent-left');
			s.emit('tetris:room-status', { status: 'waiting', players: [s.user.username] });
		}
		if (room.size === 0) tetrisRooms.delete(code);
	}
	socket.tetrisRoomCode = null;
}

function _tetrisRelayToOpponent(socket, event, data) {
	const code = socket.tetrisRoomCode;
	if (!code) return;
	const room = tetrisRooms.get(code);
	if (!room) return;
	for (const [id, s] of room) {
		if (id !== socket.id) s.emit(event, data);
	}
}

export { broadcastRoomsList };
export default setupSocketIO;