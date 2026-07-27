# Fixtures KDBX do MyVault

Esta pasta contém somente cofres artificiais, públicos e descartáveis usados para validar o M1. **Nunca adicione uma cópia anonimizada de um cofre real:** metadados, histórico, anexos e valores removidos ainda podem ser recuperáveis.

## Segredos públicos de teste

- senha das fixtures protegidas por senha: `demopass`;
- arquivo-chave: `kdbx40-password-keyfile.keyx`;
- conteúdo: dados fictícios já públicos no repositório de origem.

Esses valores fazem parte do código-fonte e nunca podem ser reutilizados em uma conta, dispositivo ou ambiente real.

## Conjunto versionado

| Arquivo | Cobertura |
| --- | --- |
| `kdbx31-aes-aeskdf-password.kdbx` | KDBX 3.1 com senha |
| `kdbx40-aes-argon2d-password.kdbx` | KDBX 4.0, AES e Argon2d |
| `kdbx40-aes-argon2id-password.kdbx` | KDBX 4.0, AES e Argon2id |
| `kdbx40-chacha20-argon2id-password.kdbx` | KDBX 4.0, ChaCha20 e Argon2id |
| `kdbx41-aes-aeskdf-password.kdbx` | KDBX 4.1, AES e AES-KDF |
| `kdbx40-password-keyfile.kdbx` | KDBX 4.0 com senha e arquivo-chave |
| `kdbx40-password-keyfile.keyx` | arquivo-chave público da fixture anterior |
| `corrupt-header.kdbx` | assinatura deliberadamente inválida |
| `corrupt-hmac.kdbx` | integridade deliberadamente inválida |
| `truncated.kdbx` | fixture válida truncada de forma reproduzível |
| `unsupported-version.kdbx` | versão sintética acima do limite aceito |
| `random-data.kdbx` | bytes aleatórios que não formam um KDBX |

Casos grandes ou de exaustão são construídos em memória durante os testes e não são versionados.

## Origem e integridade

- [`PROVENANCE.md`](PROVENANCE.md) relaciona cada nome local ao arquivo público de origem e registra as transformações.
- [`MANIFEST.sha256`](MANIFEST.sha256) fixa o hash de todos os binários.
- [`THIRD-PARTY-NOTICE.md`](THIRD-PARTY-NOTICE.md) preserva o aviso de licença aplicável.
- [`generate-corrupt-fixtures.ps1`](../../../../scripts/generate-corrupt-fixtures.ps1) reproduz os quatro casos negativos derivados.

Os testes calculam SHA-256 antes e depois de cada abertura. Qualquer diferença falha a suíte. O código de produção abre o arquivo somente com `File::open`, sem acesso de escrita.

## Regra de revisão

Uma fixture nova exige, no mesmo pull request:

- origem e licença verificáveis;
- hash SHA-256;
- teste correspondente;
- atualização da [matriz de compatibilidade](../../../../docs/KDBX-COMPATIBILITY.md);
- revisão do [modelo de ameaças](../../../../docs/THREAT-MODEL.md), caso introduza uma nova capacidade.
