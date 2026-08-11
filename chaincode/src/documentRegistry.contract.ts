import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { badRequest, conflict, notFound } from './errors';
import {
  documentKey,
  ensureUserRegistered,
  getDocumentRecord,
  putDocumentRecord,
} from './ledgerHelpers';
import { assertNonEmpty, assertRole, assertUuid } from './validation';
import { DocumentMetadata, DocumentRecord } from './types';

@Info({
  title: 'DocumentRegistryContract',
  description:
    'Anchors document content hashes and version history on the ledger',
})
export class DocumentRegistryContract extends Contract {
  constructor() {
    super('DocumentRegistryContract');
  }

  /**
   * Records a new document.
   *
   * NOTE on ownerRole: chaincode cannot reach an external database (e.g. the
   * backend's Postgres users table), so unlike a typical mock implementation
   * that might look up the owner's role itself, this contract requires the
   * caller (the gateway wrapper) to pass ownerRole explicitly so it can
   * auto-register the owner if they aren't already known on-chain. This
   * mirrors ensureUserRegistered()'s spec, just resolved one layer up.
   */
  @Transaction()
  public async recordDocument(
    ctx: Context,
    docId: string,
    hash: string,
    metadataJSON: string,
    ownerId: string,
    ownerRole: string
  ): Promise<string> {
    assertUuid(docId, 'docId');
    assertNonEmpty(hash, 'hash');
    assertUuid(ownerId, 'ownerId');
    assertRole(ownerRole);

    const existing = await getDocumentRecord(ctx, docId);
    if (existing) {
      throw conflict(`Document already recorded: ${docId}`);
    }

    let metadata: DocumentMetadata;
    try {
      metadata = JSON.parse(metadataJSON);
    } catch {
      throw badRequest('metadata must be valid JSON');
    }

    await ensureUserRegistered(ctx, ownerId, ownerRole as any);

    const record: DocumentRecord = {
      docId,
      hash,
      metadata: { ...metadata, version: metadata.version ?? 1 },
      ownerId,
    };
    await putDocumentRecord(ctx, record);

    ctx.stub.setEvent(
      'DocumentAdded',
      Buffer.from(JSON.stringify({ docId, hash, ownerId }))
    );

    return JSON.stringify({ docId, hash, txId: ctx.stub.getTxID() });
  }

  @Transaction()
  public async updateDocument(
    ctx: Context,
    docId: string,
    newHash: string,
    metadataJSON: string
  ): Promise<string> {
    assertUuid(docId, 'docId');
    assertNonEmpty(newHash, 'newHash');

    const existing = await getDocumentRecord(ctx, docId);
    if (!existing) {
      throw notFound(`Document not found: ${docId}`);
    }

    let metadata: DocumentMetadata;
    try {
      metadata = JSON.parse(metadataJSON);
    } catch {
      throw badRequest('metadata must be valid JSON');
    }

    const previousVersion = existing.metadata.version ?? 1;
    const record: DocumentRecord = {
      ...existing,
      hash: newHash,
      metadata: { ...metadata, version: metadata.version ?? previousVersion + 1 },
    };
    await putDocumentRecord(ctx, record);

    return JSON.stringify({ docId, hash: newHash, txId: ctx.stub.getTxID() });
  }

  @Transaction(false)
  public async getDocument(ctx: Context, docId: string): Promise<string> {
    assertUuid(docId, 'docId');

    const record = await getDocumentRecord(ctx, docId);
    if (!record) {
      throw notFound(`Document not found: ${docId}`);
    }

    return JSON.stringify({ hash: record.hash, metadata: record.metadata });
  }

  /**
   * Returns the full, real version history for a document by reading the
   * ledger's own transaction history for its key — NOT a manually
   * maintained array. Every putState() call against this key (from
   * recordDocument and each updateDocument) is a separate immutable ledger
   * entry, so this reflects the true on-chain history.
   */
  @Transaction(false)
  public async getVersionHistory(ctx: Context, docId: string): Promise<string> {
    assertUuid(docId, 'docId');

    const key = documentKey(ctx, docId);

    const history: Array<{
      hash: string;
      metadata: DocumentMetadata;
      timestamp: string;
    }> = [];

    for await (const entry of ctx.stub.getHistoryForKey(key)) {
      if (entry && entry.value && entry.value.length > 0) {
        const parsed = JSON.parse(
          Buffer.from(entry.value).toString('utf8')
        ) as DocumentRecord;
        const rawSeconds: any = entry.timestamp?.seconds;
        const seconds = rawSeconds
          ? Number(rawSeconds.low ?? rawSeconds)
          : 0;
        history.push({
          hash: parsed.hash,
          metadata: parsed.metadata,
          timestamp: new Date(seconds * 1000).toISOString(),
        });
      }
    }

    if (history.length === 0) {
      throw notFound(`Document not found: ${docId}`);
    }

    return JSON.stringify(history);
  }
}
