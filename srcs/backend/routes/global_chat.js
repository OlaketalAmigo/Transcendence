const express = require('express');
const router = express.Router();
const chatService = require('../services/global_chat');
const authenticateToken = require('../middleware/auth');

router.get('/messages', authenticateToken, async(req, res) =>
{
	try
	{
		const messages = await chatService.getRecentMessages(50);
		res.json(messages);
	}
	catch(err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

module.exports = router;