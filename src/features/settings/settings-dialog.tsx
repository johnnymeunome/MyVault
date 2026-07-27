import { BellOff, Database, MonitorCog } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { useVaultStore } from '../../stores/vault-store';

export function SettingsDialog() {
  const setOverlay = useVaultStore((state) => state.setOverlay);
  return (
    <Dialog open onOpenChange={(open) => !open && setOverlay(null)}>
      <DialogContent>
        <DialogTitle>Configurações</DialogTitle>
        <DialogDescription>Preferências demonstrativas deste marco.</DialogDescription>
        <div className="mt-5 divide-y divide-[var(--border)] rounded-[var(--radius-lg)] border border-[var(--border)]">
          <div className="settings-row">
            <MonitorCog size={18} />
            <div>
              <strong>Aparência</strong>
              <span>Use a paleta de comandos para alternar o tema.</span>
            </div>
          </div>
          <div className="settings-row">
            <Database size={18} />
            <div>
              <strong>Armazenamento</strong>
              <span>Somente memória; nada é salvo no disco.</span>
            </div>
            <em>Protegido por escopo</em>
          </div>
          <div className="settings-row">
            <BellOff size={18} />
            <div>
              <strong>Telemetria</strong>
              <span>Nenhuma chamada externa ou coleta ativa.</span>
            </div>
            <em>Desativada</em>
          </div>
        </div>
        <div className="mt-5 flex justify-end">
          <Button onClick={() => setOverlay(null)}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
