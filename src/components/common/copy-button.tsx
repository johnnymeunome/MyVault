import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useClipboardStore } from '../../features/clipboard/clipboard-store';
import { cn } from '../../lib/utils';
import { useVaultStore } from '../../stores/vault-store';

export function CopyButton({
  value,
  label,
  compact = false,
}: {
  value: string;
  label: string;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useClipboardStore((state) => state.copy);
  const showToast = useVaultStore((state) => state.showToast);

  const handleCopy = async () => {
    try {
      await copy(value, label);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast({
        title: 'Não foi possível copiar',
        description: 'Verifique a permissão de clipboard.',
        tone: 'danger',
      });
    }
  };

  return (
    <button
      className={cn('copy-action', compact && 'copy-action--compact', copied && 'is-copied')}
      onClick={handleCopy}
      aria-label={`Copiar ${label.toLocaleLowerCase('pt-BR')}`}
      title={copied ? `${label} copiado` : `Copiar ${label.toLocaleLowerCase('pt-BR')}`}
      type="button"
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
      {!compact && <span>{copied ? 'Copiado' : 'Copiar'}</span>}
    </button>
  );
}
