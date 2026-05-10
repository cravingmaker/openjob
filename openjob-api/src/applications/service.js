import { pool } from '../database.js';
import { publish } from '../lib/amqp.js';
import { assertJobOwner, assertOwner } from '../lib/authorize.js';
import { withCache } from '../lib/cache.js';
import { QUEUE_NAME } from '../lib/queue.js';
import { ClientError, NotFoundError } from '../middleware/error.js';
import { redis } from '../redis.js';

const BASE_SELECT = `
  SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
         j.title AS job_title, c.name AS company_name,
         u.name AS applicant_name, u.email AS applicant_email,
         j.company_id AS job_company_id, j.category_id AS job_category_id,
         j.description AS job_description
  FROM applications a
  JOIN jobs j ON j.id = a.job_id
  JOIN companies c ON c.id = j.company_id
  JOIN users u ON u.id = a.user_id
`;

async function getAll() {
	const { rows } = await pool.query(`${BASE_SELECT} ORDER BY a.created_at DESC`);
	return rows;
}

async function getById(id) {
	return await withCache(`applications:${id}`, async () => {
		const { rows } = await pool.query(`${BASE_SELECT} WHERE a.id = $1`, [id]).catch((error) => {
			if (error.code === '22P02') throw new NotFoundError('Application not found');
			throw error;
		});
		if (rows.length === 0) throw new NotFoundError('Application not found');
		return rows[0];
	});
}

async function getByUser(userId) {
	return await withCache(`applications:user:${userId}`, async () => {
		const { rows } = await pool
			.query(`${BASE_SELECT} WHERE a.user_id = $1 ORDER BY a.created_at DESC`, [userId])
			.catch((error) => {
				if (error.code === '22P02') return { rows: [] };
				throw error;
			});
		return rows;
	});
}

async function getByJob(jobId) {
	return await withCache(`applications:job:${jobId}`, async () => {
		const { rows } = await pool
			.query(`${BASE_SELECT} WHERE a.job_id = $1 ORDER BY a.created_at DESC`, [jobId])
			.catch((error) => {
				if (error.code === '22P02') return { rows: [] };
				throw error;
			});
		return rows;
	});
}

async function insert({ jobId, status }, userId) {
	const { rows } = await pool
		.query(
			'INSERT INTO applications (user_id, job_id, status) VALUES ($1, $2, $3) RETURNING id, user_id, job_id, status',
			[userId, jobId, status ?? 'on_process'],
		)
		.catch((error) => {
			if (error.constraint === 'applications_user_id_job_id_key')
				throw new ClientError('Already applied for this job', 400);
			throw error;
		});
	await Promise.all([redis.del(`applications:user:${userId}`), redis.del(`applications:job:${jobId}`)]);
	try {
		await publish(QUEUE_NAME, { applicationId: rows[0].id });
	} catch {
		// publish failure must not fail the request
	}
	return rows[0];
}

async function updateStatus(id, { status }, userId) {
	const { data: app } = await getById(id);
	await assertJobOwner(app.job_id, userId);
	await pool.query('UPDATE applications SET status = $1, updated_at = now() WHERE id = $2', [status, id]);
	await Promise.all([
		redis.del(`applications:${id}`),
		redis.del(`applications:user:${app.user_id}`),
		redis.del(`applications:job:${app.job_id}`),
	]);
}

async function remove(id, userId) {
	const { data: app } = await getById(id);
	assertOwner(app.user_id, userId);
	await pool.query('DELETE FROM applications WHERE id = $1', [id]);
	await Promise.all([
		redis.del(`applications:${id}`),
		redis.del(`applications:user:${app.user_id}`),
		redis.del(`applications:job:${app.job_id}`),
	]);
}

export { getAll, getById, getByJob, getByUser, insert, remove, updateStatus };
