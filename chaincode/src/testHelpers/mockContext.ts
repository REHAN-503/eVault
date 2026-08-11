/**
 * A minimal, in-memory mock of Fabric's Context/ChaincodeStub, sufficient
 * to unit-test our contract logic (world state get/put/delete, composite
 * keys, history, partial-key queries, events, tx id/timestamp) without a
 * running Fabric network. This is NOT a substitute for real network
 * testing — it validates our business logic in isolation.
 */

interface HistoryEntry {
  value: Buffer;
  timestamp: { seconds: number };
  isDelete: boolean;
}

export class MockStub {
  public state = new Map<string, Buffer>();
  public history = new Map<string, HistoryEntry[]>();
  public events: Array<{ name: string; payload: Buffer }> = [];
  private txCounter = 0;
  private clock = 1_700_000_000; // arbitrary fixed epoch seconds, increments per tx

  createCompositeKey(objectType: string, attributes: string[]): string {
    // Mirrors Fabric's convention closely enough for prefix-based partial
    // composite key queries to work correctly in tests.
    const SEP = '\u0000';
    return `${objectType}${SEP}${attributes.join(SEP)}${SEP}`;
  }

  async getState(key: string): Promise<Buffer> {
    return this.state.get(key) ?? Buffer.alloc(0);
  }

  async putState(key: string, value: Buffer): Promise<void> {
    this.state.set(key, value);
    const h = this.history.get(key) ?? [];
    h.push({ value, timestamp: { seconds: this.clock++ }, isDelete: false });
    this.history.set(key, h);
  }

  async deleteState(key: string): Promise<void> {
    this.state.delete(key);
    const h = this.history.get(key) ?? [];
    h.push({ value: Buffer.alloc(0), timestamp: { seconds: this.clock++ }, isDelete: true });
    this.history.set(key, h);
  }

  getHistoryForKey(key: string) {
    const entries = this.history.get(key) ?? [];
    return this.toAsyncIterable(entries.map((e) => ({
      value: e.value,
      timestamp: { seconds: { low: e.timestamp.seconds } },
      isDelete: e.isDelete,
    })));
  }

  getStateByPartialCompositeKey(objectType: string, attributes: string[]) {
    const SEP = '\u0000';
    const prefix = `${objectType}${SEP}${attributes.join(SEP)}${SEP}`;
    const matches: Array<{ key: string; value: Buffer }> = [];
    for (const [key, value] of this.state.entries()) {
      if (key.startsWith(prefix)) {
        matches.push({ key, value });
      }
    }
    return this.toAsyncIterable(matches);
  }

  private toAsyncIterable<T>(items: T[]) {
    let i = 0;
    return {
      [Symbol.asyncIterator]() {
        return {
          next: async () => {
            if (i < items.length) {
              return { value: items[i++], done: false };
            }
            return { value: undefined, done: true };
          },
        };
      },
      next: async () => {
        if (i < items.length) {
          return { value: items[i++], done: false };
        }
        return { value: undefined, done: true };
      },
      close: async () => {},
    } as any;
  }

  getTxID(): string {
    return `mock-tx-${++this.txCounter}`;
  }

  getTxTimestamp() {
    return { seconds: { low: this.clock } };
  }

  setEvent(name: string, payload: Buffer): void {
    this.events.push({ name, payload });
  }
}

export function createMockContext() {
  const stub = new MockStub();
  return { stub } as any;
}
