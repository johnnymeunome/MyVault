import { describe, expect, it } from 'vitest';
import { mockEntries } from '../../infrastructure/mocks/entries';
import { filterEntries } from './entry-search';

describe('entry filtering', () => {
  it('searches title, username, URL and tags without case sensitivity', () => {
    expect(filterEntries(mockEntries, 'JOAOVICTOR', 'all').map((entry) => entry.id)).toContain(
      'github',
    );
    expect(filterEntries(mockEntries, 'github.com', 'all').map((entry) => entry.id)).toEqual([
      'github',
    ]);
    expect(filterEntries(mockEntries, 'FINANÇAS', 'all').map((entry) => entry.id)).toEqual(
      expect.arrayContaining(['inter', 'demo-card']),
    );
  });

  it('filters categories and favorites', () => {
    expect(filterEntries(mockEntries, '', 'card').every((entry) => entry.type === 'card')).toBe(
      true,
    );
    expect(filterEntries(mockEntries, '', 'favorites').every((entry) => entry.favorite)).toBe(true);
  });

  it('keeps trashed entries out of ordinary results', () => {
    const firstEntry = mockEntries[0];
    expect(firstEntry).toBeDefined();
    if (!firstEntry) return;
    const entries = [{ ...firstEntry, trashedAt: new Date().toISOString() }];
    expect(filterEntries(entries, '', 'all')).toEqual([]);
    expect(filterEntries(entries, '', 'trash')).toHaveLength(1);
  });
});
