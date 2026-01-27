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
		`SELECT gp.*, u.username
		FROM game_players gp
		JOIN users u ON gp.user_id = u.id
		WHERE gp.room_id = $1
		ORDER BY gp.score DESC`,
		[roomId]
	);
	return (result.rows);
}

export default
{
	createRoom,
	getRoomById,
	listActiveRooms,
	joinRoom,
	leaveRoom,
	getRoomPlayers
};