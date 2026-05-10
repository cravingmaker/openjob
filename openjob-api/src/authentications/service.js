import process from 'node:process';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { pool } from '../database.js';
import { AuthenticationError, ClientError } from '../middleware/error.js';

async function login({ email, password }) {
	const { rows } = await pool.query('SELECT id, password FROM users WHERE email = $1', [email]);
	if (rows.length === 0) throw new AuthenticationError('Invalid credentials');

	const valid = await bcrypt.compare(password, rows[0].password);
	if (!valid) throw new AuthenticationError('Invalid credentials');

	const { id } = rows[0];
	const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
	const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_KEY);

	await pool.query('INSERT INTO authentications (token) VALUES ($1)', [refreshToken]);

	return { accessToken, refreshToken };
}

async function refresh(refreshToken) {
	const { rows } = await pool.query('SELECT token FROM authentications WHERE token = $1', [refreshToken]);
	if (rows.length === 0) throw new ClientError('Invalid refresh token');

	try {
		const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
		const accessToken = jwt.sign({ id: payload.id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '3h' });
		return { accessToken };
	} catch {
		throw new ClientError('Invalid refresh token');
	}
}

async function logout(refreshToken) {
	const { rowCount } = await pool.query('DELETE FROM authentications WHERE token = $1', [refreshToken]);
	if (rowCount === 0) throw new ClientError('Invalid refresh token');
}

export { login, logout, refresh };
