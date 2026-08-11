'use strict';

const { Router } = require('express');
const integrationController = require('../../controllers/integrationController');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');
const validateRequest = require('../../middlewares/validateRequest');
const { cisSyncSchema } = require('../../validators/documentValidators');
const { Role } = require('../../models/role.model');

const router = Router();

// All integration routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/integration/cis/sync:
 *   post:
 *     summary: Sync document reference with external Court CIS (mocked)
 *     tags: [Integration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [documentId, caseNumber, courtCode]
 *             properties:
 *               documentId:
 *                 type: string
 *                 format: uuid
 *               caseNumber:
 *                 type: string
 *               courtCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: CIS sync result
 */
router.post(
  '/cis/sync',
  requireRole(Role.LAWYER, Role.JUDGE, Role.ADMIN),
  validateRequest(cisSyncSchema),
  integrationController.syncCIS
);

module.exports = router;
