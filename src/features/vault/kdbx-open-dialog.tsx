import { FileKey2, FolderOpen, KeyRound, LoaderCircle, ShieldAlert } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import {
  isDesktopRuntime,
  KdbxGatewayError,
  openKdbxReadOnly,
  selectKdbxFile,
  selectKeyFile,
} from '../../infrastructure/tauri/kdbx-gateway';
import { useVaultStore } from '../../stores/vault-store';

const fileNameFromPath = (path: string) => path.split(/[\\/]/).at(-1) || 'fixture.kdbx';

export function KdbxOpenDialog() {
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const activateReadOnlyVault = useVaultStore((state) => state.activateReadOnlyVault);
  const [path, setPath] = useState('');
  const [keyFilePath, setKeyFilePath] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const desktop = isDesktopRuntime();

  const chooseDatabase = async () => {
    try {
      const selected = await selectKdbxFile();
      if (selected) setPath(selected);
    } catch (selectionError) {
      setError(messageFor(selectionError));
    }
  };

  const chooseKeyFile = async () => {
    try {
      const selected = await selectKeyFile();
      if (selected) setKeyFilePath(selected);
    } catch (selectionError) {
      setError(messageFor(selectionError));
    }
  };

  const openFixture = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!path) {
      setError('Selecione uma fixture KDBX para continuar.');
      return;
    }
    if (!password) {
      setError('Informe a senha pública da fixture.');
      return;
    }

    setIsOpening(true);
    try {
      const result = await openKdbxReadOnly({
        path,
        password,
        keyFilePath: keyFilePath || undefined,
      });
      setPassword('');
      activateReadOnlyVault(result, fileNameFromPath(path));
    } catch (openError) {
      setPassword('');
      setError(messageFor(openError));
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && setOverlay(null)}>
      <DialogContent>
        <DialogTitle>Abrir fixture KDBX</DialogTitle>
        <DialogDescription>
          Experimento desktop somente leitura. Campos protegidos não serão enviados à interface.
        </DialogDescription>

        <div className="experimental-banner" role="note">
          <ShieldAlert size={18} />
          <p>
            Use apenas as fixtures públicas do projeto. Credenciais reais continuam proibidas no M1.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={openFixture}>
          <label className="form-field">
            <span>Arquivo KDBX</span>
            <div className="file-picker-row">
              <span title={path}>
                {path ? fileNameFromPath(path) : 'Nenhum arquivo selecionado'}
              </span>
              <Button type="button" size="sm" onClick={chooseDatabase} disabled={!desktop}>
                <FolderOpen size={15} />
                Selecionar
              </Button>
            </div>
          </label>

          <label className="form-field">
            <span>
              Arquivo-chave <small>opcional</small>
            </span>
            <div className="file-picker-row">
              <span title={keyFilePath}>
                {keyFilePath ? fileNameFromPath(keyFilePath) : 'Não utilizado'}
              </span>
              <Button type="button" size="sm" onClick={chooseKeyFile} disabled={!desktop}>
                <FileKey2 size={15} />
                Selecionar
              </Button>
            </div>
          </label>

          <label className="form-field">
            <span>Senha pública da fixture</span>
            <div className="input-actions">
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError('');
                }}
                autoComplete="off"
                spellCheck={false}
                disabled={!desktop || isOpening}
                aria-invalid={Boolean(error)}
              />
              <KeyRound size={15} className="mr-3 text-[var(--text-muted)]" />
            </div>
          </label>

          {!desktop && (
            <p className="form-error" role="status">
              Abertura KDBX disponível somente ao executar o aplicativo Tauri desktop.
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOverlay(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!desktop || isOpening}>
              {isOpening ? (
                <LoaderCircle size={15} className="animate-spin" />
              ) : (
                <KeyRound size={15} />
              )}
              {isOpening ? 'Validando…' : 'Abrir somente leitura'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function messageFor(error: unknown) {
  if (error instanceof KdbxGatewayError) return error.message;
  return 'O MyVault não conseguiu concluir a operação.';
}
