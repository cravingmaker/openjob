import path from 'node:path';

import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';

import { applicationsRouter } from './applications/handler.js';
import { authenticationsRouter } from './authentications/handler.js';
import { bookmarksRouter, jobBookmarkRouter } from './bookmarks/handler.js';
import { categoriesRouter } from './categories/handler.js';
import { companiesRouter } from './companies/handler.js';
import { documentsRouter } from './documents/handler.js';
import { jobsRouter } from './jobs/handler.js';
import { csrfProtection } from './middleware/csrf.js';
import { errorHandler, NotFoundError } from './middleware/error.js';
import { profileRouter } from './profile/handler.js';
import { usersRouter } from './users/handler.js';

const app = express();
app.use(helmet());
app.use(csrfProtection);

app.use(rateLimit({ max: 10_000, windowMs: 15 * 60 * 1000 }));
app.use(express.json({ limit: '10kb' }));
app.use('/uploads', express.static(path.join(import.meta.dirname, '../public/uploads')));

app.use('/applications', applicationsRouter);
app.use('/authentications', authenticationsRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/categories', categoriesRouter);
app.use('/companies', companiesRouter);
app.use('/documents', documentsRouter);
app.use('/jobs/:jobId/bookmark', jobBookmarkRouter);
app.use('/jobs', jobsRouter);
app.use('/profile', profileRouter);
app.use('/users', usersRouter);

app.use((_req, _res, next) => {
	next(new NotFoundError());
});
app.use(errorHandler);

export { app };
