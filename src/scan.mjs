import { CHECKS, createRepoContext } from "./checks.mjs";
import { DEFAULT_LANGUAGE, resolveLanguage, t, titleForCheck } from "./i18n.mjs";

export function scanRepository(root, options = {}) {
  const repo = createRepoContext(root);
  const language = resolveLanguage(options.lang || options.language || DEFAULT_LANGUAGE);
  const checks = CHECKS.map((check) => {
    const result = check.run(repo);
    return {
      id: check.id,
      title: titleForCheck(check.id, language),
      titleKey: check.id,
      weight: check.weight,
      fixable: check.fixable,
      status: result.status,
      message: t(language, result.messageKey, result.messageValues),
      messageKey: result.messageKey,
      messageValues: result.messageValues,
    };
  });

  const totalWeight = checks
    .filter((check) => check.status !== "skip")
    .reduce((sum, check) => sum + check.weight, 0);

  const earnedWeight = checks.reduce((sum, check) => {
    if (check.status === "pass") {
      return sum + check.weight;
    }

    if (check.status === "warn") {
      return sum + check.weight * 0.5;
    }

    return sum;
  }, 0);

  const score = totalWeight === 0 ? 0 : Math.round((earnedWeight / totalWeight) * 100);

  return {
    root: repo.root,
    language,
    score,
    grade: grade(score),
    checks,
    summary: {
      pass: count(checks, "pass"),
      warn: count(checks, "warn"),
      fail: count(checks, "fail"),
      skip: count(checks, "skip"),
    },
  };
}

function count(checks, status) {
  return checks.filter((check) => check.status === status).length;
}

function grade(score) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}
