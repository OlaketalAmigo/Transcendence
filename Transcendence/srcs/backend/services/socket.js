import jwt from 'jsonwebtoken';
import chatService from './global_chat.js';
import friendsService from './friends.js';
import gameRoomService from './game_room.js';
import playerStatsService from './player_stats.js';

// Store game state per room
const gameRooms = new Map();

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
					players: gameState.players
				});
			}
		});

		// Leave a game room
		socket.on('game-leave-room', async () => {
			if (socket.gameRoomId) {
				const roomId = socket.gameRoomId;
				const dbRoomId = socket.gameRoomDbId;

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

				// Broadcast updated rooms list
				broadcastRoomsList(io);
			}
		});

		// Start the game
		socket.on('game-start', (data) => {
			console.log('Received game-start event from', socket.user.username);
			console.log('socket.gameRoomId:', socket.gameRoomId);

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
		});

		// Drawer sets the word
		socket.on('game-set-word', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			const gameState = gameRooms.get(roomId);
			if (!gameState) return;

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

			socket.to(roomId).emit('game-clear-canvas');
		});

		// Player makes a guess
		socket.on('game-guess', (data) => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

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

		// End game
		socket.on('game-end', () => {
			const roomId = socket.gameRoomId;
			if (!roomId) return;

			gameRooms.delete(roomId);
			io.to(roomId).emit('game-ended');
		});

		socket.on('disconnect', async () =>
		{
			console.log(`User disconnected: ${socket.user.username}`);

			// Notify game room if player was in one
			if (socket.gameRoomId) {
				const roomId = socket.gameRoomId;
				const dbRoomId = socket.gameRoomDbId;

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

				// Broadcast updated rooms list
				broadcastRoomsList(io);
			}
		});
	});
}

export { broadcastRoomsList };
export default setupSocketIO;