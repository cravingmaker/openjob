import { Router } from 'express';

import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getProfile, getProfileApplications, getProfileBookmarks } from './service.js';

async function profileHandler(req, res) {
	res.json({
		data: await getProfile(req.user.id),
		status: 'success',
	});
}

async function profileApplicationsHandler(req, res) {
	res.json({
		data: { applications: await getProfileApplications(req.user.id) },
		status: 'success',
	});
}

async function profileBookmarksHandler(req, res) {
	res.json({
		data: { bookmarks: await getProfileBookmarks(req.user.id) },
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', authenticate, profileHandler);
router.get('/applications', authenticate, profileApplicationsHandler);
router.get('/bookmarks', authenticate, profileBookmarksHandler);

export { router as profileRouter };
