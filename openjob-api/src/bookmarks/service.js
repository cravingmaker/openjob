import { pool } from '../database.js';
import { withCache } from '../lib/cache.js';
import { ClientError, NotFoundError } from '../middleware/error.js';
import { redis } from '../redis.js';

async function getByUser(userId) {
	return await withCache(`bookmarks:user:${userId}`, async () => {
		const { rows } = await pool.query(
			`SELECT b.id, b.user_id, b.job_id, b.created_at,
			        j.title AS job_title, j.description AS job_description,
			        j.company_id, j.category_id, j.created_at AS job_created_at, j.updated_at AS job_updated_at,
			        c.name AS company_name, c.location AS company_location, c.description AS company_description,
			        c.owner_id AS company_owner_id, c.created_at AS company_created_at, c.updated_at AS company_updated_at,
			        cat.name AS category_name, cat.created_at AS category_created_at
			 FROM bookmarks b
			 JOIN jobs j ON j.id = b.job_id
			 JOIN companies c ON c.id = j.company_id
			 JOIN categories cat ON cat.id = j.category_id
			 WHERE b.user_id = $1 ORDER BY b.created_at DESC`,
			[userId],
		);
		return rows;
	});
}

async function getById(id) {
	const { rows } = await pool
		.query('SELECT id, user_id, job_id, created_at FROM bookmarks WHERE id = $1', [id])
		.catch((error) => {
			if (error.code === '22P02') throw new NotFoundError('Bookmark not found');
			throw error;
		});
	if (rows.length === 0) throw new NotFoundError('Bookmark not found');
	return rows[0];
}

async function insert(jobId, userId) {
	const { rows } = await pool
		.query('INSERT INTO bookmarks (user_id, job_id) VALUES ($1, $2) RETURNING id', [userId, jobId])
		.catch((error) => {
			if (error.constraint === 'bookmarks_user_id_job_id_key') throw new ClientError('Already bookmarked', 409);
			throw error;
		});
	await redis.del(`bookmarks:user:${userId}`);
	return rows[0].id;
}

async function remove(jobId, userId) {
	await pool.query('DELETE FROM bookmarks WHERE user_id = $1 AND job_id = $2', [userId, jobId]);
	await redis.del(`bookmarks:user:${userId}`);
}

export { getById, getByUser, insert, remove };
