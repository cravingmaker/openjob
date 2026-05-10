import process from 'node:process';

import amqplib from 'amqplib';

import { pool } from './database.js';
import { createListener } from './Listener.js';
import { createMailSender } from './MailSender.js';

const QUEUE_NAME = 'applications';

const conn = await amqplib.connect({
	frameMax: 131_072,
	hostname: process.env.RABBITMQ_HOST,
	password: process.env.RABBITMQ_PASSWORD,
	port: Number(process.env.RABBITMQ_PORT ?? 5672),
	protocol: 'amqp',
	username: process.env.RABBITMQ_USER,
	vhost: '/',
});

const channel = await conn.createChannel();
await channel.assertQueue(QUEUE_NAME, { durable: true });

const mailSender = createMailSender();
const listener = createListener(pool, mailSender);

channel.consume(QUEUE_NAME, async (message) => {
	await listener.listen(message);
	channel.ack(message);
});

console.log(`Consumer listening on queue: ${QUEUE_NAME}`);
