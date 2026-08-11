'use strict';

const userRepository = require('../repositories/userRepository');
const { success, error } = require('../utils/response');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

async function listUsers(req, res, next) {
  try {
    const users = await userRepository.findAll();

    const result = users.map((user) => ({
      id: user.id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt,
    }));

    return success(res, 'Users retrieved successfully', result);
  } catch (err) {
    next(err);
  }
}

async function updateUserStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const statusMap = {
      active: 'APPROVED',
      approved: 'APPROVED',
      pending: 'PENDING',
      rejected: 'REJECTED',
    };

    const normalizedStatus = statusMap[String(status).toLowerCase()];

    if (!normalizedStatus) {
      return error(
        res,
        'Invalid user status',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR,
        'Status must be active, approved, pending, or rejected'
      );
    }

    const user = await userRepository.updateStatus(id, normalizedStatus);

    return success(res, 'User status updated successfully', {
      id: user.id,
      name: user.fullName,
      fullName: user.fullName,
      email: user.email,
      role: user.role.toLowerCase(),
      status: user.status.toLowerCase(),
      createdAt: user.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  updateUserStatus,
};
