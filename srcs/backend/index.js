require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool
({
	user: process.env.POSTGRES_USER,
	host: process.env.POSTGRES_HOST,
	database: process.env.POSTGRES_DB,
	password: process.env.POSTGRES_PASSWORD,
	port: 5432,
});

async function waitForDb(retries = 10, delay = 2000)
{
	for (let i = 0; i < retries; i++)
	{
		try
		{
			await pool.query('SELECT 1');
			console.log('Database is ready!');
			return ;
		}
		catch (err)
		{
			await new Promise(r =>  setTimeout(r, delay));
		}
	}
	throw new Error('Could not connect to database after multiple attempts');
}

async function createTables()
{
	try
	{
		await pool.query(`
			CREATE TABLE IF NOT EXISTS users (
				id SERIAL PRIMARY KEY,
				username VARCHAR(50) UNIQUE NOT NULL,
				email VARCHAR(100),
				created_at TIMESTAMP DEFAULT NOW()
			);
			
			CREATE TABLE IF NOT EXISTS messages(
				id SERIAL PRIMARY KEY,
				sender_id INT REFERENCES users(id),
				received_id INT REFERENCES users(id),
				content TEXT,
				created_at TIMESTAMP DEFAULT NOW()
			);

			CREATE TABLE IF NOT EXISTS friendship (
				id_user1 INT NOT NULL,
				id_user2 INT NOT NULL,
				status VARCHAR(20) NOT NULL,
				created_at TIMESTAMP DEFAULT NOW(),
				CHECK (id_user1 < id_user2),
				PRIMARY KEY (id_user1, id_user2),
				FOREIGN KEY (id_user1) REFERENCES users(id) ON DELETE CASCADE,
				FOREIGN KEY (id_user2) REFERENCES users(id) ON DELETE CASCADE
			);
		`);
		console.log('Tables created!');
	}
	catch (err)
	{
		console.error('Error creating tables:', err);
	}
}

const express = require('express');
const app = express();

async function startServer()
{
	await waitForDb();

	await createTables();

	app.get('/', (req, res) => res.send('Backend running'));

	app.listen(3001, () =>
	{
		console.log('Server ready and listening');
	});
}

startServer();