import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="Vaulta">
      <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent-bright)]">
        <ShieldCheck size={18} strokeWidth={2.2} />
      </span>
      <span className={cn('font-semibold tracking-[-0.02em]', compact ? 'text-sm' : 'text-lg')}>
        Vaulta
      </span>
    </div>
  );
}
