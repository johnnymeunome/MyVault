# Matriz de compatibilidade KDBX

- **Marco:** M1
- **Operação:** leitura experimental
- **Atualização:** 2026-07-27

## Legenda

- **Planejado:** requisito do M1 ainda sem fixture executada.
- **Verificado:** teste automatizado passou com fixture versionada.
- **Bloqueado:** não será declarado como compatível até resolver a limitação indicada.
- **Fora do escopo:** não pertence ao M1.

Nenhuma linha deve mudar para **Verificado** apenas porque a biblioteca declara suporte. O estado depende de fixture, teste automatizado e preservação do hash do arquivo.

## Versões e algoritmos

| Dimensão       | Variante              | Estado inicial | Fixture prevista                             |
| -------------- | --------------------- | -------------- | -------------------------------------------- |
| Formato        | KDBX 3.1              | Planejado      | `kdbx31-aes-aeskdf-password.kdbx`            |
| Formato        | KDBX 4.0              | Planejado      | `kdbx40-aes-argon2d-password.kdbx`           |
| Formato        | KDBX 4.1              | Planejado      | `kdbx41-aes-argon2id-password.kdbx`          |
| Cifra externa  | AES-256               | Planejado      | fixtures 3.1, 4.0 e 4.1                      |
| Cifra externa  | ChaCha20              | Planejado      | `kdbx41-chacha20-argon2id-password.kdbx`     |
| KDF            | AES-KDF               | Planejado      | fixture 3.1                                  |
| KDF            | Argon2d               | Planejado      | fixture 4.0                                  |
| KDF            | Argon2id              | Planejado      | fixtures 4.1                                 |
| Compressão     | nenhuma               | Planejado      | uma variante 4.1 dedicada ou gerada no teste |
| Compressão     | GZip                  | Planejado      | fixtures padrão                              |
| Cifra interna  | Salsa20               | Planejado      | fixture 3.1                                  |
| Cifra interna  | ChaCha20              | Planejado      | fixtures 4.x                                 |
| Chave composta | senha                 | Planejado      | todas as fixtures principais                 |
| Chave composta | senha + arquivo-chave | Planejado      | `kdbx41-password-keyfile.kdbx`               |
| Chave composta | challenge-response    | Fora do escopo | —                                            |

## Dados projetados para a UI

| Recurso KDBX                   | Leitura pelo parser           | Retorno ao React no M1                                |
| ------------------------------ | ----------------------------- | ----------------------------------------------------- |
| nome do banco                  | Planejado                     | sim                                                   |
| grupos e hierarquia            | Planejado                     | sim, com limites                                      |
| título da entrada              | Planejado                     | sim                                                   |
| usuário e URL                  | Planejado                     | sim, tratados como metadados potencialmente sensíveis |
| favorito e data de atualização | Planejado                     | quando disponíveis                                    |
| senha                          | necessário para parse interno | **não**                                               |
| TOTP                           | possível no formato           | **não**                                               |
| notas e campos personalizados  | possível no formato           | **não**                                               |
| histórico                      | possível no formato           | **não**                                               |
| anexos                         | possível no formato           | **não**                                               |
| ícones customizados            | possível no formato           | não; usar fallback visual                             |

## Casos negativos obrigatórios

| Caso                            | Resultado esperado                           | Fixture                                |
| ------------------------------- | -------------------------------------------- | -------------------------------------- |
| senha incorreta                 | `INVALID_KEY`                                | qualquer fixture válida                |
| arquivo-chave ausente/incorreto | `INVALID_KEY`                                | fixture com chave composta             |
| arquivo truncado                | `FORMAT_INVALID` ou erro específico redigido | `truncated.kdbx`                       |
| cabeçalho corrompido            | `FORMAT_INVALID`                             | `corrupt-header.kdbx`                  |
| HMAC/integridade corrompida     | `INTEGRITY_FAILED`                           | `corrupt-hmac.kdbx`                    |
| versão acima da suportada       | `UNSUPPORTED_VERSION`                        | `unsupported-version.kdbx`             |
| arquivo acima do limite         | `RESOURCE_LIMIT_EXCEEDED`                    | gerado durante o teste, não versionado |
| estrutura acima dos limites     | `RESOURCE_LIMIT_EXCEEDED`                    | gerada durante o teste, não versionada |

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
