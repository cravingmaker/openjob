function createListener(database, mailSender) {
	return {
		async listen(message) {
			const { applicationId } = JSON.parse(message.content.toString());

			const { rows } = await database.query(
				`SELECT u.email AS "applicantEmail", u.name AS "applicantName",
				        a.created_at AS "createdAt", owner.email AS "ownerEmail"
				 FROM applications a
				 JOIN users u ON u.id = a.user_id
				 JOIN jobs j ON j.id = a.job_id
				 JOIN companies c ON c.id = j.company_id
				 JOIN users owner ON owner.id = c.owner_id
				 WHERE a.id = $1`,
				[applicationId],
			);

			if (rows.length > 0) {
				const { applicantEmail, applicantName, createdAt, ownerEmail } = rows[0];
				try {
					await mailSender.sendEmail(
						ownerEmail,
						'New job application received',
						`A new application has been submitted.\n\nApplicant: ${applicantName}\nEmail: ${applicantEmail}\nDate: ${createdAt}`,
					);
				} catch (error) {
					console.error('Email send failed:', error.message);
				}
			}
		},
	};
}

export { createListener };
