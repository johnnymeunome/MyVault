import { Dialog } from '@base-ui/react/dialog';
import { FileKey2, FolderOpen, LoaderCircle, X } from 'lucide-react';
import { useState, type SyntheticEvent } from 'react';
import { DesignButton, DesignIconButton } from '../../design-system/button';
import { DesignField } from '../../design-system/form-controls';
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

  const close = () => setOverlay(null);

  const chooseDatabase = async () => {
    try {
      const selected = await selectKdbxFile();
      if (selected) {
        setPath(selected);
        setError('');
      }
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
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="phase-dialog-backdrop" />
        <Dialog.Viewport className="phase-dialog-viewport">
          <Dialog.Popup className="kdbx-open-dialog">
            <form onSubmit={openFixture}>
              <header className="kdbx-dialog-header">
                <div>
                  <span className="editor-context">Fixture pública</span>
                  <Dialog.Title>Abrir arquivo KDBX</Dialog.Title>
                  <Dialog.Description>
                    O núcleo Rust lê metadados; campos protegidos não entram na interface.
                  </Dialog.Description>
                </div>
                <Dialog.Close render={<DesignIconButton label="Fechar" tone="quiet" />}>
                  <X size={17} aria-hidden="true" />
                </Dialog.Close>
              </header>

              <div className="kdbx-dialog-content">
                <p className="kdbx-dialog-note" role="note">
                  M1 experimental — use apenas as fixtures públicas do projeto, nunca credenciais
                  reais.
                </p>

                <div className="kdbx-file-list" aria-label="Arquivos da fixture">
                  <div className="kdbx-file-row">
                    <FolderOpen size={17} aria-hidden="true" />
                    <span className="kdbx-file-copy" title={path}>
                      <strong>Arquivo KDBX</strong>
                      <small>{path ? fileNameFromPath(path) : 'Nenhum arquivo selecionado'}</small>
                    </span>
                    <DesignButton
                      type="button"
                      size="sm"
                      onClick={chooseDatabase}
                      disabled={!desktop}
                    >
                      Selecionar
                    </DesignButton>
                  </div>

                  <div className="kdbx-file-row">
                    <FileKey2 size={17} aria-hidden="true" />
                    <span className="kdbx-file-copy" title={keyFilePath}>
                      <strong>
                        Arquivo-chave <em>opcional</em>
                      </strong>
                      <small>{keyFilePath ? fileNameFromPath(keyFilePath) : 'Não utilizado'}</small>
                    </span>
                    <DesignButton
                      type="button"
                      size="sm"
                      onClick={chooseKeyFile}
                      disabled={!desktop}
                    >
                      Selecionar
                    </DesignButton>
                  </div>
                </div>

                <DesignField
                  label="Senha pública da fixture"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  autoComplete="off"
                  spellCheck={false}
                  disabled={!desktop || isOpening}
                  error={error}
                />

                {!desktop && (
                  <p className="kdbx-runtime-note" role="status">
                    A seleção de arquivos fica disponível no aplicativo desktop.
                  </p>
                )}
              </div>

              <footer className="kdbx-dialog-footer">
                <DesignButton type="button" tone="quiet" onClick={close}>
                  Cancelar
                </DesignButton>
                <DesignButton type="submit" tone="primary" disabled={!desktop || isOpening}>
                  {isOpening && (
                    <LoaderCircle size={15} className="animate-spin" aria-hidden="true" />
                  )}
                  {isOpening ? 'Validando…' : 'Abrir somente leitura'}
                </DesignButton>
              </footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function messageFor(error: unknown) {
  if (error instanceof KdbxGatewayError) return error.message;
  return 'O MyVault não conseguiu concluir a operação.';
}
