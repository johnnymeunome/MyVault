import type { EntryFilter } from '../domain/services/entry-search';

export type Overlay = 'entry-create' | 'entry-edit' | 'command' | 'generator' | 'settings' | null;

export interface NavigationState {
  filter: EntryFilter;
  overlay: Overlay;
}
