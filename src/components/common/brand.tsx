import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" aria-label="MyVault">
      <span className="brand-mark">
        <ShieldCheck size={18} strokeWidth={2.2} />
      </span>
      <span className={cn('font-semibold tracking-[-0.02em]', compact ? 'text-sm' : 'text-lg')}>
        MyVault
      </span>
    </div>
  );
}
