function sendCached(res, { data, fromCache }, wrapper) {
	res.set('X-Data-Source', fromCache ? 'cache' : 'database');
	const body = wrapper ? wrapper(data) : data;
	res.json({ data: body, status: 'success' });
}

export { sendCached };
