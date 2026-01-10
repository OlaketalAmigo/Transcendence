const express = require('express');
const router = express.Router();
const authService = require('../services/auth');

router.post('/register', async(req, res) =>
{
	const {username, password} = req.body;
	if (!username || !password)
		return (res.status(400).json({error: 'Missing fields'}));

	const result = await authService.register(username, password);
	res.status(result.status).json(result.data);
});

router.post('/login', async(req, res) =>
{
	const {username, password} = req.body;
	const result = await authService.login(username, password);
	res.status(result.status).json(result.data);
});

module.exports = router;