# Plano de redesign da interface

Status: **Fase 5 concluída e aprovada; próxima etapa: Fase 6**

Escopo: interface desktop do MyVault após o M1 KDBX somente leitura

## 1. Objetivo

Reconstruir a camada visual do MyVault para que o aplicativo pareça um produto desktop deliberado, e não um dashboard SaaS montado a partir de padrões genéricos. O redesign deve preservar o núcleo funcional e os limites de segurança já validados no M1.

Resultados esperados:

- workspace ocupando toda a área útil da janela;
- linguagem visual própria, inspirada na sobriedade do Codex, sem copiá-lo;
- menos cards, chips, bordas, raios e ícones ornamentais;
- hierarquia baseada em tipografia, alinhamento, espaço e contraste;
- componentes interativos apoiados em primitives maduros e acessíveis;
- gerador de senhas tratado como uma feature principal;
- temas escuro e claro projetados como sistemas equivalentes;
- comportamento adaptável em janelas desktop menores;
- validação visual no aplicativo Tauri real.

## 2. Feedback consolidado

### Diretrizes transversais

| ID          | Decisão                                                                                              |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| `TOP-01`    | Reconstruir a linguagem dos controles da barra superior.                                             |
| `SYSTEM-01` | Revisar globalmente botões, inputs, chips, ícones, badges, cards, bordas, raios, elevação e estados. |
| `SHELL-01`  | Remover a “janela dentro da janela” e usar todo o viewport disponível.                               |
| `THEME-01`  | Manter o tema claro, porém mais acinzentado e menos branco.                                          |

### Telas e componentes

| ID            | Decisão                                                                              |
| ------------- | ------------------------------------------------------------------------------------ |
| `SIDE-01`     | Simplificar navegação, contadores, ícones de cofre e estados selecionados.           |
| `LIST-01`     | Refinar linhas, seleção, logos e densidade da lista.                                 |
| `DETAIL-01`   | Remover caixas desnecessárias dos detalhes, notas e ações.                           |
| `DETAIL-02`   | Substituir chips genéricos de tags por metadados discretos.                          |
| `RAIL-01`     | Eliminar a pilha de cards utilitários e reduzir conteúdo redundante.                 |
| `FORM-01`     | Reconstruir criação e edição com controles, agrupamento e ações próprios.            |
| `GEN-01`      | Elevar o gerador de senhas a ferramenta principal, com interação visual útil.        |
| `SEARCH-01`   | Reconstruir a paleta de comandos e seus resultados.                                  |
| `SETTINGS-01` | Substituir o modal genérico de configurações por uma experiência dedicada.           |
| `LOCK-01`     | Refazer a tela bloqueada sem card central e ícones decorativos encaixotados.         |
| `OPEN-01`     | Refazer o fluxo de abertura KDBX e seus seletores de arquivo.                        |
| `KDBX-01`     | Integrar o estado somente leitura sem chip e sem três cards redundantes.             |
| `RESP-01`     | Adaptar a composição ao redimensionamento sem margens externas ou scroll horizontal. |

## 3. Diagnóstico técnico

A implementação atual tem bons limites de domínio e segurança, mas sua camada de apresentação apresenta quatro causas principais:

1. `src/styles/globals.css` concentra mais de mil linhas e mistura fundações, layout e estilos de features.
2. O sistema de UI próprio possui apenas `Button` e `Dialog`; inputs, file pickers, checkboxes, sliders, badges e menus são composições locais sem uma anatomia comum.
3. A mesma receita visual é repetida: fundo elevado, borda, raio médio, ícone Lucide, texto secundário e cor semântica.
4. Estados de produto aparecem como cards e badges, mesmo quando deveriam ser texto contextual, status de barra ou feedback transitório.

O uso atual de Radix é pequeno e não é a causa do resultado visual. Radix fornece comportamento sem estilo; a aparência genérica vem da composição e do CSS do projeto.

## 4. Referências e princípios

O redesign usará referências como evidência de estrutura e comportamento, não como material para cópia literal.

### Produtos

- **Codex desktop:** referência fornecida pelo autor para neutralidade, densidade, layout integral e superfícies discretas.
- **1Password desktop:** referência para a relação entre sidebar, cofres, lista, detalhes, busca e bloqueio. A documentação oficial descreve a sidebar como ponto central para contas, cofres, categorias e tags, e mantém a busca acima da lista de itens.
- **Bitwarden:** referência funcional para tratar o gerador como ferramenta dedicada e também disponível dentro da edição de uma entrada.
- **Windows:** referência de comportamento para navegação lateral adaptável, hierarquia tipográfica, agrupamento por espaço e uso eficiente da janela.

### Regras visuais

- superfície adicional só será criada quando houver diferença real de contexto ou elevação;
- badges ficam restritos a estados compactos que precisam permanecer visíveis;
- tags não devem parecer botões;
- ícones aparecem apenas quando aceleram reconhecimento ou acionam uma ação;
- ícones explicativos não serão colocados em quadrados arredondados;
- ações destrutivas usam cor somente no ponto de decisão;
- bordas separam regiões estruturais, não todos os elementos;
- o azul-aço identifica seleção, foco e identidade, sem colorir toda a interface;
- texto e espaço estabelecem a hierarquia principal;
- animação comunica geração, mudança de estado ou continuidade.

## 5. Fundação técnica proposta

### Component primitives

Adotar **Base UI** como fundação comportamental única para novos controles e migrar gradualmente os poucos usos de Radix existentes.

Motivos:

- biblioteca sem estilos, evitando uma aparência pronta de template;
- primitives acessíveis e compostos;
- suporte para React 17 ou superior;
- componentes adequados ao escopo: Dialog, Menu, Select, Combobox, Field, Checkbox, Slider, Tooltip e Toast;
- API próxima à do Radix, reduzindo o risco de migração;
- versão estável e manutenção ativa.

Não será importado um tema visual pronto. O MyVault controlará integralmente CSS, anatomia, tipografia e tokens.

### Movimento

Adicionar **Motion for React** somente nas interações em que a continuidade é relevante:

- regeneração de senha;
- expansão do painel do gerador;
- entrada e saída de overlays;
- troca de estado do medidor de força;
- feedback de cópia.

Toda animação obedecerá `prefers-reduced-motion` e terá alternativa sem deslocamento.

### Iconografia

- manter logos reais das marcas já disponíveis;
- criar uma marca SVG própria para o MyVault, substituindo `ShieldCheck`;
- usar ícones lineares somente em ações e navegação onde forem necessários;
- remover containers decorativos ao redor de ícones;
- substituir o `KeyRound` genérico de entradas por favicon, monograma ou ícone específico do tipo;
- evitar trocar uma biblioteca de ícones por outra sem mudar sua função visual.

## 6. Arquitetura visual proposta

### Shell integral

- `app-viewport` e `desktop-window` passam a ocupar `100vw × 100vh`;
- remover margem externa, raio, borda e sombra da janela interna;
- manter apenas as regiões reais do produto: barra superior, navegação, lista, detalhe e barra de estado;
- permitir que a janela nativa do Tauri seja a única moldura externa.

### Grid adaptável

Composição ampla:

```text
sidebar | lista | detalhe | ferramenta contextual opcional
```

Composição média:

```text
sidebar compacta | lista | detalhe
```

Composição estreita:

```text
sidebar recolhível | lista/detalhe alternáveis
```

O painel utilitário deixa de ser uma coluna permanente de cards. O gerador poderá abrir como ferramenta contextual; mensagens de clipboard serão transitórias; informações experimentais irão para um único status contextual.

## 7. Planos por experiência

### 7.1 Barra superior

- substituir o ícone genérico pela marca SVG do MyVault;
- reduzir o seletor de cofre a controle compacto, sem aparência de botão-card;
- manter busca como principal ferramenta operacional;
- representar somente leitura como texto de status integrado, não pill;
- simplificar `Novo item` e `Bloquear` com hierarquia clara;
- alinhar a barra com as colunas abaixo;
- reduzir quantidade de bordas e raios simultâneos.

Critério de aceite: a barra possui uma ação primária inequívoca e nenhuma região parece um conjunto de chips.

### 7.2 Sidebar

- remover fundos e pequenos containers dos ícones de cofres;
- substituir contadores em badges por numerais alinhados e discretos;
- usar seleção por contraste de linha/superfície e indicador fino;
- separar categorias, cofres e grupos por espaço e tipografia;
- adicionar Configurações ao rodapé da navegação;
- preservar leitura rápida em tema claro e escuro.

Critério de aceite: categorias e cofres são entendidos sem depender de cor ou de caixas arredondadas.

### 7.3 Lista de entradas

- transformar cada item em linha de lista, sem cartão individual;
- usar logos reais sem círculos obrigatórios;
- fallback por monograma para itens sem marca;
- seleção em faixa contínua, sem contorno arredondado;
- manter título, usuário e tempo, com truncamento e tooltip;
- desenhar filtros e ordenação como toolbar compacta.

Critério de aceite: oito entradas podem ser percorridas rapidamente sem ruído de bordas e ornamentos.

### 7.4 Detalhes

- tratar valores como conteúdo, não inputs desabilitados;
- remover caixas de notas, proteção e tags quando não houver interação;
- tags passam a metadados textuais com separadores;
- agrupar copiar/revelar junto ao valor e exibir ações no hover/foco quando apropriado;
- mover ações principais para uma command bar consistente;
- reservar vermelho para confirmação ou hover da ação destrutiva.

Critério de aceite: título, usuário, senha, URL e TOTP formam uma hierarquia clara sem “card dentro de card”.

### 7.5 Criar e editar

- trocar o modal genérico por um task dialog amplo ou painel lateral de edição;
- agrupar identidade, credencial, organização e notas;
- usar componentes Field, Input, TextArea, Checkbox e validação da fundação;
- integrar o gerador diretamente ao campo de senha;
- manter ações fixas e previsíveis no rodapé;
- diferenciar claramente criação, edição e modo somente leitura.

Critério de aceite: o formulário não se parece com um formulário HTML empilhado e pode ser completado somente pelo teclado.

### 7.6 Gerador de senhas

- substituir o card estreito por ferramenta contextual expansível;
- oferecer modos `Senha` e `Frase secreta`;
- destacar o resultado em área monoespaçada própria;
- mostrar entropia/força como informação contínua, não badge verde;
- manter comprimento, conjuntos de caracteres e opções avançadas organizados por prioridade;
- integrar regenerar e copiar ao resultado;
- disponibilizar a mesma ferramenta dentro do formulário de entrada;
- não manter histórico persistente no M1.

Movimento proposto:

- transição curta de caracteres na regeneração, sem animar ou registrar uma sequência de segredos reais;
- medidor responde continuamente a comprimento e composição;
- confirmação de cópia ocorre junto ao resultado;
- com movimento reduzido, usar apenas mudança instantânea ou opacidade.

Critério de aceite: o gerador parece uma feature central do produto, funciona com teclado e não compromete o modelo de segurança.

### 7.7 Paleta de comandos

- implementar busca e seleção com Combobox/Listbox acessível;
- reduzir o contorno de modal e aproximá-la de uma janela de comando nativa;
- destacar seleção por faixa, não por chip;
- separar itens, ações e preferências por tipografia e espaço;
- permitir setas, `Enter`, `Esc`, `Home` e `End`;
- apresentar atalhos com texto monoespaçado discreto.

Critério de aceite: todas as ações podem ser executadas sem mouse e o foco nunca se perde.

### 7.8 Configurações

- mover Configurações para uma view dedicada dentro do shell;
- usar categorias simples na lateral quando houver conteúdo suficiente;
- substituir linhas com ícones decorativos por labels, descrição e controle real;
- permitir alternância de tema diretamente em Aparência;
- apresentar armazenamento e telemetria como informações de estado, não badges verdes;
- preparar a anatomia para preferências futuras sem preencher espaço artificialmente.

Critério de aceite: a tela parece parte do aplicativo, não um modal demonstrativo.

### 7.9 Tela bloqueada

- usar canvas integral sem card central;
- aplicar marca, nome do cofre, campo e ação em uma coluna simples;
- remover o grande ícone de chave;
- mover o aviso experimental para texto auxiliar discreto;
- manter escolha de outro cofre acessível;
- preservar indicação clara de que o desbloqueio do mock é simulado.

Critério de aceite: a tela transmite segurança por clareza e contenção, não por escudos, cadeados e caixas.

### 7.10 Abertura e leitura KDBX

- usar diálogo específico da tarefa, não o mesmo esqueleto visual do formulário;
- file pickers passam a linhas de arquivo com ação explícita e nome completo acessível;
- aviso experimental usa uma única chamada textual com hierarquia moderada;
- estado de erro aparece junto ao campo responsável;
- substituir os três cards laterais por uma única informação contextual;
- remover o pill `Somente leitura` e usar status integrado com ícone somente quando necessário;
- remover caixas ao redor de “proteção” nos detalhes;
- manter campos protegidos fora do React exatamente como no M1.

Critério de aceite: o modo somente leitura parece intencional e completo, sem repetir a limitação em quatro lugares.

## 8. Temas

### Tema escuro

- base neutra próxima do Codex;
- superfícies adjacentes separadas por pequenas diferenças de luminosidade;
- azul-aço reservado para foco, seleção e marca;
- eliminar gradientes ambientais e sombras grandes no shell.

### Tema claro

- canvas e navegação aproximadamente 15–20% mais acinzentados que a versão atual;
- evitar branco puro em grandes superfícies;
- manter contraste de texto e controles;
- usar bordas menos azuladas;
- preservar a assinatura azul-aço sem transformar a interface em azul claro.

A porcentagem é uma direção perceptual. Os valores finais serão escolhidos por contraste e comparação visual, não pela aplicação cega de uma camada cinza de 20%.

## 9. Fases de implementação

### Fase 1 — fundação e laboratório visual

Arquivos principais:

- `package.json` e lockfile;
- `src/styles/tokens.css`;
- novos módulos em `src/styles/`;
- novos primitives em `src/components/ui/`;
- preview interno de componentes disponível apenas em desenvolvimento.

Entregas:

- Base UI e Motion configurados;
- tokens revisados;
- Button, IconButton, Field, TextArea, Checkbox, Slider, Status, Tooltip, Dialog e Menu;
- matriz de estados: normal, hover, active, focus, disabled, invalid;
- tema escuro e claro lado a lado.

**Gate de aprovação 1:** revisar os primitives antes de propagá-los pelo aplicativo.

### Fase 2 — shell integral e navegação

Arquivos principais:

- `src/app/app.tsx`;
- `src/components/layout/top-bar.tsx`;
- `src/components/layout/sidebar.tsx`;
- `src/components/layout/status-bar.tsx`;
- estilos de layout.

Entregas:

- viewport integral;
- grid adaptável;
- nova barra superior;
- nova sidebar;
- status sem pills ou cards.

**Gate de aprovação 2:** validar composição real em `1440 × 900`, `1280 × 720` e `1024 × 768`.

### Fase 3 — lista e detalhes

Arquivos principais:

- `src/features/entries/entry-list.tsx`;
- `src/features/entries/entry-detail.tsx`;
- `src/components/common/entry-logo.tsx`;
- `src/components/common/copy-button.tsx`.

Entregas:

- linhas de entrada sem cards;
- iconografia revisada;
- conteúdo dos detalhes sem caixas desnecessárias;
- ações e feedback de cópia refinados.

**Gate de aprovação 3:** revisar Pessoal e Trabalho antes de adaptar os fluxos KDBX.

### Fase 4 — fluxos de entrada, comandos e configurações

Arquivos principais:

- `src/features/entries/entry-dialog.tsx`;
- `src/features/search/command-palette.tsx`;
- `src/features/settings/settings-dialog.tsx`;
- estado de navegação no store, se necessário.

Entregas:

- editor reconstruído;
- paleta acessível;
- configurações como view dedicada;
- validação por teclado.

**Gate de aprovação 4:** validar criar, editar, buscar, alternar tema e fechar overlays.

### Fase 5 — gerador como feature principal

Arquivos principais:

- `src/features/password-generator/password-generator.tsx`;
- `src/domain/services/password.ts`;
- integração no formulário e no shell;
- testes do gerador.

Entregas:

- ferramenta expandida;
- modos senha e frase secreta;
- movimento funcional;
- integração com o formulário;
- suporte a movimento reduzido.

**Gate de aprovação 5:** aprovar a experiência e a animação em vídeo ou no aplicativo real.

### Fase 6 — bloqueio e KDBX

Arquivos principais:

- `src/features/vault/lock-screen.tsx`;
- `src/features/vault/kdbx-open-dialog.tsx`;
- `src/components/layout/utility-rail.tsx`;
- detalhes e status do modo somente leitura.

Entregas:

- tela bloqueada integral;
- abertura KDBX específica da tarefa;
- modo somente leitura sem redundância visual;
- preservação dos limites de segurança do M1.

**Gate de aprovação 6:** repetir abertura, leitura, bloqueio e descarte da sessão KDBX.

### Fase 7 — qualidade e publicação

Entregas:

- revisão completa dos dois temas;
- foco, teclado e contraste;
- movimento reduzido;
- estados vazios, erros, loading e desabilitado;
- redimensionamento e zoom do Windows;
- testes, lint, typecheck, build web e build Tauri;
- captura real final e atualização do README.

**Gate final:** nenhum screenshot ou merge visual será publicado como definitivo antes da aprovação do aplicativo real.

## 10. Critérios globais de aceite

- o shell ocupa toda a área útil da janela;
- nenhuma tela principal usa um container central simulando outra janela;
- não há scroll horizontal nas resoluções de teste;
- a UI funciona nos temas claro e escuro;
- foco visível atende contraste mínimo e não depende apenas de cor;
- todos os diálogos e menus fecham com `Esc`;
- a paleta e os formulários funcionam por teclado;
- estados somente leitura e desabilitado são compreensíveis sem badges repetidos;
- nenhum campo protegido de KDBX entra no estado React;
- animações respeitam movimento reduzido;
- a quantidade de cards, chips e ícones decorativos é materialmente reduzida;
- referências servem para decisões estruturais, sem copiar identidade de outro produto;
- a captura do README mostra o aplicativo real aprovado.

## 11. Estratégia de validação

Para cada fase:

1. executar testes unitários, lint, typecheck e build;
2. abrir o Tauri real;
3. validar tema escuro e claro;
4. registrar capturas em `1440 × 900`, `1280 × 720` e `1024 × 768`;
5. navegar por teclado;
6. comparar com os critérios da fase;
7. solicitar aprovação antes de avançar ao próximo gate.

O fluxo KDBX repetirá as fixtures públicas e a senha pública já documentada. Credenciais reais permanecem proibidas.

## 12. Riscos e controles

| Risco                                           | Controle                                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Troca ampla de components quebrar comportamento | Migração faseada, testes e gates visuais.                                           |
| Misturar Base UI e Radix indefinidamente        | Novos componentes usam Base UI; Radix é removido quando o último consumidor migrar. |
| Animação virar ornamento                        | Movimento restrito a feedback e continuidade, com duração curta e reduced motion.   |
| Tema claro perder contraste ao ficar cinza      | Validar contraste e foco antes de aprovar tokens.                                   |
| Redesign alterar limites do KDBX                | Não modificar gateway ou modelo de sessão sem tarefa separada.                      |
| CSS continuar monolítico                        | Separar fundações, layout, components e features durante a migração.                |
| “Não parecer IA” permanecer subjetivo           | Usar critérios mensuráveis deste documento e aprovação em aplicativo real.          |

## 13. Fora de escopo

- escrita em KDBX;
- persistência de dados reais;
- sincronização em nuvem;
- autenticação biométrica real;
- novo formato de cofre ou nova criptografia;
- redesign do backend Rust;
- atualização definitiva do README antes do gate final.

## 14. Fontes oficiais

- [Base UI — visão geral](https://base-ui.com/react/overview/about)
- [Base UI — acessibilidade](https://base-ui.com/react/overview/accessibility)
- [Base UI — releases](https://base-ui.com/react/overview/releases)
- [Motion for React — animações](https://motion.dev/docs/react-animation)
- [Motion for React — movimento reduzido](https://motion.dev/docs/react-use-reduced-motion)
- [1Password — sidebar do aplicativo](https://support.1password.com/sidebar/)
- [1Password — busca no aplicativo](https://support.1password.com/search-1password/)
- [1Password para Windows](https://support.1password.com/getting-started-windows/)
- [Bitwarden — gerador de senha e usuário](https://bitwarden.com/help/generator/)
- [Windows — layout e espaçamento](https://learn.microsoft.com/en-us/windows/apps/design/basics/content-basics)
- [Windows — navegação adaptável](https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/navigationview)
- [W3C — aparência do foco](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance)

## 15. Decisão necessária

A implementação começa somente após aprovação explícita deste plano. A aprovação autoriza as fases e os gates descritos, mas não autoriza mudanças fora do escopo, escrita em KDBX ou uso de credenciais reais.
