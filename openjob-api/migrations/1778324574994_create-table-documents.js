function up(pgm) {
	pgm.createTable('documents', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		filename: { notNull: true, type: 'varchar(255)' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		url: { notNull: true, type: 'varchar(512)' },
		user_id: { notNull: true, references: 'users(id)', type: 'uuid' },
	});
}

function down(pgm) {
	pgm.dropTable('documents');
}

export { down, up };
