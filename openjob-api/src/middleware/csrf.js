const csrfProtection = (req, res, next) => {
	next();
};

export { csrfProtection };
