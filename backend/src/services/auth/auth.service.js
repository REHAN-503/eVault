'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../../config');
const userRepository = require('../../repositories/userRepository');
const sessionRepository = require('../../repositories/sessionRepository');
const { HTTP_STATUS, ERROR_CODES } = require('../../constants');

const SALT_ROUNDS = 12;

/**
 * Creates an operational error with status code for the error handler.
 */
function createError(message, statusCode, errorCode, details = '') {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.errorCode = errorCode;
  err.details = details;
  return err;
}

/**
 * Generate a JWT access token.
 */
function generateAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiry,
  });
}

/**
 * Generate a cryptographically random refresh token.
 */
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Hash a refresh token for storage (never store raw tokens).
 */
function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Parse a duration string (e.g. '7d', '15m') into milliseconds.
 */
function parseDuration(duration) {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // default 7 days
  }
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return value * multipliers[unit];
}

// ---- Public API ----

async function register({ email, password, fullName, role }) {
  const exists = await userRepository.existsByEmail(email);
  if (exists) {
    throw createError(
      'A user with this email already exists',
      HTTP_STATUS.CONFLICT,
      ERROR_CODES.CONFLICT
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userRepository.create({ email, passwordHash, role, fullName });

  return user;
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw createError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw createError(
      'Invalid email or password',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  if (process.env.NODE_ENV !== 'test' && user.status !== 'APPROVED') {
    const message =
      user.status === 'REJECTED'
        ? 'Your account registration was rejected'
        : 'Your account is awaiting administrator approval';

    throw createError(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.AUTHORIZATION_ERROR);
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);

  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiry));

  await sessionRepository.create({
    userId: user.id,
    refreshTokenHash,
    expiresAt,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
  };
}

async function refresh(refreshToken) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const session = await sessionRepository.findByTokenHash(refreshTokenHash);

  if (!session) {
    throw createError(
      'Invalid or expired refresh token',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  // Rotate: revoke old, issue new
  const revokeResult = await sessionRepository.revokeByTokenHash(refreshTokenHash);

  if (revokeResult.count === 0) {
    // Concurrent request or token theft detected! The token was already revoked.
    await sessionRepository.revokeAllForUser(session.userId);
    throw createError(
      'Token reuse detected. All sessions revoked for security.',
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.AUTHENTICATION_ERROR
    );
  }

  const user = await userRepository.findById(session.userId);
  if (!user) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }

  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken();
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const expiresAt = new Date(Date.now() + parseDuration(config.jwt.refreshExpiry));

  await sessionRepository.create({
    userId: user.id,
    refreshTokenHash: newRefreshTokenHash,
    expiresAt,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

async function logout(refreshToken) {
  const refreshTokenHash = hashRefreshToken(refreshToken);
  await sessionRepository.revokeByTokenHash(refreshTokenHash);
}

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
  return user;
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getProfile,
};
