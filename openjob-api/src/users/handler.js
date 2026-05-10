import { Router } from 'express';

import { sendCached } from '../lib/response.js';
import { validate } from '../lib/validate.js';
import { csrfProtection } from '../middleware/csrf.js';
import { ClientError } from '../middleware/error.js';
import { getById, insert } from './service.js';
import { registerSchema } from './validator.js';

async function registerUser(req, res) {
	const data = validate(registerSchema, req.body);

	try {
		const id = await insert(data);
		res.status(201).json({
			data: { id },
			status: 'success',
		});
	} catch (error) {
		if (error.constraint === 'users_email_key') throw new ClientError('Email already registered', 409);
		throw error;
	}
}

async function getUserById(req, res) {
	sendCached(res, await getById(req.params.id));
}

const router = Router();
router.use(csrfProtection);
router.post('/', registerUser);
router.get('/:id', getUserById);

export { router as usersRouter };
