import { z } from 'zod';

const categorySchema = z.object({
	name: z.string().min(1),
});

export { categorySchema };
