import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockEntries } from '../infrastructure/mocks/entries';
import { mockGroups, mockVaults } from '../infrastructure/mocks/vaults';
import type { OpenKdbxResult } from '../infrastructure/tauri/kdbx-gateway';
import { useVaultStore } from './vault-store';

describe('vault store', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
    useVaultStore.setState({
      entries: mockEntries,
      vaults: mockVaults,
      groups: mockGroups,
      selectedEntryId: 'github',
      activeVaultId: 'personal',
      filter: 'all',
      query: '',
      overlay: null,
      toast: null,
      readOnlySession: null,
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

  it('activates a native read-only projection without secret fields or mutations', () => {
    const result: OpenKdbxResult = {
      sessionId: 'session-id',
      database: {
        name: 'Fixture',
        format: 'KDBX 4.1',
        groups: [{ id: 'group-id', name: 'Logins', depth: 0 }],
        entries: [
          {
            id: 'entry-id',
            groupId: 'group-id',
            title: 'Example service',
            username: 'demo-user',
            url: 'https://example.test',
            favorite: false,
          },
        ],
      },
      capabilities: { read: true, write: false, revealSecrets: false },
    };

    useVaultStore.getState().activateReadOnlyVault(result, 'fixture.kdbx');
    const activated = useVaultStore.getState();
    const entry = activated.entries[0];

    expect(activated.readOnlySession?.format).toBe('KDBX 4.1');
    expect(entry?.type).toBe('login');
    expect(entry?.type === 'login' ? entry.password : 'unexpected').toBe('');

    useVaultStore.getState().toggleFavorite('entry-id');
    useVaultStore.getState().trashEntry('entry-id');

    expect(useVaultStore.getState().entries[0]?.favorite).toBe(false);
    expect(useVaultStore.getState().entries[0]?.trashedAt).toBeUndefined();
  });
});
