import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy, RefreshCw, Sparkles, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { DesignButton, DesignIconButton } from '../../design-system/button';
import { DesignCheckbox, DesignSlider } from '../../design-system/form-controls';
import {
  estimatePassphraseEntropy,
  estimatePasswordEntropy,
  generatePassphrase,
  generatePassword,
  type PassphraseOptions,
  type PasswordOptions,
} from '../../domain/services/password';
import { useVaultStore } from '../../stores/vault-store';
import { useClipboardStore } from '../clipboard/clipboard-store';

type GeneratorMode = 'password' | 'passphrase';

const defaultPasswordOptions: PasswordOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const defaultPassphraseOptions: PassphraseOptions = {
  wordCount: 5,
  separator: '-',
  capitalize: false,
  includeNumber: true,
};

const createPassword = (options: PasswordOptions) => {
  const values = new Uint32Array(options.length);
  crypto.getRandomValues(values);
  return generatePassword(options, values);
};

const createPassphrase = (options: PassphraseOptions) => {
  const values = new Uint32Array(options.wordCount + (options.includeNumber ? 1 : 0));
  crypto.getRandomValues(values);
  return generatePassphrase(options, values);
};

const describeEntropy = (entropy: number) => {
  if (entropy < 45) return 'Essencial';
  if (entropy < 70) return 'Boa';
  if (entropy < 100) return 'Forte';
  return 'Muito forte';
};

interface PasswordGeneratorProps {
  variant?: 'workspace' | 'embedded';
  compact?: boolean;
  onUse?: (value: string) => void;
  onClose?: () => void;
}

export function PasswordGenerator({
  variant = 'workspace',
  onUse,
  onClose,
}: PasswordGeneratorProps) {
  const [mode, setMode] = useState<GeneratorMode>('password');
  const [passwordOptions, setPasswordOptions] = useState(defaultPasswordOptions);
  const [passphraseOptions, setPassphraseOptions] = useState(defaultPassphraseOptions);
  const [value, setValue] = useState(() => createPassword(defaultPasswordOptions));
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const showToast = useVaultStore((state) => state.showToast);
  const copy = useClipboardStore((state) => state.copy);

  const entropy = useMemo(
    () =>
      mode === 'password'
        ? estimatePasswordEntropy(passwordOptions)
        : estimatePassphraseEntropy(passphraseOptions),
    [mode, passphraseOptions, passwordOptions],
  );
  const strength = describeEntropy(entropy);
  const meterWidth = Math.min(100, Math.max(12, (entropy / 128) * 100));

  const regenerate = (
    nextMode = mode,
    nextPasswordOptions = passwordOptions,
    nextPassphraseOptions = passphraseOptions,
  ) => {
    setValue(
      nextMode === 'password'
        ? createPassword(nextPasswordOptions)
        : createPassphrase(nextPassphraseOptions),
    );
    setCopied(false);
  };

  const changeMode = (nextMode: GeneratorMode) => {
    setMode(nextMode);
    regenerate(nextMode);
  };

  const updatePasswordOptions = (nextOptions: PasswordOptions) => {
    setPasswordOptions(nextOptions);
    regenerate('password', nextOptions, passphraseOptions);
  };

  const updatePassphraseOptions = (nextOptions: PassphraseOptions) => {
    setPassphraseOptions(nextOptions);
    regenerate('passphrase', passwordOptions, nextOptions);
  };

  const togglePasswordSet = (key: keyof Omit<PasswordOptions, 'length'>) => {
    const enabledCount = Object.entries(passwordOptions).filter(
      ([option, enabled]) => option !== 'length' && enabled,
    ).length;
    if (passwordOptions[key] && enabledCount === 1) return;
    updatePasswordOptions({ ...passwordOptions, [key]: !passwordOptions[key] });
  };

  const copyValue = async () => {
    try {
      await copy(value, mode === 'password' ? 'Senha gerada' : 'Frase secreta gerada');
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      showToast({
        title: 'Não foi possível copiar',
        description: 'Conceda permissão de clipboard ao aplicativo.',
        tone: 'danger',
      });
    }
  };

  return (
    <section
      className={variant === 'workspace' ? 'password-tool-view' : 'password-tool-embedded'}
      aria-labelledby={variant === 'workspace' ? 'generator-workspace-title' : 'generator-embedded-title'}
    >
      <header className="password-tool-header">
        <div>
          <span className="password-tool-context">Ferramenta local</span>
          <h1 id={variant === 'workspace' ? 'generator-workspace-title' : 'generator-embedded-title'}>
            Gerador de senhas
          </h1>
          <p>Crie um valor forte sem histórico, persistência ou chamadas externas.</p>
        </div>
        {onClose && (
          <DesignIconButton label="Fechar gerador" tone="quiet" onClick={onClose}>
            <X size={17} aria-hidden="true" />
          </DesignIconButton>
        )}
      </header>

      <div className="password-tool-body">
        <div className="password-tool-primary">
          <div className="password-mode-switch" role="tablist" aria-label="Tipo de geração">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'password'}
              className={mode === 'password' ? 'is-active' : undefined}
              onClick={() => changeMode('password')}
            >
              Senha
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'passphrase'}
              className={mode === 'passphrase' ? 'is-active' : undefined}
              onClick={() => changeMode('passphrase')}
            >
              Frase secreta
            </button>
          </div>

          <div className="password-result" aria-live="polite">
            <span>Resultado</span>
            <div className="password-result-line">
              <AnimatePresence mode="wait" initial={false}>
                <motion.code
                  key={value}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 5, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5, filter: 'blur(3px)' }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {value}
                </motion.code>
              </AnimatePresence>
              <div className="password-result-actions">
                <DesignIconButton label="Gerar novamente" tone="quiet" onClick={() => regenerate()}>
                  <RefreshCw size={16} aria-hidden="true" />
                </DesignIconButton>
                <DesignIconButton label="Copiar valor gerado" tone="quiet" onClick={copyValue}>
                  {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                </DesignIconButton>
              </div>
            </div>
            <div className="password-strength-track" aria-hidden="true">
              <motion.i
                animate={{ width: `${String(meterWidth)}%` }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { duration: 0.48, ease: [0.22, 1, 0.36, 1] }
                }
              />
            </div>
            <div className="password-strength-copy">
              <strong>{copied ? 'Copiado' : strength}</strong>
              <span>{entropy} bits estimados · cálculo local</span>
            </div>
          </div>

          <div className="password-privacy-note">
            <i aria-hidden="true" />
            <span>Nenhum valor gerado é armazenado pelo MyVault.</span>
          </div>
        </div>

        <div className="password-tool-controls">
          {mode === 'password' ? (
            <>
              <div className="generator-control-section">
                <span>Composição</span>
                <DesignSlider
                  label="Comprimento"
                  min={8}
                  max={64}
                  value={passwordOptions.length}
                  onValueChange={(length) => updatePasswordOptions({ ...passwordOptions, length })}
                />
              </div>
              <div className="generator-control-section generator-check-grid">
                <DesignCheckbox
                  label="Maiúsculas"
                  checked={passwordOptions.uppercase}
                  onCheckedChange={() => togglePasswordSet('uppercase')}
                />
                <DesignCheckbox
                  label="Minúsculas"
                  checked={passwordOptions.lowercase}
                  onCheckedChange={() => togglePasswordSet('lowercase')}
                />
                <DesignCheckbox
                  label="Números"
                  checked={passwordOptions.numbers}
                  onCheckedChange={() => togglePasswordSet('numbers')}
                />
                <DesignCheckbox
                  label="Símbolos"
                  checked={passwordOptions.symbols}
                  onCheckedChange={() => togglePasswordSet('symbols')}
                />
              </div>
            </>
          ) : (
            <>
              <div className="generator-control-section">
                <span>Estrutura</span>
                <DesignSlider
                  label="Palavras"
                  min={3}
                  max={8}
                  value={passphraseOptions.wordCount}
                  onValueChange={(wordCount) =>
                    updatePassphraseOptions({ ...passphraseOptions, wordCount })
                  }
                />
              </div>
              <div className="generator-control-section">
                <span>Separador</span>
                <div className="separator-options" role="radiogroup" aria-label="Separador da frase">
                  {([
                    ['-', 'Hífen'],
                    [' ', 'Espaço'],
                    ['_', 'Sublinhado'],
                  ] as const).map(([separator, label]) => (
                    <button
                      type="button"
                      role="radio"
                      aria-checked={passphraseOptions.separator === separator}
                      className={passphraseOptions.separator === separator ? 'is-selected' : undefined}
                      key={label}
                      onClick={() => updatePassphraseOptions({ ...passphraseOptions, separator })}
                    >
                      <code>{separator === ' ' ? '␠' : separator}</code>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="generator-control-section generator-check-grid">
                <DesignCheckbox
                  label="Iniciais maiúsculas"
                  checked={passphraseOptions.capitalize}
                  onCheckedChange={(capitalize) =>
                    updatePassphraseOptions({ ...passphraseOptions, capitalize })
                  }
                />
                <DesignCheckbox
                  label="Incluir número"
                  checked={passphraseOptions.includeNumber}
                  onCheckedChange={(includeNumber) =>
                    updatePassphraseOptions({ ...passphraseOptions, includeNumber })
                  }
                />
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="password-tool-footer">
        <span><Sparkles size={14} aria-hidden="true" /> Aleatoriedade fornecida pela plataforma</span>
        <div>
          <DesignButton tone="quiet" onClick={() => regenerate()}>Gerar novamente</DesignButton>
          {onUse && (
            <DesignButton tone="primary" onClick={() => onUse(value)}>Usar este valor</DesignButton>
          )}
        </div>
      </footer>
    </section>
  );
}
