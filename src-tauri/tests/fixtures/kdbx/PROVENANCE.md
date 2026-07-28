# Proveniência das fixtures

- **Origem:** [`sseemayer/keepass-rs`](https://github.com/sseemayer/keepass-rs)
- **Commit fixado:** `3dd74fd755429bd89281b65549a7e8ce61f8e0e0`
- **Data da importação:** 2026-07-27
- **Licença da origem:** MIT; aviso preservado em [`THIRD-PARTY-NOTICE.md`](THIRD-PARTY-NOTICE.md)
- **Senha pública usada pela origem:** `demopass`

| Arquivo local | Caminho no commit de origem |
| --- | --- |
| `kdbx31-aes-aeskdf-password.kdbx` | `tests/resources/test_db_with_password.kdbx` |
| `kdbx40-aes-argon2d-password.kdbx` | `tests/resources/test_db_kdbx4_with_password_argon2.kdbx` |
| `kdbx40-aes-argon2id-password.kdbx` | `tests/resources/test_db_kdbx4_with_password_argon2id.kdbx` |
| `kdbx40-chacha20-argon2id-password.kdbx` | `tests/resources/test_db_kdbx4_with_password_argon2id_chacha20.kdbx` |
| `kdbx41-aes-aeskdf-password.kdbx` | `tests/resources/test_db_kdbx4_with_password_aes.kdbx` |
| `kdbx40-password-keyfile.kdbx` | `tests/resources/test_db_kdbx4_with_keyfile_v2.kdbx` |
| `kdbx40-password-keyfile.keyx` | `tests/resources/test_db_kdbx4_with_keyfile_v2.keyx` |
| `random-data.kdbx` | `tests/resources/broken_random_data.kdbx` |

## Casos derivados localmente

O script [`scripts/generate-corrupt-fixtures.ps1`](../../../../scripts/generate-corrupt-fixtures.ps1) usa `kdbx41-aes-aeskdf-password.kdbx` como origem e produz deterministicamente:

- `corrupt-header.kdbx`: alterna os bits `0xff` no byte 0 da assinatura;
- `corrupt-hmac.kdbx`: alterna o bit `0x80` no primeiro byte do HMAC do primeiro bloco;
- `truncated.kdbx`: remove os oito bytes finais;
- `unsupported-version.kdbx`: altera o minor version do cabeçalho para `2`.

Os hashes finais estão em [`MANIFEST.sha256`](MANIFEST.sha256). Nenhum arquivo deriva de um cofre pessoal ou de produção.
