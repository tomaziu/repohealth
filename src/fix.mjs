import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const CURRENT_YEAR = new Date().getFullYear();

export const FIXERS = [
  {
    checkId: "readme",
    file: "README.md",
    content: (repo) => readmeTemplate(repo),
  },
  {
    checkId: "license",
    file: "LICENSE",
    content: () => mitLicenseTemplate(),
  },
  {
    checkId: "gitignore",
    file: ".gitignore",
    content: () => gitignoreTemplate(),
  },
  {
    checkId: "contributing",
    file: "CONTRIBUTING.md",
    content: () => contributingTemplate(),
  },
  {
    checkId: "issue-templates",
    file: ".github/ISSUE_TEMPLATE/bug_report.md",
    content: () => bugReportTemplate(),
  },
  {
    checkId: "issue-templates",
    file: ".github/ISSUE_TEMPLATE/feature_request.md",
    content: () => featureRequestTemplate(),
  },
  {
    checkId: "pull-request-template",
    file: ".github/PULL_REQUEST_TEMPLATE.md",
    content: () => pullRequestTemplate(),
  },
  {
    checkId: "security",
    file: "SECURITY.md",
    content: () => securityTemplate(),
  },
  {
    checkId: "env-example",
    file: ".env.example",
    content: () => envExampleTemplate(),
  },
  {
    checkId: "changelog",
    file: "CHANGELOG.md",
    content: () => changelogTemplate(),
  },
  {
    checkId: "ai-ready",
    file: "AGENTS.md",
    content: () => agentsTemplate(),
  },
];

export function applyFixes(root, scanResult, options = {}) {
  const repo = {
    root: path.resolve(root),
    name: path.basename(path.resolve(root)),
    language: scanResult.language,
  };
  const failedOrWarned = new Set(
    scanResult.checks
      .filter((check) => check.status === "fail" || check.status === "warn")
      .map((check) => check.id),
  );

  const changes = [];
  for (const fixer of FIXERS) {
    if (!failedOrWarned.has(fixer.checkId)) {
      continue;
    }

    const fullPath = path.join(repo.root, fixer.file);
    if (existsSync(fullPath)) {
      changes.push({ file: fixer.file, action: "skipped", reasonKey: "reason.already_exists" });
      continue;
    }

    changes.push({ file: fixer.file, action: options.dryRun ? "would-create" : "created" });

    if (!options.dryRun) {
      mkdirSync(path.dirname(fullPath), { recursive: true });
      writeFileSync(fullPath, fixer.content(repo), "utf8");
    }
  }

  return changes;
}

function titleFromName(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function readmeTemplate(repo) {
  const title = titleFromName(repo.name) || "Nome Do Projeto";
  return `# ${title}

Descrição curta do que este projeto faz e quem ele ajuda.

## Por que existe

Explique o problema que este projeto resolve, o público que ele atende e o que torna ele útil.

## Funcionalidades

- Funcionalidade prática um
- Funcionalidade prática dois
- Funcionalidade prática três

## Instalação

\`\`\`bash
# Adicione os passos de instalação aqui
\`\`\`

## Uso

\`\`\`bash
# Adicione o menor exemplo útil aqui
\`\`\`

## Desenvolvimento

\`\`\`bash
# Adicione comandos de setup local aqui
\`\`\`

## Contribuição

Contribuições são bem-vindas. Leia [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir um pull request.

## Licença

Este projeto usa a licença MIT. Veja [LICENSE](LICENSE) para detalhes.
`;
}

function mitLicenseTemplate() {
  return `MIT License

Copyright (c) ${CURRENT_YEAR}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

function gitignoreTemplate() {
  return `# Dependências
node_modules/

# Saída de build
dist/
build/
coverage/

# Arquivos de ambiente
.env
.env.local
!.env.example

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# OS and editors
.DS_Store
Thumbs.db
.idea/
.vscode/
`;
}

function contributingTemplate() {
  return `# Contribuição

Obrigado por separar um tempo para contribuir.

## Antes de começar

- Procure issues e pull requests existentes primeiro.
- Mantenha mudanças focadas e fáceis de revisar.
- Inclua testes ou exemplos quando o comportamento mudar.

## Desenvolvimento local

1. Faça fork e clone do repositório.
2. Instale as dependências.
3. Crie uma branch para sua mudança.
4. Rode os testes antes de abrir um pull request.

## Pull requests

Descreva o problema, a solução e qualquer decisão importante. Capturas de tela ou saída do terminal ajudam em mudanças visíveis para usuários.
`;
}

function bugReportTemplate() {
  return `---
name: Relato de bug
about: Reporte algo que está quebrado
title: "[Bug]: "
labels: bug
assignees: ""
---

## O que aconteceu?

Descreva o bug com clareza.

## Passos para reproduzir

1. 
2. 
3. 

## Comportamento esperado

O que você esperava que acontecesse?

## Ambiente

- OS:
- Versão:
- Runtime:

## Contexto extra

Adicione prints, logs ou links se ajudar.
`;
}

function featureRequestTemplate() {
  return `---
name: Pedido de melhoria
about: Sugira uma melhoria
title: "[Feature]: "
labels: enhancement
assignees: ""
---

## Problema

Que problema isso resolveria?

## Solução proposta

Descreva a mudança que você gostaria.

## Alternativas

O que você tentou ou considerou?

## Contexto extra

Adicione exemplos, links ou prints se ajudar.
`;
}

function pullRequestTemplate() {
  return `## Resumo

- 

## Checklist

- [ ] Testei esta mudança localmente.
- [ ] Atualizei a documentação quando necessário.
- [ ] Mantive a mudança focada e fácil de revisar.

## Notas para revisão

Adicione algo que revisores devem observar com atenção.
`;
}

function securityTemplate() {
  return `# Política de Segurança

## Reportando uma vulnerabilidade

Não abra uma issue pública para vulnerabilidades de segurança.

Envie uma mensagem privada aos mantenedores ou use o relatório privado de vulnerabilidades do GitHub, se estiver habilitado. Inclua:

- Uma descrição clara do problema
- Passos para reproduzir
- Impacto e versões afetadas
- Sugestão de correção, se houver

Vamos confirmar o recebimento e coordenar uma correção assim que possível.
`;
}

function envExampleTemplate() {
  return `# Copie este arquivo para .env e preencha os valores locais.
EXAMPLE_API_KEY=
`;
}

function changelogTemplate() {
  return `# Changelog

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

## Não lançado

- Configuração inicial do projeto.
`;
}

function agentsTemplate() {
  return `# Instruções para Contribuidores com IA

Use este arquivo para ajudar ferramentas de IA a entender como trabalhar neste repositório.

## Objetivo do projeto

Descreva o que o projeto faz e quem ele ajuda.

## Fluxo de desenvolvimento

- Mantenha mudanças focadas.
- Siga o estilo existente.
- Rode testes antes de finalizar mudanças.
- Atualize a documentação quando o comportamento mudar.

## Caminhos importantes

- Adicione aqui caminhos importantes de código, testes e documentação.

## Restrições

- Não faça commit de segredos.
- Não sobrescreva dados do usuário.
- Prefira pull requests pequenos e fáceis de revisar.
`;
}
