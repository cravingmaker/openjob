import { z } from 'zod';

const registerSchema = z.object({
	email: z.string().email(),
	name: z.string().min(1),
	password: z.string().min(6),
	role: z.string().optional(),
});

export { registerSchema };
