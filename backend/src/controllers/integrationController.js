'use strict';

const integrationService = require('../services/integration/integration.service');
const { success } = require('../utils/response');

async function syncCIS(req, res, next) {
  try {
    const result = await integrationService.syncWithCIS(req.body);
    return success(res, 'CIS sync completed successfully', result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  syncCIS,
};
