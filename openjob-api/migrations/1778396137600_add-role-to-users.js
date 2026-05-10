function up(pgm) {
	pgm.addColumn('users', {
		role: { default: 'user', notNull: true, type: 'varchar(50)' },
	});
}

function down(pgm) {
	pgm.dropColumn('users', 'role');
}

export { down, up };
