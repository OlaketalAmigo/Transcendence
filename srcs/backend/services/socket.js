import jwt from 'jsonwebtoken';
import chatService from './global_chat.js';

function setupSocketIO(io)
{
	io.use((socket, next) =>
	{
		const token = socket.handshake.auth.token;
		if (!token)
			return (next(new Error('Authentication error')));

		try
		{
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			socket.user = decoded;
			next();
		}
		catch(err)
		{
			next(new Error('Authentication error'));
		}
	});

	io.on('connection', (socket) =>
	{
		console.log(`User connected: ${socket.user.username}`);

		socket.join('general-chat');
		socket.on('chat-message', async(data) =>
		{
			try
			{
				const message = await chatService.saveMessage(socket.user.userId, data.content);
				io.to('general-chat').emit('chat-message',
				{
					id:message.id,
					username: socket.user.username,
					content: message.content,
					created_at: message.created_at
				});
			}
			catch (err)
			{
				console.error('Error saving message:', err);
				socket.emit('error', {message: 'Failed to send message'});
			}
		});
		socket.on('disconnect', () =>
		{
			console.log(`User disconnected: ${socket.user.username}`);
		});
	});
}

export default setupSocketIO;