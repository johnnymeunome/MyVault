import type { EntryFilter } from '../domain/services/entry-search';

export type Overlay =
  'entry-create' | 'entry-edit' | 'command' | 'generator' | 'settings' | 'vault-open' | null;

export interface NavigationState {
  filter: EntryFilter;
  overlay: Overlay;
}
