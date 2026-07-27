import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, LockKeyhole, Plus, Search } from 'lucide-react';
import { Brand } from '../common/brand';
import { Button } from '../ui/button';
import { useVaultStore } from '../../stores/vault-store';

export function TopBar() {
  const vaults = useVaultStore((state) => state.vaults);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const query = useVaultStore((state) => state.query);
  const setActiveVault = useVaultStore((state) => state.setActiveVault);
  const setQuery = useVaultStore((state) => state.setQuery);
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const setLocked = useVaultStore((state) => state.setLocked);
  const activeVault = vaults.find((vault) => vault.id === activeVaultId);

  return (
    <header className="top-bar">
      <div className="top-brand">
        <Brand compact />
      </div>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button variant="secondary" className="vault-switcher" aria-label="Selecionar cofre">
            <span className="vault-dot" data-color={activeVault?.color} />
            <span className="truncate">{activeVault?.fileName}</span>
            <ChevronDown size={14} className="ml-auto" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="dropdown-content" sideOffset={8} align="start">
            {vaults.map((vault) => (
              <DropdownMenu.Item
                className="dropdown-item"
                key={vault.id}
                onSelect={() => setActiveVault(vault.id)}
              >
                <span className="vault-dot" data-color={vault.color} />
                <span>{vault.fileName}</span>
                {vault.id === activeVaultId && (
                  <span className="ml-auto text-[var(--brand-blue-strong)]">Ativo</span>
                )}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <label className="global-search">
        <Search size={16} aria-hidden="true" />
        <span className="sr-only">Buscar em todo o cofre</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar em todo o cofre"
        />
        <kbd>Ctrl K</kbd>
      </label>

      <Button variant="primary" onClick={() => setOverlay('entry-create')}>
        <Plus size={16} />
        Novo item
      </Button>
      <Button variant="ghost" onClick={() => setLocked(true)}>
        <LockKeyhole size={16} />
        Bloquear
      </Button>
    </header>
  );
}
