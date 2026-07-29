import { ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="MyVault">
      <span className="brand-mark">
        <ShieldCheck size={18} strokeWidth={2.2} />
      </span>
      <span className={cn('brand-name', compact ? 'text-sm' : 'text-lg')}>MyVault</span>
    </div>
  );
}
