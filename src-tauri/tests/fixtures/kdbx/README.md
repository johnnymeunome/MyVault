# Fixtures KDBX do MyVault

Esta pasta receberá apenas cofres artificiais, públicos e descartáveis para o M1. **Nunca adicione uma cópia anonimizada de um cofre real:** metadados, histórico, anexos e valores removidos podem continuar recuperáveis.

Os binários ainda não foram incluídos. Este arquivo define a política que deverá acompanhar o primeiro pull request de implementação.

## Segredos públicos de teste

- senha padrão: `myvault-fixture-only`
- usuário padrão: `demo-user`
- domínio padrão: `example.test`
- arquivo-chave: gerado exclusivamente para esta pasta e tratado como público

Nenhum desses valores pode ser reutilizado em conta, dispositivo ou ambiente real.

## Conjunto planejado

| Arquivo                                  | Finalidade                                    |
| ---------------------------------------- | --------------------------------------------- |
| `kdbx31-aes-aeskdf-password.kdbx`        | KDBX 3.1, AES-256, AES-KDF e senha            |
| `kdbx40-aes-argon2d-password.kdbx`       | KDBX 4.0, AES-256, Argon2d e senha            |
| `kdbx41-aes-argon2id-password.kdbx`      | KDBX 4.1, AES-256, Argon2id e senha           |
| `kdbx41-chacha20-argon2id-password.kdbx` | KDBX 4.1, ChaCha20, Argon2id e senha          |
| `kdbx41-password-keyfile.kdbx`           | KDBX 4.1 com senha e arquivo-chave público    |
| `corrupt-header.kdbx`                    | assinatura/cabeçalho deliberadamente inválido |
| `corrupt-hmac.kdbx`                      | integridade deliberadamente inválida          |
| `truncated.kdbx`                         | arquivo válido truncado de forma reproduzível |
| `unsupported-version.kdbx`               | versão sintética acima do limite suportado    |

Casos grandes ou de exaustão devem ser gerados durante o teste e não versionados.

## Conteúdo determinístico

Cada cofre válido deve ter a mesma árvore lógica:

```text
MyVault fixture
├── Logins
│   ├── Example service
│   └── Unicode — ação 🔐
├── Empty group
└── Nested
    └── Level 2
        └── Nested entry
```

Use somente domínios reservados como `example.test`, datas fixas quando o gerador permitir e valores claramente falsos. Não inclua logos ou anexos baixados da internet.

## Manifesto obrigatório

Todo binário deve ter uma linha em `MANIFEST.sha256` e uma entrada de proveniência com:

- nome do arquivo;
- SHA-256;
- cliente gerador e versão exata;
- sistema operacional usado na geração;
- versão KDBX, cifra externa, KDF, compressão e cifra interna;
- composição da chave;
- transformação aplicada nos casos corrompidos;
- data e autor da geração.

O manifesto é revisado no mesmo pull request dos binários.

## Geração e corrupção

1. Gere primeiro a fixture válida em um cliente conhecido.
2. Feche e reabra no cliente gerador.
3. Registre o hash e a proveniência.
4. Derive casos corrompidos por script versionado e determinístico; nunca edite manualmente sem registrar offsets/operação.
5. Confirme que senha, chave e conteúdo correspondem apenas aos valores públicos desta política.

## Regra de imutabilidade

Os testes calculam SHA-256 antes e depois de cada abertura. Qualquer diferença falha a suíte. O código de produção não deve abrir fixtures ou cofres com acesso de escrita.

## Revisão

Uma fixture nova exige atualização de:

- [matriz de compatibilidade](../../../../docs/KDBX-COMPATIBILITY.md);
- teste de integração correspondente;
- manifesto e proveniência;
- modelo de ameaças, se introduzir nova capacidade.
