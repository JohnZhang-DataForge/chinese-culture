import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const METHOD_NAMES = new Map([
  ["get", "Get"], ["post", "Post"], ["put", "Put"],
  ["patch", "Patch"], ["delete", "Delete"], ["head", "Head"], ["options", "Options"]
]);

export function parseOpenApiOperations(source) {
  const lines = source.split(/\r?\n/);
  const operations = [];
  let inPaths = false;
  let currentPath = null;
  let currentMethod = null;
  let currentOperation = null;
  const flush = () => {
    if (currentOperation) operations.push(currentOperation);
    currentOperation = null;
  };

  for (const line of lines) {
    if (/^paths:\s*$/.test(line)) { flush(); inPaths = true; currentPath = null; currentMethod = null; continue; }
    if (inPaths && /^components:\s*$/.test(line)) { flush(); inPaths = false; currentPath = null; currentMethod = null; continue; }
    if (!inPaths) continue;
    const pathMatch = /^  (\/[^:]+):\s*$/.exec(line);
    if (pathMatch) {
      flush();
      currentPath = pathMatch[1];
      currentMethod = null;
      continue;
    }
    const methodMatch = /^    (get|post|put|patch|delete|head|options):\s*$/i.exec(line);
    if (methodMatch && currentPath) {
      flush();
      currentMethod = methodMatch[1].toLowerCase();
      currentOperation = { path: currentPath, method: currentMethod, operationId: null };
      continue;
    }
    if (currentOperation) {
      const operationId = /^      operationId:\s*([A-Za-z][A-Za-z0-9_]*)\s*$/.exec(line);
      if (operationId) currentOperation.operationId = operationId[1];
    }
  }
  flush();
  return operations;
}

async function jsFiles(directory) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await jsFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".js")) output.push(path);
  }
  return output;
}

export async function validateApiContract({ openApiText, apiRoot, root = process.cwd() }) {
  const operations = parseOpenApiOperations(openApiText);
  if (!operations.length) throw new Error("OpenAPI document contains no paths operations.");
  const operationIds = new Set();
  const expected = new Map();

  for (const operation of operations) {
    if (!operation.operationId) throw new Error("Missing operationId for " + operation.method.toUpperCase() + " " + operation.path);
    if (operationIds.has(operation.operationId)) throw new Error("Duplicate OpenAPI operationId: " + operation.operationId);
    operationIds.add(operation.operationId);
    const routePath = operation.path.replace(/\{([^}]+)\}/g, "[$1]");
    const filePath = join(apiRoot, routePath.replace(/^\//, "") + ".js");
    const key = relative(root, filePath).replaceAll("\\", "/");
    const methods = expected.get(key) ?? new Set();
    methods.add(operation.method);
    expected.set(key, methods);
  }

  const actualFiles = await jsFiles(apiRoot);
  const actual = new Map();
  for (const filePath of actualFiles) {
    const source = await readFile(filePath, "utf8");
    const key = relative(root, filePath).replaceAll("\\", "/");
    const methods = new Set();
    for (const [method, suffix] of METHOD_NAMES) {
      if (new RegExp("export\\s+(?:async\\s+)?function\\s+onRequest" + suffix + "\\b").test(source)) methods.add(method);
    }
    if (methods.size) actual.set(key, methods);
  }

  const errors = [];
  for (const [file, methods] of expected) {
    const implemented = actual.get(file);
    if (!implemented) {
      errors.push("OpenAPI route has no Pages Function: " + file);
      continue;
    }
    for (const method of methods) if (!implemented.has(method)) errors.push("OpenAPI " + method.toUpperCase() + " " + file + " has no matching onRequest" + METHOD_NAMES.get(method) + " handler.");
  }
  for (const [file, methods] of actual) {
    const documented = expected.get(file);
    if (!documented) {
      errors.push("Pages Function route is not documented in OpenAPI: " + file);
      continue;
    }
    for (const method of methods) if (!documented.has(method)) errors.push("Undocumented " + method.toUpperCase() + " handler in " + file + ".");
  }
  if (errors.length) throw new Error("OpenAPI/Pages Functions contract drift detected:\n- " + errors.join("\n- "));
  return { operations: operations.length, operationIds: operationIds.size, routes: expected.size };
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  const root = process.cwd();
  const openApiPath = join(root, "docs/openspec/contracts/admin-api.openapi.yaml");
  const apiRoot = join(root, "functions/api/admin/v1");
  const openApiText = await readFile(openApiPath, "utf8");
  const result = await validateApiContract({ openApiText, apiRoot, root });
  console.log(JSON.stringify({ ...result, result: "PASS" }, null, 2));
}
