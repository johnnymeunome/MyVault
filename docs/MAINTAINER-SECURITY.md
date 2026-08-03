# Segurança para revisão de contribuições

Este guia reduz o risco de executar código malicioso recebido por pull request. Um repositório público não executa código no computador do mantenedor por si só; o risco começa quando uma contribuição desconhecida é baixada e executada com acesso ao ambiente local.

## Ordem segura de revisão

1. Leia todo o diff pelo GitHub antes de baixar a branch.
2. Examine primeiro arquivos capazes de alterar execução ou dependências:
   - `.github/workflows/**`;
   - `package.json`, `package-lock.json` e `.npmrc`;
   - `Cargo.toml`, `Cargo.lock`, `build.rs` e `.cargo/**`;
   - scripts, configurações do Tauri e permissões nativas;
   - `.vscode/**`, submódulos, links simbólicos, binários e arquivos gerados.
3. Não aprove a execução de workflow de um fork antes de revisar qualquer mudança em Actions, scripts e dependências.
4. Prefira os runners hospedados pelo GitHub. Não conecte runner próprio a pull requests públicos.
5. Só faça checkout local quando o diff estiver compreendido.

## Quando for necessário executar a contribuição

Use uma VM, container descartável ou Windows Sandbox sem:

- diretório pessoal montado;
- tokens GitHub, chaves SSH/GPG ou credenciais de nuvem;
- gerenciador de credenciais do host;
- variáveis de ambiente sensíveis;
- privilégios de administrador.

Faça a primeira inspeção de dependências npm com `npm ci --ignore-scripts`. Isso não substitui o sandbox: testes, builds, scripts npm, `build.rs` e macros Rust ainda devem ser tratados como código arbitrário.

Restrinja ou desative a rede quando a tarefa não precisar baixar dependências. Descarte o ambiente após a validação.

## Sinais que exigem revisão adicional

- lockfile alterado sem mudança correspondente no manifesto;
- dependência nova com nome semelhante ao de um pacote conhecido;
- download ou execução de binários durante instalação ou build;
- Action trocada, nova permissão de workflow ou uso de secrets;
- conteúdo ofuscado, arquivos binários, submódulos ou links simbólicos inesperados;
- expansão de CSP, permissões Tauri, filesystem, rede, clipboard ou keychain;
- remoção de testes, limites, redação de erros ou limpeza de sessão.

Não execute uma contribuição para descobrir o que ela faz. Quando a intenção não estiver clara no diff, peça explicação ou rejeite a mudança.

## Controles do repositório

- `main` deve aceitar mudanças somente por pull request com CI obrigatório;
- Actions devem usar SHA completo e token com privilégio mínimo;
- Dependabot e CodeQL devem permanecer ativos;
- relatos de vulnerabilidade devem usar o canal privado descrito em [`SECURITY.md`](../SECURITY.md);
- mudanças sensíveis devem atualizar o modelo de ameaças e receber uma decisão arquitetural antes do código.
