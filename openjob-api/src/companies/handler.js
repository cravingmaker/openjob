import { Router } from 'express';

import { sendCached } from '../lib/response.js';
import { validate } from '../lib/validate.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getAll, getById, insert, remove, update } from './service.js';
import { companySchema } from './validator.js';

async function listCompanies(_req, res) {
	sendCached(res, await getAll(), (companies) => ({ companies }));
}

async function getCompany(req, res) {
	sendCached(res, await getById(req.params.id));
}

async function createCompany(req, res) {
	const data = validate(companySchema, req.body);
	const id = await insert(data, req.user.id);
	res.status(201).json({
		data: { id },
		status: 'success',
	});
}

async function updateCompany(req, res) {
	const data = validate(companySchema, req.body);
	await update(req.params.id, data, req.user.id);
	res.json({
		message: 'Company updated',
		status: 'success',
	});
}

async function deleteCompany(req, res) {
	await remove(req.params.id, req.user.id);
	res.json({
		message: 'Company deleted',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', listCompanies);
router.get('/:id', getCompany);
router.post('/', authenticate, createCompany);
router.put('/:id', authenticate, updateCompany);
router.delete('/:id', authenticate, deleteCompany);

export { router as companiesRouter };
