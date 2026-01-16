import express from 'express';
import chatService from '../services/global_chat.js';
import authenticateToken from '../middleware/auth.js';
const router = express.Router();

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

export default router;