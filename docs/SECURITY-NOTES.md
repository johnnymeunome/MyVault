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

## Limitação do clipboard

O preview usa `navigator.clipboard.writeText`. Após a contagem regressiva, tenta substituir o valor por uma string vazia. O navegador ou sistema pode recusar a operação quando a janela perde foco, e outro aplicativo pode ter trocado o clipboard. Uma implementação nativa futura deverá conferir se o conteúdo ainda pertence ao MyVault, documentar garantias por sistema e evitar apagar dados de terceiros.

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
- clipboard nativo e auto-lock por plataforma;
- política de keychain e arquivos recentes;
- builds e atualizações assinados;
- análise contínua da cadeia de dependências;
- testes adversariais e auditoria independente.

## Reporte responsável

Não publique credenciais, cofres, caminhos privados ou detalhes exploráveis em issue pública. Até existir um canal dedicado, contate o mantenedor pelo perfil indicado no README e use apenas fixtures públicas para reproduções.
