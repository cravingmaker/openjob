function up(pgm) {
	pgm.createTable('authentications', {
		token: { primaryKey: true, type: 'varchar(512)' },
	});
}

function down(pgm) {
	pgm.dropTable('authentications');
}

export { down, up };
