# Roadmap

O roadmap avança por evidência. Uma capacidade só muda para concluída quando código, testes, documentação e limites de segurança contam a mesma história.

## M0 — Product shell ✅

**Estado:** concluído em 2026-07-27.

Interface navegável, dados mockados, arquitetura frontend, testes, preview e sistema de design. Não existe persistência ou criptografia e credenciais reais continuam proibidas.

Entregas principais:

- shell Tauri + React;
- dashboard responsivo com estética azul-aço;
- busca, filtros, formulários e gerador demonstrativos;
- mocks somente em memória;
- domínio e gateways preparados para substituição;
- CI, README, documentação de produto e sistema de design.

## M1 — Núcleo KDBX experimental ✅ concluído

**Estado:** implementação, validação automatizada e aceite manual no Windows concluídos em 2026-07-28.

Abrir fixtures KDBX descartáveis no desktop e apresentar projeções não secretas em modo somente leitura. Nenhuma edição, revelação de segredo ou escrita será incluída.

Evidências:

- [especificação e critérios de aceite](M1-SPEC.md);
- [modelo de ameaças](THREAT-MODEL.md);
- [matriz de compatibilidade](KDBX-COMPATIBILITY.md);
- [ADR da biblioteca Rust](DECISIONS/004-keepass-rs-read-only-spike.md);
- [política de fixtures](../src-tauri/tests/fixtures/kdbx/README.md).

O CI abre as fixtures em Linux e Windows, preserva seus hashes, valida limites e erros, impede a serialização de campos secretos e audita dependências. O aceite manual confirmou o seletor nativo, a projeção KDBX 4.1, o bloqueio e o retorno seguro ao modo mock; os demais gatilhos de descarte possuem cobertura automatizada.

Gates de saída:

- matriz mínima verificada por testes;
- arquivo de origem comprovadamente inalterado;
- nenhum segredo serializado para o React;
- erros redigidos e limites de recursos cobertos;
- revisão de dependências e do modelo de ameaças.

## M2 — Escrita segura

**Estado:** futuro; bloqueado pelo merge do M1 e por ADR próprio.

Criar, editar e salvar **cópias** com escrita atômica, backups, recuperação, testes de interoperabilidade e novo ADR. A feature de escrita da biblioteca não será herdada automaticamente.

## M3 — Proteções locais

**Estado:** futuro.

Auto-lock real, clipboard nativo revisado, estratégia de memória, keychain, política de logs/crash dumps e comportamento documentado por sistema operacional.

## M4 — Release experimental

**Estado:** futuro.

Builds assinados, verificação multiplataforma, instalação/atualização, importação e recuperação, documentação pública de ameaças e processo de vulnerabilidades.

Nenhum marco será chamado de pronto para produção antes de interoperabilidade de escrita, testes adversariais e auditoria independente.
