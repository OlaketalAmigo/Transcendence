import { query } from '../db.js';

// Get player stats by user ID
async function getStatsByUserId(userId) {
	const result = await query(
		`SELECT id, username, avatar_url, total_points, games_played, games_won, created_at
		FROM users WHERE id = $1`,
		[userId]
	);
	return result.rows[0] || null;
}

// Get player stats by username
async function getStatsByUsername(username) {
	const result = await query(
		`SELECT id, username, avatar_url, total_points, games_played, games_won, created_at
		FROM users WHERE username = $1`,
		[username]
	);
	return result.rows[0] || null;
}

// Update player points (add points to total)
async function addPoints(userId, points) {
	const result = await query(
		`UPDATE users SET total_points = COALESCE(total_points, 0) + $1 WHERE id = $2 RETURNING total_points`,
		[points, userId]
	);
	return result.rows[0]?.total_points || 0;
}

// Update player points by username
async function addPointsByUsername(username, points) {
	const result = await query(
		`UPDATE users SET total_points = COALESCE(total_points, 0) + $1 WHERE username = $2 RETURNING total_points`,
		[points, username]
	);
	return result.rows[0]?.total_points || 0;
}

// Increment games played
async function incrementGamesPlayed(userId) {
	await query(
		`UPDATE users SET games_played = COALESCE(games_played, 0) + 1 WHERE id = $1`,
		[userId]
	);
}

// Increment games won
async function incrementGamesWon(userId) {
	await query(
		`UPDATE users SET games_won = COALESCE(games_won, 0) + 1 WHERE id = $1`,
		[userId]
	);
}

// Get leaderboard (top players by points)
async function getLeaderboard(limit = 10) {
	const result = await query(
		`SELECT id, username, avatar_url, total_points, games_played, games_won
		FROM users
		WHERE total_points > 0
		ORDER BY total_points DESC
		LIMIT $1`,
		[limit]
	);
	return result.rows;
}

// Get user ID by username
async function getUserIdByUsername(username) {
	const result = await query(
		`SELECT id FROM users WHERE username = $1`,
		[username]
	);
	return result.rows[0]?.id || null;
}

export default {
	getStatsByUserId,
	getStatsByUsername,
	addPoints,
	addPointsByUsername,
	incrementGamesPlayed,
	incrementGamesWon,
	getLeaderboard,
	getUserIdByUsername
};
