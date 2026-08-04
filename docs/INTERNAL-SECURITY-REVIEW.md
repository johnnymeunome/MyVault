# Avaliação interna de segurança do MyVault

Este processo permite que o mantenedor e um assistente de IA façam revisões de segurança rigorosas enquanto não existe auditor externo. O resultado é uma **autoavaliação assistida por IA**, nunca uma auditoria independente, certificação ou garantia de ausência de vulnerabilidades.

## Papéis e limitação de independência

- **Mantenedor:** define escopo, autoriza mudanças e aceita riscos.
- **Assistente de IA:** inventaria superfícies, revisa código, executa ferramentas, propõe severidades e verifica correções.
- **Limitação:** ambos participam do desenvolvimento; portanto, autoria, confirmação e classificação não são independentes.

Uma nova sessão ou revisão sem contexto de implementação pode reduzir viés, mas não cria independência organizacional.

## Gate por marco

1. Congelar um commit completo de 40 caracteres e registrar a árvore Git.
2. Confirmar que o worktree está limpo e que o bundle do commit é reproduzível.
3. Comparar arquitetura, modelo de ameaças, ADRs, capabilities, CSP e comandos IPC com o código.
4. Revisar manualmente KDBX, segredos, memória, erros, filesystem, clipboard, rede e persistência.
5. Inventariar dependências, workflows, scripts executáveis, binários, symlinks e permissões.
6. Executar lint, tipos, testes, build, Clippy, rustfmt, testes Rust, audits e CodeQL.
7. Consultar alertas abertos de CodeQL, Dependabot e secret scanning.
8. Registrar cada achado com evidência, severidade, mitigação, responsável e condição de encerramento.
9. Corrigir em PR separada quando a mudança afetar runtime ou dependências.
10. Retestar no commit candidato e publicar o relatório em [`docs/security-reviews`](security-reviews).

O script [`scripts/run-internal-security-gate.ps1`](../scripts/run-internal-security-gate.ps1) automatiza o subconjunto local reproduzível. Checks remotos e inspeção humana continuam obrigatórios.

## Classificação

| Nível         | Tratamento mínimo                                               |
| ------------- | --------------------------------------------------------------- |
| Crítico       | interromper desenvolvimento/release e corrigir imediatamente    |
| Alto          | bloquear merge e qualquer distribuição                          |
| Moderado      | bloquear o target afetado ou registrar mitigação e prazo        |
| Baixo         | registrar, priorizar e adicionar teste quando aplicável         |
| Informacional | documentar controle, limitação ou oportunidade de endurecimento |

Se houver dúvida entre duas severidades, use a maior até que a evidência reduza o impacto ou a explorabilidade.

## Critério de resultado

- **Reprovado:** crítico/alto aberto ou evidência essencial ausente.
- **Condicional:** nenhum crítico/alto, mas existem moderados mitigados, limitações de marco ou targets bloqueados.
- **Aprovado para o marco experimental:** nenhum crítico/alto/moderado aberto e todas as limitações estão coerentes com a UI e a documentação.

Nenhum resultado interno autoriza credenciais reais. Essa decisão exige novo modelo de ameaças, controles de produção, reteste completo e avaliação independente quando ela se tornar viável.

## Formato do relatório

Cada relatório deve declarar:

- commit, árvore, data, marco e plataformas;
- revisores e conflito de independência;
- código e documentos incluídos/excluídos;
- comandos e links imutáveis de CI;
- contagem de achados por severidade;
- achados com status e condições de encerramento;
- controles confirmados e evidências ausentes;
- resultado do gate e usos explicitamente proibidos.
