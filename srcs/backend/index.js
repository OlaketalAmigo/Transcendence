const express = require('express');
const authRouter = require('./routes/auth');
const {waitForDb, createTables} = require('./db');

const app = express();

app.use(express.json());

async function startServer()
{
	await waitForDb();
	await createTables();

	app.use('/api/auth', authRouter);
	app.get('/api/', (req, res) => res.send('Backend running'));

	app.listen(3001, () =>
	{
		console.log('Server ready and listening');
	});
}

startServer();