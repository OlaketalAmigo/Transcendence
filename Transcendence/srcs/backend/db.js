import 'dotenv/config';
import { Pool } from 'pg';

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
				password_hash TEXT NOT NULL,
				email VARCHAR(100),
				avatar_url TEXT DEFAULT '/avatar/default.png',
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
			
			CREATE TABLE IF NOT EXISTS oauth_clients (
				id SERIAL PRIMARY KEY,
				provider VARCHAR(50) NOT NULL,
				client_id VARCHAR(200) NOT NULL,
				client_secret TEXT,
				redirect_uri VARCHAR(255),
				created_at TIMESTAMP DEFAULT NOW(),
				UNIQUE(provider, client_id)
			);

			CREATE TABLE IF NOT EXISTS game_rooms (
				id SERIAL PRIMARY KEY,
				name VARCHAR(100) NOT NULL,
				status VARCHAR(20) DEFAULT 'waiting',
				max_players INT DEFAULT 8,
				current_round INT DEFAULT 0,
				max_rounds INT DEFAULT 3,
				round_duration INT DEFAULT 90,
				created_at TIMESTAMP DEFAULT NOW(),
				started_at TIMESTAMP,
				ended_at TIMESTAMP
			);

			CREATE TABLE IF NOT EXISTS game_players (
				id SERIAL PRIMARY KEY,
				room_id INT REFERENCES game_rooms(id) ON DELETE CASCADE,
				user_id INT REFERENCES users(id) ON DELETE CASCADE,
				score INT DEFAULT 0,
				is_drawing BOOLEAN DEFAULT FALSE,
				joined_at TIMESTAMP DEFAULT NOW(),
				UNIQUE(room_id, user_id)
			);

			CREATE TABLE IF NOT EXISTS words (
				id SERIAL PRIMARY KEY,
				word VARCHAR(50) NOT NULL UNIQUE
			);

			CREATE TABLE IF NOT EXISTS game_rounds (
				id SERIAL PRIMARY KEY,
				room_id INT REFERENCES game_rooms(id) ON DELETE CASCADE,
				round_number INT NOT NULL,
				word_id INT REFERENCES words(id),
				drawer_id INT REFERENCES users(id),
				started_at TIMESTAMP DEFAULT NOW(),
				ended_at TIMESTAMP
			);
		`);
		console.log('Tables created!');
	}
	catch (err)
	{
		console.error('Error creating tables:', err);
	}
}

async function query(text, params)
{
	return (pool.query(text, params));
}

async function ensureOauthClient(provider, client_id, client_secret, redirect_uri)
{
	try
	{
		const res = await pool.query(
			`SELECT id FROM oauth_clients WHERE provider = $1 AND client_id = $2`, [provider, client_id]
		);
		if (res.rows.length > 0)
			return res.rows[0];
		const insert = await pool.query(
			`INSERT INTO oauth_clients (provider, client_id, client_secret, redirect_uri) VALUES ($1, $2, $3, $4) RETURNING id`,
			[provider, client_id, client_secret, redirect_uri]
		);
		return insert.rows[0];
	}
	catch (err)
	{
		console.error('Error ensuring oauth client:', err);
		throw err;
	}
}

export
{
	waitForDb,
	createTables,
	query,
	ensureOauthClient
};
