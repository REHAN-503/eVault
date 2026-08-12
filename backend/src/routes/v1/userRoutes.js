'use strict';

const { Router } = require('express');
const userController = require('../../controllers/userController');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/v1/users/lawyers:
 *   get:
 *     summary: List approved lawyers
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of approved lawyers
 */
router.get('/lawyers', requireRole('JUDGE', 'ADMIN'), userController.listApprovedLawyers);

module.exports = router;
