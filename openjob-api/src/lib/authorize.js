import { pool } from '../database.js';
import { AuthorizationError } from '../middleware/error.js';

function assertOwner(ownerId, userId) {
	if (ownerId !== userId) throw new AuthorizationError();
}

async function assertJobOwner(jobId, userId) {
	const { rows } = await pool.query(
		'SELECT c.owner_id FROM companies c JOIN jobs j ON j.company_id = c.id WHERE j.id = $1',
		[jobId],
	);
	if (rows.length === 0 || rows[0].owner_id !== userId) throw new AuthorizationError();
}

export { assertJobOwner, assertOwner };
