import {query} from '../db.js';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {fileTypeFromBuffer} from 'file-type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVATAR_DIR = path.join(__dirname, '../avatar');
const DEFAULT_AVATAR = '/avatar/default.png';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5mb
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Verify that the avatar folder already exists
if (!fs.existsSync(AVATAR_DIR))
{
	fs.mkdirSync(AVATAR_DIR, { recursive: true });
}

async function uploadAvatar(userId, file)
{
	try
	{
		// File check (type and size)
		if (!file)
			return ({status: 400, data: {error: 'No file provided'}});

		if (!ALLOWED_TYPES.includes(file.mimetype))
			return ({status: 400, data: { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP allowed'}});

		const fileType = await fileTypeFromBuffer(file.buffer);
		if (!fileType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(fileType.mime))
			return ({status: 400, data: {error: 'Invalid file content. File does not match allowed image types'}});

		if (file.size > MAX_FILE_SIZE)
			return ({status: 400, data: {error: 'File too large. Maximum size is 5MB'}});


		const currentAvatar = await getCurrentAvatar(userId);
		if (currentAvatar === null)
			return ({status: 404, data: {error: 'User not found'}});

		// Create a unique name for the new avatar to avoid duplicates
		const fileExt = path.extname(file.originalname);
		const fileName = `user_${userId}_${Date.now()}${fileExt}`;
		const avatarPath = `/avatar/${fileName}`;

		// Save the new avatar in the folder
		const filePath = path.join(AVATAR_DIR, fileName);
		fs.writeFileSync(filePath, file.buffer);

		await setAvatar(avatarPath, userId);

		deleteNonDefault(currentAvatar);
		return ({status: 200, data: {avatar_url: avatarPath}});
	}
	catch (err)
	{
		console.error('Avatar upload error:', err);
		return { status: 500, data: { error: 'Server error' } };
	}
}

async function deleteAvatar(userId) {
	try
	{
		const currentAvatar = await getCurrentAvatar(userId);
		if (currentAvatar === null)
			return ({status: 404, data: {error: 'User not found'}});

		// Reset the avatar to the default one
		await setAvatar(DEFAULT_AVATAR, userId);

		deleteNonDefault(currentAvatar);
		return ({status: 200, data: {avatar_url: DEFAULT_AVATAR}});
	}
	catch (err)
	{
		console.error('Avatar delete error:', err);
		return ({status: 500, data: {error: 'Server error'}});
	}
}

async function setAvatar(newAvatar, userId)
{
	await query
	(
		'UPDATE users SET avatar_url = $1 WHERE id = $2',
		[newAvatar, userId]
	);
}

async function getCurrentAvatar(userId)
{
	const res = await query
	(
		'SELECT avatar_url FROM users WHERE id = $1',
		[userId]
	);
	if (res.rows.length === 0)
		return (null);
	return (res.rows[0].avatar_url);
}

function deleteNonDefault(curAvatar)
{
	if (curAvatar && curAvatar !== DEFAULT_AVATAR)
	{
		const fileName = path.basename(curAvatar);
		const filePath = path.join(AVATAR_DIR, fileName);

		if (fs.existsSync(filePath))
			fs.unlinkSync(filePath);
	}
}

async function getAvatarUrl(userId)
{
	try 
	{
		const result = await query
		(
			'SELECT avatar_url FROM users WHERE id = $1',
			[userId]
		);

		if (result.rows.length === 0)
			return ({status: 404, data: {error: 'User not found'}});

		const avatarUrl = result.rows[0].avatar_url || DEFAULT_AVATAR;
		return ({status: 200, data: {avatar_url: avatarUrl}});
	}
	catch (err)
	{
		console.error('Get avatar error:', err);
		return ({status: 500, data: {error: 'Server error'}});
	}
}

export default
{
	uploadAvatar,
	deleteAvatar,
	getAvatarUrl,
	AVATAR_DIR,
	DEFAULT_AVATAR
};
