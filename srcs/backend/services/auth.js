const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {query} = require('../db');

async function login(username, password)
{
	try
	{
		const result = await query
		(
			`SELECT id, password_hash FROM users WHERE username = $1`,
			[username]
		);
		if (result.rows.length === 0)
			return ({status: 401, data: {error: 'Invalid credentials'}});

		const user = result.rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match)
			return ({status: 401, data: {error: 'Invalid credentials'}});

		const token = jwt.sign
		(
			{
				userId: user.id,
				username: username
			},
			process.env.JWT_SECRET,
			{expiresIn: '1h'}
		);

		return ({status: 200, data: {token}});
	}
	catch (err)
	{
		console.error(err);
		return ({status: 500, data: {error: 'Server error'}});
	}
};

async function register(username, password)
{	
	try
	{
		const password_hash = await bcrypt.hash(password, 10);
		await query
		(
			`INSERT INTO users (username, password_hash) VALUES ($1, $2)`,
			[username, password_hash]
		);
		return ({status: 201, data: {message: 'User created'}});
	}
	catch (err)
	{
		if (err.code === '23505')
			return ({status: 409, data: {error: 'Username already exists'}});

		console.error(err);
		return ({status: 500, data: {error: 'Server error'}});
	}
};

module.exports = {register, login};
