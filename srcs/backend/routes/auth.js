const express = require('express');
const router = express.Router();
const authService = require('../services/auth');
const fetch = require('node-fetch');

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
	console.log("received login!");
	const {username, password} = req.body;
	const result = await authService.login(username, password);
	res.status(result.status).json(result.data);
});

router.get('/github', (req, res) => {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GITHUB_REDIRECT_URI)}&` +
    `scope=user:email`;

  res.redirect(githubAuthUrl);
});

module.exports = router;