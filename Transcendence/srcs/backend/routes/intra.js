// routes/intra.js
import express from 'express';

const router = express.Router();

let token;

async function set_token() {
    try {
        const response = await fetch("https://api.intra.42.fr/oauth/token", {
            method: "POST",
            body: new URLSearchParams({
                grant_type: "client_credentials",
                client_id: process.env.INTRA_CLIENT_ID,
                client_secret: process.env.INTRA_CLIENT_SECRET
            }),
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });

        token = await response.json();

        setTimeout(set_token, (token.expires_in - 60) * 1000);
    } catch (e) {
        console.error("Token error:", e);
    }
}
set_token();


router.get('/profile/:login', async (req, res) => {
    try {
        const response = await fetch(
            `https://api.intra.42.fr/v2/users/${req.params.login}`,
            {
                headers: {
                    Authorization: `Bearer ${token.access_token}`
                }
            }
        );

        if (!response.ok) {
            return res.status(response.status).json({ error: 'User not found' });
        }

        res.json(await response.json());
    } catch (e) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

export default router;