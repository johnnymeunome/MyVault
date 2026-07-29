import { Combobox } from '@base-ui/react/combobox';
import { Dialog } from '@base-ui/react/dialog';
import {
  LockKeyhole,
  Moon,
  PanelsTopLeft,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
} from 'lucide-react';
import { useMemo, useState, type ComponentType } from 'react';
import { EntryLogo } from '../../components/common/entry-logo';
import type { VaultEntry } from '../../domain/entities/entry';
import { useVaultStore } from '../../stores/vault-store';

interface CommandOption {
  id: string;
  label: string;
  description: string;
  group: 'Itens' | 'Ações';
  hint?: string;
  icon?: ComponentType<{ size?: number }>;
  entry?: VaultEntry;
  run: () => void;
}

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

  const options = useMemo<CommandOption[]>(() => {
    const itemOptions = entries
      .filter((entry) => entry.vaultId === activeVaultId && !entry.trashedAt)
      .slice(0, 8)
      .map((entry) => ({
        id: `entry:${entry.id}`,
        label: entry.title,
        description: 'username' in entry && entry.username ? entry.username : entry.type,
        group: 'Itens' as const,
        entry,
        run: () => {
          setSelectedEntry(entry.id);
          setFilter('all');
          setOverlay(null);
        },
      }));

    const actionOptions: CommandOption[] = [
      {
        id: 'action:create',
        label: 'Criar entrada',
        description: 'Adicionar um login à sessão local',
        group: 'Ações',
        hint: 'N',
        icon: Plus,
        run: () => setOverlay('entry-create'),
      },
      {
        id: 'action:generator',
        label: 'Abrir gerador de senha',
        description: 'Gerar um valor localmente',
        group: 'Ações',
        hint: 'G',
        icon: Sparkles,
        run: () => setOverlay('generator'),
      },
      {
        id: 'action:lock',
        label: 'Bloquear cofre',
        description: 'Encerrar a sessão visível',
        group: 'Ações',
        hint: 'L',
        icon: LockKeyhole,
        run: () => setLocked(true),
      },
      {
        id: 'action:theme',
        label: theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro',
        description: 'Alternar a aparência do aplicativo',
        group: 'Ações',
        hint: 'T',
        icon: theme === 'dark' ? Sun : Moon,
        run: () => {
          toggleTheme();
          setOverlay(null);
        },
      },
      {
        id: 'action:settings',
        label: 'Abrir configurações',
        description: 'Aparência, armazenamento e privacidade',
        group: 'Ações',
        hint: ',',
        icon: Settings,
        run: () => setOverlay('settings'),
      },
    ];

    if (import.meta.env.DEV) {
      actionOptions.push({
        id: 'action:design-system',
        label: 'Abrir laboratório visual',
        description: 'Inspecionar os primitives do MyVault',
        group: 'Ações',
        hint: 'D',
        icon: PanelsTopLeft,
        run: () => setOverlay('design-system'),
      });
    }

    return [...actionOptions, ...itemOptions];
  }, [
    activeVaultId,
    entries,
    setFilter,
    setLocked,
    setOverlay,
    setSelectedEntry,
    theme,
    toggleTheme,
  ]);

  const normalized = query.trim().toLocaleLowerCase('pt-BR');
  const visibleOptions = options.filter((option) =>
    `${option.label} ${option.description}`.toLocaleLowerCase('pt-BR').includes(normalized),
  );

  return (
    <Dialog.Root open onOpenChange={(open) => !open && setOverlay(null)}>
      <Dialog.Portal>
        <Dialog.Backdrop className="phase-dialog-backdrop command-backdrop" />
        <Dialog.Viewport className="phase-dialog-viewport command-viewport">
          <Dialog.Popup className="command-palette-dialog">
            <Dialog.Title className="sr-only">Paleta de comandos</Dialog.Title>
            <Dialog.Description className="sr-only">
              Busque itens ou execute uma ação com o teclado.
            </Dialog.Description>
            <Combobox.Root<CommandOption>
              items={visibleOptions}
              filter={null}
              inputValue={query}
              onInputValueChange={setQuery}
              itemToStringLabel={(option) => option.label}
              onValueChange={(option) => option?.run()}
              autoHighlight
              open
              modal={false}
            >
              <div className="command-input-row">
                <Search size={18} aria-hidden="true" />
                <Combobox.Input autoFocus placeholder="Buscar item ou executar ação…" />
                <kbd>Esc</kbd>
              </div>
              <Combobox.List className="command-option-list">
                {(option: CommandOption, index: number) => {
                  const previous = visibleOptions[index - 1];
                  const beginsGroup = !previous || previous.group !== option.group;
                  const Icon = option.icon;
                  return (
                    <div className="command-option-block" key={option.id}>
                      {beginsGroup && <p className="command-group-label">{option.group}</p>}
                      <Combobox.Item className="command-option" value={option}>
                        <span className="command-option-visual" aria-hidden="true">
                          {option.entry ? (
                            <EntryLogo entry={option.entry} size="command" />
                          ) : Icon ? (
                            <Icon size={16} />
                          ) : null}
                        </span>
                        <span className="command-option-copy">
                          <strong>{option.label}</strong>
                          <small>{option.description}</small>
                        </span>
                        {option.hint && <kbd>{option.hint}</kbd>}
                      </Combobox.Item>
                    </div>
                  );
                }}
              </Combobox.List>
              {visibleOptions.length === 0 && (
                <div className="command-empty">
                  <strong>Nenhum resultado</strong>
                  <span>Tente um nome de item ou uma ação diferente.</span>
                </div>
              )}
            </Combobox.Root>
            <footer className="command-footer">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> navegar
              </span>
              <span>
                <kbd>Enter</kbd> abrir
              </span>
              <span>
                <kbd>Esc</kbd> fechar
              </span>
            </footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
