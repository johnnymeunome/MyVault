# Reteste interno — aleatoriedade do gerador no M1

## Identificação

- **Data:** 2026-08-04
- **Achado retestado:** MV-INT-2026-003
- **Issue:** [#24](https://github.com/johnnymeunome/MyVault/issues/24)
- **Baseline da revisão original:** [`2d1bae0953e684f5af1b1788aa8563ca2cff3c02`](https://github.com/johnnymeunome/MyVault/commit/2d1bae0953e684f5af1b1788aa8563ca2cff3c02)
- **Commit candidato retestado:** [`f7c45c8c84dc69cf46c72db904c4e0230252f307`](https://github.com/johnnymeunome/MyVault/commit/f7c45c8c84dc69cf46c72db904c4e0230252f307)
- **Árvore do commit candidato:** `2b6f792810d3ea9eb04d19b7ad5caab83131cc2c`
- **Revisores:** João Victor, mantenedor; OpenAI Codex, assistência de IA
- **Independência:** inexistente; este documento não é uma auditoria independente
- **Resultado:** **aprovado no escopo definido abaixo**

## Escopo e mudança verificada

O gerador continua usando `crypto.getRandomValues`, mas passa a consumir valores
de 32 bits sob demanda. A conversão para um intervalo menor usa amostragem por
rejeição: valores na cauda que causaria viés por módulo são descartados.

A mesma primitiva é usada para:

- selecionar caracteres, palavras e o sufixo numérico;
- incluir pelo menos um caractere de cada categoria habilitada;
- embaralhar a senha com Fisher–Yates sem redução por módulo.

O texto da interface continua apresentando entropia como **bits estimados** e
**cálculo local**. A estimativa é informativa e não constitui certificação da força
de uma credencial.

## Evidências

| Evidência                                                | Resultado                                                  |
| -------------------------------------------------------- | ---------------------------------------------------------- |
| ESLint com zero warnings                                 | aprovado                                                   |
| TypeScript `typecheck`                                   | aprovado                                                   |
| suíte Vitest completa                                    | 30 testes aprovados                                        |
| build de produção Vite                                   | aprovado                                                   |
| 128 senhas determinísticas com quatro categorias         | todas contêm maiúscula, minúscula, número e símbolo        |
| valor `0xffffffff` para intervalo de tamanho 3           | rejeitado antes de aceitar a amostra seguinte              |
| amostra determinística de 30.000 índices em três classes | cada classe ficou dentro da tolerância registrada no teste |
| seleção de palavras e número                             | usa a mesma função de amostragem por rejeição              |

## Limitações

- o teste de distribuição é uma verificação de sanidade determinística, não uma
  bateria estatística ou certificação criptográfica;
- a estimativa de entropia não modela todos os detalhes da política de categorias;
- valores e estado aleatório existem em memória JavaScript sem garantia de
  zeroização;
- os gates gerais de produção do MyVault continuam pendentes.

## Decisão

MV-INT-2026-003 está **corrigido no código do MyVault** no commit candidato e pode
ser encerrado após a integração da mudança e a aprovação dos checks obrigatórios.

Esta decisão não autoriza credenciais reais. O M1 permanece experimental e limitado
a dados demonstrativos até a conclusão dos demais gates de segurança.
