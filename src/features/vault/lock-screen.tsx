import { ChevronDown, KeyRound, ShieldAlert } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { Brand } from '../../components/common/brand';
import { Button } from '../../components/ui/button';
import { useVaultStore } from '../../stores/vault-store';

export function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const vaults = useVaultStore((state) => state.vaults);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const setLocked = useVaultStore((state) => state.setLocked);
  const activeVault = vaults.find((vault) => vault.id === activeVaultId);

  const unlock = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!password.trim()) {
      setError(true);
      return;
    }
    setLocked(false);
  };

  return (
    <main className="lock-screen" data-testid="lock-screen">
      <div className="lock-ambient" />
      <section className="lock-card" aria-labelledby="unlock-title">
        <Brand />
        <div className="lock-vault-icon">
          <KeyRound size={24} />
        </div>
        <div className="text-center">
          <h1 id="unlock-title">Desbloquear {activeVault?.name}</h1>
          <p>{activeVault?.fileName}</p>
        </div>
        <form onSubmit={unlock} className="w-full space-y-3">
          <label className="form-field">
            <span>Senha mestra simulada</span>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(false);
              }}
              placeholder="Digite qualquer valor"
              aria-invalid={error}
            />
            {error && (
              <small className="text-[var(--danger)]">Digite um valor para continuar.</small>
            )}
          </label>
          <Button variant="primary" className="w-full" type="submit">
            Desbloquear protótipo
          </Button>
        </form>
        <Button variant="ghost" className="w-full">
          <span>Escolher outro cofre</span>
          <ChevronDown size={15} />
        </Button>
        <div className="prototype-warning">
          <ShieldAlert size={18} />
          <p>
            <strong>M1 experimental</strong>
            <br />
            Não use credenciais reais. A leitura KDBX é limitada a fixtures públicas e acontece
            somente em modo de leitura.
          </p>
        </div>
      </section>
    </main>
  );
}
