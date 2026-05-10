function up(pgm) {
	pgm.addConstraint('applications', 'applications_user_id_job_id_key', 'UNIQUE (user_id, job_id)');
}

function down(pgm) {
	pgm.dropConstraint('applications', 'applications_user_id_job_id_key');
}

export { down, up };
