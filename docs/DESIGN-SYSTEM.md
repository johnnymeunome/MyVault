# Sistema de design do MyVault

- **Status:** adotado no M0
- **Versão:** 1.0
- **Última atualização:** 2026-07-27
- **Implementação de referência:** [`src/styles/tokens.css`](../src/styles/tokens.css) e [`src/styles/globals.css`](../src/styles/globals.css)

## 1. Direção visual

O MyVault deve parecer uma ferramenta desktop técnica, calma e confiável. A interface combina bases neutras com um espectro frio — branco acinzentado, azul mineral e grafite — usado como assinatura visual controlada.

A experiência do Codex foi usada como referência para densidade, hierarquia de painéis, sobriedade e temperatura de cor. O MyVault adapta esses princípios ao contexto de um cofre pessoal; não copia componentes, ícones, marcas ou ativos proprietários do Codex.

### Personalidade

- **calma:** pouco ruído, poucos efeitos e nenhuma decoração gratuita;
- **técnica:** hierarquia clara, dados compactos e controles previsíveis;
- **honesta:** estados simulados e limitações de segurança permanecem visíveis;
- **local:** o aplicativo comunica sessão, cofre e persistência sem linguagem de nuvem;
- **própria:** o espectro frio e o símbolo do produto formam a identidade do MyVault.

## 2. Princípios

1. **Neutro primeiro, azul com intenção.** O azul identifica navegação, foco, links e informação; não colore todas as superfícies.
2. **Segurança mantém semântica própria.** Verde significa sucesso ou integridade, âmbar indica atenção ou favorito e vermelho sinaliza perigo.
3. **Denso, não apertado.** A interface aproveita telas desktop sem sacrificar leitura ou alvos interativos.
4. **Profundidade por superfícies.** Hierarquia vem principalmente de luminosidade, bordas e espaçamento, não de sombras fortes.
5. **Texto antes de decoração.** Rótulos e mensagens devem explicar o estado sem depender apenas de cor ou ícone.
6. **Consistência entre web e desktop.** O preview web e a janela Tauri compartilham tokens e componentes.

O gradiente da marca não é uma superfície decorativa genérica. Ele aparece somente em amostras de identidade, feedback de foco e indicadores de progresso ou força relacionados ao produto.

## 3. Cores

### 3.1 Tema escuro

| Token               | Valor     | Uso                                         |
| ------------------- | --------- | ------------------------------------------- |
| `--bg-canvas`       | `#0f1011` | fundo externo da janela                     |
| `--surface-deep`    | `#1b2226` | lateral, trilhos e áreas azuladas profundas |
| `--surface-base`    | `#181818` | conteúdo principal                          |
| `--surface-raised`  | `#222222` | cartões e controles elevados                |
| `--surface-overlay` | `#242424` | diálogos, menus e toasts                    |
| `--surface-hover`   | `#272d30` | hover discreto com temperatura azul         |
| `--surface-active`  | `#30383c` | superfícies ativas neutro-azuladas          |
| `--border`          | `#303638` | divisores e contornos padrão                |
| `--border-strong`   | `#3d464a` | contornos destacados                        |
| `--text-primary`    | `#f2f2f2` | títulos e conteúdo principal                |
| `--text-secondary`  | `#b8b8b8` | conteúdo auxiliar                           |
| `--text-muted`      | `#818486` | metadados e placeholders                    |

### 3.2 Azul de identidade

| Token                 | Tema escuro                 | Tema claro                 | Uso                                  |
| --------------------- | --------------------------- | -------------------------- | ------------------------------------ |
| `--brand-blue`        | `#82a9bc`                   | `#496f82`                  | seleção, foco e controles            |
| `--brand-blue-strong` | `#a2c2d0`                   | `#31596c`                  | links, ícones e valores informativos |
| `--brand-blue-soft`   | `rgba(94, 137, 157, 0.16)`  | `rgba(73, 111, 130, 0.12)` | fundos selecionados                  |
| `--brand-blue-border` | `rgba(130, 169, 188, 0.42)` | `rgba(73, 111, 130, 0.34)` | bordas de seleção                    |

O azul não substitui a ação primária. Botões principais continuam claros no tema escuro e escuros no tema claro para manter hierarquia forte e direta.

### 3.3 Espectro de marca

O espectro MyVault progride de branco acinzentado para azul mineral e termina em grafite profundo. A implementação de referência é o token `--ds-brand-gradient` do laboratório visual.

Usos permitidos:

- linha de foco de campos;
- indicador do gerador de senhas, com fluxo lento e contínuo;
- amostras e peças próprias de marca;
- detalhes lineares de menus ou overlays.

Não usar o espectro como preenchimento padrão de botões, painéis, cards ou fundos inteiros da aplicação.

### 3.4 Cores semânticas

| Token       | Significado                       | Exemplos                                |
| ----------- | --------------------------------- | --------------------------------------- |
| `--success` | operação concluída ou integridade | clipboard, sessão local, força de senha |
| `--warning` | atenção, tempo ou favorito        | estrela, alertas não bloqueantes        |
| `--danger`  | ação destrutiva ou falha          | excluir, erro crítico                   |
| `--focus`   | foco de teclado                   | inputs, botões e diálogos               |

Regras:

- não usar verde para decoração;
- não usar vermelho para ações neutras;
- não comunicar um estado somente por cor;
- logos podem preservar cores oficiais dentro de seus próprios contêineres.

## 4. Tipografia

A pilha tipográfica é `Inter`, seguida pelas fontes de sistema. O produto não depende de carregamento externo de fontes.

| Papel             | Tamanho de referência | Peso      | Observação                    |
| ----------------- | --------------------- | --------- | ----------------------------- |
| título de detalhe | `17px`                | `620`     | uma linha, truncável          |
| título de painel  | `14px`                | `600`     | identifica a região atual     |
| item de lista     | `13px`                | `550`     | leitura rápida                |
| corpo             | `12–14px`             | `400–500` | conteúdo e controles          |
| metadado          | `10–11px`             | `400–600` | datas, contagens e status     |
| código            | fonte monoespaçada    | `400–600` | senha, atalho e valor técnico |

Textos devem usar sentence case. Caixa alta fica restrita a pequenos títulos de seção, como “COFRES”.

## 5. Espaçamento, forma e profundidade

### Espaçamento

A unidade visual é `4px`. Combinações preferidas: `4`, `8`, `12`, `16`, `20`, `24` e `32px`.

### Raios

| Token         | Valor  | Uso                        |
| ------------- | ------ | -------------------------- |
| `--radius-sm` | `6px`  | tags e controles pequenos  |
| `--radius-md` | `8px`  | botões, inputs e navegação |
| `--radius-lg` | `11px` | itens e cartões            |
| `--radius-xl` | `15px` | janela principal           |

### Sombras

- a janela usa sombra ampla apenas para separá-la do canvas;
- menus e diálogos usam `--shadow-overlay`;
- painéis internos não recebem sombras individuais;
- seleção é indicada por fundo, borda e trilho azul à esquerda.

## 6. Estrutura da aplicação

```text
┌─────────────────────────────────────────────────────────────────┐
│ marca · seletor de cofre · busca · ação principal · bloqueio   │
├────────────┬────────────────┬───────────────────┬───────────────┤
│ navegação  │ lista de itens │ detalhe do item   │ utilitários   │
│ e cofres   │ e filtros      │ e ações           │ e segurança  │
├────────────┴────────────────┴───────────────────┴───────────────┤
│ status da sessão, bloqueio e persistência                       │
└─────────────────────────────────────────────────────────────────┘
```

### Hierarquia

- a lateral e o trilho de utilitários usam a superfície profunda azulada;
- lista e detalhe usam superfícies neutras para priorizar os dados;
- a barra superior conecta marca, contexto e ações globais;
- a barra inferior comunica estado local e limitações da sessão.

Em larguras menores, o trilho de utilitários é removido primeiro. O aplicativo mantém uma largura mínima desktop até que exista uma navegação móvel própria.

## 7. Componentes

### Marca

O símbolo atual continua provisório e será revisto em uma etapa própria. Até lá, o espectro MyVault pode acompanhar a marca em detalhes lineares e peças institucionais, sem ser aplicado dentro do escudo provisório.

### Botões

- **primary:** alto contraste neutro; usado uma vez por contexto;
- **secondary:** superfície elevada e borda forte;
- **ghost:** ações de baixa ênfase;
- **danger:** texto e borda vermelhos, sem preenchimento agressivo.

### Navegação e listas

- hover usa `surface-hover`;
- seleção usa `brand-blue-soft`, `brand-blue-border` e trilho de `2px`;
- foco de teclado deve continuar visível sobre o estado selecionado;
- contagens usam baixo contraste e nunca competem com o título.

### Inputs e busca

- superfície neutra discreta, base linear e placeholder atenuado;
- foco remove o contorno nativo e usa o espectro MyVault na linha inferior, preservando contraste de teclado;
- erro usa `--danger` e mensagem textual associada;
- atalhos aparecem em `kbd` monoespaçado.

### Cartões de utilidade

Cartões de clipboard, gerador e integridade usam a mesma superfície elevada. Cor semântica aparece apenas no ícone, status ou indicador correspondente.

### Diálogos e comandos

Diálogos são overlays focados, não novas páginas. A paleta de comandos prioriza busca, itens recentes e ações com atalhos explícitos.

## 8. Logos e ícones

- Lucide representa ações e categorias genéricas;
- React Icons fornece marcas reconhecíveis quando disponíveis;
- cores oficiais ficam confinadas ao avatar da entrada;
- todo ativo deve funcionar localmente, sem download em tempo de execução;
- quando não houver marca apropriada, usar um ícone semântico — nunca inventar um logotipo;
- nomes e marcas pertencem aos respectivos titulares e são usados apenas para identificação visual das fixtures.

O componente de referência é [`EntryLogo`](../src/components/common/entry-logo.tsx).

## 9. Conteúdo e segurança

A interface nunca deve criar confiança apenas pela aparência. Mensagens precisam distinguir:

- dado fictício de credencial real;
- sessão em memória de persistência;
- bloqueio simulado de proteção criptográfica;
- tentativa de limpeza do clipboard de garantia do sistema operacional.

Termos preferidos: “simulado”, “somente em memória”, “sem persistência”, “protótipo” e “quando a plataforma permitir”. Evitar afirmações como “100% seguro”, “proteção garantida” ou “impossível de acessar”.

## 10. Interação e movimento

- transições devem ser curtas e funcionais;
- nenhum dado sensível deve aparecer em animações decorativas;
- `prefers-reduced-motion` desativa movimento não essencial;
- ações destrutivas devem ser separadas visualmente das ações comuns;
- feedback de cópia deve informar também o comportamento de limpeza.

## 11. Acessibilidade

- preservar foco visível em todos os controles;
- oferecer nome acessível a botões somente com ícone;
- manter navegação completa por teclado;
- usar texto ou ícone junto da cor para estados;
- verificar contraste nos dois temas antes de alterar tokens;
- respeitar zoom e evitar texto embutido em imagens;
- truncar conteúdo apenas quando o valor completo puder ser acessado no contexto adequado.

## 12. Checklist para novas telas

Antes de aceitar uma interface nova:

- [ ] usa tokens em vez de cores isoladas;
- [ ] reserva azul para identidade, navegação, foco ou informação;
- [ ] preserva verde, âmbar e vermelho para semântica;
- [ ] funciona nos temas escuro e claro;
- [ ] possui estados de hover, foco, disabled, erro e seleção;
- [ ] funciona por teclado;
- [ ] não depende de rede para fontes, logos ou ícones;
- [ ] comunica honestamente qualquer limitação de segurança;
- [ ] inclui teste ou verificação visual proporcional ao impacto;
- [ ] atualiza este documento quando introduz um novo padrão.

## 13. Referência visual

![Dashboard do MyVault no M0](references/myvault-m0-preview.png)

A imagem acima é a referência visual do M0. O código e os tokens são a fonte de verdade quando houver divergência.
