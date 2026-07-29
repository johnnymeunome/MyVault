import { Check, Monitor, Moon, Sun, X } from 'lucide-react';
import { DesignButton, DesignIconButton } from '../../design-system/button';
import { useVaultStore } from '../../stores/vault-store';

export function SettingsView() {
  const theme = useVaultStore((state) => state.theme);
  const toggleTheme = useVaultStore((state) => state.toggleTheme);
  const setOverlay = useVaultStore((state) => state.setOverlay);

  const setTheme = (nextTheme: 'dark' | 'light') => {
    if (theme !== nextTheme) toggleTheme();
  };

  return (
    <section className="settings-view" aria-labelledby="settings-title">
      <header className="settings-header">
        <div>
          <span className="settings-context">Preferências</span>
          <h1 id="settings-title">Configurações</h1>
          <p>Controle a aparência e consulte os limites desta sessão local.</p>
        </div>
        <DesignIconButton
          label="Fechar configurações"
          tone="quiet"
          onClick={() => setOverlay(null)}
        >
          <X size={17} aria-hidden="true" />
        </DesignIconButton>
      </header>

      <div className="settings-content">
        <section className="settings-section" aria-labelledby="appearance-title">
          <header>
            <span>01</span>
            <div>
              <h2 id="appearance-title">Aparência</h2>
              <p>Escolha o tema sem sair do fluxo atual.</p>
            </div>
          </header>
          <div className="theme-options" role="radiogroup" aria-label="Tema do aplicativo">
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'dark'}
              className={theme === 'dark' ? 'is-selected' : undefined}
              onClick={() => setTheme('dark')}
            >
              <Moon size={17} aria-hidden="true" />
              <span>
                <strong>Escuro</strong>
                <small>Grafite neutro e contraste contido.</small>
              </span>
              {theme === 'dark' && <Check size={16} aria-hidden="true" />}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={theme === 'light'}
              className={theme === 'light' ? 'is-selected' : undefined}
              onClick={() => setTheme('light')}
            >
              <Sun size={17} aria-hidden="true" />
              <span>
                <strong>Claro</strong>
                <small>Branco acinzentado com superfícies suaves.</small>
              </span>
              {theme === 'light' && <Check size={16} aria-hidden="true" />}
            </button>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="session-title">
          <header>
            <span>02</span>
            <div>
              <h2 id="session-title">Sessão e privacidade</h2>
              <p>Estados informativos, sem controles decorativos.</p>
            </div>
          </header>
          <dl className="settings-facts">
            <div>
              <dt>Armazenamento</dt>
              <dd>Somente memória</dd>
              <p>Nenhuma alteração desta demonstração é gravada no disco.</p>
            </div>
            <div>
              <dt>Telemetria</dt>
              <dd>Desativada</dd>
              <p>O protótipo não envia eventos ou conteúdo para serviços externos.</p>
            </div>
            <div>
              <dt>Plataforma</dt>
              <dd>Desktop local</dd>
              <p>Clipboard e integração nativa dependem das permissões da plataforma.</p>
            </div>
          </dl>
        </section>
      </div>

      <footer className="settings-footer">
        <span>
          <Monitor size={14} aria-hidden="true" /> Preferências aplicadas imediatamente
        </span>
        <DesignButton tone="secondary" onClick={() => setOverlay(null)}>
          Voltar ao cofre
        </DesignButton>
      </footer>
    </section>
  );
}
