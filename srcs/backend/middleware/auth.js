import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next)
{
	const header = req.headers.authorization;
	if (!header)
		return (res.status(401).json({error: 'Missing token'}));

	const token = header.split(' ')[1];

	try
	{
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		req.user = payload;
		next();
	}
	catch
	{
		res.status(401).json({error: 'Invalid token'});
	}
};