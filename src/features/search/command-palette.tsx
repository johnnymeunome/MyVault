import { LockKeyhole, Moon, Plus, Search, Settings, Sparkles, Sun } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EntryLogo } from '../../components/common/entry-logo';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

export function CommandPalette() {
  const [query, setQuery] = useState('');
  const entries = useVaultStore((state) => state.entries);
  const activeVaultId = useVaultStore((state) => state.activeVaultId);
  const theme = useVaultStore((state) => state.theme);
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const setLocked = useVaultStore((state) => state.setLocked);
  const toggleTheme = useVaultStore((state) => state.toggleTheme);
  const setSelectedEntry = useVaultStore((state) => state.setSelectedEntry);
  const setFilter = useVaultStore((state) => state.setFilter);
  const normalized = query.trim().toLocaleLowerCase('pt-BR');

  const actions = useMemo(
    () => [
      { label: 'Criar entrada', hint: 'N', icon: Plus, run: () => setOverlay('entry-create') },
      {
        label: 'Abrir gerador de senha',
        hint: 'G',
        icon: Sparkles,
        run: () => setOverlay('generator'),
      },
      { label: 'Bloquear cofre', hint: 'L', icon: LockKeyhole, run: () => setLocked(true) },
      {
        label: theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro',
        hint: 'T',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => {
          toggleTheme();
          setOverlay(null);
        },
      },
      {
        label: 'Abrir configurações',
        hint: ',',
        icon: Settings,
        run: () => setOverlay('settings'),
      },
    ],
    [setLocked, setOverlay, theme, toggleTheme],
  );
  const visibleActions = actions.filter((action) =>
    action.label.toLocaleLowerCase('pt-BR').includes(normalized),
  );
  const visibleEntries = entries
    .filter(
      (entry) =>
        entry.vaultId === activeVaultId &&
        !entry.trashedAt &&
        entry.title.toLocaleLowerCase('pt-BR').includes(normalized),
    )
    .slice(0, 5);

  return (
    <Dialog open onOpenChange={(open) => !open && setOverlay(null)}>
      <DialogContent className="p-0" aria-describedby="command-description">
        <DialogTitle className="sr-only">Paleta de comandos</DialogTitle>
        <DialogDescription id="command-description" className="sr-only">
          Busque itens ou execute uma ação.
        </DialogDescription>
        <label className="command-search">
          <Search size={18} />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar item ou executar ação…"
          />
          <kbd>Esc</kbd>
        </label>
        <div className="command-results">
          {visibleEntries.length > 0 && (
            <div className="command-group">
              <p>Itens</p>
              {visibleEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => {
                    setSelectedEntry(entry.id);
                    setFilter('all');
                    setOverlay(null);
                  }}
                >
                  <EntryLogo entry={entry} size="command" />
                  <span>{entry.title}</span>
                  <span className="ml-auto text-xs text-[var(--text-muted)]">Abrir</span>
                </button>
              ))}
            </div>
          )}
          {visibleActions.length > 0 && (
            <div
              className={cn(
                'command-group',
                visibleEntries.length > 0 && 'border-t border-[var(--border)]',
              )}
            >
              <p>Ações</p>
              {visibleActions.map((action) => (
                <button key={action.label} onClick={action.run}>
                  <action.icon size={16} />
                  <span>{action.label}</span>
                  <kbd>{action.hint}</kbd>
                </button>
              ))}
            </div>
          )}
          {visibleActions.length === 0 && visibleEntries.length === 0 && (
            <p className="p-8 text-center text-sm text-[var(--text-muted)]">Nenhum resultado.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
