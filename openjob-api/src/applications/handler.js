import { Router } from 'express';

import { sendCached } from '../lib/response.js';
import { validate } from '../lib/validate.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getAll, getById, getByJob, getByUser, insert, remove, updateStatus } from './service.js';
import { applySchema, statusSchema } from './validator.js';

async function listApplications(_req, res) {
	res.json({
		data: { applications: await getAll() },
		status: 'success',
	});
}

async function getApplication(req, res) {
	sendCached(res, await getById(req.params.id));
}

async function getApplicationsByUser(req, res) {
	sendCached(res, await getByUser(req.params.userId), (data) => ({ applications: data }));
}

async function getApplicationsByJob(req, res) {
	sendCached(res, await getByJob(req.params.jobId), (data) => ({ applications: data }));
}

async function createApplication(req, res) {
	const data = validate(applySchema, req.body);
	const application = await insert(data, req.user.id);
	res.status(201).json({
		data: application,
		status: 'success',
	});
}

async function updateApplicationStatus(req, res) {
	const data = validate(statusSchema, req.body);
	await updateStatus(req.params.id, data, req.user.id);
	res.json({
		message: 'Application status updated',
		status: 'success',
	});
}

async function deleteApplication(req, res) {
	await remove(req.params.id, req.user.id);
	res.json({
		message: 'Application deleted',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', authenticate, listApplications);
router.get('/user/:userId', authenticate, getApplicationsByUser);
router.get('/job/:jobId', authenticate, getApplicationsByJob);
router.get('/:id', authenticate, getApplication);
router.post('/', authenticate, createApplication);
router.put('/:id', authenticate, updateApplicationStatus);
router.delete('/:id', authenticate, deleteApplication);

export { router as applicationsRouter };
