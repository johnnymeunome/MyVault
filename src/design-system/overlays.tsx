import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import { Check, ChevronDown, Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { DesignButton, DesignIconButton } from './button';

export function DesignMenuDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger className="ds-button ds-button--secondary ds-button--md">
        Ações <ChevronDown size={14} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="ds-menu-positioner" sideOffset={6} align="start">
          <Menu.Popup className="ds-menu-popup">
            <Menu.Item className="ds-menu-item">
              <Pencil size={15} /> Editar <kbd>E</kbd>
            </Menu.Item>
            <Menu.Item className="ds-menu-item">
              <Copy size={15} /> Duplicar <kbd>D</kbd>
            </Menu.Item>
            <div className="ds-menu-separator" />
            <Menu.Item className="ds-menu-item ds-menu-item--danger">
              <Trash2 size={15} /> Mover para a lixeira
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export function DesignDialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="ds-button ds-button--secondary ds-button--md">
        Abrir diálogo
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="ds-dialog-backdrop" />
        <Dialog.Viewport className="ds-dialog-viewport">
          <Dialog.Popup className="ds-dialog-popup">
            <header className="ds-dialog-header">
              <Dialog.Title>Confirmar alteração</Dialog.Title>
              <Dialog.Description>
                Este é um primitive de comportamento; o conteúdo continua específico da tarefa.
              </Dialog.Description>
            </header>
            <div className="ds-dialog-content">
              <p>
                A hierarquia vem do texto e do espaço. Nenhum card adicional é necessário dentro do
                diálogo.
              </p>
            </div>
            <footer className="ds-dialog-actions">
              <Dialog.Close className="ds-button ds-button--quiet ds-button--md">
                Cancelar
              </Dialog.Close>
              <Dialog.Close className="ds-button ds-button--primary ds-button--md">
                <Check size={15} /> Confirmar
              </Dialog.Close>
            </footer>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function DesignTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip.Provider delay={350}>
      <Tooltip.Root>
        <Tooltip.Trigger render={<DesignIconButton label={label} tone="quiet" />}>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={7}>
            <Tooltip.Popup className="ds-tooltip">{label}</Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export function MoreActionsTooltip() {
  return (
    <DesignTooltip label="Mais ações">
      <MoreHorizontal size={17} />
    </DesignTooltip>
  );
}

export function DialogActionExample() {
  return (
    <div className="ds-inline-actions">
      <DesignDialogDemo />
      <DesignButton tone="quiet">Ação discreta</DesignButton>
    </div>
  );
}
