import { Context, Contract, Info, Transaction } from 'fabric-contract-api';
import { assertNonEmpty, assertUuid } from './validation';
import { AuditEntry } from './types';

@Info({
  title: 'AuditLogContract',
  description: 'Records a tamper-evident audit trail of actions on documents',
})
export class AuditLogContract extends Contract {
  constructor() {
    super('AuditLogContract');
  }

  private auditKey(ctx: Context, docId: string, txId: string): string {
    return ctx.stub.createCompositeKey('Audit', [docId, txId]);
  }

  @Transaction()
  public async logAction(
    ctx: Context,
    docId: string,
    userId: string,
    action: string
  ): Promise<string> {
    assertUuid(docId, 'docId');
    assertUuid(userId, 'userId');
    assertNonEmpty(action, 'action');

    const txId = ctx.stub.getTxID();
    const txTimestamp = ctx.stub.getTxTimestamp();
    const seconds = txTimestamp?.seconds
      ? Number((txTimestamp.seconds as any).low ?? txTimestamp.seconds)
      : Math.floor(Date.now() / 1000);

    const entry: AuditEntry = {
      docId,
      userId,
      action,
      timestamp: new Date(seconds * 1000).toISOString(),
    };

    await ctx.stub.putState(
      this.auditKey(ctx, docId, txId),
      Buffer.from(JSON.stringify(entry))
    );

    return JSON.stringify({ docId, userId, action, txId });
  }

  /**
   * Returns the full audit trail for a document, ordered oldest-first.
   */
  @Transaction(false)
  public async getAuditTrail(ctx: Context, docId: string): Promise<string> {
    assertUuid(docId, 'docId');

    const entries: AuditEntry[] = [];

    for await (const kv of ctx.stub.getStateByPartialCompositeKey('Audit', [docId])) {
      if (kv && kv.value && kv.value.length > 0) {
        entries.push(
          JSON.parse(Buffer.from(kv.value).toString('utf8')) as AuditEntry
        );
      }
    }

    entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    return JSON.stringify(entries);
  }
}
