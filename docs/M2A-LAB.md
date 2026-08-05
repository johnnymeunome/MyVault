# M2A — laboratório Rust de cópia verificada

- **Status:** Gate 0 em implementação; sem capacidade pública de escrita
- **Data:** 2026-08-03
- **Escopo:** teste Rust com fixtures públicas KDBX 4.1

## Limite do experimento

Este laboratório avalia o writer experimental `save_kdbx4` do crate `keepass` 0.13.19 sem conectá-lo ao Tauri ou ao React. O `ReadOnlyVaultService`, os comandos públicos e as permissões da aplicação permanecem inalterados.

O código do laboratório é compilado somente por `cargo test` e:

1. lê uma fixture pública com acesso somente leitura;
2. rejeita qualquer versão diferente de KDBX 4.1 antes de criar o destino;
3. cria um destino novo com `create_new`;
4. serializa sem mutar o banco;
5. executa `flush` e `sync_all`;
6. reabre a cópia com a mesma chave;
7. compara integralmente os modelos `Database` de origem e destino dentro do Rust.

Nenhum valor descriptografado é serializado, registrado ou enviado ao frontend.

## Evidência automatizada

Os testes demonstram que:

- a fixture KDBX 4.1 realiza round-trip e a cópia rejeita senha incorreta;
- a origem mantém o mesmo SHA-256;
- um destino existente não é truncado nem alterado;
- uma fixture KDBX 4.0 é rejeitada antes da criação do destino;
- a comparação semântica usa a implementação completa de `PartialEq` do modelo do crate, cobrindo configuração, metadados, grupos, entradas, históricos, anexos, ícones e objetos excluídos representados pela biblioteca.

## Auditoria da feature

- dependência fixada: `keepass = 0.13.19`;
- defaults continuam desabilitados no build normal e nos testes;
- `save_kdbx4` é habilitada somente na dependência de desenvolvimento;
- a feature expõe `Database::save` e não adiciona comando, permissão ou plugin Tauri;
- o lockfile e o grafo de dependências são auditados pelo CI existente.

## O que este gate não prova

- interoperabilidade manual com KeePassXC;
- fault injection em write, flush, sync e verify;
- preservação em todas as fixtures e configurações KDBX 4.1;
- segurança para credenciais reais;
- edição, substituição, backup, recuperação ou commit transacional.

Essas evidências pertencem ao Gate 1 e aos gates posteriores de [M2-SPEC](M2-SPEC.md). Nenhum deles é autorizado automaticamente por este laboratório.
