import path from "node:path";
import { FIXERS } from "./fix.mjs";
import { resolveLanguage } from "./i18n.mjs";

const STATUS = {
  en: {
    pass: "Pass",
    warn: "Warning",
    fail: "Fail",
    skip: "Skipped",
  },
  "pt-BR": {
    pass: "OK",
    warn: "Aviso",
    fail: "Falha",
    skip: "Ignorado",
  },
};

export function createReport(scanResult, options = {}) {
  const language = resolveLanguage(options.lang || scanResult.language);
  return language === "en" ? createEnglishReport(scanResult) : createPortugueseReport(scanResult);
}

export function reportFileName(root) {
  const repoName = path.basename(root || "repositorio")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return `${repoName || "repositorio"}-repohealth-report.md`;
}

function createPortugueseReport(result) {
  const failures = result.checks.filter((check) => check.status === "fail");
  const warnings = result.checks.filter((check) => check.status === "warn");
  const skipped = result.checks.filter((check) => check.status === "skip");
  const improvements = [...failures, ...warnings];
  const safeFiles = safeFilesFor(improvements);

  return normalizeMarkdown(`# Relatório RepoHealth

Gerado em: ${new Date().toISOString()}

## Resumo

- Repositório analisado: \`${result.root}\`
- Nota: **${result.score}/100 (${result.grade})**
- Checks OK: **${result.summary.pass}**
- Avisos: **${result.summary.warn}**
- Falhas: **${result.summary.fail}**
- Ignorados: **${result.summary.skip}**

## Prioridades

${priorityList(failures, "Alta", "Nenhuma falha crítica encontrada.")}

${priorityList(warnings, "Média", "Nenhum aviso encontrado.")}

## Arquivos que podem ser criados automaticamente

${safeFiles.length > 0 ? safeFiles.map((file) => `- \`${file}\``).join("\n") : "Nenhum arquivo de template seguro foi sugerido."}

Para ver a prévia antes de aplicar:

\`\`\`bash
repohealth fix "${result.root}" --dry-run
\`\`\`

Para criar os arquivos sugeridos:

\`\`\`bash
repohealth fix "${result.root}"
\`\`\`

## Todos os checks

| Status | Check | Mensagem |
| --- | --- | --- |
${result.checks.map((check) => `| ${STATUS["pt-BR"][check.status]} | ${escapeTable(check.title)} | ${escapeTable(check.message)} |`).join("\n")}

## Checks ignorados

${skipped.length > 0 ? skipped.map((check) => `- **${check.title}:** ${check.message}`).join("\n") : "Nenhum check foi ignorado."}

## Prompt para IA

Copie o bloco abaixo e cole em uma IA junto com o contexto do seu projeto:

~~~text
Atue como uma pessoa especialista em open source, documentação e qualidade de repositórios.

Tenho um projeto com este relatório do RepoHealth:

Nota: ${result.score}/100 (${result.grade})
Repositório: ${result.root}
Falhas: ${result.summary.fail}
Avisos: ${result.summary.warn}

Principais pontos para melhorar:
${improvements.length > 0 ? improvements.map((check) => `- ${check.title}: ${check.message}`).join("\n") : "- Nenhum ponto crítico encontrado. Sugira melhorias finas de documentação, testes e onboarding."}

Quero que você me ajude a melhorar este repositório sem quebrar o projeto.
Primeiro gere um plano curto por prioridade.
Depois sugira textos prontos para README, CONTRIBUTING, SECURITY, CHANGELOG ou testes quando fizer sentido.
Se precisar alterar código, explique quais arquivos devem mudar e por quê.
~~~

## Próximos passos recomendados

1. Corrija primeiro os itens marcados como falha.
2. Rode o RepoHealth novamente para comparar a nota.
3. Complete manualmente o README e os testes, porque eles dependem do comportamento real do projeto.
4. Use este relatório como base para abrir uma issue ou pedir ajuda a uma IA.
`);
}

function createEnglishReport(result) {
  const failures = result.checks.filter((check) => check.status === "fail");
  const warnings = result.checks.filter((check) => check.status === "warn");
  const skipped = result.checks.filter((check) => check.status === "skip");
  const improvements = [...failures, ...warnings];
  const safeFiles = safeFilesFor(improvements);

  return normalizeMarkdown(`# RepoHealth Report

Generated at: ${new Date().toISOString()}

## Summary

- Repository: \`${result.root}\`
- Score: **${result.score}/100 (${result.grade})**
- Passed checks: **${result.summary.pass}**
- Warnings: **${result.summary.warn}**
- Failed checks: **${result.summary.fail}**
- Skipped checks: **${result.summary.skip}**

## Priorities

${priorityList(failures, "High", "No critical failures found.")}

${priorityList(warnings, "Medium", "No warnings found.")}

## Files that can be created automatically

${safeFiles.length > 0 ? safeFiles.map((file) => `- \`${file}\``).join("\n") : "No safe template files were suggested."}

Preview before applying:

\`\`\`bash
repohealth fix "${result.root}" --dry-run
\`\`\`

Create suggested files:

\`\`\`bash
repohealth fix "${result.root}"
\`\`\`

## All checks

| Status | Check | Message |
| --- | --- | --- |
${result.checks.map((check) => `| ${STATUS.en[check.status]} | ${escapeTable(check.title)} | ${escapeTable(check.message)} |`).join("\n")}

## Skipped checks

${skipped.length > 0 ? skipped.map((check) => `- **${check.title}:** ${check.message}`).join("\n") : "No checks were skipped."}

## AI prompt

Copy the block below into an AI assistant together with your project context:

~~~text
Act as an expert in open source, documentation, and repository quality.

I have a project with this RepoHealth report:

Score: ${result.score}/100 (${result.grade})
Repository: ${result.root}
Failures: ${result.summary.fail}
Warnings: ${result.summary.warn}

Main improvements:
${improvements.length > 0 ? improvements.map((check) => `- ${check.title}: ${check.message}`).join("\n") : "- No critical issue found. Suggest small improvements for documentation, tests, and onboarding."}

Help me improve this repository without breaking the project.
First create a short priority plan.
Then suggest ready-to-use text for README, CONTRIBUTING, SECURITY, CHANGELOG, or tests when useful.
If code changes are needed, explain which files should change and why.
~~~

## Recommended next steps

1. Fix failed checks first.
2. Run RepoHealth again to compare the score.
3. Complete README and tests manually because they depend on the real project behavior.
4. Use this report as a base for an issue or for asking an AI assistant for help.
`);
}

function priorityList(checks, label, emptyText) {
  if (checks.length === 0) {
    return `### ${label}\n\n${emptyText}`;
  }

  return `### ${label}\n\n${checks.map((check) => `- **${check.title}:** ${check.message}`).join("\n")}`;
}

function safeFilesFor(checks) {
  const ids = new Set(checks.map((check) => check.id));
  const files = FIXERS.filter((fixer) => ids.has(fixer.checkId)).map((fixer) => fixer.file);
  return [...new Set(files)];
}

function escapeTable(value) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function normalizeMarkdown(value) {
  return `${value.trim()}\n`;
}
