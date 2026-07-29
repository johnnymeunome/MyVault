import { Dialog } from '@base-ui/react/dialog';
import { Eye, EyeOff, Sparkles, Star, X } from 'lucide-react';
import { useMemo, useState, type SyntheticEvent } from 'react';
import { DesignButton, DesignIconButton } from '../../design-system/button';
import { DesignCheckbox, DesignField, DesignTextArea } from '../../design-system/form-controls';
import type { LoginEntry, LoginEntryInput } from '../../domain/entities/entry';
import { useVaultStore } from '../../stores/vault-store';
import { PasswordGenerator } from '../password-generator/password-generator';

const emptyInput: LoginEntryInput = {
  title: '',
  username: '',
  password: '',
  url: '',
  notes: '',
  tags: [],
  favorite: false,
};

const toInput = (entry?: LoginEntry): LoginEntryInput =>
  entry
    ? {
        title: entry.title,
        username: entry.username,
        password: entry.password,
        url: entry.url,
        notes: entry.notes,
        tags: entry.tags.map((tag) => tag.label),
        favorite: entry.favorite,
      }
    : emptyInput;

export function EntryDialog({ mode }: { mode: 'create' | 'edit' }) {
  const entries = useVaultStore((state) => state.entries);
  const selectedEntryId = useVaultStore((state) => state.selectedEntryId);
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const createLogin = useVaultStore((state) => state.createLogin);
  const updateLogin = useVaultStore((state) => state.updateLogin);
  const selected = entries.find(
    (entry): entry is LoginEntry => entry.id === selectedEntryId && entry.type === 'login',
  );
  const [input, setInput] = useState<LoginEntryInput>(() =>
    toInput(mode === 'edit' ? selected : undefined),
  );
  const [tagText, setTagText] = useState(() => input.tags.join(', '));
  const [revealed, setRevealed] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const canSubmit = useMemo(
    () => Boolean(input.title.trim() && input.username.trim() && input.password),
    [input],
  );

  const update = <K extends keyof LoginEntryInput>(key: K, value: LoginEntryInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    const finalInput = {
      ...input,
      title: input.title.trim(),
      username: input.username.trim(),
      url: input.url.trim(),
      tags: tagText
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
    if (mode === 'edit' && selected) updateLogin(selected.id, finalInput);
    else createLogin(finalInput);
  };

  const close = () => setOverlay(null);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="phase-dialog-backdrop" />
        <Dialog.Viewport className="phase-dialog-viewport">
          <Dialog.Popup className="entry-editor-dialog">
            <form className="entry-editor-form" onSubmit={submit}>
              <header className="entry-editor-header">
                <div>
                  <span className="editor-context">
                    {mode === 'create' ? 'Nova entrada' : 'Entrada selecionada'}
                  </span>
                  <Dialog.Title>
                    {mode === 'create' ? 'Criar login' : `Editar ${selected?.title ?? 'login'}`}
                  </Dialog.Title>
                  <Dialog.Description>
                    {mode === 'create'
                      ? 'Adicione uma credencial a esta sessão local de demonstração.'
                      : 'Revise os campos sem gravar qualquer dado no disco.'}
                  </Dialog.Description>
                </div>
                <Dialog.Close render={<DesignIconButton label="Fechar editor" tone="quiet" />}>
                  <X size={17} aria-hidden="true" />
                </Dialog.Close>
              </header>

              <div className="entry-editor-content">
                <section className="editor-section" aria-labelledby="identity-heading">
                  <header>
                    <span>01</span>
                    <div>
                      <h2 id="identity-heading">Identidade</h2>
                      <p>Nome e endereço usados para reconhecer esta conta.</p>
                    </div>
                  </header>
                  <div className="editor-field-grid">
                    <DesignField
                      label="Título"
                      autoFocus
                      required
                      value={input.title}
                      onChange={(event) => update('title', event.target.value)}
                      placeholder="Ex.: GitHub"
                      description="Nome visível na lista do cofre."
                    />
                    <DesignField
                      label="URL"
                      type="url"
                      value={input.url}
                      onChange={(event) => update('url', event.target.value)}
                      placeholder="https://example.test"
                    />
                  </div>
                </section>

                <section className="editor-section" aria-labelledby="credential-heading">
                  <header>
                    <span>02</span>
                    <div>
                      <h2 id="credential-heading">Credencial</h2>
                      <p>O valor permanece somente na memória durante esta demonstração.</p>
                    </div>
                  </header>
                  <div className="editor-field-grid">
                    <DesignField
                      label="Usuário"
                      required
                      value={input.username}
                      onChange={(event) => update('username', event.target.value)}
                      placeholder="nome@example.test"
                      autoComplete="off"
                    />
                    <label className="editor-password-field">
                      <span>Senha de demonstração</span>
                      <div className="editor-password-control">
                        <input
                          required
                          type={revealed ? 'text' : 'password'}
                          value={input.password}
                          onChange={(event) => update('password', event.target.value)}
                          autoComplete="new-password"
                        />
                        <DesignIconButton
                          type="button"
                          tone="quiet"
                          label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
                          onClick={() => setRevealed((value) => !value)}
                        >
                          {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                        </DesignIconButton>
                        <DesignButton
                          type="button"
                          tone="quiet"
                          size="sm"
                          onClick={() => setGeneratorOpen((open) => !open)}
                          aria-expanded={generatorOpen}
                        >
                          <Sparkles size={14} aria-hidden="true" />
                          Gerar
                        </DesignButton>
                      </div>
                    </label>
                  </div>
                  {generatorOpen && (
                    <div className="editor-embedded-generator">
                      <PasswordGenerator
                        variant="embedded"
                        onClose={() => setGeneratorOpen(false)}
                        onUse={(generatedValue) => {
                          update('password', generatedValue);
                          setRevealed(true);
                          setGeneratorOpen(false);
                        }}
                      />
                    </div>
                  )}
                </section>

                <section className="editor-section" aria-labelledby="organization-heading">
                  <header>
                    <span>03</span>
                    <div>
                      <h2 id="organization-heading">Organização</h2>
                      <p>Metadados opcionais para recuperar o item mais tarde.</p>
                    </div>
                  </header>
                  <div className="editor-field-grid editor-field-grid--notes">
                    <DesignField
                      label="Tags"
                      value={tagText}
                      onChange={(event) => setTagText(event.target.value)}
                      placeholder="dev, pessoal"
                      description="Separe os termos por vírgula."
                    />
                    <DesignTextArea
                      label="Notas"
                      rows={4}
                      value={input.notes}
                      onChange={(event) => update('notes', event.target.value)}
                      placeholder="Contexto útil, sem dados reais."
                    />
                  </div>
                  <div className="editor-favorite-row">
                    <DesignCheckbox
                      label="Adicionar aos favoritos"
                      checked={input.favorite}
                      onCheckedChange={(checked) => update('favorite', checked)}
                    />
                    <Star
                      size={15}
                      fill={input.favorite ? 'currentColor' : 'none'}
                      aria-hidden="true"
                    />
                  </div>
                </section>
              </div>

              <footer className="entry-editor-footer">
                <p>
                  <i aria-hidden="true" /> Alterações locais · sem persistência
                </p>
                <div>
                  <DesignButton type="button" tone="quiet" onClick={close}>
                    Cancelar
                  </DesignButton>
                  <DesignButton type="submit" tone="primary" disabled={!canSubmit}>
                    {mode === 'create' ? 'Criar item' : 'Salvar alterações'}
                  </DesignButton>
                </div>
              </footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
