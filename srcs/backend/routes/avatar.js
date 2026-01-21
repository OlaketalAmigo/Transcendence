import express from 'express';
import multer from 'multer';
import avatarService from '../services/avatar.js';
import authenticateToken from '../middleware/auth.js';

const router = express.Router();

// Configue multer to use RAM
const storage = multer.memoryStorage();
const upload = multer
({ 
	storage: storage,
	limits:
	{
		fileSize: 5 * 1024 * 1024 // 5mb
	}
});

router.post('/upload', authenticateToken, upload.single('avatar'), async(req, res) =>
{
	if (!req.file)
		return res.status(400).json({ error: 'No file uploaded' });

	const result = await avatarService.uploadAvatar(req.user.userId, req.file);
	res.status(result.status).json(result.data);
});

router.delete('/', authenticateToken, async(req, res) =>
{
	const result = await avatarService.deleteAvatar(req.user.userId);
	res.status(result.status).json(result.data);
});

router.get('/me', authenticateToken, async(req, res) =>
{
	const result = await avatarService.getAvatarUrl(req.user.userId);
	res.status(result.status).json(result.data);
});

router.get('/user/:userId', async(req, res) =>
{
	const userId = parseInt(req.params.userId);
	if (isNaN(userId))
		return res.status(400).json({ error: 'Invalid user ID' });

	const result = await avatarService.getAvatarUrl(userId);
	res.status(result.status).json(result.data);
});

export default router;
