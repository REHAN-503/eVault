import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { conflict, notFound } from './errors';
import {
  getAccessRecord,
  getUserRecord,
  putAccessRecord,
  putUserRecord,
  deleteAccessRecord,
  getDocumentRecord,
} from './ledgerHelpers';
import { assertPermission, assertRole, assertUuid } from './validation';

@Info({
  title: 'AccessControlContract',
  description: 'Manages user registration and per-document access permissions',
})
export class AccessControlContract extends Contract {
  constructor() {
    super('AccessControlContract');
  }

  @Transaction()
  public async registerUser(
    ctx: Context,
    id: string,
    role: string
  ): Promise<string> {
    assertUuid(id, 'id');
    assertRole(role);

    const existing = await getUserRecord(ctx, id);
    if (existing) {
      throw conflict(`User already registered: ${id}`);
    }

    await putUserRecord(ctx, id, role);

    return JSON.stringify({
      userId: id,
      role,
      txId: ctx.stub.getTxID(),
    });
  }

  @Transaction()
  public async grantAccess(
    ctx: Context,
    docId: string,
    userId: string,
    permission: string
  ): Promise<string> {
    assertUuid(docId, 'docId');
    assertUuid(userId, 'userId');
    assertPermission(permission);

    const doc = await getDocumentRecord(ctx, docId);
    if (!doc) {
      throw notFound(`Document not found: ${docId}`);
    }

    const existing = await getAccessRecord(ctx, docId, userId);
    if (existing && existing.permission === permission) {
      throw conflict(
        `User ${userId} already has ${permission} access to document ${docId}`
      );
    }

    await putAccessRecord(ctx, docId, userId, permission as 'READ' | 'WRITE');

    ctx.stub.setEvent(
      'AccessGranted',
      Buffer.from(JSON.stringify({ docId, userId, permission }))
    );

    return JSON.stringify({
      docId,
      userId,
      permission,
      txId: ctx.stub.getTxID(),
    });
  }

  @Transaction()
  public async revokeAccess(
    ctx: Context,
    docId: string,
    userId: string
  ): Promise<string> {
    assertUuid(docId, 'docId');
    assertUuid(userId, 'userId');

    const existing = await getAccessRecord(ctx, docId, userId);
    if (!existing) {
      throw notFound(
        `No existing access grant for user ${userId} on document ${docId}`
      );
    }

    await deleteAccessRecord(ctx, docId, userId);

    ctx.stub.setEvent(
      'AccessRevoked',
      Buffer.from(JSON.stringify({ docId, userId }))
    );

    return JSON.stringify({ docId, userId, txId: ctx.stub.getTxID() });
  }

  @Transaction(false)
  public async checkAccess(
    ctx: Context,
    docId: string,
    userId: string
  ): Promise<boolean> {
    assertUuid(docId, 'docId');
    assertUuid(userId, 'userId');

    const doc = await getDocumentRecord(ctx, docId);
    if (doc && doc.ownerId === userId) {
      // Owners implicitly have access to their own documents.
      return true;
    }

    const access = await getAccessRecord(ctx, docId, userId);
    return !!access;
  }
}
