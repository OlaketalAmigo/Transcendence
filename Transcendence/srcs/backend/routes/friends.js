import express from 'express';
import friendsService from '../services/friends.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Get friends list
router.get('/', authenticateToken, async (req, res) => {
    const result = await friendsService.getFriends(req.user.userId);
    res.status(result.status).json(result.data);
});

// Get pending friend requests
router.get('/requests', authenticateToken, async (req, res) => {
    const result = await friendsService.getPendingRequests(req.user.userId);
    res.status(result.status).json(result.data);
});

// Search users
router.get('/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
        return res.status(400).json({ error: 'Search query required' });
    }
    const result = await friendsService.searchUsers(req.user.userId, q.trim());
    res.status(result.status).json(result.data);
});

// Send friend request
router.post('/request/:userId', authenticateToken, async (req, res) => {
    const toUserId = parseInt(req.params.userId);
    if (isNaN(toUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const result = await friendsService.sendFriendRequest(req.user.userId, toUserId);
    res.status(result.status).json(result.data);
});

// Accept friend request
router.post('/accept/:userId', authenticateToken, async (req, res) => {
    const fromUserId = parseInt(req.params.userId);
    if (isNaN(fromUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const result = await friendsService.acceptFriendRequest(req.user.userId, fromUserId);
    res.status(result.status).json(result.data);
});

// Decline friend request
router.post('/decline/:userId', authenticateToken, async (req, res) => {
    const fromUserId = parseInt(req.params.userId);
    if (isNaN(fromUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const result = await friendsService.declineFriendRequest(req.user.userId, fromUserId);
    res.status(result.status).json(result.data);
});

// Remove friend
router.delete('/:userId', authenticateToken, async (req, res) => {
    const friendId = parseInt(req.params.userId);
    if (isNaN(friendId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    const result = await friendsService.removeFriend(req.user.userId, friendId);
    res.status(result.status).json(result.data);
});

export default router;
