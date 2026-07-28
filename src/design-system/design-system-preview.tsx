import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Check, Copy, Moon, RefreshCw, Sun, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { evaluatePasswordStrength, generatePassword } from '../domain/services/password';
import { DesignButton, DesignIconButton } from './button';
import { DesignCheckbox, DesignField, DesignSlider, DesignTextArea } from './form-controls';
import { DesignDialogDemo, DesignMenuDemo, MoreActionsTooltip } from './overlays';
import { DesignStatus } from './status';

const sections = [
  ['foundation', 'Fundação'],
  ['actions', 'Ações'],
  ['forms', 'Formulários'],
  ['selection', 'Seleção'],
  ['overlays', 'Overlays'],
  ['motion', 'Movimento'],
] as const;

function createPreviewPassword(length: number, symbols: boolean) {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return generatePassword(
    { length, uppercase: true, lowercase: true, numbers: true, symbols },
    values,
  );
}

interface DesignSystemPreviewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onClose: () => void;
}

export function DesignSystemPreview({ theme, onToggleTheme, onClose }: DesignSystemPreviewProps) {
  const [length, setLength] = useState(20);
  const [symbols, setSymbols] = useState(true);
  const [password, setPassword] = useState(() => createPreviewPassword(20, true));
  const [copied, setCopied] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);

  const regenerate = (nextLength = length, nextSymbols = symbols) => {
    setPassword(createPreviewPassword(nextLength, nextSymbols));
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="ds-preview" data-theme={theme}>
      <aside className="ds-preview-nav">
        <div className="ds-preview-brand">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M5.5 5.75 12 3l6.5 2.75v5.5c0 4.2-2.5 7.48-6.5 9.75-4-2.27-6.5-5.55-6.5-9.75v-5.5Z" />
            <path d="m9.25 12 1.8 1.8 3.75-4.1" />
          </svg>
          <div>
            <strong>MyVault</strong>
            <span>Foundation Lab</span>
          </div>
        </div>

        <nav aria-label="Seções do laboratório">
          {sections.map(([id, label]) => (
            <a key={id} href={`#${id}`}>
              {label}
            </a>
          ))}
        </nav>

        <div className="ds-preview-nav__footer">
          <strong>Fase 1 · preview real</strong>
          <span>Primitives isolados do dashboard atual.</span>
        </div>
      </aside>

      <main className="ds-preview-main">
        <header className="ds-preview-header">
          <div>
            <span className="ds-context-label">Design system · Gate 1</span>
            <h1>Uma fundação mais contida e específica</h1>
            <p>Revise comportamento, densidade, estados e temas antes da migração do dashboard.</p>
          </div>
          <div className="ds-preview-header__actions">
            <DesignIconButton
              label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'}
              tone="quiet"
              onClick={onToggleTheme}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </DesignIconButton>
            <DesignIconButton label="Fechar laboratório" tone="quiet" onClick={onClose}>
              <X size={18} />
            </DesignIconButton>
          </div>
        </header>

        <div className="ds-preview-content">
          <section id="foundation" className="ds-spec-section">
            <header>
              <div>
                <h2>Fundação</h2>
                <p>Neutros quentes, branco acinzentado e cor reservada para informação.</p>
              </div>
            </header>
            <div className="ds-foundation-grid">
              <div className="ds-type-sample">
                <span className="ds-context-label">Cofre pessoal</span>
                <h3>GitHub</h3>
                <p>joaovictor · atualizado hoje, 09:41</p>
              </div>
              <div className="ds-token-strip" aria-label="Cores principais">
                <span data-token="canvas">Canvas</span>
                <span data-token="surface">Surface</span>
                <span data-token="soft-white">Soft white</span>
                <span data-token="line">Line</span>
                <span data-token="steel">Steel</span>
              </div>
              <div className="ds-meta-sample">
                <span>Tags</span>
                <p>
                  pessoal <i>·</i> trabalho <i>·</i> desenvolvimento
                </p>
              </div>
            </div>
          </section>

          <section id="actions" className="ds-spec-section">
            <header>
              <div>
                <h2>Ações</h2>
                <p>Uma ação principal; operações secundárias recuam ou migram para o menu.</p>
              </div>
            </header>
            <div className="ds-action-showcase">
              <DesignButton tone="primary">Salvar alterações</DesignButton>
              <DesignButton tone="quiet">Duplicar</DesignButton>
              <DesignButton tone="quiet">Cancelar</DesignButton>
              <MoreActionsTooltip />
              <DesignButton tone="quiet" disabled>
                Indisponível
              </DesignButton>
            </div>
            <div className="ds-status-row">
              <DesignStatus>Local</DesignStatus>
              <DesignStatus tone="info">Somente leitura</DesignStatus>
              <DesignStatus tone="success">Sincronizado</DesignStatus>
              <DesignStatus tone="warning">Experimental</DesignStatus>
              <DesignStatus tone="danger">Falha ao abrir</DesignStatus>
            </div>
          </section>

          <section id="forms" className="ds-spec-section">
            <header>
              <div>
                <h2>Formulários</h2>
                <p>Labels persistentes, ajuda próxima e erro associado ao campo.</p>
              </div>
            </header>
            <div className="ds-form-grid">
              <DesignField
                label="Título"
                defaultValue="GitHub"
                description="Nome reconhecível no cofre."
              />
              <DesignField label="Usuário" defaultValue="joaovictor" />
              <DesignField label="URL" defaultValue="https://github.com" />
              <DesignField
                label="Campo inválido"
                defaultValue="example"
                error="Informe uma URL completa."
              />
              <DesignTextArea
                label="Notas"
                defaultValue="Conta usada em projetos pessoais e profissionais."
                description="O conteúdo permanece somente nesta demonstração."
              />
            </div>
          </section>

          <section id="selection" className="ds-spec-section">
            <header>
              <div>
                <h2>Seleção e valores</h2>
                <p>Controles pequenos, legíveis e completamente operáveis por teclado.</p>
              </div>
            </header>
            <div className="ds-selection-grid">
              <div className="ds-control-stack">
                <DesignCheckbox label="Letras maiúsculas" defaultChecked />
                <DesignCheckbox
                  label="Números"
                  description="Evita caracteres ambíguos."
                  defaultChecked
                />
                <DesignCheckbox label="Controle desabilitado" disabled />
              </div>
              <DesignSlider
                label="Comprimento"
                min={8}
                max={40}
                value={length}
                onValueChange={(value) => {
                  setLength(value);
                  regenerate(value, symbols);
                }}
              />
            </div>
          </section>

          <section id="overlays" className="ds-spec-section">
            <header>
              <div>
                <h2>Menus e diálogos</h2>
                <p>Comportamento robusto da Base UI; anatomia visual específica do MyVault.</p>
              </div>
            </header>
            <div className="ds-inline-actions">
              <DesignMenuDemo />
              <DesignDialogDemo />
            </div>
          </section>

          <section id="motion" className="ds-spec-section ds-spec-section--motion">
            <header>
              <div>
                <h2>Estudo de movimento</h2>
                <p>Primeira direção para o gerador; a experiência completa pertence à Fase 5.</p>
              </div>
            </header>
            <div className="ds-generator-study">
              <div className="ds-generator-result">
                <span>Senha gerada</span>
                <div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.code
                      key={password}
                      initial={
                        shouldReduceMotion ? false : { opacity: 0, y: 5, filter: 'blur(3px)' }
                      }
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={
                        shouldReduceMotion ? undefined : { opacity: 0, y: -5, filter: 'blur(3px)' }
                      }
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                    >
                      {password}
                    </motion.code>
                  </AnimatePresence>
                  <div className="ds-generator-actions">
                    <DesignIconButton
                      label="Gerar novamente"
                      tone="quiet"
                      onClick={() => regenerate()}
                    >
                      <RefreshCw size={16} />
                    </DesignIconButton>
                    <DesignIconButton label="Copiar senha" tone="quiet" onClick={copy}>
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </DesignIconButton>
                  </div>
                </div>
                <div className="ds-generator-strength">
                  <motion.i
                    animate={{ width: `${String(strength.score * 25)}%` }}
                    transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.24 }}
                  />
                </div>
                <p>
                  {copied
                    ? 'Copiada para o clipboard'
                    : `${strength.label} · ${String(length)} caracteres`}
                </p>
              </div>
              <div className="ds-generator-controls">
                <DesignSlider
                  label="Comprimento"
                  min={8}
                  max={40}
                  value={length}
                  onValueChange={(value) => {
                    setLength(value);
                    regenerate(value, symbols);
                  }}
                />
                <DesignCheckbox
                  label="Incluir símbolos"
                  checked={symbols}
                  onCheckedChange={(checked) => {
                    setSymbols(checked);
                    regenerate(length, checked);
                  }}
                />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
