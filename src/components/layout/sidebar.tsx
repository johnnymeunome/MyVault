import {
  Archive,
  CreditCard,
  FileText,
  Grid2X2,
  Heart,
  IdCard,
  KeyRound,
  LockKeyhole,
  Plus,
  Trash2,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { EntryFilter } from '../../domain/services/entry-search';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

interface SidebarItem {
  label: string;
  filter: EntryFilter;
  icon: ComponentType<{ size?: number }>;
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
      <nav className="space-y-1">
        {items.map(({ label, filter: itemFilter, icon: Icon }) => (
          <button
            key={itemFilter}
            className={cn('nav-row', filter === itemFilter && 'is-active')}
            onClick={() => setFilter(itemFilter)}
          >
            <Icon size={16} />
            <span>{label}</span>
            <span className="count-badge">{countFor(itemFilter)}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-section-heading">
        <span>Cofres</span>
        <button aria-label="Adicionar cofre" title="Disponível em marco futuro">
          <Plus size={14} />
        </button>
      </div>
      <div className="space-y-1">
        {vaults.map((vault) => (
          <button
            key={vault.id}
            className={cn('nav-row', vault.id === activeVaultId && 'is-active')}
            onClick={() => setActiveVault(vault.id)}
          >
            <span className={cn('vault-icon', vault.color === 'emerald' && 'is-green')}>
              <LockKeyhole size={14} />
            </span>
            <span className="truncate">{vault.name}</span>
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
                <KeyRound size={13} />
                <span className="truncate">{group.name || 'Grupo sem nome'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="sidebar-spacer" />
      <div className="prototype-chip">
        <Archive size={14} />
        <span>
          {readOnlySession ? 'Fixture KDBX · sem campos protegidos' : 'Dados somente em memória'}
        </span>
      </div>
    </aside>
  );
}
