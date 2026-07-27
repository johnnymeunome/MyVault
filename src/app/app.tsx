import { useEffect } from 'react';
import { Toast } from '../components/common/toast';
import { Sidebar } from '../components/layout/sidebar';
import { StatusBar } from '../components/layout/status-bar';
import { TopBar } from '../components/layout/top-bar';
import { UtilityRail } from '../components/layout/utility-rail';
import { EntryDetail } from '../features/entries/entry-detail';
import { EntryDialog } from '../features/entries/entry-dialog';
import { EntryList } from '../features/entries/entry-list';
import { PasswordGenerator } from '../features/password-generator/password-generator';
import { CommandPalette } from '../features/search/command-palette';
import { SettingsDialog } from '../features/settings/settings-dialog';
import { LockScreen } from '../features/vault/lock-screen';
import { KdbxOpenDialog } from '../features/vault/kdbx-open-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { useVaultStore } from '../stores/vault-store';

export function App() {
  const isLocked = useVaultStore((state) => state.isLocked);
  const overlay = useVaultStore((state) => state.overlay);
  const theme = useVaultStore((state) => state.theme);
  const setOverlay = useVaultStore((state) => state.setOverlay);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        if (!isLocked) setOverlay('command');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLocked, setOverlay]);

  if (isLocked)
    return (
      <>
        <LockScreen />
        <Toast />
      </>
    );

  return (
    <main className="app-viewport">
      <div className="desktop-window">
        <TopBar />
        <div className="workspace-grid">
          <Sidebar />
          <EntryList />
          <EntryDetail />
          <UtilityRail />
        </div>
        <StatusBar />
      </div>
      {overlay === 'entry-create' && <EntryDialog mode="create" />}
      {overlay === 'entry-edit' && <EntryDialog mode="edit" />}
      {overlay === 'command' && <CommandPalette />}
      {overlay === 'settings' && <SettingsDialog />}
      {overlay === 'vault-open' && <KdbxOpenDialog />}
      {overlay === 'generator' && (
        <Dialog open onOpenChange={(open) => !open && setOverlay(null)}>
          <DialogContent>
            <DialogTitle>Gerador de senhas</DialogTitle>
            <DialogDescription>
              Gere valores demonstrativos localmente. Nada é persistido.
            </DialogDescription>
            <div className="mt-5">
              <PasswordGenerator />
            </div>
          </DialogContent>
        </Dialog>
      )}
      <Toast />
    </main>
  );
}
