import { z } from 'zod';

const applySchema = z
	.object({
		job_id: z.string().uuid(),
		status: z.string().optional(),
	})
	.transform((data) => ({
		jobId: data.job_id,
		status: data.status,
	}));

const statusSchema = z.object({
	status: z.enum(['accepted', 'rejected', 'pending']),
});

export { applySchema, statusSchema };
