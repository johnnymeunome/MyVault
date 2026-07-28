import { ListFilter, SearchX, SlidersHorizontal, Star } from 'lucide-react';
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

  return (
    <section className="entry-list-panel" aria-labelledby="entry-list-title">
      <div className="panel-heading">
        <div>
          <h1 id="entry-list-title">{filterLabels[filter]}</h1>
          <p>
            {visible.length} {visible.length === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            className="icon-button"
            aria-label="Filtrar lista"
            title="Filtros ativos na barra lateral"
          >
            <ListFilter size={16} />
          </button>
          <button
            className="icon-button"
            aria-label="Ordenar lista"
            title="Ordenado por atualização"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="entry-scroll" role="listbox" aria-label="Itens do cofre">
        {visible.length === 0 ? (
          <div className="empty-state">
            <SearchX size={24} />
            <strong>Nenhum item encontrado</strong>
            <span>Tente outro termo ou categoria.</span>
          </div>
        ) : (
          visible.map((entry) => (
            <div
              key={entry.id}
              className={cn('entry-row', selectedEntryId === entry.id && 'is-selected')}
              onClick={() => setSelectedEntry(entry.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSelectedEntry(entry.id);
                }
              }}
              role="option"
              aria-selected={selectedEntryId === entry.id}
              tabIndex={0}
            >
              <EntryLogo entry={entry} />
              <span className="entry-row-copy">
                <span className="entry-title-line">
                  <strong>{entry.title}</strong>
                  <button
                    className={cn('favorite-button', entry.favorite && 'is-favorite')}
                    aria-label={
                      entry.favorite
                        ? `Remover ${entry.title} dos favoritos`
                        : `Favoritar ${entry.title}`
                    }
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(entry.id);
                    }}
                    disabled={Boolean(readOnlySession)}
                    title={readOnlySession ? 'Favoritos não podem ser alterados no M1' : undefined}
                  >
                    <Star size={14} fill={entry.favorite ? 'currentColor' : 'none'} />
                  </button>
                </span>
                <span className="entry-meta-line">
                  <span className="truncate">{entrySubtitle(entry)}</span>
                  <time>{formatRelativeDate(entry.updatedAt)}</time>
                </span>
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
