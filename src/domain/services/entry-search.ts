import type { EntryType, VaultEntry } from '../entities/entry';

export type EntryFilter = 'all' | 'favorites' | EntryType | 'trash';

const searchableText = (entry: VaultEntry): string => {
  const shared = [entry.title, entry.notes, ...entry.tags.map((tag) => tag.label)];

  if (entry.type === 'login') shared.push(entry.username, entry.url);
  if (entry.type === 'identity') shared.push(entry.fullName, entry.email);
  if (entry.type === 'card') shared.push(entry.cardholderName, entry.lastFour);
  if (entry.type === 'secure-note') shared.push(entry.content);

  return shared.join(' ').toLocaleLowerCase('pt-BR');
};

export const filterEntries = (
  entries: ReadonlyArray<VaultEntry>,
  query: string,
  filter: EntryFilter,
): VaultEntry[] => {
  const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR');

  return entries.filter((entry) => {
    const isTrashed = Boolean(entry.trashedAt);
    if (filter === 'trash') return isTrashed && searchableText(entry).includes(normalizedQuery);
    if (isTrashed) return false;
    if (filter === 'favorites' && !entry.favorite) return false;
    if (!['all', 'favorites'].includes(filter) && entry.type !== filter) return false;
    return searchableText(entry).includes(normalizedQuery);
  });
};
