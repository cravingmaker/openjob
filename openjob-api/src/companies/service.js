import { pool } from '../database.js';
import { assertOwner } from '../lib/authorize.js';
import { withCache } from '../lib/cache.js';
import { NotFoundError } from '../middleware/error.js';
import { redis } from '../redis.js';

async function getAll() {
	return await withCache('companies:list', async () => {
		const { rows } = await pool.query(
			'SELECT id, name, location, description, created_at, updated_at FROM companies ORDER BY created_at DESC',
		);
		return rows;
	});
}

async function getById(id) {
	return await withCache(`companies:${id}`, async () => {
		const { rows } = await pool
			.query('SELECT id, owner_id, name, location, description, created_at, updated_at FROM companies WHERE id = $1', [
				id,
			])
			.catch((error) => {
				if (error.code === '22P02') throw new NotFoundError('Company not found');
				throw error;
			});
		if (rows.length === 0) throw new NotFoundError('Company not found');
		return rows[0];
	});
}

async function insert({ description, location, name }, ownerId) {
	const { rows } = await pool.query(
		'INSERT INTO companies (owner_id, name, location, description) VALUES ($1, $2, $3, $4) RETURNING id',
		// eslint-disable-next-line unicorn/no-null -- explicitly use null for database NULL compatibility
		[ownerId, name, location ?? null, description ?? null],
	);
	await redis.del('companies:list');
	return rows[0].id;
}

async function update(id, { description, location, name }, userId) {
	const { data: company } = await getById(id);
	assertOwner(company.owner_id, userId);
	await pool.query(
		'UPDATE companies SET name = $1, location = $2, description = $3, updated_at = now() WHERE id = $4',
		[
			name,
			// eslint-disable-next-line unicorn/no-null -- explicitly use null for database NULL compatibility
			location ?? null,
			// eslint-disable-next-line unicorn/no-null -- explicitly use null for database NULL compatibility
			description ?? null,
			id,
		],
	);
	await Promise.all([redis.del(`companies:${id}`), redis.del('companies:list')]);
}

async function remove(id, userId) {
	const { data: company } = await getById(id);
	assertOwner(company.owner_id, userId);
	await pool.query('DELETE FROM companies WHERE id = $1', [id]);
	await Promise.all([redis.del(`companies:${id}`), redis.del('companies:list')]);
}

export { getAll, getById, insert, remove, update };
