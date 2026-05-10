import process from 'node:process';

import { createClient } from 'redis';

const redis = createClient({ socket: { host: process.env.REDIS_HOST ?? 'localhost' } });

redis.on('error', (error) => console.error('Redis error:', error));

await redis.connect();

export { redis };
