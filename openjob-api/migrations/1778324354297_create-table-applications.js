function up(pgm) {
	pgm.createTable('applications', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		job_id: { notNull: true, references: 'jobs(id)', type: 'uuid' },
		status: { default: "'on_process'", notNull: true, type: 'varchar(20)' },
		updated_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		user_id: { notNull: true, references: 'users(id)', type: 'uuid' },
	});
}

function down(pgm) {
	pgm.dropTable('applications');
}

export { down, up };
