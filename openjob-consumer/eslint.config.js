import { createConfig } from '@cravingmaker/eslint-config';
import globals from 'globals';

const baseConfigs = await createConfig({
	ignores: ['node_modules/**'],
	rules: {
		js: {
			'functional/no-promise-reject': 'off',
			'n/no-process-env': [
				'error',
				{
					allowedVariables: [
						'PGUSER',
						'PGPASSWORD',
						'PGDATABASE',
						'PGHOST',
						'PGPORT',
						'RABBITMQ_HOST',
						'RABBITMQ_USER',
						'RABBITMQ_PASSWORD',
						'RABBITMQ_PORT',
						'MAIL_HOST',
						'MAIL_PORT',
						'MAIL_USER',
						'MAIL_PASSWORD',
					],
				},
			],
			'perfectionist/sort-modules': 'off',
		},
	},
});

const nodeGlobals = {
	languageOptions: {
		globals: globals.node,
	},
};

const config = [nodeGlobals, ...baseConfigs];

// eslint-disable-next-line import-x/no-default-export -- ESLint flat config requires a default export
export default config;
