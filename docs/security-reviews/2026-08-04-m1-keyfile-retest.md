# Reteste interno — buffer do arquivo-chave no M1

## Identificação

- **Data:** 2026-08-04
- **Achado retestado:** MV-INT-2026-002
- **Issue:** [#23](https://github.com/johnnymeunome/MyVault/issues/23)
- **Baseline da revisão original:** [`2d1bae0953e684f5af1b1788aa8563ca2cff3c02`](https://github.com/johnnymeunome/MyVault/commit/2d1bae0953e684f5af1b1788aa8563ca2cff3c02)
- **Commit candidato retestado:** [`e2cc826f2dacd93dc9da78f50a8d554af89daf57`](https://github.com/johnnymeunome/MyVault/commit/e2cc826f2dacd93dc9da78f50a8d554af89daf57)
- **Árvore do commit candidato:** `ee4824c87ab050be055dff2cd7c61ca4f00ec8bd`
- **Revisores:** João Victor, mantenedor; OpenAI Codex, assistência de IA
- **Independência:** inexistente; este documento não é uma auditoria independente
- **Resultado:** **aprovado no escopo definido abaixo**

## Escopo e mudança verificada

O MyVault passa a alocar o buffer inicial do arquivo-chave diretamente em
`Zeroizing<Vec<u8>>`. O wrapper existe antes de `read_to_end`, portanto o buffer é
zerado ao sair do escopo tanto após uma leitura válida quanto nos retornos de erro
posteriores à alocação, incluindo falha de leitura e limite excedido.

Permanecem os limites anteriores: arquivo regular, no máximo 1 MiB, erros públicos
enumerados e uso exclusivo de fixtures públicas no M1.

## Inspeção da dependência

Foi inspecionado o código-fonte fixado de `keepass 0.13.19`:

- `DatabaseKey::with_keyfile` lê o conteúdo para uma segunda `Vec<u8>` interna;
- `DatabaseKey` deriva `Zeroize` e `ZeroizeOnDrop`, cobrindo essa cópia interna;
- o parser cria elementos temporários de chave durante a derivação e o código
  inspecionado não demonstra zeroização explícita de todos esses temporários.

Assim, o reteste confirma a correção do buffer pertencente ao MyVault e a proteção
da cópia armazenada em `DatabaseKey`. Ele não afirma zeroização integral de toda a
memória usada pela biblioteca ou pelo sistema operacional.

## Evidências

| Evidência                                                                        | Resultado                             |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check`                | aprovado                              |
| `cargo test --manifest-path src-tauri/Cargo.toml`                                | 8 testes aprovados                    |
| abertura da fixture com senha e arquivo-chave                                    | aprovado                              |
| rejeição de arquivo-chave ausente ou incorreto                                   | aprovado com `VaultError::InvalidKey` |
| `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings` | aprovado                              |
| inspeção manual de `keepass 0.13.19/src/key/mod.rs`                              | realizada                             |

Os testes utilizam somente fixtures públicas versionadas. Nenhuma credencial real
foi usada.

## Decisão

MV-INT-2026-002 está **corrigido no código do MyVault** no commit candidato e pode
ser encerrado após a integração da mudança e a aprovação dos checks obrigatórios.

Continuam fora desta garantia: memória JavaScript e IPC, temporários internos não
explicitamente zerados pela dependência, banco descriptografado, swap, hibernação,
crash dumps e processos locais privilegiados. A decisão geral da revisão M1
permanece inalterada: somente fixtures públicas e modo experimental.
