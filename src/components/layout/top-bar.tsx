import { Menu } from '@base-ui/react/menu';
import { ChevronDown, FolderOpen, LockKeyhole, Moon, Plus, Search, Sun } from 'lucide-react';
import { Brand } from '../common/brand';
import { DesignButton, DesignIconButton } from '../../design-system/button';
import { useVaultStore } from '../../stores/vault-store';

export function TopBar() {
  const vaults = useVaultStore((state) => state.vaults);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const query = useVaultStore((state) => state.query);
  const setActiveVault = useVaultStore((state) => state.setActiveVault);
  const setQuery = useVaultStore((state) => state.setQuery);
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const setLocked = useVaultStore((state) => state.setLocked);
  const theme = useVaultStore((state) => state.theme);
  const toggleTheme = useVaultStore((state) => state.toggleTheme);
  const readOnlySession = useVaultStore((state) => state.readOnlySession);
  const activeVault = vaults.find((vault) => vault.id === activeVaultId);

  return (
    <header className="top-bar">
      <div className="top-brand">
        <Brand compact />
      </div>
      <Menu.Root>
        <Menu.Trigger className="top-vault-trigger" aria-label="Selecionar cofre">
          <span className="vault-dot" data-color={activeVault?.color} />
          <span className="truncate">{activeVault?.fileName}</span>
          <ChevronDown size={13} aria-hidden="true" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner className="top-vault-positioner" sideOffset={6} align="start">
            <Menu.Popup className="top-vault-menu">
              <div className="top-vault-menu-label">Cofres disponíveis</div>
              {vaults.map((vault) => (
                <Menu.Item
                  className="top-vault-option"
                  key={vault.id}
                  onClick={() => setActiveVault(vault.id)}
                >
                  <span className="vault-dot" data-color={vault.color} />
                  <span className="top-vault-option-copy">
                    <strong>{vault.name}</strong>
                    <small>{vault.fileName}</small>
                  </span>
                  {vault.id === activeVaultId && <span className="top-vault-active">Atual</span>}
                </Menu.Item>
              ))}
              <div className="top-vault-separator" />
              <Menu.Item className="top-vault-open" onClick={() => setOverlay('vault-open')}>
                <FolderOpen size={15} aria-hidden="true" />
                <span>Abrir fixture KDBX…</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

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

      {readOnlySession && (
        <span className="top-session-status">
          <i aria-hidden="true" />
          Somente leitura
        </span>
      )}
      <DesignButton
        tone="primary"
        onClick={() => setOverlay('entry-create')}
        disabled={Boolean(readOnlySession)}
      >
        <Plus size={15} aria-hidden="true" />
        Novo item
      </DesignButton>
      <DesignIconButton
        className="top-theme-toggle"
        label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
        tone="quiet"
        onClick={toggleTheme}
        title={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
      >
        {theme === 'dark' ? (
          <Sun size={15} aria-hidden="true" />
        ) : (
          <Moon size={15} aria-hidden="true" />
        )}
      </DesignIconButton>
      <DesignButton tone="quiet" onClick={() => setLocked(true)}>
        <LockKeyhole size={15} aria-hidden="true" />
        Bloquear
      </DesignButton>
    </header>
  );
}
