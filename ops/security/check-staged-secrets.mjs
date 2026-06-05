import { execFileSync } from "node:child_process";

const REPO_ROOT = new URL("../../", import.meta.url);

const BLOCKED_PATH_PATTERNS = [
  /(^|\/)\.env(\.|$)/i,
  /(^|\/).*\.pem$/i,
  /(^|\/).*\.key$/i,
  /(^|\/)id_(rsa|dsa|ecdsa|ed25519)(\.pub)?$/i,
  /(^|\/).*credentials.*$/i,
];

const SECRET_PATTERNS = [
  { label: "Private key block", regex: /BEGIN [A-Z ]*PRIVATE KEY/ },
  { label: "AWS access key", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "GitHub token", regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/ },
  { label: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { label: "Slack token", regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  { label: "Stripe secret key", regex: /\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}\b/ },
  { label: "SendGrid token", regex: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/ },
  {
    label: "Suspicious credential assignment",
    regex:
      /\b(password|passwd|secret|api[_-]?key|access[_-]?key|client[_-]?secret|private[_-]?key)\b\s*[:=]\s*["'`](?!fixture-|dummy-|example-|sample-|test-|smoke-|local-|mock-|fake-|__TEST_ONLY__)[^"'`\n]{8,}["'`]/i,
  },
];

function runGit(args) {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
}

function getStagedPaths() {
  const output = runGit(["diff", "--cached", "--name-only", "--diff-filter=ACMR"]);
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readStagedFile(filePath) {
  try {
    return runGit(["show", `:${filePath}`]);
  } catch {
    return "";
  }
}

const stagedPaths = getStagedPaths();
const findings = [];

for (const filePath of stagedPaths) {
  if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(filePath))) {
    findings.push({
      filePath,
      label: "Blocked sensitive path",
      snippet: filePath,
    });
    continue;
  }

  const contents = readStagedFile(filePath);
  if (!contents) {
    continue;
  }

  for (const pattern of SECRET_PATTERNS) {
    const match = contents.match(pattern.regex);
    if (match) {
      findings.push({
        filePath,
        label: pattern.label,
        snippet: match[0].slice(0, 160),
      });
    }
  }
}

if (findings.length > 0) {
  console.error("Potential secret or credential leak detected in staged changes:");
  for (const finding of findings) {
    console.error(`- ${finding.filePath}: ${finding.label}`);
    console.error(`  ${finding.snippet}`);
  }
  process.exit(1);
}

console.log("No obvious secret patterns found in staged changes.");
