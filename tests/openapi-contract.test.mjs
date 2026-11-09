import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseOpenApiOperations, validateApiContract } from "../scripts/validate-openapi-contract.mjs";

test("parses documented path operations and operation IDs", () => {
  const operations = parseOpenApiOperations([
    "openapi: 3.1.0",
    "paths:",
    "  /session:",
    "    get:",
    "      operationId: getSession",
    "  /content/{contentId}:",
    "    put:",
    "      operationId: saveContent",
    "components:",
    "  schemas:"
  ].join("\n"));
  assert.deepEqual(operations, [
    { path: "/session", method: "get", operationId: "getSession" },
    { path: "/content/{contentId}", method: "put", operationId: "saveContent" }
  ]);
});

test("detects undocumented handlers and missing implementation methods", async () => {
  const root = await mkdtemp(join(tmpdir(), "cms-openapi-"));
  const apiRoot = join(root, "functions/api/admin/v1");
  try {
    await mkdir(join(apiRoot, "content"), { recursive: true });
    await writeFile(join(apiRoot, "session.js"), "export async function onRequestGet() {}\n");
    await writeFile(join(apiRoot, "content/[contentId].js"), "export async function onRequestGet() {}\n");
    const openApiText = [
      "paths:",
      "  /session:",
      "    get:",
      "      operationId: getSession",
      "  /content/{contentId}:",
      "    put:",
      "      operationId: saveContent",
      "components:"
    ].join("\n");
    await assert.rejects(
      validateApiContract({ openApiText, apiRoot, root }),
      /has no matching onRequestPut/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("rejects duplicate operation IDs", async () => {
  const root = await mkdtemp(join(tmpdir(), "cms-openapi-"));
  const apiRoot = join(root, "functions/api/admin/v1");
  try {
    await mkdir(apiRoot, { recursive: true });
    await writeFile(join(apiRoot, "session.js"), "export async function onRequestGet() {}\n");
    const openApiText = [
      "paths:",
      "  /session:",
      "    get:",
      "      operationId: duplicateId",
      "  /other:",
      "    get:",
      "      operationId: duplicateId",
      "components:"
    ].join("\n");
    await assert.rejects(
      validateApiContract({ openApiText, apiRoot, root }),
      /Duplicate OpenAPI operationId/
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
