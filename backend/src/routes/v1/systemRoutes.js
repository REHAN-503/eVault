'use strict';

const { Router } = require('express');
const systemController = require('../../controllers/systemController');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: System
 *   description: System monitoring and health endpoints
 */

/**
 * @swagger
 * /api/v1/system/status:
 *   get:
 *     summary: Get system status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System status details
 */
router.get('/status', systemController.getStatus);

/**
 * @swagger
 * /api/v1/system/info:
 *   get:
 *     summary: Get system metrics and environment info
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System information (Admin only)
 */
router.get('/info', authenticate, requireRole('ADMIN'), systemController.getInfo);

/**
 * @swagger
 * /api/v1/system/version:
 *   get:
 *     summary: Get API version
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API version details
 */
router.get('/version', systemController.getVersion);

module.exports = router;
