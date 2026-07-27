import { Copy, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';
import {
  evaluatePasswordStrength,
  generatePassword,
  type PasswordOptions,
} from '../../domain/services/password';
import { Button } from '../../components/ui/button';
import { useVaultStore } from '../../stores/vault-store';
import { useClipboardStore } from '../clipboard/clipboard-store';

const defaultOptions: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

function createGeneratedPassword(options: PasswordOptions): string {
  const values = new Uint32Array(options.length);
  crypto.getRandomValues(values);
  return generatePassword(options, values);
}

export function PasswordGenerator({ compact = false }: { compact?: boolean }) {
  const [options, setOptions] = useState(defaultOptions);
  const [password, setPassword] = useState(() => createGeneratedPassword(defaultOptions));
  const showToast = useVaultStore((state) => state.showToast);
  const copy = useClipboardStore((state) => state.copy);
  const strength = evaluatePasswordStrength(password);

  const regenerate = (nextOptions = options) => setPassword(createGeneratedPassword(nextOptions));

  const updateOptions = (nextOptions: PasswordOptions) => {
    setOptions(nextOptions);
    regenerate(nextOptions);
  };

  const toggle = (key: keyof Omit<PasswordOptions, 'length'>) => {
    const enabledCount = Object.entries(options).filter(
      ([option, value]) => option !== 'length' && value,
    ).length;
    if (options[key] && enabledCount === 1) return;
    updateOptions({ ...options, [key]: !options[key] });
  };

  const copyPassword = async () => {
    try {
      await copy(password, 'Senha gerada');
    } catch {
      showToast({
        title: 'Não foi possível copiar',
        description: 'Conceda permissão de clipboard ao aplicativo.',
        tone: 'danger',
      });
    }
  };

  return (
    <section className={compact ? 'utility-card' : 'space-y-4'} aria-labelledby="generator-title">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--brand-blue-strong)]" />
          <h2 id="generator-title" className="text-sm font-medium">
            Gerador de senhas
          </h2>
        </div>
        <span className="text-xs font-medium text-[var(--success)]">{strength.label}</span>
      </div>

      <div className="mt-3 flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-deep)] p-1 pl-2.5">
        <code className="min-w-0 flex-1 truncate text-xs text-[var(--text-primary)]">
          {password}
        </code>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 min-h-7"
          onClick={() => regenerate()}
          aria-label="Gerar outra senha"
        >
          <RefreshCw size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-7 min-h-7"
          onClick={copyPassword}
          aria-label="Copiar senha gerada"
        >
          <Copy size={14} />
        </Button>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <label htmlFor={`password-length-${compact ? 'compact' : 'dialog'}`}>Comprimento</label>
        <output className="rounded bg-[var(--surface-active)] px-1.5 py-0.5 text-[var(--text-secondary)]">
          {options.length}
        </output>
      </div>
      <input
        id={`password-length-${compact ? 'compact' : 'dialog'}`}
        className="range mt-2 w-full"
        type="range"
        min="8"
        max="40"
        value={options.length}
        onChange={(event) => updateOptions({ ...options, length: Number(event.target.value) })}
      />

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {(
          [
            ['uppercase', 'A–Z'],
            ['lowercase', 'a–z'],
            ['numbers', '0–9'],
            ['symbols', 'Símbolos'],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex min-h-7 cursor-pointer items-center gap-2 text-[var(--text-secondary)]"
          >
            <input type="checkbox" checked={options[key]} onChange={() => toggle(key)} />
            {label}
          </label>
        ))}
      </div>

      {!compact && (
        <Button variant="primary" className="w-full" onClick={() => regenerate()}>
          Gerar nova senha
        </Button>
      )}
    </section>
  );
}
