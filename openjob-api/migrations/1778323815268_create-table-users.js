/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
function up(pgm) {
	pgm.createTable('users', {
		created_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
		email: { notNull: true, type: 'varchar(255)', unique: true },
		id: { default: pgm.func('gen_random_uuid()'), primaryKey: true, type: 'uuid' },
		name: { notNull: true, type: 'varchar(255)' },
		password: { notNull: true, type: 'varchar(255)' },
		updated_at: { default: pgm.func('now()'), notNull: true, type: 'timestamptz' },
	});
}

/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
function down(pgm) {
	pgm.dropTable('users');
}

export { down, up };
