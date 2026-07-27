import { create } from 'zustand';
import type { LoginEntry, LoginEntryInput, Tag, VaultEntry } from '../domain/entities/entry';
import type { EntryFilter } from '../domain/services/entry-search';
import { mockEntries } from '../infrastructure/mocks/entries';
import { mockVaults } from '../infrastructure/mocks/vaults';
import type { Overlay } from '../types/navigation';

interface ToastMessage {
  id: number;
  title: string;
  description: string;
  tone: 'success' | 'neutral' | 'danger';
}

interface VaultState {
  vaults: typeof mockVaults;
  activeVaultId: string;
  entries: VaultEntry[];
  selectedEntryId: string;
  filter: EntryFilter;
  query: string;
  isLocked: boolean;
  overlay: Overlay;
  theme: 'dark' | 'light';
  toast: ToastMessage | null;
  setActiveVault: (id: string) => void;
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

export const useVaultStore = create<VaultState>((set, get) => ({
  vaults: mockVaults,
  activeVaultId: 'personal',
  entries: mockEntries,
  selectedEntryId: 'github',
  filter: 'all',
  query: '',
  isLocked: false,
  overlay: null,
  theme: 'dark',
  toast: null,
  setActiveVault: (id) => {
    const first = get().entries.find((entry) => entry.vaultId === id && !entry.trashedAt);
    set({ activeVaultId: id, selectedEntryId: first?.id ?? '', filter: 'all', query: '' });
  },
  setSelectedEntry: (id) => set({ selectedEntryId: id }),
  setFilter: (filter) => set({ filter }),
  setQuery: (query) => set({ query }),
  setLocked: (isLocked) => set({ isLocked, overlay: null }),
  setOverlay: (overlay) => set({ overlay }),
  toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
  toggleFavorite: (id) =>
    set((state) => ({
      entries: state.entries.map((entry) =>
        entry.id === id ? { ...entry, favorite: !entry.favorite } : entry,
      ),
    })),
  createLogin: (input) => {
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
