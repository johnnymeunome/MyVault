import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useVaultStore } from '../stores/vault-store';
import { mockEntries } from '../infrastructure/mocks/entries';
import { mockGroups, mockVaults } from '../infrastructure/mocks/vaults';
import { App } from './app';

describe('main application flows', () => {
  beforeEach(() => {
    useVaultStore.setState({
      isLocked: false,
      overlay: null,
      theme: 'dark',
      readOnlySession: null,
      vaults: mockVaults,
      groups: mockGroups,
      entries: mockEntries,
      activeVaultId: 'personal',
      selectedEntryId: 'github',
    });
  });

  it('locks and unlocks the prototype', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Bloquear' }));
    expect(screen.getByTestId('lock-screen')).toBeInTheDocument();
    expect(screen.getByText('M1 experimental')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Senha mestra simulada'), { target: { value: 'demo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear protótipo' }));
    expect(screen.getByRole('heading', { name: 'Todos os itens' })).toBeInTheDocument();
  });

  it('opens the command palette with the documented shortcut', () => {
    render(<App />);
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByPlaceholderText('Buscar item ou executar ação…')).toBeInTheDocument();
  });

  it('opens the vault selector from the integrated top bar', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Selecionar cofre' }));
    expect(screen.getByText('Cofres disponíveis')).toBeInTheDocument();
    expect(screen.getByText('Trabalho.kdbx')).toBeInTheDocument();
  });

  it('keeps the theme switch visible in the top bar', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Usar tema claro' }));
    expect(useVaultStore.getState().theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Usar tema escuro' })).toBeInTheDocument();
  });

  it('moves through the continuous entry list with arrow keys', () => {
    render(<App />);
    const github = screen.getByTitle('GitHub — joaovictor');
    fireEvent.keyDown(github, { key: 'ArrowDown' });
    expect(useVaultStore.getState().selectedEntryId).toBe('google');
    expect(screen.getByRole('heading', { name: 'Google' })).toBeInTheDocument();
  });

  it('renders the work vault with its own list and detail content', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Trabalho' }));
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'AWS' })).toBeInTheDocument();
    expect(screen.getByText('Ambiente fictício de desenvolvimento.')).toBeInTheDocument();
  });
});
