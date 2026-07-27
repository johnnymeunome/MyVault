import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]',
        secondary:
          'border border-[var(--border-strong)] bg-[var(--surface-raised)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]',
        ghost:
          'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]',
        danger:
          'border border-[var(--danger-border)] text-[var(--danger)] hover:bg-[var(--danger-soft)]',
      },
      size: {
        sm: 'min-h-8 px-2.5 text-xs',
        md: 'min-h-9 px-3',
        icon: 'size-9 p-0',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
