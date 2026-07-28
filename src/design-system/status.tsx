import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

type DesignStatusTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export function DesignStatus({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: DesignStatusTone;
}) {
  return (
    <span className={cn('ds-status', `ds-status--${tone}`)}>
      <i aria-hidden="true" />
      {children}
    </span>
  );
}
