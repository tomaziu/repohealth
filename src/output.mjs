import { DEFAULT_LANGUAGE, t } from "./i18n.mjs";

export function printScan(result, options = {}) {
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("");
  console.log(`${t(result.language, "cli.score")}: ${result.score}/100 (${result.grade})`);
  console.log(`${t(result.language, "cli.path")}: ${result.root}`);
  console.log("");

  for (const check of result.checks) {
    const label = t(result.language, `status.${check.status}`);
    console.log(`${label.padEnd(8)} ${check.title}`);
    console.log(`     ${check.message}`);
  }

  console.log("");
  console.log(t(result.language, "cli.summary", result.summary));
}

export function printFixes(changes, options = {}) {
  const language = options.lang || options.language || DEFAULT_LANGUAGE;
  if (options.json) {
    console.log(JSON.stringify({ changes }, null, 2));
    return;
  }

  if (changes.length === 0) {
    console.log(t(language, "cli.no_fixes"));
    return;
  }

  console.log("");
  for (const change of changes) {
    const detail = change.reasonKey ? ` (${t(language, change.reasonKey)})` : "";
    console.log(`${t(language, `action.${change.action}`).padEnd(12)} ${change.file}${detail}`);
  }
}

export function printHelp(language = DEFAULT_LANGUAGE) {
  console.log(t(language, "help.text"));
}
