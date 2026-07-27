import type { VaultEntry } from '../../domain/entities/entry';
import type { EntryRepository } from '../../domain/repositories/entry-repository';
import { mockEntries } from './entries';

export class MockEntryRepository implements EntryRepository {
  async list(vaultId: string): Promise<ReadonlyArray<VaultEntry>> {
    return Promise.resolve(mockEntries.filter((entry) => entry.vaultId === vaultId));
  }

  async findById(id: string): Promise<VaultEntry | null> {
    return Promise.resolve(mockEntries.find((entry) => entry.id === id) ?? null);
  }
}
