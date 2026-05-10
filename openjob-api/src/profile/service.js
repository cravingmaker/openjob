import { getByUser as getBookmarksByUser } from '../bookmarks/service.js';
import { pool } from '../database.js';
import { getById as getUserById } from '../users/service.js';

async function getProfile(userId) {
	const { data } = await getUserById(userId);
	return data;
}

async function getProfileApplications(userId) {
	const { rows } = await pool.query(
		`SELECT a.id, a.user_id, a.job_id, a.status, a.created_at, a.updated_at,
		        j.title AS job_title, c.name AS company_name,
		        u.name AS applicant_name, u.email AS applicant_email,
		        j.company_id AS job_company_id, j.category_id AS job_category_id,
		        j.description AS job_description, j.created_at AS job_created_at, j.updated_at AS job_updated_at
		 FROM applications a
		 JOIN jobs j ON j.id = a.job_id
		 JOIN companies c ON c.id = j.company_id
		 JOIN users u ON u.id = a.user_id
		 WHERE a.user_id = $1 ORDER BY a.created_at DESC`,
		[userId],
	);
	return rows;
}

async function getProfileBookmarks(userId) {
	const { data } = await getBookmarksByUser(userId);
	return data;
}

export { getProfile, getProfileApplications, getProfileBookmarks };
