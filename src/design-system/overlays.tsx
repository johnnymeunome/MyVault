import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';
import { Tooltip } from '@base-ui/react/tooltip';
import { Check, ChevronDown, MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { DesignButton, DesignIconButton } from './button';

export function DesignMenuDemo() {
  return (
    <Menu.Root>
      <Menu.Trigger className="ds-button ds-button--secondary ds-button--md ds-menu-trigger">
        Ações <ChevronDown size={14} />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner className="ds-menu-positioner" sideOffset={6} align="start">
          <Menu.Popup className="ds-menu-popup">
            <div className="ds-menu-context">
              <strong>GitHub</strong>
              <span>Entrada selecionada</span>
            </div>
            <Menu.Item className="ds-menu-item">
              <span>
                <strong>Editar</strong>
                <small>Alterar os campos</small>
              </span>
              <kbd>E</kbd>
            </Menu.Item>
            <Menu.Item className="ds-menu-item">
              <span>
                <strong>Duplicar</strong>
                <small>Criar uma cópia</small>
              </span>
              <kbd>D</kbd>
            </Menu.Item>
            <div className="ds-menu-separator" />
            <Menu.Item className="ds-menu-item ds-menu-item--danger">
              <span>
                <strong>Mover para a lixeira</strong>
                <small>Disponível até ser esvaziada</small>
              </span>
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
