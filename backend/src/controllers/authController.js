'use strict';

const authService = require('../services/auth/auth.service');
const { success } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return success(res, 'User registered successfully', user, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return success(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const tokens = await authService.refresh(req.body.refreshToken);
    return success(res, 'Tokens refreshed successfully', tokens);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.body.refreshToken);
    return success(res, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return success(res, 'Profile retrieved successfully', user);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getMe,
};
