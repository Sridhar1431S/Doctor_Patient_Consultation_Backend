const doctorService = require('../services/doctorService');

async function listDoctors(req, res, next) {
  try {
    const doctors = await doctorService.listDoctors();
    res.status(200).json({ doctors });
  } catch (err) {
    next(err);
  }
}

async function getDoctorById(req, res, next) {
  try {
    const doctor = await doctorService.getDoctorById(req.params.id);
    res.status(200).json({ doctor });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDoctors, getDoctorById };
