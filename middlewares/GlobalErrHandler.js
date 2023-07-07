const globalErrHandler = (err, req, res, next) => {

  const statusCode = err?.statusCode || 500;
  const status = err?.status || "Failed";
  const message = err.message;

  return res.status(statusCode).json({
    status,
    message,
    statusCode,
  });
};

module.exports = globalErrHandler;
