import assert from "node:assert/strict";
import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const distDir = join(projectRoot, "dist");
const outputDir = join(projectRoot, "dist-worker");
const outputFile = join(outputDir, "index.js");

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    else if (entry.isFile()) files.push(absolute);
  }
  return files.sort();
}

function writeOctal(buffer, offset, length, value) {
  const text = Math.trunc(value).toString(8).padStart(length - 1, "0") + "\0";
  buffer.write(text, offset, length, "ascii");
}

function createTarHeader(relativePath, size) {
  const header = Buffer.alloc(512);
  let name = relativePath;
  let prefix = "";
  if (Buffer.byteLength(name) > 100) {
    const splitAt = name.lastIndexOf("/");
    assert.ok(splitAt > 0, "Tar path exceeds 100 bytes: " + name);
    prefix = name.slice(0, splitAt);
    name = name.slice(splitAt + 1);
  }
  assert.ok(Buffer.byteLength(name) <= 100 && Buffer.byteLength(prefix) <= 155, "Tar path is too long: " + relativePath);
  header.write(name, 0, 100, "utf8");
  writeOctal(header, 100, 8, 0o644);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, size);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header[156] = 0x30;
  header.write("ustar\0", 257, 6, "ascii");
  header.write("00", 263, 2, "ascii");
  if (prefix) header.write(prefix, 345, 155, "utf8");
  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  header.write(checksum.toString(8).padStart(6, "0") + "\0 ", 148, 8, "ascii");
  return header;
}

async function buildTar() {
  const files = await collectFiles(distDir);
  assert.ok(files.length > 0, "dist/ is empty; run npm run build first");
  const parts = [];
  for (const absolute of files) {
    const path = relative(distDir, absolute).split("\\").join("/");
    const content = await readFile(absolute);
    parts.push(createTarHeader(path, content.length), content);
    const padding = (512 - (content.length % 512)) % 512;
    if (padding) parts.push(Buffer.alloc(padding));
  }
  parts.push(Buffer.alloc(1024));
  return { archive: gzipSync(Buffer.concat(parts), { level: 9, mtime: 0 }), fileCount: files.length };
}

function createWorkerSource(archiveBase64) {
  return [
    "// Chinese Culture Atlas — static-site fallback Worker.",
    "// The prerendered site is bundled as a gzip-compressed tar archive.",
    "const ARCHIVE_B64 = " + JSON.stringify(archiveBase64) + ";",
    "let assetsPromise;",
    "async function loadAssets() {",
    "  const compressed = Uint8Array.from(atob(ARCHIVE_B64), (char) => char.charCodeAt(0));",
    "  const stream = new Blob([compressed]).stream().pipeThrough(new DecompressionStream(\"gzip\"));",
    "  const tar = new Uint8Array(await new Response(stream).arrayBuffer());",
    "  const files = new Map();",
    "  const decoder = new TextDecoder();",
    "  const field = (offset, length) => decoder.decode(tar.subarray(offset, offset + length)).split(\"\\0\", 1)[0].trim();",
    "  for (let offset = 0; offset + 512 <= tar.length;) {",
    "    if (tar.subarray(offset, offset + 512).every((byte) => byte === 0)) break;",
    "    const name = field(offset, 100);",
    "    const prefix = field(offset + 345, 155);",
    "    const path = (prefix ? prefix + \"/\" : \"\") + name;",
    "    const size = Number.parseInt(field(offset + 124, 12), 8) || 0;",
    "    const type = String.fromCharCode(tar[offset + 156]);",
    "    const dataStart = offset + 512;",
    "    if ((type === \"0\" || type === \"\\0\" || type === \"\") && path) {",
    "      const normalized = path.replace(/^\\.\\//, \"\");",
    "      if (normalized && normalized !== \"_headers\") files.set(normalized, tar.slice(dataStart, dataStart + size));",
    "    }",
    "    offset = dataStart + Math.ceil(size / 512) * 512;",
    "  }",
    "  return files;",
    "}",
    "function getAssets() { if (!assetsPromise) assetsPromise = loadAssets(); return assetsPromise; }",
    "function contentType(path) {",
    "  const ext = path.split(\".\").pop().toLowerCase();",
    "  const types = { html: \"text/html; charset=utf-8\", css: \"text/css; charset=utf-8\", svg: \"image/svg+xml\", txt: \"text/plain; charset=utf-8\", json: \"application/json; charset=utf-8\", js: \"text/javascript; charset=utf-8\", png: \"image/png\", jpg: \"image/jpeg\", jpeg: \"image/jpeg\", webp: \"image/webp\", ico: \"image/x-icon\" };",
    "  return types[ext] || \"application/octet-stream\";",
    "}",
    "async function handle(request) {",
    "  if (request.method !== \"GET\" && request.method !== \"HEAD\") return new Response(\"Method not allowed\", { status: 405, headers: { Allow: \"GET, HEAD\" } });",
    "  const files = await getAssets();",
    "  const url = new URL(request.url);",
    "  let pathname;",
    "  try { pathname = decodeURIComponent(url.pathname); } catch { return new Response(\"Bad request\", { status: 400 }); }",
    "  if (pathname.includes(\"\\0\") || pathname.split(\"/\").includes(\"..\")) return new Response(\"Bad request\", { status: 400 });",
    "  let key = pathname.replace(/^\\/+/, \"\");",
    "  if (!key || key.endsWith(\"/\")) key += \"index.html\";",
    "  else if (!key.split(\"/\").pop().includes(\".\")) key += \"/index.html\";",
    "  let body = files.get(key);",
    "  let status = 200;",
    "  if (!body) { body = files.get(\"404.html\"); status = 404; }",
    "  const headers = { \"Content-Type\": contentType(key), \"Cache-Control\": \"public, max-age=300, s-maxage=600, stale-while-revalidate=86400\", \"X-Content-Type-Options\": \"nosniff\", \"Referrer-Policy\": \"strict-origin-when-cross-origin\", \"X-Frame-Options\": \"DENY\", \"Permissions-Policy\": \"camera=(), microphone=(), geolocation=()\" };",
    "  return new Response(request.method === \"HEAD\" ? null : body, { status, headers });",
    "}",
    "addEventListener(\"fetch\", (event) => event.respondWith(handle(event.request)));",
    ""
  ].join("\n");
}

const { archive, fileCount } = await buildTar();
const workerSource = createWorkerSource(archive.toString("base64"));
await mkdir(outputDir, { recursive: true });
await writeFile(outputFile, workerSource, "utf8");
console.log("Built embedded Worker: " + fileCount + " static files, " + workerSource.length + " source characters, " + archive.length + " compressed archive bytes.");
