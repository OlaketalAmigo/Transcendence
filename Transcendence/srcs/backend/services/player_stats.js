import { query } from '../db.js';

// Get player stats by user ID
async function getStatsByUserId(userId) {
	const result = await query(
		`SELECT id, username, avatar_url, total_points, games_played, games_won,
		        tetris_best_score, tetris_wins, tetris_games_played, created_at
		FROM users WHERE id = $1`,
		[userId]
	);
	return result.rows[0] || null;
}

// Get player stats by username
async function getStatsByUsername(username) {
	const result = await query(
		`SELECT id, username, avatar_url, total_points, games_played, games_won,
		        tetris_best_score, tetris_wins, tetris_games_played, created_at
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

// Update tetris best score (only if new score is higher)
async function updateTetrisBestScore(userId, score) {
	const result = await query(
		`UPDATE users SET tetris_best_score = GREATEST(COALESCE(tetris_best_score, 0), $1) WHERE id = $2 RETURNING tetris_best_score`,
		[score, userId]
	);
	return result.rows[0]?.tetris_best_score || 0;
}

// Increment tetris duel wins
async function incrementTetrisWins(userId) {
	await query(
		`UPDATE users SET tetris_wins = COALESCE(tetris_wins, 0) + 1 WHERE id = $1`,
		[userId]
	);
}

// Increment tetris games played
async function incrementTetrisGamesPlayed(userId) {
	await query(
		`UPDATE users SET tetris_games_played = COALESCE(tetris_games_played, 0) + 1 WHERE id = $1`,
		[userId]
	);
}

// Leaderboard: best tetris scores
async function getTetrisBestScoreLeaderboard(limit = 10) {
	const result = await query(
		`SELECT id, username, avatar_url, tetris_best_score, tetris_wins, tetris_games_played
		FROM users
		WHERE tetris_best_score > 0
		ORDER BY tetris_best_score DESC
		LIMIT $1`,
		[limit]
	);
	return result.rows;
}

// Leaderboard: most tetris duel wins
async function getTetrisDuelWinsLeaderboard(limit = 10) {
	const result = await query(
		`SELECT id, username, avatar_url, tetris_wins, tetris_games_played, tetris_best_score
		FROM users
		WHERE tetris_wins > 0
		ORDER BY tetris_wins DESC
		LIMIT $1`,
		[limit]
	);
	return result.rows;
}

// Rank of a user by tetris best score (1 = best)
async function getTetrisScoreRank(userId) {
	const result = await query(
		`SELECT COUNT(*) + 1 AS rank
		FROM users
		WHERE tetris_best_score > COALESCE((SELECT tetris_best_score FROM users WHERE id = $1), 0)`,
		[userId]
	);
	return parseInt(result.rows[0]?.rank || 1);
}

// Rank of a user by tetris duel wins (1 = best)
async function getTetrisDuelWinsRank(userId) {
	const result = await query(
		`SELECT COUNT(*) + 1 AS rank
		FROM users
		WHERE tetris_wins > COALESCE((SELECT tetris_wins FROM users WHERE id = $1), 0)`,
		[userId]
	);
	return parseInt(result.rows[0]?.rank || 1);
}

export default {
	getStatsByUserId,
	getStatsByUsername,
	addPoints,
	addPointsByUsername,
	incrementGamesPlayed,
	incrementGamesWon,
	getLeaderboard,
	getUserIdByUsername,
	updateTetrisBestScore,
	incrementTetrisWins,
	incrementTetrisGamesPlayed,
	getTetrisBestScoreLeaderboard,
	getTetrisDuelWinsLeaderboard,
	getTetrisScoreRank,
	getTetrisDuelWinsRank
};
