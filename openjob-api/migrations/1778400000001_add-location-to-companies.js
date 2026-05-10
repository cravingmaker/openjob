function up(pgm) {
	pgm.addColumn('companies', {
		location: { type: 'varchar(255)' },
	});
}

function down(pgm) {
	pgm.dropColumn('companies', 'location');
}

export { down, up };
