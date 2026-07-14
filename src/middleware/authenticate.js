const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errors');

// Verifies the Bearer token and attaches the decoded payload to req.user.
// Downstream controllers can then read req.user.id and req.user.role.
function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = authenticate;
