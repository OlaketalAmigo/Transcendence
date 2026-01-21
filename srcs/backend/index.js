import express from 'express';
import http from 'http';
import cors from 'cors';
import {Server} from 'socket.io';
import authRouter from './routes/auth.js';
import chatRouter from './routes/global_chat.js';
import gameRoomRouter from './routes/game_room.js';
import avatarRouter from './routes/avatar.js';
import {waitForDb, createTables, ensureOauthClient} from './db.js';
import setupSocketIO from './services/socket.js';
import avatarService from './services/avatar.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server,
{
	cors:
	{
		origin: "*",
		methods: ["GET", "POST"]
	}
});

app.use(cors());
app.use(express.json());

setupSocketIO(io);

async function startServer()
{
	await waitForDb();
	await createTables();

	// Ensure GitHub OAuth client is registered in DB
	try {
		await ensureOauthClient('github', process.env.GITHUB_CLIENT_ID, process.env.GITHUB_CLIENT_SECRET, process.env.GITHUB_CALLBACK_URL || process.env.GITHUB_REDIRECT_URI);
	} catch (e) {
		console.warn('OAuth client might already exist or failed to register:', e.message);
	}

	app.use('/avatar', express.static(avatarService.AVATAR_DIR));
	app.use('/api/auth', authRouter);
	app.use('/api/global_chat', chatRouter);
	app.use('/api/rooms', gameRoomRouter);
	app.use('/api/avatar', avatarRouter);
	app.get('/api', (req, res) => res.send('Backend running'));

	server.listen(3001, () =>
	{
		console.log('Server ready and listening');
	});
}

startServer();
