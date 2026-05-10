import { redis } from '../redis.js';

const TTL = 3600;

async function withCache(key, fn) {
	const cached = await redis.get(key);
	if (cached) return { data: JSON.parse(cached), fromCache: true };

	const data = await fn();
	await redis.set(key, JSON.stringify(data), { EX: TTL });
	return { data, fromCache: false };
}

export { withCache };
