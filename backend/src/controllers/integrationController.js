'use strict';

const caseManagementAdapter = require('../integrations/CaseManagementAdapter');
const { success } = require('../utils/response');

async function syncCIS(req, res, next) {
  try {
    const result = await caseManagementAdapter.syncWithCIS(req.body);
    return success(res, 'CIS sync completed successfully', result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  syncCIS,
};
