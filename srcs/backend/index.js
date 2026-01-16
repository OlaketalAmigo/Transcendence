const express = require('express');
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/global_chat');
const {waitForDb, createTables, ensureOauthClient} = require('./db');
const setupSocketIO = require('./services/socket');

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

	app.use('/api/auth', authRouter);
	app.use('/api/global_chat', chatRouter);
	app.get('/api', (req, res) => res.send('Backend running'));

	server.listen(3001, () =>
	{
		console.log('Server ready and listening');
	});
}

startServer();
