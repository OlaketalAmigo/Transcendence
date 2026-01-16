import express from 'express';
import authService from '../services/auth.js';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {query} from '../db.js';
import crypto from 'crypto';

const router = express.Router();

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
    `redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL || process.env.GITHUB_REDIRECT_URI)}&` +
    `scope=user:email`;

  res.redirect(githubAuthUrl);
});

router.get('/github/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing code');
  }
  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code
      })
    });
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) throw new Error('No access token');

  
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'User-Agent': 'Transcendence' }
    });
    const ghUser = await userResponse.json();
    const ghUsername = ghUser.login || `github_${ghUser.id}`;


    let result = await query(`SELECT id FROM users WHERE username = $1`, [ghUsername]);
    let userId;
    if (result.rows.length > 0) {
      userId = result.rows[0].id;
    } else {
      const randomPwd = crypto.randomBytes(16).toString('hex');
      const passwordHash = await bcrypt.hash(randomPwd, 10);
      await query(`INSERT INTO users (username, password_hash) VALUES ($1, $2)`, [ghUsername, passwordHash]);
      const inserted = await query(`SELECT id FROM users WHERE username = $1`, [ghUsername]);
      userId = inserted.rows[0].id;
    }

    // Issue JWT
    const token = jwt.sign({ userId: userId, username: ghUsername }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token to opener window and close popup
    res.send(`<!doctype html><html><body><script>window.opener && window.opener.postMessage({token: '${token}'}, '*'); window.close();</script></body></html>`);
  } catch (err) {
    console.error(err);
    res.status(500).send('GitHub OAuth error');
  }
});

export default router;
