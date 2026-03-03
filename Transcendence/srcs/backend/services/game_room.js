import {query} from '../db.js';

// Create the room with name as the only parameter
// max_players, status and the other variables have their default values defined in db.js
async function createRoom(name, userId)
{
	const result = await query
	(
		`INSERT INTO game_rooms (name) VALUES ($1) RETURNING *`,
		[name]
	);
	const room = result.rows[0];

	await query
	(
		'INSERT INTO game_players (room_id, user_id) VALUES ($1, $2)',
		[room.id, userId]
	);
	return (room);
}

async function getRoomById(roomId)
{
	const result = await query
	(
		'SELECT * FROM game_rooms WHERE id = $1',
		[roomId]
	);
	return (result.rows[0]);
}

// List all the waiting rooms and the player amount in each of them
async function listActiveRooms()
{
	const result = await query
	(
		`SELECT r.*, COUNT(p.id) as player_count
		FROM game_rooms r
		LEFT JOIN game_players p ON r.id = p.room_id
		WHERE r.status = 'waiting'
		GROUP BY r.id
		ORDER BY player_count DESC, r.created_at DESC`
	);
	return (result.rows);
}

async function listPlayingRooms()
{
	const result = await query
	(
		`SELECT r.*, COUNT(p.id) as player_count
		FROM game_rooms r
		LEFT JOIN game_players p ON r.id = p.room_id
		WHERE r.status = 'playing'
		GROUP BY r.id
		ORDER BY player_count DESC, r.created_at DESC`
	);
	return (result.rows);
}

async function spectateRoom(roomId, userId)
{
	const room = await getRoomById(roomId);
	if (!room)
		throw new Error('Room not found');

	if (room.status !== 'playing')
		throw new Error('Room is not in playing status');

	// Check if user is already a player in any active game
	const playerInGame = await query
	(
		`SELECT r.id, r.name, r.status 
		FROM game_rooms r
		JOIN game_players gp ON r.id = gp.room_id
		WHERE gp.user_id = $1 AND r.status IN ('waiting', 'playing')
		LIMIT 1`,
		[userId]
	);

	if (playerInGame.rows.length > 0)
	{
		const gameRoom = playerInGame.rows[0];
		if (gameRoom.id === parseInt(roomId))
			throw new Error('You cannot spectate a game you are playing in');
		else
			throw new Error('You are already in an active game');
	}

	return (room);
}

async function leaveSpectateRoom(roomId, userId)
{
	const playerCount = await query
	(
		'SELECT COUNT(*) FROM game_players WHERE room_id = $1',
		[roomId]
	);

	if (parseInt(playerCount.rows[0].count) === 0)
	{
		await query
		(
			'DELETE FROM game_rooms WHERE id = $1',
			[roomId]
		);
	}
}


async function joinRoom(roomId, userId)
{
	const room = await getRoomById(roomId);
	if (!room)
		throw new Error('Room not found');

	const playerCount = await query
	(
		'SELECT COUNT(*) FROM game_players WHERE room_id = $1',
		[roomId]
	);

	if (parseInt(playerCount.rows[0].count) >= 8)
			throw new Error('Room is full');
	if (room.status !== 'waiting')
			throw new Error('Game already started or ended');
	const result = await query
	(
		'INSERT INTO game_players (room_id, user_id) VALUES ($1, $2) RETURNING *',
		[roomId, userId]
	);
	return (result.rows[0]);
}

async function leaveRoom(roomId, userId)
{
	await query
	(
		'DELETE FROM game_players WHERE room_id = $1 AND user_id = $2',
		[roomId, userId]
	);

	const playerCount = await query
	(
		'SELECT COUNT(*) FROM game_players WHERE room_id = $1',
		[roomId]
	);
	
	if (parseInt(playerCount.rows[0].count) === 0)
	{
		await query
		(
			'DELETE FROM game_rooms WHERE id = $1',
			[roomId]
		);
	}
}

// List the players in the room and their scores
// Useful for the scoreboard and also tell which player is currently drawing
async function getRoomPlayers(roomId)
{
	const result = await query
	(
		`SELECT gp.*, u.username, u.avatar_url, u.total_points, u.games_played, u.games_won
		FROM game_players gp
		JOIN users u ON gp.user_id = u.id
		WHERE gp.room_id = $1
		ORDER BY gp.score DESC`,
		[roomId]
	);
	return (result.rows);
}

// Get the current room of a user (if any)
async function getCurrentRoom(userId)
{
	const result = await query
	(
		`SELECT r.*
		FROM game_rooms r
		JOIN game_players gp ON r.id = gp.room_id
		WHERE gp.user_id = $1 AND r.status = 'waiting'
		LIMIT 1`,
		[userId]
	);
	return (result.rows[0] || null);
}

// Update room status (waiting, playing, ended)
async function updateRoomStatus(roomId, status)
{
	const validStatuses = ['waiting', 'playing', 'ended'];
	if (!validStatuses.includes(status))
		throw new Error('Invalid status');

	let updateQuery = 'UPDATE game_rooms SET status = $1';
	const params = [status, roomId];

	if (status === 'playing')
	{
		updateQuery += ', started_at = NOW()';
	}
	else if (status === 'ended')
	{
		updateQuery += ', ended_at = NOW()';
	}

	updateQuery += ' WHERE id = $2 RETURNING *';

	const result = await query(updateQuery, params);
	return (result.rows[0]);
}

async function resetRoomScores(roomId)
{
	await query
	(
		'UPDATE game_players SET score = 0 WHERE room_id = $1',
		[roomId]
	);
}

async function cleanupEndedRooms()
{
	await query
	(
		'DELETE FROM game_players WHERE room_id IN (SELECT id FROM game_rooms WHERE status = $1)',
		['ended']
	);

	await query
	(
		'DELETE FROM game_rooms WHERE status = $1',
		['ended']
	);
}

export default
{
	createRoom,
	getRoomById,
	listActiveRooms,
	listPlayingRooms,
	spectateRoom,
	leaveSpectateRoom,
	joinRoom,
	leaveRoom,
	getRoomPlayers,
	getCurrentRoom,
	updateRoomStatus,
	resetRoomScores,
	cleanupEndedRooms
};
