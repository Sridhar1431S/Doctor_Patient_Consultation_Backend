const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const authenticate = require('../middleware/authenticate');

// Decision: browsing doctors requires login (any authenticated user) but not a specific role.
// If you'd rather this be fully public, just remove `authenticate` — document the choice either way.
router.get('/', authenticate, doctorController.listDoctors);
router.get('/:id', authenticate, doctorController.getDoctorById);

module.exports = router;
