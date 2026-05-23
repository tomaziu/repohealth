import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".rb",
  ".go",
  ".rs",
  ".java",
  ".kt",
  ".php",
  ".cs",
  ".swift",
  ".md",
  ".json",
  ".yml",
  ".yaml",
  ".toml",
  ".ini",
  ".env",
  ".txt",
]);

export const CHECKS = [
  {
    id: "readme",
    title: "README",
    weight: 16,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, ["README.md", "readme.md"]);
      if (!file) {
        return fail("readme.missing");
      }

      const content = readText(file);
      const sections = [
        hasAnyHeading(content, ["installation", "install", "instalacao", "instalação"]),
        hasAnyHeading(content, ["usage", "quick start", "uso", "como usar"]),
        hasAnyHeading(content, ["contributing", "contribuicao", "contribuição"]),
      ].filter(Boolean).length;

      if (content.trim().length < 300) {
        return warn("readme.short");
      }

      if (sections < 2) {
        return warn("readme.missing_sections");
      }

      return pass("readme.pass");
    },
  },
  {
    id: "license",
    title: "License",
    weight: 10,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, ["LICENSE", "LICENSE.md", "license", "license.md"]);
      return file
        ? pass("license.pass")
        : fail("license.missing");
    },
  },
  {
    id: "gitignore",
    title: ".gitignore",
    weight: 8,
    fixable: true,
    run: (repo) => {
      return exists(repo.root, ".gitignore")
        ? pass("gitignore.pass")
        : fail("gitignore.missing");
    },
  },
  {
    id: "package-metadata",
    title: "Package metadata",
    weight: 8,
    fixable: false,
    run: (repo) => {
      const packagePath = path.join(repo.root, "package.json");
      if (!existsSync(packagePath)) {
        return skip("package_metadata.skip");
      }

      const pkg = readJson(packagePath);
      if (!pkg.ok) {
        return fail("package_metadata.invalid");
      }

      const missing = ["name", "description", "license", "repository"].filter((key) => !pkg.value[key]);
      return missing.length === 0
        ? pass("package_metadata.pass")
        : warn("package_metadata.missing", { missing: missing.join(", ") });
    },
  },
  {
    id: "contributing",
    title: "Contributing guide",
    weight: 7,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, ["CONTRIBUTING.md", ".github/CONTRIBUTING.md"]);
      return file
        ? pass("contributing.pass")
        : fail("contributing.missing");
    },
  },
  {
    id: "issue-templates",
    title: "Issue templates",
    weight: 7,
    fixable: true,
    run: (repo) => {
      const dir = path.join(repo.root, ".github", "ISSUE_TEMPLATE");
      if (!existsSync(dir)) {
        return fail("issue_templates.missing");
      }

      const files = safeReaddir(dir).filter((file) => /\.(md|ya?ml)$/i.test(file));
      return files.length > 0
        ? pass("issue_templates.pass")
        : fail("issue_templates.empty");
    },
  },
  {
    id: "pull-request-template",
    title: "Pull request template",
    weight: 7,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, [
        ".github/PULL_REQUEST_TEMPLATE.md",
        ".github/pull_request_template.md",
        "PULL_REQUEST_TEMPLATE.md",
      ]);
      return file
        ? pass("pull_request_template.pass")
        : fail("pull_request_template.missing");
    },
  },
  {
    id: "ci",
    title: "Continuous integration",
    weight: 9,
    fixable: false,
    run: (repo) => {
      const dir = path.join(repo.root, ".github", "workflows");
      if (!existsSync(dir)) {
        return fail("ci.missing");
      }

      const workflows = safeReaddir(dir).filter((file) => /\.(yml|yaml)$/i.test(file));
      return workflows.length > 0
        ? pass("ci.pass")
        : fail("ci.empty");
    },
  },
  {
    id: "tests",
    title: "Tests",
    weight: 10,
    fixable: false,
    run: (repo) => {
      const packagePath = path.join(repo.root, "package.json");
      if (existsSync(packagePath)) {
        const pkg = readJson(packagePath);
        const testScript = pkg.ok && pkg.value.scripts && pkg.value.scripts.test;
        if (testScript && !/no test|echo/i.test(testScript)) {
          return pass("tests.package_script");
        }
      }

      const hasTestDir = ["test", "tests", "__tests__"].some((dir) => exists(repo.root, dir));
      const hasTestFiles = findFiles(repo.root, (file) => /\.(test|spec)\.[cm]?[jt]sx?$/i.test(file), 80).length > 0;
      return hasTestDir || hasTestFiles
        ? pass("tests.files")
        : fail("tests.missing");
    },
  },
  {
    id: "security",
    title: "Security policy",
    weight: 6,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, ["SECURITY.md", ".github/SECURITY.md"]);
      return file
        ? pass("security.pass")
        : fail("security.missing");
    },
  },
  {
    id: "env-example",
    title: "Environment example",
    weight: 5,
    fixable: true,
    run: (repo) => {
      const hasEnv = exists(repo.root, ".env");
      const hasExample = exists(repo.root, ".env.example") || exists(repo.root, ".env.sample");
      if (!hasEnv && !hasExample) {
        return skip("env_example.skip");
      }

      return hasExample
        ? pass("env_example.pass")
        : fail("env_example.missing");
    },
  },
  {
    id: "changelog",
    title: "Changelog",
    weight: 4,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, ["CHANGELOG.md", "HISTORY.md", "RELEASES.md"]);
      return file
        ? pass("changelog.pass")
        : warn("changelog.missing");
    },
  },
  {
    id: "ai-ready",
    title: "AI contributor instructions",
    weight: 3,
    fixable: true,
    run: (repo) => {
      const file = firstExisting(repo.root, [
        "AGENTS.md",
        "CLAUDE.md",
        ".cursorrules",
        ".github/copilot-instructions.md",
      ]);
      return file
        ? pass("ai_ready.pass")
        : warn("ai_ready.missing");
    },
  },
];

export function createRepoContext(root) {
  return {
    root: path.resolve(root),
  };
}

function pass(messageKey, messageValues = {}) {
  return { status: "pass", messageKey, messageValues };
}

function warn(messageKey, messageValues = {}) {
  return { status: "warn", messageKey, messageValues };
}

function fail(messageKey, messageValues = {}) {
  return { status: "fail", messageKey, messageValues };
}

function skip(messageKey, messageValues = {}) {
  return { status: "skip", messageKey, messageValues };
}

function exists(root, relativePath) {
  return existsSync(path.join(root, relativePath));
}

function firstExisting(root, names) {
  for (const name of names) {
    const fullPath = path.join(root, name);
    if (existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

function readText(file) {
  return readFileSync(file, "utf8");
}

function readJson(file) {
  try {
    return { ok: true, value: JSON.parse(readText(file)) };
  } catch (error) {
    return { ok: false, error };
  }
}

function hasHeading(content, heading) {
  const expression = new RegExp(`^#{1,6}\\s+.*\\b${escapeRegExp(heading)}\\b`, "im");
  return expression.test(content);
}

function hasAnyHeading(content, headings) {
  return headings.some((heading) => hasHeading(content, heading));
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function safeReaddir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function findFiles(root, predicate, limit) {
  const results = [];
  const ignored = new Set([".git", "node_modules", "dist", "build", "coverage", ".next", ".turbo"]);

  function walk(dir) {
    if (results.length >= limit) {
      return;
    }

    for (const entry of safeReaddir(dir)) {
      if (ignored.has(entry)) {
        continue;
      }

      const fullPath = path.join(dir, entry);
      let stats;
      try {
        stats = statSync(fullPath);
      } catch {
        continue;
      }

      if (stats.isDirectory()) {
        walk(fullPath);
      } else if (stats.isFile()) {
        const extension = path.extname(entry);
        if (TEXT_EXTENSIONS.has(extension) && predicate(fullPath)) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(root);
  return results;
}
