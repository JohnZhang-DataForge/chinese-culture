import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const helperPath = resolve(process.cwd(), "functions/_lib/github-api.js");

if (!existsSync(helperPath)) {
  test("GitHub API client tests activate when Agent 5 backend files are merged", {
    skip: "Agent 5 GitHub API helper is not present on the current base branch."
  }, () => {});
} else {
  const {
    assertAllowedRepoPath,
    deleteRepositoryFile,
    getRepositoryFile,
    githubApiRequest,
    GitHubApiError,
    GitHubConfigurationError,
    putRepositoryFile,
    RepositoryPathError
  } = await import(pathToFileURL(helperPath).href);

  const env = { GITHUB_TOKEN: "qa-only-not-a-real-token" };
  const allowedRoots = ["src/content/"];
  const filePath = "src/content/qa-fixtures/example.md";
  const apiPath = "/repos/JohnZhang-DataForge/chinese-culture/contents/src/content/example.md";

  test("allows only paths below an explicit content root", () => {
    assert.equal(assertAllowedRepoPath(filePath, allowedRoots), filePath);
    for (const invalid of [
      "../README.md",
      "/src/content/example.md",
      "src/content/../../README.md",
      "src/content/%2e%2e/README.md",
      "src\\content\\example.md",
      "src/content/.env",
      ".github/workflows/deploy.yml",
      "public/secret.txt"
    ]) {
      assert.throws(() => assertAllowedRepoPath(invalid, allowedRoots), RepositoryPathError);
    }
  });

  test("rejects an API path that escapes the fixed repository content endpoint", async () => {
    await assert.rejects(
      githubApiRequest(env, "/repos/JohnZhang-DataForge/chinese-culture/contents/../README.md"),
      RepositoryPathError
    );
  });

  test("fails closed when the GitHub token is missing", async () => {
    await assert.rejects(
      githubApiRequest({}, apiPath),
      GitHubConfigurationError
    );
  });

  test("maps network errors to a sanitized 503 GitHub API error", async () => {
    await assert.rejects(
      githubApiRequest(env, apiPath, {}, async () => {
        throw new Error("upstream network detail must not escape");
      }),
      (error) => error instanceof GitHubApiError &&
        error.status === 503 &&
        error.message === "GitHub API request failed"
    );
  });

  test("maps upstream 500 errors without exposing the upstream response body", async () => {
    await assert.rejects(
      githubApiRequest(env, apiPath, {}, async () =>
        new Response("private upstream diagnostics", { status: 500 })
      ),
      (error) => error instanceof GitHubApiError &&
        error.status === 500 &&
        !error.message.includes("private upstream diagnostics")
    );
  });

  test("preserves GitHub rate-limit retry information", async () => {
    await assert.rejects(
      githubApiRequest(env, apiPath, {}, async () =>
        new Response('{"message":"rate limited"}', {
          status: 403,
          headers: { "retry-after": "45" }
        })
      ),
      (error) => error instanceof GitHubApiError &&
        error.status === 403 &&
        error.retryAfterSeconds === 45
    );
  });

  test("sends authenticated requests to the fixed GitHub API origin", async () => {
    let captured;
    const result = await githubApiRequest(env, apiPath, {}, async (url, init) => {
      captured = { url, init };
      return new Response('{"ok":true}', { status: 200 });
    });

    assert.deepEqual(result, { ok: true });
    assert.equal(new URL(captured.url).origin, "https://api.github.com");
    assert.equal(captured.init.redirect, "error");
    assert.equal(captured.init.headers.get("authorization"), "Bearer qa-only-not-a-real-token");
    assert.equal(captured.init.headers.get("user-agent"), "chinese-culture-admin-cms");
  });


  test("reads content only from an allow-listed repository path and selected branch", async () => {
    let captured;
    const result = await getRepositoryFile(env, filePath, allowedRoots, "cms/qa-agent6", async (url, init) => {
      captured = { url, init };
      return new Response('{"sha":"abc","content":"IyBRQQ=="}', { status: 200 });
    });
    const parsed = new URL(captured.url);
    assert.equal(parsed.origin, "https://api.github.com");
    assert.equal(parsed.searchParams.get("ref"), "cms/qa-agent6");
    assert.equal(parsed.pathname, "/repos/JohnZhang-DataForge/chinese-culture/contents/src/content/qa-fixtures/example.md");
    assert.equal(captured.init.method, "GET");
    assert.equal(result.sha, "abc");
  });

  test("writes UTF-8 content only to the selected content branch", async () => {
    let captured;
    const result = await putRepositoryFile(env, {
      path: filePath,
      allowedRoots,
      content: "# 质量保证\n\n中文内容",
      message: "test: create isolated QA fixture",
      branch: "cms/qa-agent6"
    }, async (url, init) => {
      captured = { url, init };
      return new Response('{"content":{"sha":"123"}}', { status: 200 });
    });

    const body = JSON.parse(captured.init.body);
    assert.equal(Buffer.from(body.content, "base64").toString("utf8"), "# 质量保证\n\n中文内容");
    assert.equal(body.branch, "cms/qa-agent6");
    assert.equal(new URL(captured.url).pathname, "/repos/JohnZhang-DataForge/chinese-culture/contents/src/content/qa-fixtures/example.md");
    assert.deepEqual(result, { content: { sha: "123" } });
  });

  test("deletes only a validated content file with a SHA and non-main QA branch", async () => {
    let captured;
    await deleteRepositoryFile(env, {
      path: filePath,
      allowedRoots,
      sha: "a".repeat(40),
      message: "test: remove isolated QA fixture",
      branch: "cms/qa-agent6"
    }, async (url, init) => {
      captured = { url, init };
      return new Response('{"commit":{"sha":"456"}}', { status: 200 });
    });

    const body = JSON.parse(captured.init.body);
    assert.equal(body.sha, "a".repeat(40));
    assert.equal(body.branch, "cms/qa-agent6");
    assert.equal(captured.init.method, "DELETE");
  });
  test("refuses writes when the CMS branch is omitted", async () => {
    await assert.rejects(
      putRepositoryFile(env, {
        path: filePath,
        allowedRoots,
        content: "must not land on main",
        message: "test: omitted CMS branch"
      }, async () => new Response('{"ok":true}', { status: 200 })),
      RepositoryPathError
    );
  });

  test("refuses direct writes or deletes against main", async () => {
    await assert.rejects(
      putRepositoryFile(env, {
        path: filePath,
        allowedRoots,
        content: "must not land on main",
        message: "test: block main write",
        branch: "main"
      }, async () => new Response('{"ok":true}', { status: 200 })),
      RepositoryPathError
    );
    await assert.rejects(
      deleteRepositoryFile(env, {
        path: filePath,
        allowedRoots,
        sha: "a".repeat(40),
        message: "test: block main delete",
        branch: "main"
      }, async () => new Response('{"ok":true}', { status: 200 })),
      RepositoryPathError
    );
  });

}
