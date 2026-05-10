import { Buffer } from 'node:buffer';
import process from 'node:process';

import amqplib from 'amqplib';

async function publish(queueName, payload) {
	const conn = await amqplib.connect({
		frameMax: 131_072,
		hostname: process.env.RABBITMQ_HOST,
		password: process.env.RABBITMQ_PASSWORD,
		port: Number(process.env.RABBITMQ_PORT ?? 5672),
		protocol: 'amqp',
		username: process.env.RABBITMQ_USER,
		vhost: '/',
	});
	const ch = await conn.createChannel();
	await ch.assertQueue(queueName, { durable: true });
	ch.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)));
	await ch.close();
	await conn.close();
}

export { publish };
