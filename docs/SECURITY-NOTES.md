# Notas de segurança

## Postura atual

O código atual combina o product shell M0 com um núcleo KDBX M1 experimental e somente leitura. Os mocks ainda contêm senhas fictícias em texto puro no bundle, e o conjunto completo não passou por auditoria independente. **Nunca informe uma senha real.**

O M1 abre exclusivamente fixtures públicas e descartáveis, retorna somente projeções não secretas e não oferece escrita. A validação automatizada passou em Linux e Windows, e o fluxo desktop recebeu aceite manual em 2026-07-28.

## Compatibilidade Linux bloqueada

O grafo Linux do Tauri 2 inclui `glib 0.18.5` por meio de GTK3 e `webkit2gtk`. Essa versão é afetada por [RUSTSEC-2024-0429 / GHSA-wrw7-89jp-8q8g](https://github.com/advisories/GHSA-wrw7-89jp-8q8g), uma falha de soundness que pode causar comportamento indefinido e crash em builds otimizados quando o iterador afetado é exercitado.

O crate não aparece no grafo `x86_64-pc-windows-msvc`, portanto o fluxo Windows validado no M1 não inclui essa dependência. Isso não autoriza minimizar o risco multiplataforma:

- o alerta do Dependabot e o aviso do RustSec permanecem visíveis, sem regra de ignore;
- não será usado fork não revisado nem patch transitivo sem proveniência upstream;
- **nenhum build Linux pode ser publicado ou anunciado como suportado enquanto a [issue #15](https://github.com/johnnymeunome/MyVault/issues/15) estiver aberta**;
- a liberação exige uma versão compatível que contenha o patch upstream ou uma migração do backend GTK, seguida de CI Linux/Windows e nova revisão deste documento.

## Proteções deliberadas do M0

- sem `localStorage`, IndexedDB ou persistência em arquivo;
- sem chamadas de rede ou telemetria;
- sem logging de senhas;
- capabilities Tauri mínimas (`core:default`);
- operações privilegiadas reservadas para comandos Rust estreitos;
- clipboard isolado atrás de um gateway substituível;
- avisos explícitos sobre dados mockados e limitações.

## Política de clipboard do M1

| Ambiente                      | Comportamento aceito                                                                                                                 | Limitação                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Windows com Tauri/WebView2    | copia via API do WebView; após 15 segundos, no bloqueio ou na troca de cofre, lê e limpa somente se o fingerprint ainda corresponder | leitura pode ser recusada; comparação e limpeza não são atômicas |
| preview em navegador          | aplica a mesma comparação quando `navigator.clipboard.readText` está disponível                                                      | permissões e execução em segundo plano variam por navegador      |
| fechamento da janela/processo | `pagehide` e desmontagem iniciam uma limpeza condicional de melhor esforço                                                           | o sistema pode encerrar o processo antes da conclusão assíncrona |

Se a leitura falhar ou o conteúdo tiver mudado, o MyVault não escreve uma string vazia e preserva o clipboard atual. O recibo rastreado contém somente SHA-256 do valor, não uma segunda cópia em texto no store. Ainda existe uma janela de corrida entre a comparação e a limpeza porque a API do navegador não fornece compare-and-clear atômico.

Campos protegidos de KDBX continuam ausentes do DTO enviado ao React e não possuem ação de cópia no M1. A política acima cobre apenas valores demonstrativos e o gerador experimental; não autoriza credenciais reais.

## Baseline implementada do M1

Antes de alterar o parser ou ampliar capacidades, leia:

- [especificação funcional e técnica](M1-SPEC.md);
- [modelo de ameaças](THREAT-MODEL.md);
- [matriz de compatibilidade](KDBX-COMPATIBILITY.md);
- [ADR da biblioteca Rust](DECISIONS/004-keepass-rs-read-only-spike.md);
- [política de fixtures](../src-tauri/tests/fixtures/kdbx/README.md).

O M1 proíbe escrita, retorno de campos secretos ao React, persistência de sessão, credenciais reais, anexos e features KDBX não documentadas.

## Antes de uso real

Ainda serão necessários, no mínimo:

- interoperabilidade de leitura e escrita com clientes independentes;
- escrita atômica, backups e recuperação testada;
- estratégia revisada de memória, swap, hibernação e crash dumps;
- clipboard nativo com comparação atômica quando disponível e auto-lock por plataforma;
- política de keychain e arquivos recentes;
- builds e atualizações assinados;
- análise contínua da cadeia de dependências;
- testes adversariais e auditoria independente.

## Reporte responsável

Não publique credenciais, cofres, caminhos privados ou detalhes exploráveis em issue pública. Até existir um canal dedicado, contate o mantenedor pelo perfil indicado no README e use apenas fixtures públicas para reproduções.
