const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Note: GET /profile is technically outside the /auth prefix per the spec
// (it's mounted separately in app.js), but the handler lives here since
// it's auth-related.
module.exports = router;
module.exports.getProfile = [authenticate, authController.getProfile];
