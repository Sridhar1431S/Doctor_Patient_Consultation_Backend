const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');
const { AppError } = require('../utils/errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register({ name, email, password, role, specialization, experienceYears }) {
  if (!name || !email || !password || !role) {
    throw new AppError('name, email, password and role are required', 400);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new AppError('Invalid email format', 400);
  }
  if (!['PATIENT', 'DOCTOR'].includes(role)) {
    throw new AppError('role must be PATIENT or DOCTOR', 400);
  }
  if (role === 'DOCTOR' && (!specialization || !experienceYears)) {
    throw new AppError('specialization and experienceYears are required for doctors', 400);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError('Email is already registered', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user, and doctor profile in the same flow if role is DOCTOR.
  // Documented assumption: doctor-specific fields are supplied at registration time.
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      ...(role === 'DOCTOR' && {
        doctorProfile: {
          create: { specialization, experienceYears: Number(experienceYears) },
        },
      }),
    },
    include: { doctorProfile: true },
  });

  const { password: _, ...safeUser } = user;
  return safeUser;
}

async function login({ email, password }) {
  if (!email || !password) {
    throw new AppError('email and password are required', 400);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Deliberately vague error — don't reveal whether the email exists.
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError('Invalid credentials', 401);
  }

  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });

  return token;
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { doctorProfile: true },
  });
  if (!user) {
    throw new AppError('User not found', 404);
  }
  const { password: _, ...safeUser } = user;
  return safeUser;
}

module.exports = { register, login, getProfile };
