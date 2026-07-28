import { Checkbox } from '@base-ui/react/checkbox';
import { Field } from '@base-ui/react/field';
import { Slider } from '@base-ui/react/slider';
import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '../lib/utils';

interface DesignFieldProps extends ComponentPropsWithoutRef<typeof Field.Control> {
  label: string;
  description?: string;
  error?: string;
}

export function DesignField({ label, description, error, className, ...props }: DesignFieldProps) {
  return (
    <Field.Root className="ds-field" invalid={Boolean(error)}>
      <Field.Label className="ds-field__label">{label}</Field.Label>
      <Field.Control className={cn('ds-field__control', className)} {...props} />
      {description && (
        <Field.Description className="ds-field__description">{description}</Field.Description>
      )}
      {error && (
        <Field.Error className="ds-field__error" match>
          {error}
        </Field.Error>
      )}
    </Field.Root>
  );
}

interface DesignTextAreaProps extends Omit<
  ComponentPropsWithoutRef<typeof Field.Control>,
  'render'
> {
  label: string;
  description?: string;
  rows?: number;
}

export function DesignTextArea({
  label,
  description,
  rows = 4,
  className,
  ...props
}: DesignTextAreaProps) {
  return (
    <Field.Root className="ds-field">
      <Field.Label className="ds-field__label">{label}</Field.Label>
      <Field.Control
        className={cn('ds-field__control ds-field__textarea', className)}
        render={<textarea rows={rows} />}
        {...props}
      />
      {description && (
        <Field.Description className="ds-field__description">{description}</Field.Description>
      )}
    </Field.Root>
  );
}

interface DesignCheckboxProps extends ComponentPropsWithoutRef<typeof Checkbox.Root> {
  label: string;
  description?: string;
}

export function DesignCheckbox({ label, description, ...props }: DesignCheckboxProps) {
  return (
    <label className="ds-check-row">
      <Checkbox.Root className="ds-checkbox" {...props}>
        <Checkbox.Indicator className="ds-checkbox__indicator">✓</Checkbox.Indicator>
      </Checkbox.Root>
      <span>
        <strong>{label}</strong>
        {description && <small>{description}</small>}
      </span>
    </label>
  );
}

interface DesignSliderProps extends ComponentPropsWithoutRef<typeof Slider.Root<number>> {
  label: string;
}

export function DesignSlider({ label, ...props }: DesignSliderProps) {
  return (
    <Slider.Root className="ds-slider" {...props}>
      <div className="ds-slider__heading">
        <Slider.Label>{label}</Slider.Label>
        <Slider.Value />
      </div>
      <Slider.Control className="ds-slider__control">
        <Slider.Track className="ds-slider__track">
          <Slider.Indicator className="ds-slider__indicator" />
          <Slider.Thumb className="ds-slider__thumb" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
