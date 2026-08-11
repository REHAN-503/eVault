'use strict';

const systemService = require('../services/systemService');
const { success } = require('../utils/response');

async function getStatus(req, res, next) {
  try {
    const status = await systemService.getStatus();
    return success(res, 'System status retrieved', status);
  } catch (err) {
    next(err);
  }
}

async function getInfo(req, res, next) {
  try {
    const info = systemService.getInfo();
    return success(res, 'System info retrieved', info);
  } catch (err) {
    next(err);
  }
}

async function getVersion(req, res, next) {
  try {
    const version = systemService.getVersion();
    return success(res, 'System version retrieved', version);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStatus,
  getInfo,
  getVersion,
};
