# Instruções para Contribuidores com IA

RepoHealth é uma CLI sem dependências externas em runtime, com uma interface gráfica local servida pelo próprio Node.js. Mantenha o projeto simples, legível e seguro para rodar em repositórios arbitrários.

## Fluxo de desenvolvimento

- Prefira módulos nativos do Node.js em vez de novas dependências.
- Não sobrescreva arquivos do usuário no `fix`.
- Adicione ou atualize testes quando o comportamento mudar.
- Mantenha a saída da CLI concisa e amigável para automação.
- A interface deve funcionar bem em desktop e mobile.

## Caminhos importantes

- `src/cli.mjs`: parsing de comandos e entrada da CLI
- `src/checks.mjs`: checks de saúde do repositório
- `src/fix.mjs`: templates de arquivos gerados
- `src/i18n.mjs`: textos em português e inglês
- `src/output.mjs`: saída textual da CLI
- `src/scan.mjs`: cálculo de nota
- `src/ui.mjs`: servidor e interface gráfica local
- `test/scan.test.mjs`: testes principais de comportamento
