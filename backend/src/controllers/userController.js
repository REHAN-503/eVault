'use strict';

const userRepository = require('../repositories/userRepository');
const { success } = require('../utils/response');

async function listApprovedLawyers(req, res, next) {
  try {
    const lawyers = await userRepository.findApprovedLawyers();
    return success(res, 'Approved lawyers retrieved successfully', lawyers);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listApprovedLawyers,
};
