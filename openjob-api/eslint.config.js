import { createConfig } from '@cravingmaker/eslint-config';
import globals from 'globals';

const baseConfigs = await createConfig({
	ignores: ['node_modules/**', 'public/**'],
	rules: {
		js: {
			'functional/no-promise-reject': 'off',
			'n/no-process-env': [
				'error',
				{
					allowedVariables: [
						'NODE_ENV',
						'PORT',
						'HOST',
						'ACCESS_TOKEN_KEY',
						'REFRESH_TOKEN_KEY',
						'RABBITMQ_HOST',
						'RABBITMQ_USER',
						'RABBITMQ_PASSWORD',
						'RABBITMQ_PORT',
						'REDIS_HOST',
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

const config = [
	nodeGlobals,
	...baseConfigs,
	{
		files: ['migrations/**', '**/*validator.js'],
		rules: {
			camelcase: 'off',
		},
	},
	{
		files: ['src/middleware/error.js'],
		rules: {
			'functional/no-class-inheritance': 'off',
			'functional/no-classes': 'off',
		},
	},
];

// eslint-disable-next-line import-x/no-default-export -- ESLint flat config requires a default export
export default config;
