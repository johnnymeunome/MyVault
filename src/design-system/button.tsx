import { Button as BaseButton } from '@base-ui/react/button';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { cn } from '../lib/utils';

export type DesignButtonTone = 'primary' | 'secondary' | 'quiet' | 'danger';
export type DesignButtonSize = 'sm' | 'md';

interface DesignButtonProps extends ComponentPropsWithoutRef<typeof BaseButton> {
  tone?: DesignButtonTone;
  size?: DesignButtonSize;
}

export const DesignButton = forwardRef<HTMLElement, DesignButtonProps>(function DesignButton(
  { className, tone = 'secondary', size = 'md', ...props },
  ref,
) {
  return (
    <BaseButton
      ref={ref}
      className={cn('ds-button', `ds-button--${tone}`, `ds-button--${size}`, className)}
      {...props}
    />
  );
});

interface DesignIconButtonProps extends Omit<DesignButtonProps, 'children'> {
  label: string;
  children?: ReactNode;
}

export const DesignIconButton = forwardRef<HTMLElement, DesignIconButtonProps>(
  function DesignIconButton({ className, label, children, ...props }, ref) {
    return (
      <DesignButton
        ref={ref}
        className={cn('ds-icon-button', className)}
        aria-label={label}
        {...props}
      >
        {children}
      </DesignButton>
    );
  },
);
