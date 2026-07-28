# ADR 004: crate `keepass` para o spike KDBX somente leitura

- **Status:** aceita com restrições
- **Data:** 2026-07-27
- **Escopo:** M1 experimental

## Contexto

O MyVault precisa validar leitura KDBX sem implementar criptografia ou o formato manualmente. A dependência deve funcionar atrás do limite Rust, permitir leitura a partir de `std::io::Read`, suportar as versões alvo e não obrigar a habilitar escrita.

Essa escolha não equivale a auditoria, recomendação para produção ou compromisso permanente com a biblioteca.

## Decisão

Usar o pacote Cargo [`keepass`](https://crates.io/crates/keepass), mantido no repositório [`sseemayer/keepass-rs`](https://github.com/sseemayer/keepass-rs), como parser do spike M1.

Na implementação, a dependência será fixada exatamente em:

```toml
keepass = { version = "=0.13.17", default-features = false }
```

Restrições obrigatórias:

- não habilitar `save_kdbx4` ou qualquer caminho de escrita;
- não habilitar features não usadas como `utilities`, `serialization`, `totp` ou `challenge_response`;
- manter o crate atrás de uma interface interna do núcleo;
- não expor tipos da biblioteca pelo IPC ou pelo domínio frontend;
- revisar `Cargo.lock` e executar auditoria de dependências no pull request;
- usar apenas fixtures públicas e descartáveis;
- mapear erros para o modelo público do MyVault;
- revisar esta decisão antes de M2 ou de qualquer uso com dados reais.

O pacote requer Rust 1.85.1 ou superior em sua configuração atual. O toolchain do projeto deverá satisfazer e documentar esse requisito ao integrar a dependência.

## Fundamentação

- a [documentação da versão 0.13.17](https://docs.rs/keepass/0.13.17/keepass/) declara parsing de KDB, KDBX3 e KDBX4;
- `Database::open` aceita um leitor, permitindo que o MyVault controle a abertura somente leitura;
- `DatabaseKey` oferece senha e arquivo-chave para os casos previstos no M1;
- o [manifesto oficial](https://github.com/sseemayer/keepass-rs/blob/master/Cargo.toml) mantém features de escrita separadas e usa dependências voltadas a segredos, como `secrecy` e `zeroize`;
- a licença MIT é compatível com a licença atual do MyVault;
- o projeto possui testes e uma [política pública de segurança](https://github.com/sseemayer/keepass-rs/blob/master/SECURITY.md).

## Limitações conhecidas

- a escrita KDBX 4.1 é descrita pela própria biblioteca como experimental;
- o MyVault não identificou auditoria independente suficiente para fazer alegação de produção;
- suporte declarado não substitui testes com as fixtures do projeto;
- o parser pode processar dados antes de todos os limites de estrutura do MyVault serem aplicáveis;
- a limpeza de todas as cópias de memória não é demonstrável;
- novas versões não serão adotadas automaticamente.

## Alternativas consideradas

### Implementar KDBX manualmente

Rejeitada. Isso ampliaria drasticamente a superfície criptográfica e de parsing, contrariando a decisão de não inventar nem reimplementar primitives sensíveis.

### Usar uma biblioteca exclusiva para KDBX 4

Adiada. Bibliotecas como [`kdbx4`](https://docs.rs/kdbx4/latest/kdbx4/) têm escopo mais estreito e não atendem diretamente a toda a matriz 3.1/4.x escolhida. Podem ser reavaliadas se os testes do spike falharem.

### Invocar KeePassXC ou outro executável

Rejeitada para o M1. Criaria dependência externa, descoberta de binário, superfície de processo e uma experiência inconsistente entre plataformas.

### Forkar KeePassXC

Rejeitada no [ADR 002](002-kdbx-future-compatibility.md). O MyVault é uma aplicação original e busca interoperabilidade no formato, não herança de aplicação e interface.

## Consequências

- o M1 ganha um caminho curto para validar a arquitetura e a matriz;
- a dependência entra com versão e features fechadas;
- compatibilidade só será divulgada por caso verificado;
- falha em segurança, manutenção ou compatibilidade pode substituir o parser sem alterar o contrato da UI;
- qualquer escrita exige novo ADR, modelo de ameaças atualizado e plano de interoperabilidade/recuperação.
