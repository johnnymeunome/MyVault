# Matriz de compatibilidade KDBX

- **Marco:** M1
- **Operação:** leitura experimental
- **Atualização:** 2026-07-28

## Legenda

- **Em validação:** o parser abriu a fixture, mas a característica ainda não possui asserção dedicada.
- **Planejado:** requisito do M1 ainda sem fixture executada.
- **Verificado:** teste automatizado passou com fixture versionada.
- **Bloqueado:** não será declarado como compatível até resolver a limitação indicada.
- **Fora do escopo:** não pertence ao M1.

Nenhuma linha deve mudar para **Verificado** apenas porque a biblioteca declara suporte. O estado depende de fixture, teste automatizado e preservação do hash do arquivo.

## Versões e algoritmos

| Dimensão       | Variante              | Estado         | Fixture                                  |
| -------------- | --------------------- | -------------- | ---------------------------------------- |
| Formato        | KDBX 3.1              | Verificado     | `kdbx31-aes-aeskdf-password.kdbx`        |
| Formato        | KDBX 4.0              | Verificado     | fixtures `kdbx40-*`                      |
| Formato        | KDBX 4.1              | Verificado     | `kdbx41-aes-aeskdf-password.kdbx`        |
| Cifra externa  | AES-256               | Verificado     | fixtures 3.1, 4.0 e 4.1                  |
| Cifra externa  | ChaCha20              | Verificado     | `kdbx40-chacha20-argon2id-password.kdbx` |
| KDF            | AES-KDF               | Verificado     | fixtures 3.1 e 4.1                       |
| KDF            | Argon2d               | Verificado     | `kdbx40-aes-argon2d-password.kdbx`       |
| KDF            | Argon2id              | Verificado     | fixtures 4.0 AES e ChaCha20              |
| Compressão     | nenhuma               | Planejado      | fixture dedicada ou gerada no teste      |
| Compressão     | GZip                  | Em validação   | fixtures importadas                      |
| Cifra interna  | Salsa20               | Em validação   | fixture 3.1                              |
| Cifra interna  | ChaCha20              | Em validação   | fixtures 4.x                             |
| Chave composta | senha                 | Verificado     | todas as fixtures principais             |
| Chave composta | senha + arquivo-chave | Verificado     | `kdbx40-password-keyfile.kdbx`           |
| Chave composta | challenge-response    | Fora do escopo | —                                        |

## Dados projetados para a UI

| Recurso KDBX                   | Leitura pelo parser           | Retorno ao React no M1                                |
| ------------------------------ | ----------------------------- | ----------------------------------------------------- |
| nome do banco                  | Verificado                    | sim                                                   |
| grupos e hierarquia            | Verificado                    | sim, com limites                                      |
| título da entrada              | Verificado                    | sim                                                   |
| usuário e URL                  | Verificado                    | sim, tratados como metadados potencialmente sensíveis |
| favorito e data de atualização | Em validação                  | quando disponíveis                                    |
| senha                          | necessário para parse interno | **não**                                               |
| TOTP                           | possível no formato           | **não**                                               |
| notas e campos personalizados  | possível no formato           | **não**                                               |
| histórico                      | possível no formato           | **não**                                               |
| anexos                         | possível no formato           | **não**                                               |
| ícones customizados            | possível no formato           | não; usar fallback visual                             |

## Casos negativos obrigatórios

| Caso                            | Estado       | Resultado esperado        | Fixture                                |
| ------------------------------- | ------------ | ------------------------- | -------------------------------------- |
| senha incorreta                 | Verificado   | `INVALID_KEY`             | qualquer fixture válida                |
| arquivo-chave ausente/incorreto | Verificado   | `INVALID_KEY`             | fixture com chave composta             |
| arquivo truncado                | Em validação | erro público redigido     | `truncated.kdbx`                       |
| cabeçalho corrompido            | Verificado   | `FORMAT_INVALID`          | `corrupt-header.kdbx`                  |
| HMAC/integridade corrompida     | Verificado   | `INTEGRITY_FAILED`        | `corrupt-hmac.kdbx`                    |
| versão acima da suportada       | Verificado   | `UNSUPPORTED_VERSION`     | `unsupported-version.kdbx`             |
| arquivo acima do limite         | Verificado   | `RESOURCE_LIMIT_EXCEEDED` | gerado durante o teste, não versionado |
| estrutura acima dos limites     | Verificado   | `RESOURCE_LIMIT_EXCEEDED` | gerada durante o teste, não versionada |

## Escrita

| Operação                   | M1             |
| -------------------------- | -------------- |
| criar banco                | Fora do escopo |
| editar entrada             | Fora do escopo |
| salvar no arquivo original | Proibido       |
| salvar como cópia          | Fora do escopo |
| migrar KDBX                | Fora do escopo |
| backup/recuperação         | Fora do escopo |

A feature experimental de escrita KDBX 4.1 da biblioteca escolhida não será habilitada.

## Processo para declarar compatibilidade

1. Gerar a fixture em um cliente reconhecido, usando somente dados falsos.
2. Registrar cliente, versão, opções e SHA-256 no manifesto.
3. Abrir a fixture pelo comando Rust com a versão exata da dependência.
4. Comparar a projeção com o resultado esperado.
5. Confirmar o mesmo SHA-256 antes e depois.
6. Executar também senha incorreta e corrupção aplicável.
7. Atualizar esta matriz no mesmo pull request do teste.

## Fontes e limitações

A [especificação oficial KDBX 4.1](https://keepass.info/help/kb/kdbx.html) descreve AES-256 e ChaCha20, AES-KDF, Argon2d e Argon2id, compressão e o fluxo autenticado do formato. A [documentação oficial de mudanças do KDBX 4](https://keepass.info/help/kb/kdbx_4.html) complementa as diferenças de versão.

O crate [`keepass` 0.13.17](https://docs.rs/keepass/0.13.17/keepass/) declara parsing de KDB, KDBX3 e KDBX4, mas sua escrita KDBX 4.1 é experimental. O MyVault usa essa declaração apenas para selecionar o spike; a compatibilidade pública depende dos testes acima.
