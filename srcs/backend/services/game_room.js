import {query} from '../db.js';

// Creer la room avec comme seul parametre le nom
// max_players, status et ses autres variables sont aux valeurs definis dans db.js
async function createRoom(name)
{
	const result = await query
	(
		`INSERT INTO game_rooms (name) VALUES ($1) RETURNING *`,
		[name]
	);
	return (result.rows[0]);
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

//Liste toutes les rooms en attente
//ainsi que le nombre de joueurs dans chaque room
//utile pour montrer toutes les rooms joignables
async function listActiveRooms()
{
	const result = await query
	(
		`SELECT r.*, COUNT(p.id) as player_count
		FROM game_rooms r
		LEFT JOIN game_players p ON r.id = p.room_id
		WHERE r.status = 'waiting'
		GROUP BY r.id
		ORDER BY r.created_at DESC`
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

//Renvoie la liste des joueurs trie selon leur score
//Cette liste donne egalement l'info sur qui dessine actuellement
//Utile pour le jeu en lui meme et le scoreboard de la game
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