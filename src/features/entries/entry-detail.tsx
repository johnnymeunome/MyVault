import { ExternalLink, Eye, EyeOff, Star } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { CopyButton } from '../../components/common/copy-button';
import { EntryLogo } from '../../components/common/entry-logo';
import { DesignButton } from '../../design-system/button';
import type { VaultEntry } from '../../domain/entities/entry';
import { evaluatePasswordStrength } from '../../domain/services/password';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="detail-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

const typeLabelFor = (entry: VaultEntry) => {
  if (entry.type === 'card') return 'Cartão';
  if (entry.type === 'identity') return 'Identidade';
  if (entry.type === 'secure-note') return 'Nota segura';
  return 'Login';
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
        <strong>Nenhum item selecionado</strong>
        <p>Escolha uma linha para consultar seus detalhes.</p>
      </section>
    );
  }

  const revealed = revealedEntryId === entry.id;
  const safeUrl = entry.type === 'login' && /^https?:\/\//i.test(entry.url) ? entry.url : null;
  const passwordStrength =
    entry.type === 'login' && !readOnlySession ? evaluatePasswordStrength(entry.password) : null;

  return (
    <section className="detail-panel" aria-labelledby="entry-detail-title">
      <div className="detail-heading">
        <EntryLogo entry={entry} size="detail" />
        <div className="detail-heading-copy">
          <h2 id="entry-detail-title" title={entry.title}>
            {entry.title}
          </h2>
          <p>{typeLabelFor(entry)}</p>
        </div>
        {!readOnlySession && (
          <button
            className={cn('detail-favorite-action', entry.favorite && 'is-favorite')}
            aria-label={entry.favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            onClick={() => toggleFavorite(entry.id)}
            type="button"
          >
            <Star
              size={16}
              strokeWidth={1.7}
              fill={entry.favorite ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <dl className="detail-body">
        {entry.type === 'login' && (
          <>
            <DetailRow label="URL">
              {safeUrl ? (
                <a className="detail-link" href={safeUrl} target="_blank" rel="noreferrer">
                  <span>{entry.url}</span>
                  <ExternalLink size={12} strokeWidth={1.7} aria-hidden="true" />
                </a>
              ) : (
                <span className="detail-empty-value">Não informada</span>
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
                <div className="password-block">
                  <span className="value-with-action">
                    <code>{revealed ? entry.password : '••••••••••••'}</code>
                    <span className="detail-value-actions">
                      <button
                        className="detail-value-action"
                        onClick={() => setRevealedEntryId(revealed ? null : entry.id)}
                        aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
                        title={revealed ? 'Ocultar senha' : 'Mostrar senha'}
                        type="button"
                      >
                        {revealed ? (
                          <EyeOff size={14} aria-hidden="true" />
                        ) : (
                          <Eye size={14} aria-hidden="true" />
                        )}
                      </button>
                      <CopyButton value={entry.password} label="Senha" compact />
                    </span>
                  </span>
                  {passwordStrength && (
                    <span className="password-strength" data-level={passwordStrength.level}>
                      <i aria-hidden="true" />
                      Força {passwordStrength.label.toLocaleLowerCase('pt-BR')}
                    </span>
                  )}
                </div>
              </DetailRow>
            )}
            {!readOnlySession && entry.totp && (
              <DetailRow label="Código 2FA">
                <span className="totp-value">
                  <strong>{entry.totp.mockCode}</strong>
                  <small>atualiza em 18 s</small>
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
                <span className="truncate">{entry.email}</span>
                <CopyButton value={entry.email} label="E-mail" compact />
              </span>
            </DetailRow>
          </>
        )}

        {entry.type === 'secure-note' && (
          <DetailRow label="Conteúdo">
            <p className="detail-long-copy">{entry.content}</p>
          </DetailRow>
        )}

        {readOnlySession && (
          <DetailRow label="Proteção">
            <span className="read-only-notice">
              <strong>Segredos isolados</strong>
              <span>Senha, TOTP, notas, histórico e anexos permaneceram no núcleo Rust.</span>
            </span>
          </DetailRow>
        )}

        {!readOnlySession && entry.tags.length > 0 && (
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
        <div className="detail-actions" aria-label="Ações do item">
          <DesignButton
            tone="secondary"
            disabled={entry.type !== 'login'}
            onClick={() => setOverlay('entry-edit')}
          >
            Editar
          </DesignButton>
          <DesignButton tone="quiet" onClick={() => duplicateEntry(entry.id)}>
            Duplicar
          </DesignButton>
          <DesignButton
            tone="quiet"
            className="detail-delete-action"
            onClick={() => trashEntry(entry.id)}
          >
            Mover para a lixeira
          </DesignButton>
        </div>
      )}
    </section>
  );
}
