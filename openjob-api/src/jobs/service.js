import { pool } from '../database.js';
import { assertJobOwner } from '../lib/authorize.js';
import { ClientError, NotFoundError } from '../middleware/error.js';

const BASE_SELECT = `
  SELECT j.id, j.company_id, j.category_id, j.title, j.description,
         j.created_at, j.updated_at, c.name AS company_name,
         c.location AS company_location, c.description AS company_description,
         c.owner_id AS company_owner_id, c.created_at AS company_created_at,
         cat.name AS category_name
  FROM jobs j
  JOIN companies c ON c.id = j.company_id
  JOIN categories cat ON cat.id = j.category_id
`;

async function getAll({ 'company-name': companyName, title } = {}) {
	const conditions = [];
	const values = [];

	if (title) {
		values.push(`%${title}%`);
		conditions.push(`j.title ILIKE $${values.length}`);
	}
	if (companyName) {
		values.push(`%${companyName}%`);
		conditions.push(`c.name ILIKE $${values.length}`);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const { rows } = await pool.query(`${BASE_SELECT} ${where} ORDER BY j.created_at DESC`, values);
	return rows;
}

async function getById(id) {
	const { rows } = await pool.query(`${BASE_SELECT} WHERE j.id = $1`, [id]).catch((error) => {
		if (error.code === '22P02') throw new NotFoundError('Job not found');
		throw error;
	});
	if (rows.length === 0) throw new NotFoundError('Job not found');
	return rows[0];
}

async function getByCompany(companyId) {
	const { rows } = await pool
		.query(`${BASE_SELECT} WHERE j.company_id = $1 ORDER BY j.created_at DESC`, [companyId])
		.catch((error) => {
			if (error.code === '22P02') return { rows: [] };
			throw error;
		});
	return rows;
}

async function getByCategory(categoryId) {
	const { rows } = await pool
		.query(`${BASE_SELECT} WHERE j.category_id = $1 ORDER BY j.created_at DESC`, [categoryId])
		.catch((error) => {
			if (error.code === '22P02') return { rows: [] };
			throw error;
		});
	return rows;
}

async function insert({ categoryId, companyId, description, title }, userId) {
	const { rows: companies } = await pool.query('SELECT owner_id FROM companies WHERE id = $1', [companyId]);
	if (companies.length === 0) throw new ClientError('Company not found', 404);
	if (companies[0].owner_id !== userId) throw new ClientError('Forbidden', 403);

	const { rows } = await pool.query(
		'INSERT INTO jobs (company_id, category_id, title, description) VALUES ($1, $2, $3, $4) RETURNING id',
		[companyId, categoryId, title, description],
	);
	return rows[0].id;
}

async function update(id, { categoryId, companyId, description, title }, userId) {
	const job = await getById(id);
	await assertJobOwner(job.id, userId);

	const newCompanyId = companyId ?? job.company_id;
	const newCategoryId = categoryId ?? job.category_id;
	const newTitle = title ?? job.title;
	const newDescription = description === undefined ? job.description : description;

	await pool.query(
		'UPDATE jobs SET company_id = $1, category_id = $2, title = $3, description = $4, updated_at = now() WHERE id = $5',
		[newCompanyId, newCategoryId, newTitle, newDescription, id],
	);
}

async function remove(id, userId) {
	await assertJobOwner(id, userId);
	await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
}

export { getAll, getByCategory, getByCompany, getById, insert, remove, update };
