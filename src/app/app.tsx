import { lazy, Suspense, useEffect } from 'react';
import { Toast } from '../components/common/toast';
import { Sidebar } from '../components/layout/sidebar';
import { StatusBar } from '../components/layout/status-bar';
import { TopBar } from '../components/layout/top-bar';
import { EntryDetail } from '../features/entries/entry-detail';
import { EntryDialog } from '../features/entries/entry-dialog';
import { EntryList } from '../features/entries/entry-list';
import { PasswordGenerator } from '../features/password-generator/password-generator';
import { CommandPalette } from '../features/search/command-palette';
import { SettingsView } from '../features/settings/settings-dialog';
import { LockScreen } from '../features/vault/lock-screen';
import { KdbxOpenDialog } from '../features/vault/kdbx-open-dialog';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../components/ui/dialog';
import { useVaultStore } from '../stores/vault-store';
import { clearKdbxSessions } from '../infrastructure/tauri/kdbx-gateway';

const DesignSystemPreview = import.meta.env.DEV
  ? lazy(() =>
      import('../design-system/design-system-preview').then((module) => ({
        default: module.DesignSystemPreview,
      })),
    )
  : null;

export function App() {
  const isLocked = useVaultStore((state) => state.isLocked);
  const overlay = useVaultStore((state) => state.overlay);
  const theme = useVaultStore((state) => state.theme);
  const setOverlay = useVaultStore((state) => state.setOverlay);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (import.meta.env.DEV && import.meta.env.VITE_UI_LAB === '1') {
      setOverlay('design-system');
    }
  }, [setOverlay]);

  useEffect(() => {
    void clearKdbxSessions().catch(() => undefined);
    return () => {
      void useVaultStore.getState().closeReadOnlyVault();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
        event.preventDefault();
        if (!isLocked) setOverlay('command');
      }
      if (event.key === 'Escape' && overlay === 'settings') {
        event.preventDefault();
        setOverlay(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLocked, overlay, setOverlay]);

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
          {overlay === 'settings' ? (
            <SettingsView />
          ) : (
            <>
              <EntryList />
              <EntryDetail />
            </>
          )}
        </div>
        <StatusBar />
      </div>
      {overlay === 'entry-create' && <EntryDialog mode="create" />}
      {overlay === 'entry-edit' && <EntryDialog mode="edit" />}
      {overlay === 'command' && <CommandPalette />}
      {overlay === 'vault-open' && <KdbxOpenDialog />}
      {DesignSystemPreview && overlay === 'design-system' && (
        <Suspense fallback={null}>
          <DesignSystemPreview
            theme={theme}
            onToggleTheme={() => useVaultStore.getState().toggleTheme()}
            onClose={() => setOverlay(null)}
          />
        </Suspense>
      )}
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
