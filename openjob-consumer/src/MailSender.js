import process from 'node:process';

import nodemailer from 'nodemailer';

function createMailSender() {
	const transporter = nodemailer.createTransport({
		auth: {
			pass: process.env.MAIL_PASSWORD,
			user: process.env.MAIL_USER,
		},
		host: process.env.MAIL_HOST,
		port: Number(process.env.MAIL_PORT),
	});

	return {
		sendEmail(to, subject, text) {
			return transporter.sendMail({
				from: { address: 'hello@demomailtrap.co', name: 'OpenJob' },
				subject,
				text,
				to,
			});
		},
	};
}

export { createMailSender };
