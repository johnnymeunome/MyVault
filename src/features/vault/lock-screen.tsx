import { Menu } from '@base-ui/react/menu';
import { Check, ChevronDown } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { Brand } from '../../components/common/brand';
import { DesignButton } from '../../design-system/button';
import { DesignField } from '../../design-system/form-controls';
import { useVaultStore } from '../../stores/vault-store';

export function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const vaults = useVaultStore((state) => state.vaults);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const setActiveVault = useVaultStore((state) => state.setActiveVault);
  const setLocked = useVaultStore((state) => state.setLocked);
  const activeVault = vaults.find((vault) => vault.id === activeVaultId);

  const unlock = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError('Digite um valor para continuar.');
      return;
    }
    setLocked(false);
  };

  return (
    <main className="lock-screen" data-testid="lock-screen">
      <header className="lock-brand">
        <Brand />
      </header>

      <section className="lock-content" aria-labelledby="unlock-title">
        <span className="lock-context">Sessão bloqueada</span>
        <h1 id="unlock-title">Desbloquear {activeVault?.name}</h1>
        <p className="lock-file-name">{activeVault?.fileName}</p>

        <form className="lock-form" onSubmit={unlock}>
          <DesignField
            label="Senha mestra simulada"
            autoFocus
            type="password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setError('');
            }}
            placeholder="Digite qualquer valor"
            error={error}
            autoComplete="off"
          />
          <DesignButton tone="primary" type="submit">
            Desbloquear protótipo
          </DesignButton>
        </form>

        <Menu.Root>
          <Menu.Trigger className="lock-vault-trigger">
            <span>Escolher outro cofre</span>
            <ChevronDown size={14} aria-hidden="true" />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner className="top-vault-positioner" sideOffset={7} align="center">
              <Menu.Popup className="top-vault-menu lock-vault-menu">
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
                    {vault.id === activeVaultId && <Check size={14} aria-hidden="true" />}
                  </Menu.Item>
                ))}
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>

        <p className="lock-experiment-note">
          <strong>M1 experimental</strong>. Use somente dados demonstrativos; fixtures KDBX
          permanecem em modo de leitura.
        </p>
      </section>

      <footer className="lock-footer">
        <span>MyVault</span>
        <span>Sessão local · sem persistência</span>
      </footer>
    </main>
  );
}
