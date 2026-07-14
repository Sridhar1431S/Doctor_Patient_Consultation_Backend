const { AppError } = require('../utils/errors');

// Usage: authorize('PATIENT') or authorize('DOCTOR')
// Must run AFTER authenticate, since it relies on req.user being set.
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

module.exports = authorize;
