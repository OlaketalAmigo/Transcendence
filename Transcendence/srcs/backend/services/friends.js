import { query } from '../db.js';

/**
 * Get list of friends for a user
 */
async function getFriends(userId) {
    try {
        const result = await query(
            `SELECT u.id, u.username, u.avatar_url, u.total_points, u.games_played, u.games_won
             FROM friendship f
             JOIN users u ON (
                 CASE
                     WHEN f.id_user1 = $1 THEN f.id_user2 = u.id
                     ELSE f.id_user1 = u.id
                 END
             )
             WHERE (f.id_user1 = $1 OR f.id_user2 = $1)
             AND f.status = 'accepted'`,
            [userId]
        );
        return { status: 200, data: { friends: result.rows } };
    } catch (err) {
        console.error('Get friends error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Get pending friend requests received by user
 */
async function getPendingRequests(userId) {
    try {
        const result = await query(
            `SELECT u.id, u.username, u.avatar_url, f.created_at
             FROM friendship f
             JOIN users u ON (
                 CASE
                     WHEN f.id_user1 = $1 THEN f.id_user2 = u.id
                     ELSE f.id_user1 = u.id
                 END
             )
             WHERE (f.id_user1 = $1 OR f.id_user2 = $1)
             AND f.status = 'pending_' || $1::text`,
            [userId]
        );
        return { status: 200, data: { requests: result.rows } };
    } catch (err) {
        console.error('Get pending requests error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Search users by username
 */
async function searchUsers(userId, searchTerm) {
    try {
        const result = await query(
            `SELECT id, username, avatar_url
             FROM users
             WHERE username ILIKE $1
             AND id != $2
             LIMIT 20`,
            [`%${searchTerm}%`, userId]
        );
        return { status: 200, data: { users: result.rows } };
    } catch (err) {
        console.error('Search users error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Send a friend request
 */
async function sendFriendRequest(fromUserId, toUserId) {
    try {
        if (fromUserId === toUserId) {
            return { status: 400, data: { error: 'Cannot add yourself as friend' } };
        }

        // Check if user exists
        const userCheck = await query('SELECT id FROM users WHERE id = $1', [toUserId]);
        if (userCheck.rows.length === 0) {
            return { status: 404, data: { error: 'User not found' } };
        }

        // Ensure id_user1 < id_user2 for the constraint
        const id1 = Math.min(fromUserId, toUserId);
        const id2 = Math.max(fromUserId, toUserId);

        // Check existing friendship
        const existing = await query(
            'SELECT status FROM friendship WHERE id_user1 = $1 AND id_user2 = $2',
            [id1, id2]
        );

        if (existing.rows.length > 0) {
            const status = existing.rows[0].status;
            if (status === 'accepted') {
                return { status: 400, data: { error: 'Already friends' } };
            }
            if (status.startsWith('pending_')) {
                return { status: 400, data: { error: 'Friend request already exists' } };
            }
        }

        // Status indicates who needs to accept: pending_<receiver_id>
        const status = `pending_${toUserId}`;

        await query(
            `INSERT INTO friendship (id_user1, id_user2, status)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_user1, id_user2)
             DO UPDATE SET status = $3`,
            [id1, id2, status]
        );

        return { status: 200, data: { message: 'Friend request sent' } };
    } catch (err) {
        console.error('Send friend request error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Accept a friend request
 */
async function acceptFriendRequest(userId, fromUserId) {
    try {
        const id1 = Math.min(userId, fromUserId);
        const id2 = Math.max(userId, fromUserId);

        const result = await query(
            `UPDATE friendship
             SET status = 'accepted'
             WHERE id_user1 = $1 AND id_user2 = $2
             AND status = $3
             RETURNING *`,
            [id1, id2, `pending_${userId}`]
        );

        if (result.rows.length === 0) {
            return { status: 404, data: { error: 'Friend request not found' } };
        }

        return { status: 200, data: { message: 'Friend request accepted' } };
    } catch (err) {
        console.error('Accept friend request error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Decline a friend request
 */
async function declineFriendRequest(userId, fromUserId) {
    try {
        const id1 = Math.min(userId, fromUserId);
        const id2 = Math.max(userId, fromUserId);

        const result = await query(
            `DELETE FROM friendship
             WHERE id_user1 = $1 AND id_user2 = $2
             AND status = $3
             RETURNING *`,
            [id1, id2, `pending_${userId}`]
        );

        if (result.rows.length === 0) {
            return { status: 404, data: { error: 'Friend request not found' } };
        }

        return { status: 200, data: { message: 'Friend request declined' } };
    } catch (err) {
        console.error('Decline friend request error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

/**
 * Get list of friend IDs for a user (for quick lookup)
 */
async function getFriendIds(userId) {
    try {
        const result = await query(
            `SELECT
                CASE
                    WHEN f.id_user1 = $1 THEN f.id_user2
                    ELSE f.id_user1
                END as friend_id
             FROM friendship f
             WHERE (f.id_user1 = $1 OR f.id_user2 = $1)
             AND f.status = 'accepted'`,
            [userId]
        );
        return result.rows.map(row => row.friend_id);
    } catch (err) {
        console.error('Get friend IDs error:', err);
        return [];
    }
}

/**
 * Remove a friend
 */
async function removeFriend(userId, friendId) {
    try {
        const id1 = Math.min(userId, friendId);
        const id2 = Math.max(userId, friendId);

        const result = await query(
            `DELETE FROM friendship
             WHERE id_user1 = $1 AND id_user2 = $2
             AND status = 'accepted'
             RETURNING *`,
            [id1, id2]
        );

        if (result.rows.length === 0) {
            return { status: 404, data: { error: 'Friendship not found' } };
        }

        return { status: 200, data: { message: 'Friend removed' } };
    } catch (err) {
        console.error('Remove friend error:', err);
        return { status: 500, data: { error: 'Server error' } };
    }
}

export default {
    getFriends,
    getFriendIds,
    getPendingRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    removeFriend
};
