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

// Get leaderboard
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

export default router;
