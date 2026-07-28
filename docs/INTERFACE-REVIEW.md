# Roteiro de revisão da interface

Este roteiro organiza a avaliação visual do MyVault antes de qualquer alteração. O objetivo é transformar observações subjetivas em decisões claras, priorizadas e verificáveis.

## Regra desta rodada

- nenhuma mudança visual será implementada durante a inspeção;
- use somente dados mockados e fixtures públicas do projeto;
- não inclua senhas, caminhos pessoais, notificações ou outros dados privados nos prints;
- avalie primeiro o tema escuro e depois confira o tema claro;
- registre uma observação por elemento sempre que possível.

## Como registrar feedback

Use este formato para cada observação:

```text
ID: MAIN-03
Decisão: manter | ajustar | remover | substituir
Problema: o que parece errado ou desconfortável
Resultado desejado: como deveria parecer ou se comportar
Referência: print, aplicativo ou produto de referência (opcional)
Prioridade: P0 bloqueia | P1 importante | P2 refinamento
```

Também dê uma nota geral de 1 a 5 para cada tela:

- **1:** precisa ser redesenhada;
- **2:** muitos problemas visuais;
- **3:** funcional, mas ainda genérica ou inconsistente;
- **4:** boa, precisa de polimento;
- **5:** manter como está.

## Preparação

1. Abra o MyVault em uma janela de aproximadamente `1440 × 900`.
2. Comece no cofre mockado **Pessoal** e no tema escuro.
3. Faça uma segunda passagem em `1280 × 720`.
4. No final, confira o tema claro e a navegação por teclado.
5. Para o fluxo KDBX, use `kdbx41-aes-aeskdf-password.kdbx` e a senha pública `demopass`.

## 1. Janela e impressão geral

ID base: `SHELL`

- proporção da janela e quantidade de espaço vazio;
- distância entre a janela do aplicativo e as bordas da tela;
- cor de fundo externa e sensação de profundidade;
- bordas, raio, sombra e contraste do container principal;
- densidade geral: compacta, confortável ou espaçada demais;
- semelhança desejada com o Codex sem parecer uma cópia;
- personalidade própria do MyVault;
- equilíbrio entre cinza neutro, azul-aço e cores semânticas.

Pergunta principal: **a primeira impressão parece produto real, protótipo ou conceito visual? Por quê?**

## 2. Barra superior

ID base: `TOP`

- marca, ícone e nome **MyVault**;
- seletor de cofre e truncamento do nome do arquivo;
- busca global, placeholder e atalho `Ctrl + K`;
- badge **Somente leitura**;
- botão **Novo item** em estados ativo e desabilitado;
- botão **Bloquear**;
- espaçamento, alinhamento vertical e hierarquia entre ações;
- contraste entre ação primária, ação neutra e estado informativo;
- comportamento do menu do seletor de cofre.

Pergunta principal: **qual elemento chama atenção primeiro e qual deveria chamar?**

## 3. Navegação lateral

ID base: `SIDE`

- largura da coluna;
- item selecionado, hover e foco;
- ícones e contadores das categorias;
- separação entre categorias, cofres e grupos KDBX;
- hierarquia entre **Pessoal**, **Trabalho** e a fixture aberta;
- recuo e legibilidade dos grupos KDBX;
- rodapé “dados somente em memória” ou “fixture KDBX”;
- uso do azul nos estados ativos;
- excesso ou falta de linhas divisórias.

Pergunta principal: **é possível entender a estrutura do cofre em menos de três segundos?**

## 4. Lista de entradas

ID base: `LIST`

- largura e quantidade de informação por item;
- título, usuário, data e favorito;
- logos reais versus ícones genéricos;
- tamanho, contraste e alinhamento dos logos;
- item selecionado, hover, foco e borda azul;
- espaçamento vertical entre entradas;
- cabeçalho, contador, filtro e ordenação;
- truncamento de textos longos;
- estado com uma única entrada KDBX;
- estado vazio e resultado de busca sem correspondência.

Pergunta principal: **a lista permite localizar a entrada certa rapidamente sem ficar visualmente ruidosa?**

## 5. Detalhes da entrada

ID base: `DETAIL`

- cabeçalho, logo, título, tipo e favorito;
- alinhamento entre rótulos e valores;
- tamanho e contraste dos rótulos;
- links, botões de copiar e revelar;
- indicador de força da senha;
- código TOTP e contador;
- tags, notas e data de atualização;
- divisórias horizontais;
- botões **Editar**, **Duplicar** e **Excluir**;
- distribuição do espaço quando campos secretos não aparecem no modo KDBX;
- mensagem “campos permaneceram no núcleo Rust”.

Pergunta principal: **o painel prioriza a informação correta ou parece uma ficha técnica extensa demais?**

## 6. Painel utilitário direito

ID base: `RAIL`

No modo mock:

- card de clipboard;
- gerador de senhas;
- integridade do protótipo;
- equilíbrio entre conteúdo útil e ruído.

No modo KDBX:

- card **M1 experimental**;
- card **Segredos isolados**;
- card **Capacidades fechadas**;
- repetição entre badge, cards, rodapé e mensagem central;
- uso de azul, verde e ícones semânticos.

Pergunta principal: **este painel ajuda a tarefa atual ou ocupa espaço que deveria pertencer aos detalhes?**

## 7. Barra de status

ID base: `STATUS`

- altura e legibilidade;
- informação mostrada à esquerda e à direita;
- diferença entre modo mock e KDBX;
- uso de verde para estado seguro/operacional;
- alinhamento com as colunas superiores;
- necessidade real de manter a barra sempre visível.

## 8. Diálogo para abrir KDBX

ID base: `OPEN`

- título e descrição do experimento;
- aviso sobre credenciais reais;
- seletor do KDBX e arquivo-chave;
- campo de senha pública;
- botões **Cancelar** e **Abrir somente leitura**;
- estados de carregamento, erro e sucesso;
- clareza sobre o que será e não será exibido;
- tamanho do diálogo e ordem dos campos;
- linguagem técnica versus linguagem de produto.

Pergunta principal: **uma pessoa que não conhece KDBX entende o que precisa fazer sem consultar o README?**

## 9. Modo KDBX somente leitura

ID base: `KDBX`

- reconhecimento imediato de que o modo é experimental;
- reconhecimento imediato de que nenhuma edição é possível;
- nome do arquivo truncado no topo;
- presença da fixture como terceiro cofre;
- grupos e entradas importados;
- ausência correta de senha, TOTP, notas e anexos;
- botão **Novo item** desabilitado;
- ausência das ações de editar, duplicar, excluir e favoritar;
- quantidade de avisos repetindo a mesma limitação;
- sensação de segurança sem alarmismo.

Pergunta principal: **o modo somente leitura parece intencional e confiável ou apenas uma interface incompleta?**

## 10. Tela bloqueada

ID base: `LOCK`

- centralização e tamanho do card;
- hierarquia entre marca, cofre, campo e botão;
- campo de senha mestra simulada;
- botão **Escolher outro cofre**;
- aviso **M1 experimental**;
- contraste do aviso âmbar;
- quantidade de espaço vazio ao redor;
- coerência com o dashboard;
- clareza de que o desbloqueio ainda é simulado.

Pergunta principal: **a tela transmite segurança e acabamento ou parece desconectada do restante do produto?**

## 11. Criar e editar entrada

ID base: `FORM`

- tamanho do diálogo;
- ordem e agrupamento dos campos;
- rótulos, placeholders e ajuda contextual;
- campo de senha e acesso ao gerador;
- tags, favorito e notas;
- botões de cancelar e salvar;
- validação e mensagens de erro;
- foco inicial e navegação por `Tab`;
- diferença visual entre criar e editar;
- aviso de que as mudanças são apenas mockadas.

## 12. Gerador de senhas

ID base: `GEN`

- versão compacta no painel lateral;
- versão expandida em diálogo;
- legibilidade da senha gerada;
- botão de regenerar e copiar;
- controle de comprimento;
- opções A–Z, a–z, números e símbolos;
- indicador de força;
- alinhamento e espaçamento dos controles;
- feedback após copiar.

## 13. Busca e paleta de comandos

ID base: `SEARCH`

- busca persistente no topo;
- paleta aberta com `Ctrl + K`;
- dimensão, posição e fundo do overlay;
- agrupamento de resultados e ações;
- item selecionado por teclado;
- estado sem resultados;
- clareza do atalho para fechar;
- diferença entre buscar entrada e executar comando.

## 14. Configurações e tema claro

ID base: `SETTINGS`

- localização do acesso às configurações;
- organização das opções;
- alternância de tema;
- contraste e hierarquia no tema claro;
- manutenção da assinatura azul-aço;
- legibilidade de bordas e superfícies claras;
- consistência dos logos nos dois temas.

Pergunta principal: **o tema claro parece projetado ou apenas uma inversão do escuro?**

## 15. Feedback e estados transitórios

ID base: `STATE`

- toast de sucesso, erro e informação;
- feedback de clipboard e contagem regressiva;
- loading ao abrir KDBX;
- erros de senha, arquivo e formato;
- botões desabilitados;
- estados vazios;
- confirmação antes de excluir;
- duração e posição das mensagens;
- estabilidade do layout quando uma mensagem aparece.

## 16. Responsividade desktop

ID base: `RESP`

Confira pelo menos:

- `1440 × 900` — referência principal;
- `1280 × 720` — notebook comum;
- `1024 × 768` — largura mínima de avaliação;
- janela maximizada;
- janela redimensionada horizontalmente.

Observe:

- colunas comprimidas ou cortadas;
- textos truncados sem tooltip;
- scroll horizontal;
- painel direito ocupando espaço excessivo;
- diálogos fora da área visível;
- barra inferior e ações sempre acessíveis.

## 17. Acessibilidade e teclado

ID base: `A11Y`

- ordem completa de `Tab` e `Shift + Tab`;
- foco visível em todos os elementos interativos;
- ativação com `Enter` e `Espaço`;
- fechamento de diálogos com `Esc`;
- contraste de texto secundário e controles desabilitados;
- rótulos compreensíveis sem depender apenas de ícones;
- áreas clicáveis confortáveis;
- zoom do Windows em 125% e 150%, se disponível;
- ausência de informação transmitida somente por cor.

## Ordem sugerida das sessões

Para evitar fadiga, envie o feedback em quatro blocos:

1. **Estrutura:** `SHELL`, `TOP`, `SIDE`, `LIST`, `DETAIL`, `RAIL`, `STATUS`.
2. **Fluxos:** `OPEN`, `KDBX`, `LOCK`, `FORM`, `GEN`, `SEARCH`.
3. **Sistema visual:** cores, tipografia, espaçamento, bordas, sombras, logos e tema claro.
4. **Qualidade:** `STATE`, `RESP` e `A11Y`.

## O que acontecerá depois

Quando o feedback estiver completo:

1. os comentários serão agrupados por causa, não apenas por tela;
2. conflitos e decisões que exigem escolha serão destacados;
3. será criado um plano em fases com arquivos afetados, critérios de aceite e riscos;
4. nenhuma implementação começará antes da aprovação explícita do plano;
5. cada fase será validada no aplicativo desktop real;
6. o README receberá uma captura real somente depois da aprovação visual final.
