import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("Pages preview config is isolated from production D1 and secrets", async () => {
  const preview = JSON.parse(await readFile(new URL("../wrangler.preview.jsonc", import.meta.url), "utf8"));
  const production = JSON.parse(await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"));

  assert.equal(preview.name, production.name);
  assert.equal(preview.pages_build_output_dir, production.pages_build_output_dir);
  assert.equal(preview.compatibility_date, production.compatibility_date);
  assert.equal(Object.hasOwn(preview, "d1_databases"), false, "preview must never inherit the production D1 binding");
  assert.equal(Object.hasOwn(preview, "vars"), false, "preview must not inherit production Access configuration");
  assert.equal(Object.hasOwn(preview, "env"), false, "preview must not define a production environment");
  assert.equal(production.d1_databases?.[0]?.database_id, "8b6f6c98-06fe-49eb-adbc-690d4b57c058");
});
