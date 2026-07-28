import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DesignSystemPreview } from './design-system-preview';

describe('DesignSystemPreview', () => {
  it('exposes the phase-one controls and preview sections', () => {
    const onToggleTheme = vi.fn();
    const onClose = vi.fn();

    render(<DesignSystemPreview theme="dark" onToggleTheme={onToggleTheme} onClose={onClose} />);

    expect(
      screen.getByRole('heading', { name: 'Uma fundação mais contida e específica' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Formulários' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Estudo de movimento' })).toBeInTheDocument();
    expect(screen.getByText('Somente leitura')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir diálogo' }));
    expect(screen.getByRole('dialog', { name: 'Confirmar alteração' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    fireEvent.click(screen.getByRole('button', { name: 'Usar tema claro' }));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar laboratório' }));

    expect(onToggleTheme).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
