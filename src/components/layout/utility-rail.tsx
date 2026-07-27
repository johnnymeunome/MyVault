import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { ClipboardNotice } from '../../features/clipboard/clipboard-notice';
import { PasswordGenerator } from '../../features/password-generator/password-generator';

export function UtilityRail() {
  return (
    <aside className="utility-rail" aria-label="Ferramentas do cofre">
      <ClipboardNotice />
      <PasswordGenerator compact />
      <section className="utility-card">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck size={17} className="text-[var(--success)]" />
          Integridade do protótipo
        </div>
        <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
          Nenhuma persistência ou chamada externa ativa.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--success)]">
          <CheckCircle2 size={13} />
          Limites M0 verificados
        </div>
      </section>
    </aside>
  );
}
