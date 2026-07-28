# ADR 003: Linguagem visual inspirada no Codex

- **Status:** Aceita
- **Data:** 2026-07-27

## Contexto

O MyVault precisa sustentar uma interface desktop moderna durante a evolução do protótipo para fluxos KDBX, configurações, erros e proteções locais. Sem uma direção registrada, cada nova tela poderia introduzir cores, densidade e estados inconsistentes.

A interface do Codex foi escolhida como referência por sua hierarquia de painéis, densidade controlada, base neutra e lateral levemente azulada. O MyVault também precisa preservar sua identidade e a semântica específica de um produto de segurança.

## Decisão

Adotar uma linguagem visual própria com:

- superfícies principais neutras em cinza escuro;
- laterais e estados ativos com temperatura azulada;
- azul-aço como cor de identidade, navegação, foco e informação;
- espectro frio do branco acinzentado ao azul mineral e grafite como assinatura linear de marca;
- ação primária neutra de alto contraste;
- verde, âmbar e vermelho reservados para estados semânticos;
- layout desktop denso dividido em navegação, lista, detalhe e utilitários;
- tokens compartilhados entre o preview web e a janela Tauri.

A inspiração no Codex acontece no nível de princípios visuais. O projeto não reutiliza marca, nome, componentes, ilustrações ou ativos proprietários do Codex.

## Consequências

- novas telas devem seguir [`docs/DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md);
- cores devem ser adicionadas primeiro como tokens semânticos;
- mudanças relevantes de identidade exigem atualização do preview e deste ADR;
- o azul não pode substituir cores de sucesso, alerta ou perigo;
- o espectro de marca fica restrito a foco, progresso, força e peças próprias de identidade;
- contribuições visuais devem ser verificadas nos temas escuro e claro;
- o sistema de design passa a fazer parte dos critérios de aceite do produto.

## Alternativas consideradas

### Manter a paleta índigo original

Rejeitada porque transmitia uma aparência mais genérica de dashboard web e competia com estados semânticos.

### Usar somente tons neutros

Rejeitada porque retirava personalidade e dificultava reconhecer seleção, foco e navegação.

### Copiar exatamente a interface de referência

Rejeitada. O MyVault precisa de identidade própria, componentes adequados a credenciais e liberdade para evoluir sem dependência visual de outro produto.
