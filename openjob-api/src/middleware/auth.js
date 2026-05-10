import process from 'node:process';

import jwt from 'jsonwebtoken';

import { AuthenticationError } from './error.js';

function authenticate(req, _res, next) {
	const auth = req.headers.authorization;

	if (!auth?.startsWith('Bearer ')) {
		return next(new AuthenticationError());
	}

	try {
		const payload = jwt.verify(auth.slice(7), process.env.ACCESS_TOKEN_KEY);
		req.user = { id: payload.id };
		return next();
	} catch {
		return next(new AuthenticationError());
	}
}

export { authenticate };
