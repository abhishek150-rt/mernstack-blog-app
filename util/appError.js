const appError = (message, statusCode) => {
  const error = new Error();
  error.statusCode = statusCode || 500;
  error.message = message;

  return error;
};

module.exports = appError;
