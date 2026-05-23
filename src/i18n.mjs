export const DEFAULT_LANGUAGE = "pt-BR";

const LANGUAGE_ALIASES = {
  en: "en",
  "en-us": "en",
  "en_US": "en",
  pt: "pt-BR",
  "pt-br": "pt-BR",
  "pt_BR": "pt-BR",
  "pt-BR": "pt-BR",
};

const CHECK_TITLES = {
  en: {
    readme: "README",
    license: "License",
    gitignore: ".gitignore",
    "package-metadata": "Package metadata",
    contributing: "Contributing guide",
    "issue-templates": "Issue templates",
    "pull-request-template": "Pull request template",
    ci: "Continuous integration",
    tests: "Tests",
    security: "Security policy",
    "env-example": "Environment example",
    changelog: "Changelog",
    "ai-ready": "AI contributor instructions",
  },
  "pt-BR": {
    readme: "README",
    license: "Licença",
    gitignore: ".gitignore",
    "package-metadata": "Metadados do pacote",
    contributing: "Guia de contribuição",
    "issue-templates": "Templates de issue",
    "pull-request-template": "Template de pull request",
    ci: "Integração contínua",
    tests: "Testes",
    security: "Política de segurança",
    "env-example": "Exemplo de ambiente",
    changelog: "Changelog",
    "ai-ready": "Instruções para IA",
  },
};

const DICTIONARY = {
  en: {
    "readme.missing": "Add a README.md that explains what the project does, how to install it, and how to use it.",
    "readme.short": "README.md exists, but it is very short. Add setup, usage, examples, and contribution notes.",
    "readme.missing_sections":
      "README.md exists, but it is missing common sections such as installation, usage, or contributing.",
    "readme.pass": "README.md is present and reasonably informative.",
    "license.pass": "A license file is present.",
    "license.missing": "Add a license so people know how they can use your project.",
    "gitignore.pass": ".gitignore is present.",
    "gitignore.missing": "Add a .gitignore to keep generated files, secrets, and local noise out of Git.",
    "package_metadata.skip": "No package.json found. This check applies to JavaScript and TypeScript packages.",
    "package_metadata.invalid": "package.json could not be parsed.",
    "package_metadata.pass": "package.json includes core publishing metadata.",
    "package_metadata.missing": "package.json is missing: {missing}.",
    "contributing.pass": "A contributing guide is present.",
    "contributing.missing": "Add CONTRIBUTING.md so new contributors know how to help.",
    "issue_templates.missing": "Add issue templates for bug reports and feature requests.",
    "issue_templates.pass": "Issue templates are present.",
    "issue_templates.empty": "The issue template directory exists, but no template files were found.",
    "pull_request_template.pass": "A pull request template is present.",
    "pull_request_template.missing": "Add a pull request template to make reviews easier.",
    "ci.missing": "Add a GitHub Actions workflow or another CI setup.",
    "ci.pass": "At least one GitHub Actions workflow is present.",
    "ci.empty": "The workflows directory exists, but no workflow files were found.",
    "tests.package_script": "A test script is defined in package.json.",
    "tests.files": "Test files or test directories are present.",
    "tests.missing": "Add tests or a test script so users can trust changes.",
    "security.pass": "A security policy is present.",
    "security.missing": "Add SECURITY.md so people know how to report vulnerabilities responsibly.",
    "env_example.skip": "No .env file detected. Add .env.example if your project needs environment variables.",
    "env_example.pass": ".env.example is present.",
    "env_example.missing": "A .env file exists, but .env.example is missing.",
    "changelog.pass": "A changelog is present.",
    "changelog.missing": "Add CHANGELOG.md when the project starts publishing releases.",
    "ai_ready.pass": "AI contributor instructions are present.",
    "ai_ready.missing": "Add AGENTS.md or similar instructions so AI coding tools understand the project.",
    "cli.score": "RepoHealth score",
    "cli.path": "Path",
    "cli.summary": "Summary: {pass} passed, {warn} warnings, {fail} failed, {skip} skipped.",
    "cli.no_fixes": "RepoHealth did not find any safe template fixes to apply.",
    "cli.new_score": "New score",
    "cli.error": "RepoHealth error",
    "cli.unknown_command": "Unknown command \"{command}\". Run \"repohealth help\" for usage.",
    "cli.path_missing": "Path does not exist: {path}",
    "cli.path_not_directory": "Path is not a directory: {path}",
    "cli.min_score_invalid": "--min-score must be an integer between 0 and 100.",
    "cli.port_invalid": "--port must be an integer between 1 and 65535.",
    "cli.unknown_option": "Unknown option \"{option}\".",
    "cli.ui_started": "RepoHealth UI running at {url}",
    "cli.report_written": "Report written to {path}",
    "action.created": "created",
    "action.would-create": "would-create",
    "action.skipped": "skipped",
    "reason.already_exists": "already exists",
    "status.pass": "OK",
    "status.warn": "WARN",
    "status.fail": "FAIL",
    "status.skip": "SKIP",
    "help.text": `RepoHealth

Usage:
  repohealth scan [path] [--json] [--min-score <number>] [--lang pt-BR|en]
  repohealth fix [path] [--dry-run] [--json] [--lang pt-BR|en]
  repohealth report [path] [--output <file>] [--lang pt-BR|en]
  repohealth ui [path] [--port <number>] [--no-open] [--lang pt-BR|en]
  repohealth help
  repohealth version

Examples:
  repohealth scan
  repohealth scan ../my-project --min-score 80
  repohealth fix --dry-run
  repohealth report --output repohealth-report.md
  repohealth ui ../my-project
`,
  },
  "pt-BR": {
    "readme.missing": "Adicione um README.md explicando o que o projeto faz, como instalar e como usar.",
    "readme.short": "README.md existe, mas está muito curto. Adicione instalação, uso, exemplos e contribuição.",
    "readme.missing_sections":
      "README.md existe, mas faltam seções comuns como instalação, uso ou contribuição.",
    "readme.pass": "README.md está presente e tem informação suficiente.",
    "license.pass": "Um arquivo de licença está presente.",
    "license.missing": "Adicione uma licença para as pessoas saberem como podem usar seu projeto.",
    "gitignore.pass": ".gitignore está presente.",
    "gitignore.missing": "Adicione um .gitignore para evitar arquivos gerados, segredos e ruído local no Git.",
    "package_metadata.skip": "Nenhum package.json encontrado. Este check vale para pacotes JavaScript e TypeScript.",
    "package_metadata.invalid": "Não foi possível ler o package.json.",
    "package_metadata.pass": "package.json inclui os metadados principais de publicação.",
    "package_metadata.missing": "package.json está sem: {missing}.",
    "contributing.pass": "Um guia de contribuição está presente.",
    "contributing.missing": "Adicione CONTRIBUTING.md para novos contribuidores saberem como ajudar.",
    "issue_templates.missing": "Adicione templates de issue para bugs e pedidos de melhoria.",
    "issue_templates.pass": "Templates de issue estão presentes.",
    "issue_templates.empty": "A pasta de templates existe, mas nenhum arquivo de template foi encontrado.",
    "pull_request_template.pass": "Um template de pull request está presente.",
    "pull_request_template.missing": "Adicione um template de pull request para facilitar revisões.",
    "ci.missing": "Adicione um workflow do GitHub Actions ou outra configuração de CI.",
    "ci.pass": "Pelo menos um workflow do GitHub Actions está presente.",
    "ci.empty": "A pasta de workflows existe, mas nenhum arquivo de workflow foi encontrado.",
    "tests.package_script": "Um script de teste está definido no package.json.",
    "tests.files": "Arquivos ou pastas de teste estão presentes.",
    "tests.missing": "Adicione testes ou um script de teste para aumentar a confiança nas mudanças.",
    "security.pass": "Uma política de segurança está presente.",
    "security.missing": "Adicione SECURITY.md para as pessoas saberem como reportar vulnerabilidades com cuidado.",
    "env_example.skip": "Nenhum .env detectado. Adicione .env.example se o projeto usa variáveis de ambiente.",
    "env_example.pass": ".env.example está presente.",
    "env_example.missing": "Existe um .env, mas falta .env.example.",
    "changelog.pass": "Um changelog está presente.",
    "changelog.missing": "Adicione CHANGELOG.md quando o projeto começar a publicar versões.",
    "ai_ready.pass": "Instruções para contribuidores com IA estão presentes.",
    "ai_ready.missing": "Adicione AGENTS.md ou instruções parecidas para ferramentas de IA entenderem o projeto.",
    "cli.score": "Nota RepoHealth",
    "cli.path": "Caminho",
    "cli.summary": "Resumo: {pass} OK, {warn} avisos, {fail} falhas, {skip} ignorados.",
    "cli.no_fixes": "O RepoHealth não encontrou correções seguras por template para aplicar.",
    "cli.new_score": "Nova nota",
    "cli.error": "Erro do RepoHealth",
    "cli.unknown_command": "Comando desconhecido \"{command}\". Rode \"repohealth help\" para ver o uso.",
    "cli.path_missing": "Caminho não existe: {path}",
    "cli.path_not_directory": "Caminho não é uma pasta: {path}",
    "cli.min_score_invalid": "--min-score precisa ser um número inteiro entre 0 e 100.",
    "cli.port_invalid": "--port precisa ser um número inteiro entre 1 e 65535.",
    "cli.unknown_option": "Opção desconhecida \"{option}\".",
    "cli.ui_started": "Interface do RepoHealth rodando em {url}",
    "cli.report_written": "Relatório salvo em {path}",
    "action.created": "criado",
    "action.would-create": "criaria",
    "action.skipped": "ignorado",
    "reason.already_exists": "já existe",
    "status.pass": "OK",
    "status.warn": "AVISO",
    "status.fail": "FALHA",
    "status.skip": "IGNORADO",
    "help.text": `RepoHealth

Uso:
  repohealth scan [caminho] [--json] [--min-score <número>] [--lang pt-BR|en]
  repohealth fix [caminho] [--dry-run] [--json] [--lang pt-BR|en]
  repohealth report [caminho] [--output <arquivo>] [--lang pt-BR|en]
  repohealth ui [caminho] [--port <número>] [--no-open] [--lang pt-BR|en]
  repohealth help
  repohealth version

Exemplos:
  repohealth scan
  repohealth scan ../meu-projeto --min-score 80
  repohealth fix --dry-run
  repohealth report --output repohealth-report.md
  repohealth ui ../meu-projeto
`,
  },
};

export function resolveLanguage(language) {
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  return LANGUAGE_ALIASES[language] || LANGUAGE_ALIASES[String(language).toLowerCase()] || DEFAULT_LANGUAGE;
}

export function titleForCheck(checkId, language = DEFAULT_LANGUAGE) {
  const resolved = resolveLanguage(language);
  return CHECK_TITLES[resolved]?.[checkId] || CHECK_TITLES.en[checkId] || checkId;
}

export function t(language, key, values = {}) {
  const resolved = resolveLanguage(language);
  const template = DICTIONARY[resolved]?.[key] || DICTIONARY.en[key] || key;
  return interpolate(template, values);
}

function interpolate(template, values) {
  return template.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_, key) => String(values[key] ?? ""));
}
