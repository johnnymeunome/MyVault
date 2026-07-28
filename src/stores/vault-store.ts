import { create } from 'zustand';
import type { LoginEntry, LoginEntryInput, Tag, VaultEntry } from '../domain/entities/entry';
import type { Vault, VaultGroup } from '../domain/entities/vault';
import type { EntryFilter } from '../domain/services/entry-search';
import { mockEntries } from '../infrastructure/mocks/entries';
import { mockGroups, mockVaults } from '../infrastructure/mocks/vaults';
import { closeKdbxSession, type OpenKdbxResult } from '../infrastructure/tauri/kdbx-gateway';
import type { Overlay } from '../types/navigation';

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  tone: 'success' | 'neutral' | 'danger';
}

export interface ReadOnlyVaultSession {
  sessionId: string;
  vaultId: string;
  format: string;
}

interface VaultState {
  vaults: Vault[];
  groups: VaultGroup[];
  activeVaultId: string;
  entries: VaultEntry[];
  selectedEntryId: string;
  filter: EntryFilter;
  query: string;
  isLocked: boolean;
  overlay: Overlay;
  theme: 'dark' | 'light';
  toast: ToastMessage | null;
  readOnlySession: ReadOnlyVaultSession | null;
  setActiveVault: (id: string) => void;
  activateReadOnlyVault: (result: OpenKdbxResult, fileName: string) => void;
  closeReadOnlyVault: () => Promise<void>;
  setSelectedEntry: (id: string) => void;
  setFilter: (filter: EntryFilter) => void;
  setQuery: (query: string) => void;
  setLocked: (locked: boolean) => void;
  setOverlay: (overlay: Overlay) => void;
  toggleTheme: () => void;
  toggleFavorite: (id: string) => void;
  createLogin: (input: LoginEntryInput) => void;
  updateLogin: (id: string, input: LoginEntryInput) => void;
  duplicateEntry: (id: string) => void;
  trashEntry: (id: string) => void;
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
  clearToast: () => void;
}

const tagsFromLabels = (labels: string[]): Tag[] =>
  labels.map((label) => ({ id: label.toLocaleLowerCase('pt-BR').replace(/\s+/g, '-'), label }));

const closeNativeSession = (session: ReadOnlyVaultSession | null) => {
  if (session) void closeKdbxSession(session.sessionId).catch(() => undefined);
};

const mockState = () => ({
  vaults: mockVaults,
  groups: mockGroups,
  activeVaultId: 'personal',
  entries: mockEntries,
  selectedEntryId: 'github',
  filter: 'all' as EntryFilter,
  query: '',
  readOnlySession: null,
});

export const useVaultStore = create<VaultState>((set, get) => ({
  ...mockState(),
  isLocked: false,
  overlay: null,
  theme: 'dark',
  toast: null,
  setActiveVault: (id) => {
    const current = get();
    if (current.readOnlySession && id !== current.readOnlySession.vaultId) {
      closeNativeSession(current.readOnlySession);
      const next = mockEntries.find((entry) => entry.vaultId === id && !entry.trashedAt);
      set({ ...mockState(), activeVaultId: id, selectedEntryId: next?.id ?? '' });
      return;
    }
    const first = current.entries.find((entry) => entry.vaultId === id && !entry.trashedAt);
    set({ activeVaultId: id, selectedEntryId: first?.id ?? '', filter: 'all', query: '' });
  },
  activateReadOnlyVault: (result, fileName) => {
    closeNativeSession(get().readOnlySession);
    const vaultId = `kdbx:${result.sessionId}`;
    const fallbackDate = '1970-01-01T00:00:00.000Z';
    const entries: VaultEntry[] = result.database.entries.map((entry) => ({
      id: entry.id,
      vaultId,
      groupId: entry.groupId,
      type: 'login',
      title: entry.title,
      username: entry.username,
      password: '',
      url: entry.url,
      notes: '',
      tags: [],
      favorite: entry.favorite,
      createdAt: entry.updatedAt ?? fallbackDate,
      updatedAt: entry.updatedAt ?? fallbackDate,
      accent: '#82a9bc',
    }));
    const groups: VaultGroup[] = result.database.groups.map((group) => ({
      id: group.id,
      vaultId,
      name: group.name,
      parentId: group.parentId,
      depth: group.depth,
    }));
    const vault: Vault = {
      id: vaultId,
      name: result.database.name || 'Fixture KDBX',
      fileName,
      color: 'steel',
      entryCount: entries.length,
    };

    set({
      vaults: [...mockVaults, vault],
      groups,
      activeVaultId: vaultId,
      entries,
      selectedEntryId: entries[0]?.id ?? '',
      filter: 'all',
      query: '',
      overlay: null,
      readOnlySession: { sessionId: result.sessionId, vaultId, format: result.database.format },
    });
    get().showToast({
      title: 'Fixture aberta',
      description: `${result.database.format} · somente leitura · sem campos protegidos`,
      tone: 'success',
    });
  },
  closeReadOnlyVault: async () => {
    const session = get().readOnlySession;
    if (session) await closeKdbxSession(session.sessionId).catch(() => undefined);
    set(mockState());
  },
  setSelectedEntry: (id) => set({ selectedEntryId: id }),
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  setLocked: (isLocked) => {
    if (isLocked) closeNativeSession(get().readOnlySession);
    set({ ...(isLocked && get().readOnlySession ? mockState() : {}), isLocked, overlay: null });
  },
  setOverlay: (overlay) => set({ overlay }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleFavorite: (id) => {
    if (get().readOnlySession) return;
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
      ),
    }));
  },
  createLogin: (input) => {
    if (get().readOnlySession) return;
    const timestamp = new Date().toISOString();
    const id = crypto.randomUUID();
    const entry: LoginEntry = {
      ...input,
      id,
      type: 'login',
      vaultId: get().activeVaultId,
      groupId: `${get().activeVaultId}-root`,
      tags: tagsFromLabels(input.tags),
      createdAt: timestamp,
      updatedAt: timestamp,
      accent: '#818cf8',
    };
    set((state) => ({ entries: [entry, ...state.entries], selectedEntryId: id, overlay: null }));
    get().showToast({
      title: 'Item criado',
      description: 'Alteração mantida apenas nesta sessão.',
      tone: 'success',
    });
  },
  updateLogin: (id, input) => {
    if (get().readOnlySession) return;
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id && entry.type === 'login'
          ? {
              ...entry,
              ...input,
              tags: tagsFromLabels(input.tags),
              updatedAt: new Date().toISOString(),
            }
          : entry,
      ),
      overlay: null,
    }));
    get().showToast({
      title: 'Item atualizado',
      description: 'Alteração mantida apenas nesta sessão.',
      tone: 'success',
    });
  },
  duplicateEntry: (id) => {
    if (get().readOnlySession) return;
    const source = get().entries.find((entry) => entry.id === id);
    if (!source) return;
    const duplicate = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} — cópia`,
      favorite: false,
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ entries: [duplicate, ...state.entries], selectedEntryId: duplicate.id }));
    get().showToast({
      title: 'Item duplicado',
      description: 'Uma cópia foi criada na memória.',
      tone: 'success',
    });
  },
  trashEntry: (id) => {
    if (get().readOnlySession) return;
    set((state) => {
      const entries = state.entries.map((entry) =>
        entry.id === id ? { ...entry, trashedAt: new Date().toISOString() } : entry,
      );
      const next = entries.find(
        (entry) => entry.vaultId === state.activeVaultId && !entry.trashedAt && entry.id !== id,
      );
      return { entries, selectedEntryId: next?.id ?? '' };
    });
    get().showToast({
      title: 'Movido para a lixeira',
      description: 'O item permanece na memória desta sessão.',
      tone: 'danger',
    });
  },
  showToast: (message) => set({ toast: { ...message, id: Date.now() } }),
  clearToast: () => set({ toast: null }),
}));
