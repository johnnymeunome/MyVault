import { CircleCheck, Clock3 } from 'lucide-react';

export function StatusBar() {
  return (
    <footer className="status-bar">
      <span>
        <Clock3 size={13} />
        Bloqueio automático simulado em 3 min
      </span>
      <span className="ml-auto">
        <CircleCheck size={13} className="text-[var(--success)]" />
        Sessão local · sem persistência
      </span>
    </footer>
  );
}
