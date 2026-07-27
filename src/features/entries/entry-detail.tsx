import {
  CreditCard,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  IdCard,
  KeyRound,
  Pencil,
  RotateCw,
  Star,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { EntryLogo } from '../../components/common/entry-logo';
import type { VaultEntry } from '../../domain/entities/entry';
import { evaluatePasswordStrength } from '../../domain/services/password';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';
import { CopyButton } from '../../components/common/copy-button';
import { Button } from '../../components/ui/button';

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const renderTypeIcon = (entry: VaultEntry) => {
  const props = { size: 15, className: 'text-[var(--text-muted)]' };
  if (entry.type === 'card') return <CreditCard {...props} />;
  if (entry.type === 'identity') return <IdCard {...props} />;
  if (entry.type === 'secure-note') return <FileText {...props} />;
  return <KeyRound {...props} />;
};

export function EntryDetail() {
  const entries = useVaultStore((state) => state.entries);
  const selectedEntryId = useVaultStore((state) => state.selectedEntryId);
  const toggleFavorite = useVaultStore((state) => state.toggleFavorite);
  const duplicateEntry = useVaultStore((state) => state.duplicateEntry);
  const trashEntry = useVaultStore((state) => state.trashEntry);
  const setOverlay = useVaultStore((state) => state.setOverlay);
  const readOnlySession = useVaultStore((state) => state.readOnlySession);
  const [revealedEntryId, setRevealedEntryId] = useState<string | null>(null);
  const entry = entries.find((candidate) => candidate.id === selectedEntryId);

  if (!entry) {
    return (
      <section className="detail-panel empty-detail">
        <KeyRound size={28} />
        <p>Selecione um item para ver os detalhes.</p>
      </section>
    );
  }

  const revealed = revealedEntryId === entry.id;
  const safeUrl = entry.type === 'login' && /^https?:\/\//i.test(entry.url) ? entry.url : null;

  return (
    <section className="detail-panel" aria-labelledby="entry-detail-title">
      <div className="detail-heading">
        <EntryLogo entry={entry} size="detail" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {renderTypeIcon(entry)}
            <h2 id="entry-detail-title" className="truncate">
              {entry.title}
            </h2>
          </div>
          <p>
            {entry.type === 'login'
              ? 'Login'
              : entry.type === 'card'
                ? 'Cartão'
                : entry.type === 'identity'
                  ? 'Identidade'
                  : 'Nota segura'}
          </p>
        </div>
        {!readOnlySession && (
          <button
            className={cn('icon-button', entry.favorite && 'is-favorite')}
            aria-label={entry.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={() => toggleFavorite(entry.id)}
          >
            <Star size={17} fill={entry.favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <dl className="detail-body">
        <DetailRow label="Título">
          <span>{entry.title}</span>
        </DetailRow>
        {entry.type === 'login' && (
          <>
            <DetailRow label="URL">
              {safeUrl ? (
                <a className="detail-link" href={safeUrl} target="_blank" rel="noreferrer">
                  {entry.url}
                  <ExternalLink size={13} />
                </a>
              ) : (
                <span className="text-[var(--text-muted)]">Não informada</span>
              )}
            </DetailRow>
            <DetailRow label="Usuário">
              <span className="value-with-action">
                <span className="truncate">{entry.username}</span>
                {!readOnlySession && <CopyButton value={entry.username} label="Usuário" compact />}
              </span>
            </DetailRow>
            {!readOnlySession && (
              <DetailRow label="Senha">
                <div className="space-y-2">
                  <span className="value-with-action">
                    <code className="tracking-[0.16em]">
                      {revealed ? entry.password : '••••••••••••'}
                    </code>
                    <span className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 min-h-7"
                        onClick={() => setRevealedEntryId(revealed ? null : entry.id)}
                        aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
                      >
                        {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
                      </Button>
                      <CopyButton value={entry.password} label="Senha" compact />
                    </span>
                  </span>
                  <span className="strength-meter">
                    {[1, 2, 3, 4].map((segment) => (
                      <i
                        key={segment}
                        data-active={segment <= evaluatePasswordStrength(entry.password).score}
                      />
                    ))}
                    <small>{evaluatePasswordStrength(entry.password).label}</small>
                  </span>
                </div>
              </DetailRow>
            )}
            {!readOnlySession && entry.totp && (
              <DetailRow label="Código 2FA">
                <span className="totp-value">
                  <strong>{entry.totp.mockCode}</strong>
                  <span aria-label="18 segundos restantes">18</span>
                  <CopyButton
                    value={entry.totp.mockCode.replace(' ', '')}
                    label="Código 2FA"
                    compact
                  />
                </span>
              </DetailRow>
            )}
          </>
        )}
        {entry.type === 'card' && (
          <>
            <DetailRow label="Titular">
              <span>{entry.cardholderName}</span>
            </DetailRow>
            <DetailRow label="Número">
              <span>•••• •••• •••• {entry.lastFour}</span>
            </DetailRow>
            <DetailRow label="Validade">
              <span>{entry.expiresAt}</span>
            </DetailRow>
          </>
        )}
        {entry.type === 'identity' && (
          <>
            <DetailRow label="Nome">
              <span>{entry.fullName}</span>
            </DetailRow>
            <DetailRow label="E-mail">
              <span className="value-with-action">
                {entry.email}
                <CopyButton value={entry.email} label="E-mail" compact />
              </span>
            </DetailRow>
          </>
        )}
        {entry.type === 'secure-note' && (
          <DetailRow label="Conteúdo">
            <p className="leading-6">{entry.content}</p>
          </DetailRow>
        )}
        {readOnlySession && (
          <DetailRow label="Proteção">
            <div className="read-only-notice">
              Senha, TOTP, notas, histórico e anexos permaneceram no núcleo Rust.
            </div>
          </DetailRow>
        )}
        {!readOnlySession && (
          <DetailRow label="Tags">
            <span className="tag-list">
              {entry.tags.map((tag) => (
                <span key={tag.id}>{tag.label}</span>
              ))}
            </span>
          </DetailRow>
        )}
        {!readOnlySession && (
          <DetailRow label="Notas">
            <p className="detail-note">{entry.notes || 'Nenhuma nota.'}</p>
          </DetailRow>
        )}
        <DetailRow label="Atualizado">
          <time>
            {new Date(entry.updatedAt).toLocaleString('pt-BR', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </time>
        </DetailRow>
      </dl>

      {!readOnlySession && (
        <div className="detail-actions">
          <Button
            variant="secondary"
            disabled={entry.type !== 'login'}
            onClick={() => setOverlay('entry-edit')}
          >
            <Pencil size={15} />
            Editar
          </Button>
          <Button variant="secondary" onClick={() => duplicateEntry(entry.id)}>
            <RotateCw size={15} />
            Duplicar
          </Button>
          <Button variant="danger" onClick={() => trashEntry(entry.id)}>
            <Trash2 size={15} />
            Excluir
          </Button>
        </div>
      )}
    </section>
  );
}
