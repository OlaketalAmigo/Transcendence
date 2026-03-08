import express from 'express';
import playerStatsService from '../services/player_stats.js';
import authenticateToken from '../middleware/auth.js';
const router = express.Router();

// Get current user's stats
router.get('/me', authenticateToken, async (req, res) => {
	try {
		const stats = await playerStatsService.getStatsByUserId(req.user.userId);
		if (!stats) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json(stats);
	} catch (err) {
		console.error('Error getting user stats:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Get stats by username
router.get('/user/:username', authenticateToken, async (req, res) => {
	try {
		const stats = await playerStatsService.getStatsByUsername(req.params.username);
		if (!stats) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json(stats);
	} catch (err) {
		console.error('Error getting user stats:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Get general leaderboard
router.get('/leaderboard', authenticateToken, async (req, res) => {
	try {
		const limit = Math.min(parseInt(req.query.limit) || 10, 50);
		const leaderboard = await playerStatsService.getLeaderboard(limit);
		res.json(leaderboard);
	} catch (err) {
		console.error('Error getting leaderboard:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Save tetris score (solo or duel) — updates best score if higher
router.post('/tetris/score', authenticateToken, async (req, res) => {
	try {
		const { score } = req.body;
		if (typeof score !== 'number' || score < 0) {
			return res.status(400).json({ error: 'Invalid score' });
		}
		const bestScore = await playerStatsService.updateTetrisBestScore(req.user.userId, score);
		await playerStatsService.incrementTetrisGamesPlayed(req.user.userId);
		res.json({ bestScore });
	} catch (err) {
		console.error('Error saving tetris score:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Tetris best score leaderboard
router.get('/tetris/leaderboard/score', authenticateToken, async (req, res) => {
	try {
		const limit = Math.min(parseInt(req.query.limit) || 10, 50);
		const leaderboard = await playerStatsService.getTetrisBestScoreLeaderboard(limit);
		res.json(leaderboard);
	} catch (err) {
		console.error('Error getting tetris score leaderboard:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Tetris duel wins leaderboard
router.get('/tetris/leaderboard/wins', authenticateToken, async (req, res) => {
	try {
		const limit = Math.min(parseInt(req.query.limit) || 10, 50);
		const leaderboard = await playerStatsService.getTetrisDuelWinsLeaderboard(limit);
		res.json(leaderboard);
	} catch (err) {
		console.error('Error getting tetris wins leaderboard:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Current user's rank by tetris best score
router.get('/tetris/rank/score', authenticateToken, async (req, res) => {
	try {
		const rank = await playerStatsService.getTetrisScoreRank(req.user.userId);
		res.json({ rank });
	} catch (err) {
		console.error('Error getting tetris score rank:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

// Current user's rank by tetris duel wins
router.get('/tetris/rank/wins', authenticateToken, async (req, res) => {
	try {
		const rank = await playerStatsService.getTetrisDuelWinsRank(req.user.userId);
		res.json({ rank });
	} catch (err) {
		console.error('Error getting tetris wins rank:', err);
		res.status(500).json({ error: 'Server error' });
	}
});

export default router;
