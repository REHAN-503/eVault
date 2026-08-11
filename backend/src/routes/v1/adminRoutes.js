'use strict';

const { Router } = require('express');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');
const adminController = require('../../controllers/adminController');

const router = Router();

router.get(
  '/users',
  authenticate,
  requireRole('ADMIN'),
  adminController.listUsers
);

router.patch(
  '/users/:id/status',
  authenticate,
  requireRole('ADMIN'),
  adminController.updateUserStatus
);

module.exports = router;
