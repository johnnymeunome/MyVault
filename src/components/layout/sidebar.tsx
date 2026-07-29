import {
  CreditCard,
  FileText,
  FolderClosed,
  Grid2X2,
  Heart,
  IdCard,
  KeyRound,
  Plus,
  Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EntryFilter } from '../../domain/services/entry-search';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

interface SidebarItem {
  label: string;
  filter: EntryFilter;
  icon: LucideIcon;
}

const items: SidebarItem[] = [
  { label: 'Todos', filter: 'all', icon: Grid2X2 },
  { label: 'Favoritos', filter: 'favorites', icon: Heart },
  { label: 'Logins', filter: 'login', icon: KeyRound },
  { label: 'Cartões', filter: 'card', icon: CreditCard },
  { label: 'Notas seguras', filter: 'secure-note', icon: FileText },
  { label: 'Identidades', filter: 'identity', icon: IdCard },
  { label: 'Lixeira', filter: 'trash', icon: Trash2 },
];

export function Sidebar() {
  const entries = useVaultStore((state) => state.entries);
  const vaults = useVaultStore((state) => state.vaults);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const filter = useVaultStore((state) => state.filter);
  const groups = useVaultStore((state) => state.groups);
  const readOnlySession = useVaultStore((state) => state.readOnlySession);
  const setFilter = useVaultStore((state) => state.setFilter);
  const setActiveVault = useVaultStore((state) => state.setActiveVault);
  const vaultEntries = entries.filter((entry) => entry.vaultId === activeVaultId);

  const countFor = (entryFilter: EntryFilter) => {
    if (entryFilter === 'trash') return vaultEntries.filter((entry) => entry.trashedAt).length;
    const visible = vaultEntries.filter((entry) => !entry.trashedAt);
    if (entryFilter === 'all') return visible.length;
    if (entryFilter === 'favorites') return visible.filter((entry) => entry.favorite).length;
    return visible.filter((entry) => entry.type === entryFilter).length;
  };

  return (
    <aside className="sidebar" aria-label="Navegação do cofre">
      <nav className="sidebar-navigation" aria-label="Categorias">
        {items.map(({ label, filter: itemFilter, icon: Icon }) => (
          <button
            key={itemFilter}
            className={cn('nav-row', filter === itemFilter && 'is-active')}
            onClick={() => setFilter(itemFilter)}
            aria-current={filter === itemFilter ? 'page' : undefined}
          >
            <Icon size={15} strokeWidth={1.75} aria-hidden="true" />
            <span className="nav-label">{label}</span>
            <span className="nav-count" aria-label={`${String(countFor(itemFilter))} itens`}>
              {countFor(itemFilter)}
            </span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-heading">
        <span>Cofres</span>
        <button aria-label="Adicionar cofre" title="Disponível em marco futuro">
          <Plus size={14} />
        </button>
      </div>
      <div className="sidebar-vaults">
        {vaults.map((vault) => (
          <button
            key={vault.id}
            className={cn('nav-row', vault.id === activeVaultId && 'is-active')}
            onClick={() => setActiveVault(vault.id)}
            aria-current={vault.id === activeVaultId ? 'page' : undefined}
          >
            <span className="vault-indicator" data-color={vault.color} aria-hidden="true" />
            <span className="nav-label truncate">{vault.name}</span>
          </button>
        ))}
      </div>

      {readOnlySession && (
        <>
          <div className="sidebar-section-heading">
            <span>Grupos KDBX</span>
          </div>
          <div className="kdbx-group-list" aria-label="Grupos da fixture KDBX">
            {groups.map((group) => (
              <div
                key={group.id}
                className="kdbx-group-row"
                style={{ paddingLeft: `${String(8 + Math.min(group.depth ?? 0, 4) * 12)}px` }}
                title={group.name}
              >
                <FolderClosed size={13} strokeWidth={1.7} aria-hidden="true" />
                <span className="truncate">{group.name || 'Grupo sem nome'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sidebar-spacer" />
      <div className="sidebar-context">
        <i aria-hidden="true" />
        <span>{readOnlySession ? 'Fixture descartável' : 'Sessão em memória'}</span>
      </div>
    </aside>
  );
}
