# Checklist de evidências para auditoria

Preencher com links, hashes ou “não aplicável” justificado. Um item marcado comprova apenas que a evidência foi entregue, não que o controle passou.

## Identidade e reprodução

- [ ] commit de 40 caracteres e árvore Git registrados;
- [ ] bundle gerado e `BUNDLE-SHA256SUMS.txt` validado em duas execuções;
- [ ] worktree auditado reconstruído em ambiente limpo;
- [ ] versões de Rust, Node, npm, Tauri, WebView e sistema operacional;
- [ ] lockfiles, grafo de features e inventário de dependências;
- [ ] comandos exatos de build/teste e links imutáveis de CI;
- [ ] SBOM, assinatura e proveniência dos artefatos, quando existirem.

## Arquitetura e segurança

- [ ] `ARCHITECTURE.md`, ADRs e diagramas de fluxo;
- [ ] `THREAT-MODEL.md` e deltas do marco;
- [ ] inventário de ativos, fronteiras, pressupostos e riscos residuais;
- [ ] inventário de comandos Tauri, DTOs, capabilities e plugins;
- [ ] CSP efetiva e confirmação de ausência de conteúdo remoto não autorizado;
- [ ] política de logging, erros, clipboard, memória e crash dumps;
- [ ] política de temporários, backups, permissões e recuperação.

## KDBX e filesystem

- [ ] formatos, cipher, KDF e compressão declarados;
- [ ] proveniência e hashes das fixtures públicas;
- [ ] matriz de interoperabilidade por cliente/versão/plataforma;
- [ ] equivalência semântica incluindo campos protegidos internamente;
- [ ] testes de destino existente e origem byte a byte preservada;
- [ ] fault injection em write, flush, sync, verify, backup e commit;
- [ ] disco cheio, permissão negada, cancelamento e queda do processo;
- [ ] symlink, junction, reparse point, TOCTOU e edição concorrente;
- [ ] inspeção de ACLs, streams, temporários e artefatos residuais.

## Qualidade e supply chain

- [ ] testes frontend e Rust em targets declarados;
- [ ] rustfmt, Clippy com warnings negados, lint e tipos;
- [ ] CodeQL Rust e JavaScript/TypeScript;
- [ ] RustSec, npm audit e Dependabot triados;
- [ ] OpenSSF Scorecard e justificativas para checks não atendidos;
- [ ] actions fixadas por SHA e permissões de token mínimas;
- [ ] dependências novas revisadas por origem, manutenção e licença;
- [ ] inventário de `unsafe`, FFI, scripts de build e binários gerados.

## Processo e divulgação

- [ ] `SECURITY.md` e private vulnerability reporting verificados;
- [ ] declaração de independência/conflitos assinada;
- [ ] canal privado e SLA de triagem combinados;
- [ ] formato de achados e severidade acordado;
- [ ] processo de correção sem reescrever o commit original;
- [ ] reteste, avaliação de delta e resumo público planejados;
- [ ] descarte de ambientes e artefatos confirmado.
