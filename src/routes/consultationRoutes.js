const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Only patients can initiate a consultation.
router.post('/', authenticate, authorize('PATIENT'), consultationController.createConsultation);

// Both roles can list/view — filtering to "their own" happens inside the service.
router.get('/', authenticate, consultationController.listConsultations);
router.get('/:id', authenticate, consultationController.getConsultationById);

// Role check for "must be the assigned doctor" happens inside the service,
// since it depends on WHICH consultation, not just the user's role generally.
router.patch('/:id/status', authenticate, authorize('DOCTOR'), consultationController.updateStatus);

module.exports = router;
