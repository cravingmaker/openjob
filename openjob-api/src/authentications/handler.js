import { Router } from 'express';

import { validate } from '../lib/validate.js';
import { csrfProtection } from '../middleware/csrf.js';
import { login, logout, refresh } from './service.js';
import { loginSchema, refreshSchema } from './validator.js';

async function loginHandler(req, res) {
	const data = validate(loginSchema, req.body);
	const tokens = await login(data);
	res.status(200).json({
		data: tokens,
		status: 'success',
	});
}

async function refreshHandler(req, res) {
	const { refreshToken } = validate(refreshSchema, req.body);
	const tokens = await refresh(refreshToken);
	res.json({
		data: tokens,
		status: 'success',
	});
}

async function logoutHandler(req, res) {
	const { refreshToken } = validate(refreshSchema, req.body);
	await logout(refreshToken);
	res.status(200).json({
		message: 'Logged out',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.post('/', loginHandler);
router.put('/', refreshHandler);
router.delete('/', logoutHandler);

export { router as authenticationsRouter };
