import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useVaultStore } from '../stores/vault-store';
import { App } from './app';

describe('main application flows', () => {
  beforeEach(() => {
    useVaultStore.setState({ isLocked: false, overlay: null, theme: 'dark' });
  });

  it('locks and unlocks the prototype', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear' }));
    expect(screen.getByTestId('lock-screen')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Senha mestra simulada'), { target: { value: 'demo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear protótipo' }));
    expect(screen.getByRole('heading', { name: 'Todos os itens' })).toBeInTheDocument();
  });

  it('opens the command palette with the documented shortcut', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText('Buscar item ou executar ação…')).toBeInTheDocument();
  });
});
