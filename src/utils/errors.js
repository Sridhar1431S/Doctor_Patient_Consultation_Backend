// Custom error class so controllers/services can throw with a status code
// attached, instead of manually calling res.status() everywhere.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Registered LAST in app.js. Catches anything thrown (including AppError)
// and any error passed via next(err).
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  if (!err.statusCode) {
    // Unexpected errors (bugs, DB connection issues, etc.) — log full detail server-side
    console.error(err);
  }

  res.status(statusCode).json({ error: message });
}

module.exports = { AppError, errorHandler };
