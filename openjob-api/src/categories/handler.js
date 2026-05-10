import { Router } from 'express';

import { validate } from '../lib/validate.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getAll, getById, insert, remove, update } from './service.js';
import { categorySchema } from './validator.js';

async function listCategories(_req, res) {
	res.json({
		data: { categories: await getAll() },
		status: 'success',
	});
}

async function getCategory(req, res) {
	res.json({
		data: await getById(req.params.id),
		status: 'success',
	});
}

async function createCategory(req, res) {
	const data = validate(categorySchema, req.body);
	const id = await insert(data);
	res.status(201).json({
		data: { id },
		status: 'success',
	});
}

async function updateCategory(req, res) {
	const data = validate(categorySchema, req.body);
	await update(req.params.id, data);
	res.json({
		message: 'Category updated',
		status: 'success',
	});
}

async function deleteCategory(req, res) {
	await remove(req.params.id);
	res.json({
		message: 'Category deleted',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', listCategories);
router.get('/:id', getCategory);
router.post('/', authenticate, createCategory);
router.put('/:id', authenticate, updateCategory);
router.delete('/:id', authenticate, deleteCategory);

export { router as categoriesRouter };
