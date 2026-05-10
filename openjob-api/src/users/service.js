import bcrypt from 'bcrypt';

import { pool } from '../database.js';
import { withCache } from '../lib/cache.js';
import { ClientError, NotFoundError } from '../middleware/error.js';

async function insert({ email, name, password, role }) {
	const hash = await bcrypt.hash(password, 10);
	const { rows } = await pool
		.query('INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id', [
			name,
			email,
			hash,
			role ?? 'user',
		])
		.catch((error) => {
			if (error.code === '23505') throw new ClientError('Email already exists');
			throw error;
		});
	return rows[0].id;
}

async function getById(id) {
	return await withCache(`users:${id}`, async () => {
		const { rows } = await pool
			.query('SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1', [id])
			.catch((error) => {
				if (error.code === '22P02') throw new NotFoundError('User not found');
				throw error;
			});
		if (rows.length === 0) throw new NotFoundError('User not found');
		return rows[0];
	});
}

export { getById, insert };
