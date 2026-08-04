# Plano de auditoria independente do MyVault

- **Status:** preparação de auditoria; nenhuma auditoria concluída
- **Responsável:** mantenedor do MyVault
- **Alvo formal:** marco congelado após M2C e antes de credenciais reais ou release estável
- **Padrão de referência:** OWASP ASVS 5.0.0 nível 2, adaptado a aplicativo desktop local

## Objetivo

Obter uma avaliação externa, reproduzível e ligada a um commit específico sobre as fronteiras de segurança do MyVault. A auditoria deve encontrar falhas exploráveis, validar controles e registrar riscos residuais; ela não deve produzir uma promessa genérica de que o produto é “seguro”.

Revisões internas, CodeQL, RustSec e testes de CI são pré-requisitos, não substitutos da independência.

## Quando contratar

Revisões externas focadas podem ocorrer durante M2A e M2B. A auditoria formal começa somente quando:

- o fluxo M2C de escrita, verificação, backup e recuperação estiver implementado e congelado;
- a matriz KDBX e o conjunto de fixtures cobrirem as configurações declaradas;
- permissões, comandos Tauri, CSP e targets de release estiverem definidos;
- fuzzing, fault injection e testes de interoperabilidade tiverem resultados anexáveis;
- não houver mudança arquitetural planejada durante a janela da auditoria;
- o canal privado de vulnerabilidades estiver habilitado e monitorado.

Qualquer mudança de segurança relevante após o congelamento invalida a cobertura correspondente e exige avaliação de delta ou nova auditoria.

## Independência e qualificação

O auditor ou equipe:

- não pode ser autor material do código auditado nem depender da aprovação do mantenedor para classificar achados;
- deve declarar conflitos de interesse e trabalhos prévios relacionados;
- deve ter experiência verificável em Rust, Tauri/WebView/IPC e filesystem do Windows;
- deve compreender criptografia aplicada, gerenciadores de credenciais e o formato KDBX;
- deve revisar dependências críticas, incluindo o caminho `save_kdbx4` do `keepass`;
- deve aceitar trabalhar somente com fixtures sintéticas e ambientes descartáveis;
- deve concordar com divulgação coordenada e descarte dos artefatos após o reteste.

Certificação formal não é obrigatória, mas o portfólio precisa demonstrar auditorias de software nativo ou produtos que armazenam dados sensíveis.

## Escopo mínimo

### Arquitetura e fronteiras

- modelo de ameaças, ADRs, invariantes e riscos aceitos;
- React/WebView → IPC → comandos Tauri → núcleo Rust → filesystem;
- ciclo de vida da sessão, bloqueio, troca de cofre e descarte;
- diferenças entre modo mock, laboratório e capacidade pública.

### KDBX e segredos

- composição e permanência de senha e arquivo-chave;
- parser e writer de terceiro, features habilitadas e parâmetros criptográficos;
- allowlists de DTOs e impossibilidade de retorno acidental de campos protegidos;
- logs, erros, clipboard, temporários, backups, crash dumps, swap e memória;
- interoperabilidade e fidelidade semântica de grupos, entradas, histórico, anexos, ícones e metadados.

### Filesystem e falhas

- `create_new`, permissões, ACLs e identidade do arquivo;
- links simbólicos, junctions, reparse points e condições TOCTOU;
- edição concorrente, fingerprint e conflito;
- escrita parcial, disco cheio, `flush`, `sync`, queda do processo e energia;
- backup, substituição específica do Windows, estado incerto e recuperação idempotente.

### Tauri e frontend

- inventário de comandos registrados e payloads aceitos;
- capabilities por janela/plataforma e plugins habilitados;
- CSP, conteúdo remoto, navegação, devtools e exposição do WebView;
- validação no Rust de todo valor controlado pelo frontend;
- ausência de segredo persistente em stores, DOM, logs ou storage do navegador.

### Supply chain e release

- manifests, lockfiles, licenças, origem e manutenção de dependências;
- RustSec, Dependabot, CodeQL e resultado do OpenSSF Scorecard;
- actions fixadas por SHA e permissões mínimas de tokens;
- builds reproduzíveis, SBOM, assinatura, proveniência e canal de atualização;
- separação entre builds experimentais e artefatos apresentados como release.

## Fora de escopo padrão

- malware, administrador local comprometido, keylogger e captura de tela pelo sistema;
- quebra matemática de AES, ChaCha20, Argon2 ou SHA;
- serviços de terceiros não distribuídos com o MyVault;
- engenharia social, invasão física e disponibilidade do GitHub;
- credenciais, cofres ou contas reais.

Exclusões adicionais precisam aparecer no contrato e no resumo público. O auditor ainda deve verificar se a documentação não promete proteção contra riscos excluídos.

## Metodologia exigida

1. Congelar commit, targets, ferramentas, escopo e hipóteses.
2. Validar o bundle reproduzível e reconstruir o projeto em ambiente limpo.
3. Revisar arquitetura, modelo de ameaças e código manualmente.
4. Executar análise estática, auditoria de dependências e inventário de `unsafe`/FFI.
5. Realizar testes dinâmicos, fuzzing, fault injection e interoperabilidade.
6. Inspecionar filesystem, memória observável, logs, clipboard e artefatos residuais no Windows.
7. Entregar achados privados com evidência e reprodução mínima.
8. Corrigir em PRs rastreáveis sem reescrever o histórico auditado.
9. Retestar cada correção e avaliar o delta entre commit original e final.
10. Publicar resumo somente após coordenação e remoção de detalhes exploráveis ainda abertos.

Scanners não podem ser a única metodologia. Todo controle crítico precisa de inspeção humana ou teste adversarial documentado.

## Classificação e decisão

Cada achado deve registrar severidade, CWE quando aplicável, pré-condições, impacto, arquivos/linhas, reprodução, correção sugerida e status do reteste.

O gate formal exige:

- nenhum achado crítico ou alto aberto;
- achados médios corrigidos ou aceitos por ADR com justificativa e prazo;
- achados baixos/informativos triados e documentados;
- todas as correções retestadas no commit candidato;
- CI, RustSec, CodeQL, testes Windows e matriz de interoperabilidade verdes;
- resumo público que identifique auditor, período, commits, escopo e riscos residuais;
- nenhuma afirmação de uso seguro com credenciais reais sem novo aceite explícito.

## Entregáveis

- declaração de escopo assinada;
- inventário de versões, targets e dependências;
- relatório técnico privado;
- registro de achados e decisões de risco;
- commits e PRs de correção;
- relatório de reteste;
- resumo público redigido;
- confirmação de descarte de cofres, temporários e ambientes fornecidos.

Os modelos ficam em [`docs/audit`](audit). O bundle de um commit é gerado por [`scripts/build-audit-bundle.ps1`](../scripts/build-audit-bundle.ps1).

## Referências

- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [Tauri capabilities](https://v2.tauri.app/security/capabilities/)
- [Tauri CSP](https://v2.tauri.app/security/csp/)
- [RustSec](https://rustsec.org/)
- [OpenSSF Scorecard](https://www.scorecard.dev/)
- [GitHub private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/working-with-repository-security-advisories/configuring-private-vulnerability-reporting-for-a-repository)
- [Modelo de ameaças M1](THREAT-MODEL.md)
- [Delta de ameaças M2](M2-THREAT-MODEL.md)
