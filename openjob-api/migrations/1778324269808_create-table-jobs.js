function up(pgm) {
	pgm.createTable('jobs', {
		category_id: { notNull: true, references: 'categories(id)', type: 'uuid' },
		company_id: { notNull: true, references: 'companies(id)', type: 'uuid' },
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		description: { type: 'text' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		title: { notNull: true, type: 'varchar(255)' },
		updated_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
	});
}

function down(pgm) {
	pgm.dropTable('jobs');
}

export { down, up };
