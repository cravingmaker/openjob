import { Router } from 'express';

import { sendCached } from '../lib/response.js';
import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getById, getByUser, insert, remove } from './service.js';

async function createBookmark(req, res) {
	const id = await insert(req.params.jobId, req.user.id);
	res.status(201).json({
		data: { id },
		status: 'success',
	});
}

async function getBookmark(req, res) {
	res.json({
		data: await getById(req.params.id),
		status: 'success',
	});
}

async function deleteBookmark(req, res) {
	await remove(req.params.jobId, req.user.id);
	res.json({
		message: 'Bookmark deleted',
		status: 'success',
	});
}

async function getBookmarks(req, res) {
	sendCached(res, await getByUser(req.user.id), (data) => ({ bookmarks: data }));
}

// Mounted under /jobs/:jobId/bookmark
const jobBookmarkRouter = Router({ mergeParams: true });
jobBookmarkRouter.use(csrfProtection);
jobBookmarkRouter.post('/', authenticate, createBookmark);
jobBookmarkRouter.get('/:id', authenticate, getBookmark);
jobBookmarkRouter.delete('/', authenticate, deleteBookmark);

const bookmarksRouter = Router();
bookmarksRouter.get('/', authenticate, getBookmarks);

export { bookmarksRouter, jobBookmarkRouter };
