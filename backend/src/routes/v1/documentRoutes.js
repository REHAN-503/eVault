'use strict';

const { Router } = require('express');
const multer = require('multer');
const documentController = require('../../controllers/documentController');
const authenticate = require('../../middlewares/authenticate');
const requireRole = require('../../middlewares/requireRole');
const validateRequest = require('../../middlewares/validateRequest');
const config = require('../../config');
const {
  documentListQuerySchema,
  documentIdParamSchema,
  shareDocumentSchema,
  revokeDocumentSchema,
} = require('../../validators/documentValidators');
const { Role } = require('../../models/role.model');
const { HTTP_STATUS, ERROR_CODES } = require('../../constants');

const router = Router();

// Multer with memoryStorage — backend holds buffer in memory, never writes
// directly to disk. The mock storage service handles disk writes.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'application/octet-stream', // Required for client-side encrypted blobs
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      const err = new Error(
        'Invalid file type. Only PDF, DOC, DOCX, TXT, JPEG, and PNG are allowed.'
      );
      err.statusCode = HTTP_STATUS.BAD_REQUEST;
      err.errorCode = ERROR_CODES.VALIDATION_ERROR;
      cb(err);
    }
  },
});

// All document routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/documents/upload:
 *   post:
 *     summary: Upload an encrypted document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded
 *       400:
 *         description: No file or invalid file
 *       401:
 *         description: Not authenticated
 */
router.post(
  '/upload',
  requireRole(Role.LAWYER, Role.ADMIN),
  upload.single('file'),
  documentController.upload
);

/**
 * @swagger
 * /api/v1/documents:
 *   get:
 *     summary: List documents (paginated)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated document list
 */
router.get('/', validateRequest(documentListQuerySchema, 'query'), documentController.list);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   get:
 *     summary: Get document metadata (with access check)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document metadata
 *       403:
 *         description: Access denied
 *       404:
 *         description: Not found
 */
router.get('/:id', validateRequest(documentIdParamSchema, 'params'), documentController.getById);

/**
 * @swagger
 * /api/v1/documents/{id}/download:
 *   get:
 *     summary: Download document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: File binary
 *       403:
 *         description: Access denied
 *       404:
 *         description: Not found
 */
router.get(
  '/:id/download',
  validateRequest(documentIdParamSchema, 'params'),
  documentController.download
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   put:
 *     summary: Update document (new version)
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document updated
 */
router.put(
  '/:id',
  validateRequest(documentIdParamSchema, 'params'),
  requireRole(Role.LAWYER, Role.ADMIN),
  upload.single('file'),
  documentController.update
);

/**
 * @swagger
 * /api/v1/documents/{id}:
 *   delete:
 *     summary: Soft-delete a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Document soft-deleted
 */
router.delete(
  '/:id',
  validateRequest(documentIdParamSchema, 'params'),
  requireRole(Role.LAWYER, Role.ADMIN),
  documentController.remove
);

/**
 * @swagger
 * /api/v1/documents/{id}/share:
 *   post:
 *     summary: Share document with another user
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               permission:
 *                 type: string
 *                 enum: [READ, WRITE]
 *                 default: READ
 *     responses:
 *       200:
 *         description: Access granted
 */
router.post(
  '/:id/share',
  validateRequest(documentIdParamSchema, 'params'),
  validateRequest(shareDocumentSchema),
  requireRole(Role.LAWYER, Role.JUDGE, Role.ADMIN),
  documentController.share
);

/**
 * @swagger
 * /api/v1/documents/{id}/revoke:
 *   post:
 *     summary: Revoke user's access to a document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Access revoked
 */
router.post(
  '/:id/revoke',
  validateRequest(documentIdParamSchema, 'params'),
  validateRequest(revokeDocumentSchema),
  requireRole(Role.LAWYER, Role.JUDGE, Role.ADMIN),
  documentController.revoke
);

/**
 * @swagger
 * /api/v1/documents/{id}/verify:
 *   get:
 *     summary: Verify document hash against blockchain ledger
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Verification result
 */
router.get(
  '/:id/verify',
  validateRequest(documentIdParamSchema, 'params'),
  requireRole(Role.JUDGE, Role.ADMIN),
  documentController.verifyLedger
);

/**
 * @swagger
 * /api/v1/documents/{id}/history:
 *   get:
 *     summary: Get document version history from blockchain
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Version history
 */
router.get(
  '/:id/history',
  validateRequest(documentIdParamSchema, 'params'),
  documentController.history
);

/**
 * @swagger
 * /api/v1/documents/{id}/audit:
 *   get:
 *     summary: Get document audit trail
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Audit trail
 */
router.get(
  '/:id/audit',
  validateRequest(documentIdParamSchema, 'params'),
  documentController.audit
);

module.exports = router;
