import { ClientError } from '../middleware/error.js';

function validate(schema, data) {
	const result = schema.safeParse(data);
	if (!result.success) throw new ClientError(result.error.issues[0].message);
	return result.data;
}

export { validate };
