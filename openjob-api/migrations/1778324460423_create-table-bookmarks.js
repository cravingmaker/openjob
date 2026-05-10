function up(pgm) {
	pgm.createTable('bookmarks', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		job_id: { notNull: true, references: 'jobs(id)', type: 'uuid' },
		user_id: { notNull: true, references: 'users(id)', type: 'uuid' },
	});
	pgm.addConstraint('bookmarks', 'bookmarks_user_id_job_id_key', 'UNIQUE(user_id, job_id)');
}

function down(pgm) {
	pgm.dropTable('bookmarks');
}

export { down, up };
