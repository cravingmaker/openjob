import process from 'node:process';

import { app } from './app.js';

// eslint-disable-next-line import-x/no-unassigned-import -- redis.js needs to be imported to initialize connection
import './redis.js';

const host = process.env.HOST ?? 'localhost';
const port = Number(process.env.PORT ?? 3000);

app.listen(port, host, () => {
	console.log(`Server running at http://${host}:${port}`);
});
