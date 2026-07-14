const consultationService = require('../services/consultationService');

async function createConsultation(req, res, next) {
  try {
    const consultation = await consultationService.createConsultation(
      req.user.id,
      req.body.doctorId
    );
    res.status(201).json({ consultation });
  } catch (err) {
    next(err);
  }
}

async function listConsultations(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await consultationService.listConsultationsForUser(req.user, { page, limit });
    res.status(200).json(result); // { consultations, pagination }
  } catch (err) {
    next(err);
  }
}

async function getConsultationById(req, res, next) {
  try {
    const consultation = await consultationService.getConsultationWithAccessCheck(
      req.params.id,
      req.user
    );
    res.status(200).json({ consultation });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const consultation = await consultationService.updateStatus(
      req.params.id,
      req.body.status,
      req.user
    );
    res.status(200).json({ consultation });
  } catch (err) {
    next(err);
  }
}

module.exports = { createConsultation, listConsultations, getConsultationById, updateStatus };
