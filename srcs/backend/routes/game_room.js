import express from 'express';
import gameRoomService from '../services/game_room.js';
import authenticateToken from '../middleware/auth.js';
const router = express.Router();

router.get('/', authenticateToken, async(req, res) =>
{
	try
	{
		const rooms = await gameRoomService.listActiveRooms();
		res.json(rooms);
	}
	catch (err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

router.get('/:roomId', authenticateToken, async(req, res) =>
{
	try
	{
		const room = await gameRoomService.getRoomById(req.params.roomId);
		if (!room)
			return (res.status(404).json({error: 'Room not found'}));
		res.json(room);
	}
	catch(err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

router.get('/:roomId/players', authenticateToken, async(req, res) =>
{
	try
	{
		const players = await gameRoomService.getRoomPlayers(req.params.roomId);
		res.json(players);
	}
	catch(err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

router.post('/', authenticateToken, async(req, res) =>
{
	try
	{
		const {name} = req.body;
		if (!name)
			return (res.status(400).json({error: 'Room name required'}));
		const room = await gameRoomService.createRoom(name, req.user.userId);
		res.status(201).json(room);
	}
	catch(err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

router.post('/:roomId/join', authenticateToken, async(req, res) =>
{
	try
	{
		const player = await gameRoomService.joinRoom(req.params.roomId, req.user.userId);
		res.json(player);
	}
	catch(err)
	{
		console.error(err);
		if (err.message.includes('full') || err.message.includes('already'))
			res.status(400).json({error: err.message});
		else
			res.status(500).json({error: err.message});
	}
});

router.post('/:roomId/leave', authenticateToken, async(req, res) =>
{
	try
	{
		await gameRoomService.leaveRoom(req.params.roomId, req.user.userId);
		res.json({message: 'Left room successfully'});
	}
	catch(err)
	{
		console.error(err);
		res.status(500).json({error: 'Server error'});
	}
});

export default router;