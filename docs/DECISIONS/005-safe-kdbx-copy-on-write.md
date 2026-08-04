# ADR 005: escrita KDBX por cópia verificada antes de substituição

- **Status:** aceita para planejamento; implementação permanece condicionada aos gates
- **Data:** 2026-08-03
- **Escopo:** planejamento do M2 experimental

## Contexto

O M1 comprovou leitura KDBX em um núcleo Rust isolado, sem retornar campos protegidos ao React e sem alterar o arquivo de origem. O M2 precisa investigar escrita sem transformar esse spike em um caminho de perda de dados.

O crate `keepass` oferece escrita KDBX 4.1 pela feature opcional `save_kdbx4`, mas o próprio projeto a descreve como experimental. Habilitar essa feature no serviço existente, salvar diretamente sobre o arquivo aberto ou permitir credenciais reais confundiria uma prova de interoperabilidade com uma capacidade segura de produção.

Escrita também introduz riscos que não existem no M1: serialização incompleta, downgrade de parâmetros, conflito com edição externa, arquivos temporários, disco cheio, queda de energia, preservação de permissões, backups ambíguos e substituição do caminho errado.

## Decisão

Dividir o M2 em gates irreversíveis apenas por aprovação explícita.

### M2A — round-trip em nova cópia

O primeiro incremento:

- aceita somente fixtures KDBX 4.1 públicas e descartáveis;
- abre a origem sem permissão de escrita;
- serializa o banco sem mutação para um destino novo escolhido pela pessoa;
- usa `create_new` e falha se o destino já existir;
- sincroniza o arquivo, reabre a cópia com a mesma chave e valida sua semântica no Rust;
- confirma interoperabilidade em uma matriz independente;
- nunca substitui, renomeia ou remove a origem;
- não adiciona edição ou revelação de segredos ao frontend.

### M2B — mutação controlada de uma cópia

Só pode começar após o gate M2A. O escopo inicial será uma única operação de fixture, definida em especificação própria. O arquivo original selecionado no M1 continuará imutável; a mutação ocorrerá em uma cópia criada pelo MyVault.

Qualquer campo protegido permanece no núcleo Rust. Um contrato IPC novo deve usar comandos fechados por intenção, e não transportar o banco descriptografado ou objetos genéricos de patch.

### M2C — commit transacional de uma cópia administrada

Só pode começar após M2B, revisão do modelo de ameaças e testes de falha. O commit deverá:

1. comprovar que a versão em disco ainda corresponde ao fingerprint aberto;
2. criar arquivo temporário imprevisível no mesmo diretório e volume;
3. escrever, `flush` e sincronizar o temporário;
4. reabrir e validar o temporário antes do commit;
5. criar backup explícito e verificável;
6. substituir o destino por uma abstração específica do sistema operacional;
7. preservar ou reaplicar metadados e permissões de forma testada;
8. verificar o resultado final e reportar estado incerto sem apagar evidência de recuperação.

No Windows, a implementação deve avaliar `ReplaceFileW`, que substitui um arquivo e pode criar backup preservando atributos relevantes. `std::fs::rename` não será tratado como prova suficiente de semântica transacional multiplataforma. Uma implementação Unix futura deverá documentar `fsync` do arquivo e do diretório e permanecer bloqueada enquanto a issue #15 impedir release Linux.

## Restrições obrigatórias

- nenhuma escrita no `ReadOnlyVaultService` ou em seu handle de origem;
- writer separado e negado por padrão no contrato de capacidades;
- feature `save_kdbx4` habilitada somente no marco que a testa;
- versão exata e features mínimas da biblioteca registradas no lockfile;
- KDBX 3.1 e 4.0 não podem ser migrados silenciosamente para 4.1;
- parâmetros de KDF, cipher e compressão não podem ser enfraquecidos;
- nenhum arquivo descriptografado, log de conteúdo ou cache persistente;
- temporários e backups são tratados como dados sensíveis, mesmo criptografados;
- nenhuma chamada de rede, telemetria ou atualização automática;
- nenhuma credencial real até auditoria independente e marco posterior explícito;
- qualquer mudança de permissão Tauri exige ADR e revisão de ameaça separadas.

## Gates de saída

Cada gate exige código, testes, documentação e aceite manual coerentes. Falhar em qualquer item mantém escrita desabilitada.

- origem preservada byte a byte em sucesso, falha e cancelamento;
- cópia reabre com a chave correta e rejeita chave incorreta;
- equivalência semântica cobre grupos, entradas, campos protegidos, histórico, anexos, ícones, metadados e objetos excluídos;
- saída abre em pelo menos um cliente independente, com versão registrada;
- fault injection cobre criação, escrita parcial, flush, sync, validação, backup e commit;
- conflitos externos são detectados antes do commit;
- nenhum segredo aparece no IPC, estado React, logs ou mensagens públicas;
- permissões e artefatos residuais são inspecionados no Windows;
- CI de frontend, Rust, auditoria e CodeQL permanece verde;
- modelo de ameaças e matriz de compatibilidade são atualizados no mesmo PR.

## Alternativas consideradas

### Salvar diretamente sobre o arquivo aberto

Rejeitada. Uma falha parcial pode destruir a única cópia válida, e o M1 não possui garantias de recuperação.

### Habilitar escrita e confiar nos testes do crate

Rejeitada. Testes upstream não demonstram fidelidade para as fixtures, contratos e sistemas operacionais do MyVault.

### Implementar o writer KDBX manualmente

Rejeitada. Isso ampliaria a superfície criptográfica e de formato que o projeto decidiu não reinventar.

### Fazer backup e depois escrever no mesmo handle

Rejeitada. Backup não torna uma escrita parcial atômica nem resolve conflito, metadados ou estado incerto.

### Usar credenciais reais no teste manual

Rejeitada. Fixtures públicas continuam obrigatórias durante todo o M2 experimental.

## Consequências

- o M2 começa mais lento, porém cada avanço produz evidência recuperável;
- a UI pode continuar parecendo somente leitura durante todo o M2A;
- a biblioteca de escrita pode ser rejeitada sem afetar o leitor do M1;
- suporte a formatos e sistemas operacionais será declarado por matriz, não por inferência;
- escrita em arquivos reais, sincronizados ou compartilhados continua fora de escopo;
- a implementação não começa enquanto este ADR, a especificação e o delta do modelo de ameaças não forem aprovados.

## Registro de aprovação

O plano e seus gates foram aprovados pelo mantenedor em 2026-08-03. A aprovação autoriza somente o Gate 0 documental e o futuro laboratório Rust descrito no M2A; não autoriza escrita no arquivo de origem, comandos Tauri de mutação, dados reais ou avanço automático para M2B/M2C.

## Referências

- [Documentação do crate `keepass`](https://docs.rs/keepass/0.13.19/keepass/)
- [Especificação oficial KDBX 4.1](https://keepass.info/help/kb/kdbx.html)
- [Rust `std::fs::rename` e diferenças por plataforma](https://doc.rust-lang.org/std/fs/fn.rename.html)
- [Microsoft `ReplaceFileW`](https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-replacefilew)
- [Especificação do M2](../M2-SPEC.md)
- [Delta do modelo de ameaças do M2](../M2-THREAT-MODEL.md)
