# Arquitetura

## Princípios

- a interface não acessa diretamente filesystem, criptografia ou APIs privilegiadas;
- regras de produto permanecem independentes do parser KDBX;
- toda capacidade nativa é pequena, tipada, negada por padrão e testável;
- o preview web continua funcional com mocks;
- dados secretos devem atravessar o menor número possível de fronteiras;
- a interface nunca promete uma proteção que o marco atual não entrega.

## Estado atual — M0 + M1 experimental

```mermaid
flowchart LR
    UI["React UI"] --> Store["Zustand actions"]
    Store --> Domain["Domínio e contratos"]
    Domain --> Mock["Repositório mock em memória"]
    Store --> Gateway["Gateway KDBX tipado"]
    Gateway --> IPC["Comandos Tauri allowlisted"]
    IPC --> Core["Serviço Rust somente leitura"]
```

- `domain/` contém entidades portáveis, contratos e regras puras;
- `features/` contém comportamento e UI por funcionalidade;
- `stores/` coordena seleção, navegação e overlays da sessão;
- `infrastructure/mocks/` continua sendo a origem do preview web do M0;
- `infrastructure/tauri/` contém o gateway tipado para operações privilegiadas;
- `src-tauri/` abre somente fixtures KDBX públicas em modo somente leitura e mantém a sessão no processo Rust.

O store não usa middleware de persistência. Formulários, senhas geradas e alterações mockadas desaparecem ao recarregar.

## Implementação do M1

```mermaid
flowchart TB
    subgraph WebView["Frontend não privilegiado"]
      UI["React UI"] --> Session["Store de sessão"]
      Session --> Mock["Dados mock do preview"]
      Session --> Gateway["Gateway KDBX"]
    end

    subgraph Native["Núcleo Tauri / Rust"]
      IPC["Comandos allowlisted"] --> Service["ReadOnlyVaultService"]
      Service --> Parser["crate keepass = 0.13.19"]
      Service --> Sessions["Mapa de sessões opacas"]
    end

    Gateway --> IPC
    Service --> File["Handle somente leitura"]
```

### Caminho de abertura

1. o seletor nativo devolve um caminho escolhido pela pessoa;
2. o frontend envia caminho, senha efêmera e arquivo-chave opcional;
3. o comando valida forma e limites básicos;
4. o serviço abre o mesmo arquivo com acesso somente leitura;
5. o adaptador valida e lê o KDBX;
6. o serviço guarda o banco no processo Rust e cria uma sessão opaca;
7. uma projeção allowlist, sem campos secretos, volta ao frontend;
8. fechar/bloquear invalida a sessão e descarta o estado.

### Contratos

O frontend depende de funções de gateway equivalentes a este contrato:

```ts
interface KdbxGateway {
  openReadOnly(request: OpenKdbxRequest): Promise<OpenKdbxResult>;
  close(sessionId: string): Promise<void>;
}
```

Os tipos do crate Rust não podem atravessar o IPC. `OpenKdbxResult` contém apenas identificador da sessão, versão do formato, grupos, resumos de entradas e capacidades fixas de leitura. O contrato completo está em [M1-SPEC.md](M1-SPEC.md).

### Estado e concorrência

- uma sessão KDBX ativa por processo no M1;
- a abertura mais recente concluída substitui a sessão anterior;
- identificadores de entrada retornados são efêmeros;
- nenhum estado KDBX é persistido pelo Zustand;
- montagem ou reload limpa sessões nativas órfãs por comando dedicado;
- erro durante abertura não substitui a fonte de dados atual.

### Erros

O adaptador converte erros da biblioteca em erros internos. O comando converte esses erros em uma enumeração pública fechada. Caminhos, backtraces e mensagens transitivas nunca são serializados. Consulte a tabela em [M1-SPEC.md](M1-SPEC.md#modelo-público-de-erros).

## Limite de permissões Tauri

O WebView não recebe permissão genérica de leitura do filesystem. A seleção usa diálogo nativo e o acesso acontece dentro de comando próprio. Novas permissões exigem justificativa, teste e atualização do [modelo de ameaças](THREAT-MODEL.md).

## Sistema de apresentação

A UI usa tokens CSS semânticos como fronteira entre intenção do produto e estilo. Superfícies neutras definem hierarquia; azul-aço identifica navegação, foco e informação; verde, âmbar e vermelho permanecem exclusivos de estados semânticos.

- `src/styles/tokens.css` é a fonte de verdade dos temas;
- `src/styles/globals.css` implementa layout e estados compartilhados;
- componentes consomem tokens em vez de cores isoladas;
- cores de serviços aparecem somente nos containers de logos;
- sessões do M1 reutilizam os mesmos componentes e acrescentam os estados **Experimental** e **Somente leitura**.

O contrato visual completo está em [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) e no [ADR 003](DECISIONS/003-codex-inspired-visual-language.md).

## Caminho posterior

M2 não será uma extensão automática do adaptador de leitura. O [ADR 005](DECISIONS/005-safe-kdbx-copy-on-write.md) separa o experimento em três gates: round-trip sem mutação para um destino novo, mutação controlada de uma cópia e commit transacional de uma cópia administrada.

O [M2-SPEC.md](M2-SPEC.md) mantém o `ReadOnlyVaultService` imutável e propõe um serviço de laboratório separado. Escrita atômica, backup, recuperação e interoperabilidade só entram depois de evidência própria e revisão do [delta do modelo de ameaças](M2-THREAT-MODEL.md). Até lá, nenhum método de mutação pertence aos contratos KDBX públicos.
