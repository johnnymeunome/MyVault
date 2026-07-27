import { CheckCircle2, ClipboardCheck } from 'lucide-react';
import { useClipboardStore } from './clipboard-store';

export function ClipboardNotice() {
  const label = useClipboardStore((state) => state.label);
  const secondsRemaining = useClipboardStore((state) => state.secondsRemaining);
  const progress = (secondsRemaining / 15) * 100;

  return (
    <section className="utility-card" aria-live="polite">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-[var(--success)]">
          {label ? <CheckCircle2 size={17} /> : <ClipboardCheck size={17} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            {label ? `${label} copiado` : 'Clipboard pronto'}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">
            {label
              ? `Limpeza em ${String(secondsRemaining)} segundos`
              : 'Valores copiados serão limpos quando a plataforma permitir.'}
          </p>
        </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--surface-active)]">
        <div
          className="h-full rounded-full bg-[var(--success)] transition-[width] duration-300"
          style={{ width: `${String(label ? progress : 0)}%` }}
        />
      </div>
    </section>
  );
}
