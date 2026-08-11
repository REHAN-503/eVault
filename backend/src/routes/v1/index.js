'use strict';

const { Router } = require('express');
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const integrationRoutes = require('./integrationRoutes');
const systemRoutes = require('./systemRoutes');
const adminRoutes = require('./adminRoutes');

/**
 * V1 API Router — aggregates all route modules under /api/v1.
 */
const router = Router();

router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/integration', integrationRoutes);
router.use('/system', systemRoutes);
router.use('/', adminRoutes);

module.exports = router;
