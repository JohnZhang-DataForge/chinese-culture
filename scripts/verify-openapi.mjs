import { access } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const contract = resolve(
  process.cwd(),
  "docs/openspec/contracts/admin-api.openapi.yaml"
);

try {
  await access(contract);
} catch {
  process.stdout.write("OpenAPI lint NOT TESTED: the approved API contract is not present on this branch yet.\n");
  process.exit(0);
}

const result = spawnSync(
  "npx",
  ["--yes", "@redocly/cli", "lint", "--extends", "minimal", contract],
  { stdio: "inherit", shell: process.platform === "win32" }
);

if (result.error) {
  process.stderr.write(`OpenAPI lint could not start: ${result.error.message}\n`);
  process.exitCode = 1;
} else {
  process.exitCode = result.status ?? 1;
}
