'use strict';

const { z } = require('zod');
const { PAGINATION } = require('../constants');

const documentListQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(PAGINATION.DEFAULT_PAGE),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(PAGINATION.MAX_LIMIT)
    .default(PAGINATION.DEFAULT_LIMIT),
  search: z.string().optional(),
});

const documentIdParamSchema = z.object({
  id: z.string().uuid('Invalid document ID format'),
});

const shareDocumentSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).uuid('Invalid user ID format'),
  permission: z
    .enum(['READ', 'WRITE'], {
      errorMap: () => ({ message: 'Permission must be READ or WRITE' }),
    })
    .default('READ'),
});

const revokeDocumentSchema = z.object({
  userId: z.string({ required_error: 'User ID is required' }).uuid('Invalid user ID format'),
});

const cisSyncSchema = z.object({
  documentId: z
    .string({ required_error: 'Document ID is required' })
    .uuid('Invalid document ID format'),
  caseNumber: z
    .string({ required_error: 'Case number is required' })
    .min(1, 'Case number cannot be empty')
    .max(50, 'Case number must be at most 50 characters'),
  courtCode: z
    .string({ required_error: 'Court code is required' })
    .min(1, 'Court code cannot be empty')
    .max(20, 'Court code must be at most 20 characters'),
});

module.exports = {
  documentListQuerySchema,
  documentIdParamSchema,
  shareDocumentSchema,
  revokeDocumentSchema,
  cisSyncSchema,
};
