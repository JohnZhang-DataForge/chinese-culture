import { readdir, readFile, stat } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";

const dist = resolve(process.cwd(), "dist");
const textExtensions = new Set([
  ".html", ".js", ".mjs", ".cjs", ".css", ".json", ".xml", ".txt",
  ".map", ".svg", ".webmanifest"
]);
const patterns = [
  ["GitHub credential", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/g],
  ["JWT-like credential", /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g],
  ["PEM private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g]
];
const exactSecretNames = [
  "GITHUB_TOKEN",
  "CLOUDFLARE_API_TOKEN",
  "CF_API_TOKEN",
  "CF_ACCESS_CLIENT_SECRET",
  "QA_ACCESS_JWT"
];
const exactSecrets = exactSecretNames
  .map((name) => ({ name, value: process.env[name] }))
  .filter((entry) => typeof entry.value === "string" && entry.value.length >= 8);

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && textExtensions.has(extname(entry.name).toLowerCase())) files.push(path);
  }
  return files;
}

try {
  const info = await stat(dist);
  if (!info.isDirectory()) throw new Error("dist is not a directory");
  const files = await walk(dist);
  const findings = [];

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    for (const [label, pattern] of patterns) {
      pattern.lastIndex = 0;
      if (pattern.test(contents)) findings.push({ file: relative(process.cwd(), file), label });
    }
    for (const secret of exactSecrets) {
      if (contents.includes(secret.value)) {
        findings.push({ file: relative(process.cwd(), file), label: `value of ${secret.name}` });
      }
    }
  }

  if (findings.length) {
    for (const finding of findings) {
      process.stderr.write(`Potential ${finding.label} exposed in ${finding.file}\n`);
    }
    process.stderr.write(`Secret scan failed: ${findings.length} finding(s). Values were not printed.\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Secret scan passed: ${files.length} generated text assets inspected; no credential patterns found.\n`);
  }
} catch (error) {
  process.stderr.write(`Secret scan could not complete: ${error.message}\n`);
  process.exitCode = 1;
}
