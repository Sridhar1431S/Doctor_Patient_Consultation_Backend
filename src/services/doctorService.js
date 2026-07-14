const prisma = require('../config/prismaClient');
const { AppError } = require('../utils/errors');

async function listDoctors() {
  const doctors = await prisma.doctorProfile.findMany({
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  return doctors;
}

async function getDoctorById(id) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: Number(id) },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
  return doctor;
}

module.exports = { listDoctors, getDoctorById };
