import jwt from 'jsonwebtoken';
import chatService from './global_chat.js';
import friendsService from './friends.js';

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

	io.on('connection', async (socket) =>
	{
		console.log(`User connected: ${socket.user.username}`);

		socket.join('general-chat');

		// Send recent messages and friend IDs on connection
		try {
			const [recentMessages, friendIds] = await Promise.all([
				chatService.getRecentMessages(50),
				friendsService.getFriendIds(socket.user.userId)
			]);

			socket.emit('chat-init', {
				messages: recentMessages,
				friendIds: friendIds
			});
		} catch (err) {
			console.error('Error fetching initial data:', err);
		}

		socket.on('chat-message', async(data) =>
		{
			try
			{
				const message = await chatService.saveMessage(socket.user.userId, data.content);
				socket.broadcast.to('general-chat').emit('chat-message',
				{
					id: message.id,
					sender_id: socket.user.userId,
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