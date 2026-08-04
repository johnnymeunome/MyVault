# Reteste interno — ciclo de vida do clipboard no M1

## Identificação

- **Data:** 2026-08-04
- **Achado retestado:** MV-INT-2026-004
- **Issue:** [#25](https://github.com/johnnymeunome/MyVault/issues/25)
- **Baseline da revisão original:** [`2d1bae0953e684f5af1b1788aa8563ca2cff3c02`](https://github.com/johnnymeunome/MyVault/commit/2d1bae0953e684f5af1b1788aa8563ca2cff3c02)
- **Commit candidato retestado:** [`4e4459461282a5e8d974e9bea2aa81bb7e774cd7`](https://github.com/johnnymeunome/MyVault/commit/4e4459461282a5e8d974e9bea2aa81bb7e774cd7)
- **Árvore do commit candidato:** `97aec5f479cfd7598d9bf751b00a0d8c0c840af9`
- **Revisores:** João Victor, mantenedor; OpenAI Codex, assistência de IA
- **Independência:** inexistente; este documento não é uma auditoria independente
- **Resultado:** **aprovado no escopo definido abaixo**

## Escopo e mudança verificada

Ao copiar, o gateway grava o valor e devolve um recibo contendo seu fingerprint
SHA-256. Na expiração de 15 segundos ou em um gatilho antecipado, o conteúdo atual
é lido e comparado. A string vazia só é escrita quando o fingerprint ainda
corresponde.

Gatilhos antecipados implementados:

- bloqueio da sessão;
- troca, abertura ou fechamento de cofre;
- `pagehide` e desmontagem da aplicação como tentativa de melhor esforço.

Falha de leitura ou conteúdo diferente produz nenhuma escrita. Escritas pendentes
que terminam após `reset` são reconhecidas como obsoletas e passam pela mesma
limpeza condicional, sem iniciar um novo timer.

## Evidências

| Evidência                             | Resultado                                            |
| ------------------------------------- | ---------------------------------------------------- |
| ESLint com zero warnings              | aprovado                                             |
| TypeScript `typecheck`                | aprovado                                             |
| suíte Vitest completa                 | 36 testes aprovados                                  |
| build de produção Vite                | aprovado                                             |
| conteúdo trocado por outro aplicativo | preservado                                           |
| permissão de leitura recusada         | nenhuma limpeza cega                                 |
| expiração de 15 segundos              | limpeza condicional solicitada                       |
| bloqueio/reset                        | limpeza condicional imediata solicitada              |
| escrita concluída após reset          | tratada como obsoleta, sem timer residual            |
| projeção KDBX do M1                   | continua sem senha, TOTP, notas, histórico ou anexos |

## Limitações por plataforma

O M1 suportado é Windows com Tauri/WebView2; o navegador de desenvolvimento usa a
mesma API Web Clipboard. Em ambos, leitura pode depender de foco e permissão. Não há
operação atômica de comparar e limpar, portanto outro processo ainda pode alterar o
clipboard entre as duas chamadas. No fechamento, o processo pode terminar antes da
promessa assíncrona.

Uma implementação nativa futura deverá usar recursos de propriedade ou sequência do
clipboard quando disponíveis, além de testes específicos por versão do sistema.

## Decisão

MV-INT-2026-004 está **corrigido no escopo experimental do M1** no commit candidato
e pode ser encerrado após a integração da mudança e a aprovação dos checks
obrigatórios.

Esta decisão não autoriza copiar campos KDBX protegidos nem usar credenciais reais.
