const express = require('express');
const http = require('http');
const cors = require('cors');
const {Server} = require('socket.io');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/global_chat');
const {waitForDb, createTables} = require('./db');
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

	app.use('/api/auth', authRouter);
	app.use('/api/global_chat', chatRouter);
	app.get('/api', (req, res) => res.send('Backend running'));

	server.listen(3001, () =>
	{
		console.log('Server ready and listening');
	});
}

startServer();