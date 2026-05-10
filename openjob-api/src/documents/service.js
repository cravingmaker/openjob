import fs from 'node:fs/promises';
import path from 'node:path';

import { pool } from '../database.js';
import { assertOwner } from '../lib/authorize.js';
import { NotFoundError } from '../middleware/error.js';

const UPLOADS_DIRECTORY = path.join(import.meta.filename, '../../../public/uploads');

async function getAll() {
	const { rows } = await pool.query(
		'SELECT id, user_id, filename, url, created_at FROM documents ORDER BY created_at DESC',
	);
	return rows;
}

async function getById(id) {
	const { rows } = await pool
		.query('SELECT id, user_id, filename, url, created_at FROM documents WHERE id = $1', [id])
		.catch((error) => {
			if (error.code === '22P02') throw new NotFoundError('Document not found');
			throw error;
		});
	if (rows.length === 0) throw new NotFoundError('Document not found');
	return rows[0];
}

async function insert({ filename, url }, userId) {
	const { rows } = await pool.query('INSERT INTO documents (user_id, filename, url) VALUES ($1, $2, $3) RETURNING id', [
		userId,
		filename,
		url,
	]);
	return rows[0].id;
}

async function remove(id, userId) {
	const document = await getById(id);
	assertOwner(document.user_id, userId);
	await pool.query('DELETE FROM documents WHERE id = $1', [id]);
	try {
		// eslint-disable-next-line security/detect-non-literal-fs-filename -- path built from DB value, not user input
		await fs.unlink(path.join(UPLOADS_DIRECTORY, document.filename));
	} catch {
		// file may already be gone — ignore
	}
}

export { getAll, getById, insert, remove, UPLOADS_DIRECTORY };
