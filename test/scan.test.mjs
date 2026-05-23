import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { parseCommand } from "../src/cli.mjs";
import { applyFixes } from "../src/fix.mjs";
import { createReport, reportFileName } from "../src/report.mjs";
import { scanRepository } from "../src/scan.mjs";

test("scanRepository reports a low score for an empty repository", () => {
  const repo = tempRepo();
  try {
    const result = scanRepository(repo);
    assert.equal(result.summary.fail > 0, true);
    assert.equal(result.score < 50, true);
  } finally {
    cleanup(repo);
  }
});

test("applyFixes creates safe starter files without overwriting existing files", () => {
  const repo = tempRepo();
  try {
    writeFileSync(path.join(repo, "README.md"), "# Existing\n\nThis file should stay untouched.\n", "utf8");

    const before = scanRepository(repo);
    const changes = applyFixes(repo, before);
    const readmeChange = changes.find((change) => change.file === "README.md");

    assert.equal(readmeChange?.action, "skipped");
    assert.equal(changes.some((change) => change.file === "LICENSE" && change.action === "created"), true);
  } finally {
    cleanup(repo);
  }
});

test("a repository with common health files receives a stronger score", () => {
  const repo = tempRepo();
  try {
    writeFileSync(
      path.join(repo, "README.md"),
      "# Healthy Repo\n\nA useful project description with enough detail for users.\n\n## Installation\n\nInstall it.\n\n## Usage\n\nUse it.\n\n## Contributing\n\nHelp improve it.\n",
      "utf8",
    );
    writeFileSync(path.join(repo, "LICENSE"), "MIT\n", "utf8");
    writeFileSync(path.join(repo, ".gitignore"), "node_modules/\n", "utf8");
    writeFileSync(
      path.join(repo, "package.json"),
      JSON.stringify({
        name: "healthy-repo",
        description: "A healthy test repo.",
        license: "MIT",
        repository: "https://example.com/repo",
        scripts: { test: "node --test" },
      }),
      "utf8",
    );
    writeFileSync(path.join(repo, "CONTRIBUTING.md"), "# Contributing\n", "utf8");
    writeFileSync(path.join(repo, "SECURITY.md"), "# Security\n", "utf8");
    writeFileSync(path.join(repo, "CHANGELOG.md"), "# Changelog\n", "utf8");
    writeFileSync(path.join(repo, "AGENTS.md"), "# AI Contributor Instructions\n", "utf8");
    mkdirSync(path.join(repo, ".github", "ISSUE_TEMPLATE"), { recursive: true });
    writeFileSync(path.join(repo, ".github", "ISSUE_TEMPLATE", "bug_report.md"), "# Bug report\n", "utf8");
    writeFileSync(path.join(repo, ".github", "PULL_REQUEST_TEMPLATE.md"), "# Pull request\n", "utf8");
    mkdirSync(path.join(repo, ".github", "workflows"), { recursive: true });
    writeFileSync(path.join(repo, ".github", "workflows", "ci.yml"), "name: CI\n", "utf8");

    const result = scanRepository(repo);
    assert.equal(result.score >= 85, true);
  } finally {
    cleanup(repo);
  }
});

test("parseCommand defaults to scan when the first argument is an option", () => {
  const parsed = parseCommand(["--json"]);
  assert.equal(parsed.command, "scan");
  assert.deepEqual(parsed.args, ["--json"]);
});

test("scanRepository uses pt-BR by default and can switch to English", () => {
  const repo = tempRepo();
  try {
    writeFileSync(path.join(repo, "LICENSE"), "MIT\n", "utf8");

    const pt = scanRepository(repo);
    const en = scanRepository(repo, { lang: "en" });

    assert.equal(pt.language, "pt-BR");
    assert.equal(pt.checks.find((check) => check.id === "license").title, "Licença");
    assert.equal(en.checks.find((check) => check.id === "license").title, "License");
  } finally {
    cleanup(repo);
  }
});

test("createReport produces an AI-ready Markdown report", () => {
  const repo = tempRepo();
  try {
    const result = scanRepository(repo);
    const report = createReport(result);

    assert.match(report, /^# Relatório RepoHealth/m);
    assert.match(report, /## Prompt para IA/);
    assert.match(report, /repohealth fix/);
    assert.equal(reportFileName(repo).endsWith("-repohealth-report.md"), true);
  } finally {
    cleanup(repo);
  }
});

function tempRepo() {
  return mkdtempSync(path.join(os.tmpdir(), "repohealth-"));
}

function cleanup(repo) {
  rmSync(repo, { recursive: true, force: true });
}
