import path from 'node:path';

import { Router } from 'express';
import multer, { diskStorage } from 'multer';

import { authenticate } from '../middleware/auth.js';
import { csrfProtection } from '../middleware/csrf.js';
import { getAll, getById, insert, remove, UPLOADS_DIRECTORY } from './service.js';

const storage = diskStorage({
	destination: UPLOADS_DIRECTORY,
	/* eslint-disable promise/prefer-await-to-callbacks -- Multer's diskStorage requires a callback and does not support async/await */
	filename(_req, file, callback) {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		callback(undefined, `${unique}${path.extname(file.originalname)}`);
	},
	/* eslint-enable promise/prefer-await-to-callbacks -- Re-enable the rule after Multer configuration */
});

const upload = multer({
	/* eslint-disable promise/prefer-await-to-callbacks -- Multer's fileFilter requires a callback */
	fileFilter(_req, file, callback) {
		if (file.mimetype !== 'application/pdf') return callback(new Error('File is required'));
		callback(undefined, true);
	},
	/* eslint-enable promise/prefer-await-to-callbacks -- Re-enable the rule after Multer configuration */
	limits: { fileSize: 5 * 1024 * 1024 },

	storage,
});

async function listDocuments(_req, res) {
	res.json({
		data: { documents: await getAll() },
		status: 'success',
	});
}

async function getDocument(req, res) {
	const document = await getById(req.params.id);
	const filePath = path.join(UPLOADS_DIRECTORY, document.filename);
	res.set('Content-Disposition', `attachment; filename="${document.filename}"`);
	res.sendFile(filePath);
}

async function uploadDocument(req, res) {
	const { file } = req;
	if (!file) throw new Error('File is required');
	const url = `/uploads/${file.filename}`;
	const id = await insert({ filename: file.filename, url }, req.user.id);
	res.status(201).json({
		data: { documentId: id, filename: file.filename, originalName: file.originalname, size: file.size },
		status: 'success',
	});
}

async function deleteDocument(req, res) {
	await remove(req.params.id, req.user.id);
	res.json({
		message: 'Document deleted',
		status: 'success',
	});
}

const router = Router();
router.use(csrfProtection);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.post('/', authenticate, upload.single('document'), uploadDocument);
router.delete('/:id', authenticate, deleteDocument);

export { router as documentsRouter };
