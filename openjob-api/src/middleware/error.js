class AuthenticationError extends Error {
	constructor(message = 'Unauthenticated') {
		super(message);
		this.name = 'AuthenticationError';
		this.statusCode = 401;
	}
}

class AuthorizationError extends Error {
	constructor(message = 'Forbidden') {
		super(message);
		this.name = 'AuthorizationError';
		this.statusCode = 403;
	}
}

class ClientError extends Error {
	constructor(message, statusCode = 400) {
		super(message);
		this.name = 'ClientError';
		this.statusCode = statusCode;
	}
}

class NotFoundError extends Error {
	constructor(message = 'Resource not found') {
		super(message);
		this.name = 'NotFoundError';
		this.statusCode = 404;
	}
}

function errorHandler(error, _req, res, _next) {
	if (error.statusCode) {
		return res.status(error.statusCode).json({
			message: error.message,
			status: 'failed',
		});
	}
	if (error.name === 'MulterError' || error.message === 'File is required') {
		const message = error.code === 'LIMIT_UNEXPECTED_FILE' ? 'File is required' : error.message;
		return res.status(400).json({
			message,
			status: 'failed',
		});
	}
	console.error(error);
	res.status(500).json({
		message: 'Internal server error',
		status: 'failed',
	});
}

export { AuthenticationError, AuthorizationError, ClientError, errorHandler, NotFoundError };
