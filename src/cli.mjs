#!/usr/bin/env node
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { applyFixes } from "./fix.mjs";
import { DEFAULT_LANGUAGE, resolveLanguage, t } from "./i18n.mjs";
import { printFixes, printHelp, printScan } from "./output.mjs";
import { scanRepository } from "./scan.mjs";
import { startUiServer } from "./ui.mjs";

if (isDirectRun()) {
  const { command, args } = parseCommand(process.argv.slice(2));
  main(command, args).catch((error) => {
    const language = parseLanguageOption(args);
    console.error(`${t(language, "cli.error")}: ${error.message}`);
    process.exitCode = 1;
  });
}

export async function main(command, args) {
  const language = parseLanguageOption(args);

  if (command === "help") {
    printHelp(language);
    return;
  }

  if (command === "version") {
    console.log(await readVersion());
    return;
  }

  const options = parseOptions(args);
  const target = resolveTarget(options.path, options.lang);

  if (command === "scan") {
    const result = scanRepository(target, { lang: options.lang });
    printScan(result, options);

    if (typeof options.minScore === "number" && result.score < options.minScore) {
      process.exitCode = 2;
    }
    return;
  }

  if (command === "fix" || command === "init") {
    const before = scanRepository(target, { lang: options.lang });
    const changes = applyFixes(target, before, { dryRun: options.dryRun });
    printFixes(changes, options);

    if (!options.dryRun && !options.json) {
      const after = scanRepository(target, { lang: options.lang });
      console.log("");
      console.log(`${t(options.lang, "cli.new_score")}: ${after.score}/100 (${after.grade})`);
    }
    return;
  }

  if (command === "ui" || command === "gui") {
    const server = await startUiServer({
      root: target,
      host: options.host,
      port: options.port,
      lang: options.lang,
      open: options.open,
    });
    console.log(t(options.lang, "cli.ui_started", { url: server.url }));
    return;
  }

  throw new Error(t(language, "cli.unknown_command", { command }));
}

export function parseCommand(rawArgs) {
  const args = [...rawArgs];
  const command = normalizeCommand(args.shift(), args);
  return { command, args };
}

function normalizeCommand(command, args) {
  if (!command || command.startsWith("-")) {
    if (command) {
      args.unshift(command);
    }
    return "scan";
  }

  return command;
}

function parseOptions(rawArgs) {
  const options = {
    path: ".",
    json: false,
    dryRun: false,
    lang: DEFAULT_LANGUAGE,
    minScore: null,
    host: "127.0.0.1",
    port: 4789,
    open: true,
  };

  for (let index = 0; index < rawArgs.length; index += 1) {
    const arg = rawArgs[index];

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }

    if (arg === "--no-open") {
      options.open = false;
      continue;
    }

    if (arg === "--lang") {
      options.lang = resolveLanguage(rawArgs[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--lang=")) {
      options.lang = resolveLanguage(arg.slice("--lang=".length));
      continue;
    }

    if (arg === "--min-score") {
      const value = Number(rawArgs[index + 1]);
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        throw new Error(t(options.lang, "cli.min_score_invalid"));
      }
      options.minScore = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--min-score=")) {
      const value = Number(arg.split("=")[1]);
      if (!Number.isInteger(value) || value < 0 || value > 100) {
        throw new Error(t(options.lang, "cli.min_score_invalid"));
      }
      options.minScore = value;
      continue;
    }

    if (arg === "--port") {
      const value = Number(rawArgs[index + 1]);
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new Error(t(options.lang, "cli.port_invalid"));
      }
      options.port = value;
      index += 1;
      continue;
    }

    if (arg.startsWith("--port=")) {
      const value = Number(arg.slice("--port=".length));
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new Error(t(options.lang, "cli.port_invalid"));
      }
      options.port = value;
      continue;
    }

    if (arg === "--host") {
      options.host = rawArgs[index + 1] || options.host;
      index += 1;
      continue;
    }

    if (arg.startsWith("--host=")) {
      options.host = arg.slice("--host=".length) || options.host;
      continue;
    }

    if (arg.startsWith("-")) {
      throw new Error(t(options.lang, "cli.unknown_option", { option: arg }));
    }

    options.path = arg;
  }

  return options;
}

function resolveTarget(target, language) {
  const fullPath = path.resolve(target);
  if (!existsSync(fullPath)) {
    throw new Error(t(language, "cli.path_missing", { path: fullPath }));
  }

  if (!statSync(fullPath).isDirectory()) {
    throw new Error(t(language, "cli.path_not_directory", { path: fullPath }));
  }

  return fullPath;
}

function parseLanguageOption(rawArgs) {
  const langIndex = rawArgs.findIndex((arg) => arg === "--lang");
  if (langIndex >= 0 && rawArgs[langIndex + 1]) {
    return resolveLanguage(rawArgs[langIndex + 1]);
  }

  const inline = rawArgs.find((arg) => arg.startsWith("--lang="));
  if (inline) {
    return resolveLanguage(inline.slice("--lang=".length));
  }

  return DEFAULT_LANGUAGE;
}

async function readVersion() {
  const cliPath = fileURLToPath(import.meta.url);
  const packagePath = path.join(path.dirname(cliPath), "..", "package.json");
  const { readFile } = await import("node:fs/promises");
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  return pkg.version;
}

function isDirectRun() {
  if (typeof process === "undefined" || !process.argv?.[1]) {
    return false;
  }

  return process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
}
