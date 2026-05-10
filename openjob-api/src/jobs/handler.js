import { Router } from 'express';

import { validate } from '../lib/validate.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getAll, getByCategory, getByCompany, getById, insert, remove, update } from './service.js';
import { jobSchema, jobUpdateSchema } from './validator.js';

async function listJobs(req, res) {
	res.json({
		data: { jobs: await getAll(req.query) },
		status: 'success',
	});
}

async function getJob(req, res) {
	res.json({
		data: await getById(req.params.id),
		status: 'success',
	});
}

async function getJobsByCompany(req, res) {
	res.json({
		data: { jobs: await getByCompany(req.params.companyId) },
		status: 'success',
	});
}

async function getJobsByCategory(req, res) {
	res.json({
		data: { jobs: await getByCategory(req.params.categoryId) },
		status: 'success',
	});
}

async function createJob(req, res) {
	const data = validate(jobSchema, req.body);
	const id = await insert(data, req.user.id);
	res.status(201).json({
		data: { id },
		status: 'success',
	});
}

async function updateJob(req, res) {
	const data = validate(jobUpdateSchema, req.body);
	await update(req.params.id, data, req.user.id);
	res.json({
		message: 'Job updated',
		status: 'success',
	});
}

async function deleteJob(req, res) {
	await remove(req.params.id, req.user.id);
	res.json({
		message: 'Job deleted',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', listJobs);
router.get('/company/:companyId', getJobsByCompany);
router.get('/category/:categoryId', getJobsByCategory);
router.get('/:id', getJob);
router.post('/', authenticate, createJob);
router.put('/:id', authenticate, updateJob);
router.delete('/:id', authenticate, deleteJob);

export { router as jobsRouter };
