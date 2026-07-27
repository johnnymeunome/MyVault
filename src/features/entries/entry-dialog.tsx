import { Eye, EyeOff, Sparkles, Star } from 'lucide-react';
import { useMemo, useState, type SyntheticEvent } from 'react';
import type { LoginEntry, LoginEntryInput } from '../../domain/entities/entry';
import { generatePassword } from '../../domain/services/password';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog';
import { useVaultStore } from '../../stores/vault-store';

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
  const canSubmit = useMemo(
    () => input.title.trim() && input.username.trim() && input.password,
    [input],
  );

  const update = <K extends keyof LoginEntryInput>(key: K, value: LoginEntryInput[K]) =>
    setInput((current) => ({ ...current, [key]: value }));

  const generate = () => {
    const values = new Uint32Array(20);
    crypto.getRandomValues(values);
    update(
      'password',
      generatePassword(
        { length: 20, uppercase: true, lowercase: true, numbers: true, symbols: true },
        values,
      ),
    );
    setRevealed(true);
  };

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

  return (
    <Dialog open onOpenChange={(open) => !open && setOverlay(null)}>
      <DialogContent>
        <DialogTitle>{mode === 'create' ? 'Novo login' : 'Editar login'}</DialogTitle>
        <DialogDescription>
          {mode === 'create'
            ? 'Crie um item apenas para esta sessão de demonstração.'
            : 'As alterações não serão salvas no disco.'}
        </DialogDescription>
        <form className="mt-5 space-y-4" onSubmit={submit}>
          <label className="form-field">
            <span>Título</span>
            <input
              autoFocus
              required
              value={input.title}
              onChange={(event) => update('title', event.target.value)}
              placeholder="Ex.: GitHub"
            />
          </label>
          <label className="form-field">
            <span>Usuário</span>
            <input
              required
              value={input.username}
              onChange={(event) => update('username', event.target.value)}
              placeholder="nome@example.test"
              autoComplete="off"
            />
          </label>
          <div className="form-field">
            <span>Senha de demonstração</span>
            <div className="input-actions">
              <input
                required
                type={revealed ? 'text' : 'password'}
                value={input.password}
                onChange={(event) => update('password', event.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setRevealed((value) => !value)}
                aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button type="button" onClick={generate} aria-label="Gerar senha">
                <Sparkles size={16} />
              </button>
            </div>
          </div>
          <label className="form-field">
            <span>URL</span>
            <input
              type="url"
              value={input.url}
              onChange={(event) => update('url', event.target.value)}
              placeholder="https://example.test"
            />
          </label>
          <label className="form-field">
            <span>
              Tags <small>separadas por vírgula</small>
            </span>
            <input
              value={tagText}
              onChange={(event) => setTagText(event.target.value)}
              placeholder="dev, pessoal"
            />
          </label>
          <label className="form-field">
            <span>Notas</span>
            <textarea
              rows={3}
              value={input.notes}
              onChange={(event) => update('notes', event.target.value)}
              placeholder="Contexto útil, sem dados reais."
            />
          </label>
          <label className="favorite-toggle">
            <input
              type="checkbox"
              checked={input.favorite}
              onChange={(event) => update('favorite', event.target.checked)}
            />
            <Star size={16} fill={input.favorite ? 'currentColor' : 'none'} />
            Adicionar aos favoritos
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOverlay(null)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!canSubmit}>
              {mode === 'create' ? 'Criar item' : 'Salvar alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
