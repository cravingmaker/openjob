function up(pgm) {
	pgm.createTable('companies', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		description: { type: 'text' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		name: { notNull: true, type: 'varchar(255)' },
		owner_id: { notNull: true, references: 'users(id)', type: 'uuid' },
		updated_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
	});
}

function down(pgm) {
	pgm.dropTable('companies');
}

export { down, up };
