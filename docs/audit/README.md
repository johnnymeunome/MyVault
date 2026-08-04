# Pacote de auditoria

Esta pasta contém os modelos usados para congelar e conduzir uma auditoria independente do MyVault. Eles não representam uma auditoria concluída.

Enquanto não existe auditor externo, use o processo separado de [avaliação interna](../INTERNAL-SECURITY-REVIEW.md). Uma autoavaliação não deve preencher ou publicar estes modelos como se houvesse independência.

## Conteúdo

- [`SCOPE-TEMPLATE.md`](SCOPE-TEMPLATE.md): contrato técnico e fronteiras do trabalho;
- [`EVIDENCE-CHECKLIST.md`](EVIDENCE-CHECKLIST.md): materiais exigidos antes do kickoff;
- [`FINDING-TEMPLATE.md`](FINDING-TEMPLATE.md): formato mínimo de cada achado;
- [`RETEST-TEMPLATE.md`](RETEST-TEMPLATE.md): validação das correções e do delta;
- [`PUBLIC-SUMMARY-TEMPLATE.md`](PUBLIC-SUMMARY-TEMPLATE.md): divulgação sem promessas excessivas.

## Gerar um snapshot reproduzível

No Windows PowerShell, a partir do repositório:

```powershell
powershell.exe -File scripts/build-audit-bundle.ps1 `
  -Commit <sha-de-40-caracteres> `
  -OutputDirectory .\audit-artifacts
```

O script resolve o commit, recusa sobrescrever um bundle existente e cria:

```text
audit-artifacts/myvault-audit-<sha-curto>/
├── BUNDLE-METADATA.json
├── BUNDLE-SHA256SUMS.txt
├── SOURCE-TREE.txt
└── myvault-source-<sha-curto>.tar
```

O tar vem diretamente de `git archive`; não inclui worktree sujo, `node_modules`, builds, variáveis de ambiente, tokens ou arquivos não versionados. Metadados usam somente valores derivados do commit e identificadores públicos do projeto.

Para provar reprodutibilidade, gere o mesmo SHA em dois diretórios vazios e compare `BUNDLE-SHA256SUMS.txt`. Diferença exige investigação antes de entregar o material.

## Entrega ao auditor

Forneça o bundle junto com:

- links imutáveis dos workflows executados para o commit;
- SBOM e artefatos assinados quando o gate de release existir;
- declaração de escopo preenchida;
- checklist de evidências preenchido;
- canal privado para achados;
- instruções para usar somente fixtures públicas.

Não envie cofres reais, dumps de memória, tokens, arquivos pessoais ou um ambiente de desenvolvimento com credenciais.
