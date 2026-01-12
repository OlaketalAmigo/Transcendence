const {query} = require('../db');

async function saveMessage(userId, content)
{
	const result = await query
	(
		'INSERT INTO messages (sender_id, content) VALUES ($1 ,$2) RETURNING *',
		[userId, content]
	);
	return (result.rows[0]);
}

async function getRecentMessages(limit = 50)
{
	const result = await query
	(
		`SELECT m.sender_id, m.content, m.created_at, u.username
		FROM messages m
		JOIN users u ON m.sender_id = u.id
		ORDER BY m.created_at DESC
		LIMIT $1`,
		[limit]
	);
	return (result.rows.reverse());
}

module.exports = 
{
	saveMessage,
	getRecentMessages
};