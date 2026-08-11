'use strict';

const documentService = require('../services/document/document.service');
const { success } = require('../utils/response');
const { HTTP_STATUS } = require('../constants');

function mapDocumentForFrontend(doc) {
  return {
    id: doc.id,
    docId: doc.docId,
    title: doc.title || doc.filename,
    filename: doc.filename,
    caseNo: doc.caseNo || 'N/A',
    ownerId: doc.ownerId,
    ownerName: doc.owner?.fullName || 'Unknown',
    hash: doc.currentHash,
    cid: doc.cid,
    status: 'verified', // If it's in the DB, it's considered verified unless flagged
    size: `${(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB`,
    version: doc.version,
    updatedAt: doc.updatedAt,
    sharedWith: doc.sharedWith ? doc.sharedWith.map(u => u.id) : [],
  };
}

async function upload(req, res, next) {
  try {
    const { title, caseNo } = req.body;
    const document = await documentService.uploadDocument(req.file, req.user.id, req.user.role, title, caseNo);
    return success(res, 'Document uploaded successfully', mapDocumentForFrontend(document), HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { documents, total } = await documentService.listDocuments(
      req.user.id,
      req.user.role,
      req.query
    );

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;

    return success(res, 'Documents retrieved successfully', {
      documents: documents.map(mapDocumentForFrontend),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const document = await documentService.getDocument(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, 'Document retrieved successfully', mapDocumentForFrontend(document));
  } catch (err) {
    next(err);
  }
}

async function download(req, res, next) {
  try {
    const { buffer, filename, mimetype } = await documentService.downloadDocument(
      req.params.id,
      req.user.id,
      req.user.role
    );

    res.set({
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${filename.replace(/"/g, '')}"`,
      'Content-Length': buffer.length,
    });

    return res.send(buffer);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const document = await documentService.updateDocument(
      req.params.id,
      req.file,
      req.user.id,
      req.user.role
    );
    return success(res, 'Document updated successfully', mapDocumentForFrontend(document));
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const result = await documentService.deleteDocument(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, 'Document deleted successfully', result);
  } catch (err) {
    next(err);
  }
}

async function share(req, res, next) {
  try {
    const result = await documentService.shareDocument(
      req.params.id,
      req.body.userId,
      req.body.permission,
      req.user.id,
      req.user.role
    );
    return success(res, 'Access granted successfully', result);
  } catch (err) {
    next(err);
  }
}

async function revoke(req, res, next) {
  try {
    const result = await documentService.revokeDocument(
      req.params.id,
      req.body.userId,
      req.user.id,
      req.user.role
    );
    return success(res, 'Access revoked successfully', result);
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const versionHistory = await documentService.getDocumentHistory(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, 'Version history retrieved successfully', versionHistory);
  } catch (err) {
    next(err);
  }
}

async function audit(req, res, next) {
  try {
    const auditTrail = await documentService.getDocumentAudit(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, 'Audit trail retrieved successfully', auditTrail);
  } catch (err) {
    next(err);
  }
}

async function verifyLedger(req, res, next) {
  try {
    const result = await documentService.verifyLedger(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return success(res, 'Ledger verification complete', result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  upload,
  list,
  getById,
  download,
  update,
  remove,
  share,
  revoke,
  history,
  audit,
  verifyLedger,
};
