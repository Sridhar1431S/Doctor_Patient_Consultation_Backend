const prisma = require('../config/prismaClient');
const { AppError } = require('../utils/errors');

const VALID_STATUSES = ['PENDING', 'ACTIVE', 'COMPLETED'];

// Allowed forward-only transitions. Adjust here if your README documents a
// different assumption (e.g. allowing PENDING -> COMPLETED directly).
const ALLOWED_TRANSITIONS = {
  PENDING: ['ACTIVE'],
  ACTIVE: ['COMPLETED'],
  COMPLETED: [],
};

async function createConsultation(patientId, doctorId) {
  if (!doctorId) {
    throw new AppError('doctorId is required', 400);
  }

  const doctor = await prisma.doctorProfile.findUnique({ where: { id: Number(doctorId) } });
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  return prisma.consultation.create({
    data: { patientId, doctorId: Number(doctorId) },
  });
}

async function listConsultationsForUser(user, { page = 1, limit = 10 } = {}) {
  // Guard against garbage query params (e.g. ?page=abc or ?limit=-5).
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(50, Math.max(1, Number(limit) || 10)); // cap at 50 per page
  const skip = (pageNum - 1) * limitNum;

  let where;
  if (user.role === 'PATIENT') {
    where = { patientId: user.id };
  } else {
    // DOCTOR: find their doctorProfile first, then filter consultations by it.
    const doctorProfile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
    if (!doctorProfile) {
      return { consultations: [], pagination: { page: pageNum, limit: limitNum, total: 0, totalPages: 0 } };
    }
    where = { doctorId: doctorProfile.id };
  }

  const include =
    user.role === 'PATIENT'
      ? { doctor: { include: { user: { select: { name: true } } } } }
      : { patient: { select: { name: true } } };

  // Run the page query and the total count together.
  const [consultations, total] = await Promise.all([
    prisma.consultation.findMany({
      where,
      include,
      skip,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.consultation.count({ where }),
  ]);

  return {
    consultations,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
}

// Shared helper — also used by messageService, which is why it lives here
// rather than being duplicated in the controller.
async function getConsultationWithAccessCheck(consultationId, user) {
  const consultation = await prisma.consultation.findUnique({
    where: { id: Number(consultationId) },
    include: { doctor: true },
  });

  if (!consultation) {
    throw new AppError('Consultation not found', 404);
  }

  const isPatient = user.role === 'PATIENT' && consultation.patientId === user.id;
  const isDoctor = user.role === 'DOCTOR' && consultation.doctor.userId === user.id;

  if (!isPatient && !isDoctor) {
    throw new AppError('You do not have access to this consultation', 403);
  }

  return consultation;
}

async function updateStatus(consultationId, newStatus, user) {
  if (!VALID_STATUSES.includes(newStatus)) {
    throw new AppError('Invalid status value', 400);
  }

  const consultation = await getConsultationWithAccessCheck(consultationId, user);

  // Only the assigned doctor may change status — patients cannot.
  const isAssignedDoctor = user.role === 'DOCTOR' && consultation.doctor.userId === user.id;
  if (!isAssignedDoctor) {
    throw new AppError('Only the assigned doctor can change consultation status', 403);
  }

  if (consultation.status === 'COMPLETED') {
    throw new AppError('Completed consultations cannot be modified', 400);
  }

  if (!ALLOWED_TRANSITIONS[consultation.status].includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${consultation.status} to ${newStatus}`,
      400
    );
  }

  return prisma.consultation.update({
    where: { id: consultation.id },
    data: { status: newStatus },
  });
}

module.exports = {
  createConsultation,
  listConsultationsForUser,
  getConsultationWithAccessCheck,
  updateStatus,
};
