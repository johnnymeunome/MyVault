import { ArrowDown, SearchX, Star } from 'lucide-react';
import { EntryLogo } from '../../components/common/entry-logo';
import { filterEntries } from '../../domain/services/entry-search';
import { cn, formatRelativeDate } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

const filterLabels = {
  all: 'Todos os itens',
  favorites: 'Favoritos',
  login: 'Logins',
  card: 'Cartões',
  'secure-note': 'Notas seguras',
  identity: 'Identidades',
  trash: 'Lixeira',
} as const;

const entrySubtitle = (entry: ReturnType<typeof filterEntries>[number]) => {
  if (entry.type === 'login') return entry.username;
  if (entry.type === 'card') return `•••• ${entry.lastFour}`;
  if (entry.type === 'identity') return entry.email;
  return 'Nota protegida';
};

export function EntryList() {
  const entries = useVaultStore((state) => state.entries);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const filter = useVaultStore((state) => state.filter);
  const query = useVaultStore((state) => state.query);
  const selectedEntryId = useVaultStore((state) => state.selectedEntryId);
  const setSelectedEntry = useVaultStore((state) => state.setSelectedEntry);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const readOnlySession = useVaultStore((state) => state.readOnlySession);
  const visible = filterEntries(
    entries.filter((entry) => entry.vaultId === activeVaultId),
    query,
    filter,
  );

  const focusRelativeEntry = (index: number, offset: -1 | 1) => {
    const next = visible[index + offset];
    if (!next) return;
    setSelectedEntry(next.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`entry-select-${next.id}`)?.focus();
    });
  };

  return (
    <section className="entry-list-panel" aria-labelledby="entry-list-title">
      <div className="panel-heading">
        <div>
          <h1 id="entry-list-title">{filterLabels[filter]}</h1>
          <p>
            {visible.length} {visible.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <div className="list-order" aria-label="Ordenado pelos mais recentes">
          <span>Recentes</span>
          <ArrowDown size={12} strokeWidth={1.7} aria-hidden="true" />
        </div>
      </div>

      <div className="entry-scroll" role="list" aria-label="Itens do cofre">
        {visible.length === 0 ? (
          <div className="empty-state">
            <SearchX size={22} strokeWidth={1.5} />
            <strong>Nenhum item encontrado</strong>
            <span>Tente outro termo ou categoria.</span>
          </div>
        ) : (
          visible.map((entry, index) => {
            const selected = selectedEntryId === entry.id;
            return (
              <div
                key={entry.id}
                className={cn('entry-row', selected && 'is-selected')}
                role="listitem"
              >
                <button
                  id={`entry-select-${entry.id}`}
                  className="entry-row-select"
                  onClick={() => setSelectedEntry(entry.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      focusRelativeEntry(index, 1);
                    }
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      focusRelativeEntry(index, -1);
                    }
                  }}
                  aria-current={selected ? 'true' : undefined}
                  title={`${entry.title} — ${entrySubtitle(entry)}`}
                  type="button"
                >
                  <EntryLogo entry={entry} />
                  <span className="entry-row-copy">
                    <strong>{entry.title}</strong>
                    <span className="entry-meta-line">
                      <span className="truncate">{entrySubtitle(entry)}</span>
                      <time>{formatRelativeDate(entry.updatedAt)}</time>
                    </span>
                  </span>
                </button>
                <button
                  className={cn('favorite-button', entry.favorite && 'is-favorite')}
                  aria-label={
                    entry.favorite
                      ? `Remover ${entry.title} dos favoritos`
                      : `Favoritar ${entry.title}`
                  }
                  onClick={() => toggleFavorite(entry.id)}
                  disabled={Boolean(readOnlySession)}
                  title={readOnlySession ? 'Favoritos não podem ser alterados no M1' : undefined}
                  type="button"
                >
                  <Star
                    size={13}
                    strokeWidth={1.7}
                    fill={entry.favorite ? 'currentColor' : 'none'}
                    aria-hidden="true"
                  />
                </button>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
