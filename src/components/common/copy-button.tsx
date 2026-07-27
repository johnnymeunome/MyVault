import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { useClipboardStore } from '../../features/clipboard/clipboard-store';
import { useVaultStore } from '../../stores/vault-store';
import { Button } from '../ui/button';

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
    <Button
      variant="ghost"
      size={compact ? 'icon' : 'sm'}
      className={compact ? 'size-7 min-h-7' : undefined}
      onClick={handleCopy}
      aria-label={`Copiar ${label.toLocaleLowerCase('pt-BR')}`}
    >
      {copied ? <Check size={14} className="text-[var(--success)]" /> : <Copy size={14} />}
      {!compact && (copied ? 'Copiado' : 'Copiar')}
    </Button>
  );
}
