import { CheckCircle2, EyeOff, FlaskConical, ShieldCheck } from 'lucide-react';
import { ClipboardNotice } from '../../features/clipboard/clipboard-notice';
import { PasswordGenerator } from '../../features/password-generator/password-generator';
import { useVaultStore } from '../../stores/vault-store';

export function UtilityRail() {
  const readOnlySession = useVaultStore((state) => state.readOnlySession);

  if (readOnlySession) {
    return (
      <aside className="utility-rail" aria-label="Estado da fixture KDBX">
        <section className="utility-card experimental-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FlaskConical size={17} className="text-[var(--brand-blue-strong)]" />
            M1 experimental
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
            Leitura de fixture descartável. Não utilize credenciais reais.
          </p>
        </section>
        <section className="utility-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <EyeOff size={17} className="text-[var(--brand-blue-strong)]" />
            Segredos isolados
          </div>
          <p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">
            Senhas, TOTP, notas, histórico e anexos não foram enviados ao React.
          </p>
        </section>
        <section className="utility-card">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck size={17} className="text-[var(--success)]" />
            Capacidades fechadas
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-[var(--success)]">
            <CheckCircle2 size={13} />
            Escrita e revelação desabilitadas
          </div>
        </section>
      </aside>
    );
  }

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
