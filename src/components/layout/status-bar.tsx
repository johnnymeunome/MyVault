import { CircleCheck, Clock3, FlaskConical } from 'lucide-react';
import { useVaultStore } from '../../stores/vault-store';

export function StatusBar() {
  const readOnlySession = useVaultStore((state) => state.readOnlySession);

  return (
    <footer className="status-bar">
      <span>
        {readOnlySession ? <FlaskConical size={13} /> : <Clock3 size={13} />}
        {readOnlySession
          ? `${readOnlySession.format} · modo experimental`
          : 'Bloqueio automático simulado em 3 min'}
      </span>
      <span className="ml-auto">
        <CircleCheck size={13} className="text-[var(--success)]" />
        {readOnlySession ? 'Somente leitura · sem persistência' : 'Sessão local · sem persistência'}
      </span>
    </footer>
  );
}
