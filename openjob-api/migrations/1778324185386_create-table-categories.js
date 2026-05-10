function up(pgm) {
	pgm.createTable('categories', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		name: { notNull: true, type: 'varchar(255)', unique: true },
		updated_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
	});
}

function down(pgm) {
	pgm.dropTable('categories');
}

export { down, up };
