const prisma = require('../config/prismaClient');
const { AppError } = require('../utils/errors');
const { getConsultationWithAccessCheck } = require('./consultationService');

async function sendMessage(consultationId, user, content) {
  if (!content || !content.trim()) {
    throw new AppError('Message content is required', 400);
  }

  // Reuses the same ownership check as the consultation routes —
  // throws 404 if it doesn't exist, 403 if this user isn't part of it.
  const consultation = await getConsultationWithAccessCheck(consultationId, user);

  if (consultation.status !== 'ACTIVE') {
    throw new AppError('Messages can only be sent in an active consultation', 400);
  }

  return prisma.message.create({
    data: {
      consultationId: consultation.id,
      senderId: user.id,
      content: content.trim(),
    },
  });
}

async function listMessages(consultationId, user) {
  await getConsultationWithAccessCheck(consultationId, user);

  return prisma.message.findMany({
    where: { consultationId: Number(consultationId) },
    orderBy: { createdAt: 'asc' },
    include: { sender: { select: { id: true, name: true, role: true } } },
  });
}

module.exports = { sendMessage, listMessages };
