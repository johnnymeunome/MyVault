import { useVaultStore } from '../../stores/vault-store';

export function StatusBar() {
  const readOnlySession = useVaultStore((state) => state.readOnlySession);

  return (
    <footer className="status-bar">
      <span className="status-context">
        <i aria-hidden="true" />
        {readOnlySession
          ? `${readOnlySession.format} · modo experimental`
          : 'Bloqueio automático simulado em 3 min'}
      </span>
      <span className="status-session">
        <i aria-hidden="true" />
        {readOnlySession ? 'Somente leitura · sem persistência' : 'Sessão local · sem persistência'}
      </span>
    </footer>
  );
}
