import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useClipboardStore } from '../features/clipboard/clipboard-store';
import { mockEntries } from '../infrastructure/mocks/entries';
import { mockGroups, mockVaults } from '../infrastructure/mocks/vaults';
import type { OpenKdbxResult } from '../infrastructure/tauri/kdbx-gateway';
import { useVaultStore } from './vault-store';

const resetClipboard = useClipboardStore.getState().reset;

const readOnlyResult = (sessionId = 'session-id'): OpenKdbxResult => ({
  sessionId,
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
});

describe('vault store', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: () => 'generated-id' });
    useClipboardStore.setState({ reset: resetClipboard });
    useVaultStore.setState({
      entries: mockEntries,
      vaults: mockVaults,
      groups: mockGroups,
      selectedEntryId: 'github',
      activeVaultId: 'personal',
      filter: 'all',
      query: '',
      isLocked: false,
      overlay: null,
      toast: null,
      readOnlySession: null,
    });
  });

  it('resets the tracked clipboard value when the vault locks', () => {
    const reset = vi.fn();
    useClipboardStore.setState({ reset });

    useVaultStore.getState().setLocked(true);

    expect(reset).toHaveBeenCalledOnce();
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
    useVaultStore.getState().activateReadOnlyVault(readOnlyResult(), 'fixture.kdbx');
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

  it('discards the read-only projection when locking or switching vaults', () => {
    useVaultStore.getState().activateReadOnlyVault(readOnlyResult(), 'fixture.kdbx');
    useVaultStore.getState().setLocked(true);

    expect(useVaultStore.getState().readOnlySession).toBeNull();
    expect(useVaultStore.getState().activeVaultId).toBe('personal');

    useVaultStore.setState({ isLocked: false });
    useVaultStore.getState().activateReadOnlyVault(readOnlyResult(), 'fixture.kdbx');
    useVaultStore.getState().setActiveVault('work');

    expect(useVaultStore.getState().readOnlySession).toBeNull();
    expect(useVaultStore.getState().activeVaultId).toBe('work');
  });

  it('replaces or explicitly closes the previous read-only session', async () => {
    useVaultStore.getState().activateReadOnlyVault(readOnlyResult('first-session'), 'first.kdbx');
    useVaultStore.getState().activateReadOnlyVault(readOnlyResult('second-session'), 'second.kdbx');

    expect(useVaultStore.getState().readOnlySession?.sessionId).toBe('second-session');

    await useVaultStore.getState().closeReadOnlyVault();
    expect(useVaultStore.getState().readOnlySession).toBeNull();
    expect(useVaultStore.getState().activeVaultId).toBe('personal');
  });
});
