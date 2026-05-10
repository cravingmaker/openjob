import { z } from 'zod';

const jobSchema = z
	.object({
		category_id: z.string().uuid(),
		company_id: z.string().uuid(),
		description: z.string().optional(),
		title: z.string().min(1),
	})
	.transform((data) => ({
		categoryId: data.category_id,
		companyId: data.company_id,
		description: data.description,
		title: data.title,
	}));

const jobUpdateSchema = z
	.object({
		category_id: z.string().uuid().optional(),
		company_id: z.string().uuid().optional(),
		description: z.string().optional(),
		title: z.string().min(1).optional(),
	})
	.transform((data) => ({
		categoryId: data.category_id,
		companyId: data.company_id,
		description: data.description,
		title: data.title,
	}));

export { jobSchema, jobUpdateSchema };
