import { pool } from '../database.js';
import { ClientError, NotFoundError } from '../middleware/error.js';

async function getAll() {
	const { rows } = await pool.query('SELECT id, name, created_at, updated_at FROM categories ORDER BY name');
	return rows;
}

async function getById(id) {
	const { rows } = await pool
		.query('SELECT id, name, created_at, updated_at FROM categories WHERE id = $1', [id])
		.catch((error) => {
			if (error.code === '22P02') throw new NotFoundError('Category not found');
			throw error;
		});
	if (rows.length === 0) throw new NotFoundError('Category not found');
	return rows[0];
}

async function insert({ name }) {
	const { rows } = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]).catch((error) => {
		if (error.constraint === 'categories_name_key') throw new ClientError('Category name already exists', 409);
		throw error;
	});
	return rows[0].id;
}

async function update(id, { name }) {
	await getById(id);
	await pool.query('UPDATE categories SET name = $1, updated_at = now() WHERE id = $2', [name, id]).catch((error) => {
		if (error.constraint === 'categories_name_key') throw new ClientError('Category name already exists', 409);
		throw error;
	});
}

async function remove(id) {
	await getById(id);
	await pool.query('DELETE FROM categories WHERE id = $1', [id]);
}

export { getAll, getById, insert, remove, update };
