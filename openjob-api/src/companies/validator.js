import { z } from 'zod';

const companySchema = z.object({
	description: z.string().optional(),
	location: z.string().min(1),
	name: z.string().min(1),
});

export { companySchema };
