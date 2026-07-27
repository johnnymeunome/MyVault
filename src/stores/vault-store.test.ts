import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockEntries } from '../infrastructure/mocks/entries';
import { useVaultStore } from './vault-store';

describe('vault store', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
    useVaultStore.setState({
      entries: mockEntries,
      selectedEntryId: 'github',
      activeVaultId: 'personal',
      filter: 'all',
      query: '',
      overlay: null,
      toast: null,
    });
  });

  it('creates a login only in memory and selects it', () => {
    useVaultStore.getState().createLogin({
      title: 'Exemplo',
      username: 'demo',
      password: 'not-real',
      url: 'https://example.test',
      notes: '',
      tags: ['demo'],
      favorite: false,
    });
    const state = useVaultStore.getState();
    expect(state.selectedEntryId).toBe('generated-id');
    expect(state.entries[0]?.title).toBe('Exemplo');
  });

  it('moves the selected item to trash', () => {
    useVaultStore.getState().trashEntry('github');
    expect(
      useVaultStore.getState().entries.find((entry) => entry.id === 'github')?.trashedAt,
    ).toBeTruthy();
    expect(useVaultStore.getState().selectedEntryId).not.toBe('github');
  });
});
