import type { VaultEntry } from '../entities/entry';

export interface EntryRepository {
  list(vaultId: string): Promise<ReadonlyArray<VaultEntry>>;
  findById(id: string): Promise<VaultEntry | null>;
}
