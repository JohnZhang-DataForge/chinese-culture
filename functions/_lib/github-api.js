const API_ROOT = "https://api.github.com";
const REPOSITORY_PATH = "/repos/JohnZhang-DataForge/chinese-culture";

export class GitHubConfigurationError extends Error {
  constructor() {
    super("GitHub integration is not configured");
    this.name = "GitHubConfigurationError";
  }
}

export class GitHubApiError extends Error {
  constructor(status, retryAfterSeconds = null) {
    super("GitHub API request failed");
    this.name = "GitHubApiError";
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class RepositoryPathError extends Error {
  constructor() {
    super("Repository path is not allowed");
    this.name = "RepositoryPathError";
  }
}

export function assertAllowedRepoPath(path, allowedRoots) {
  if (
    typeof path !== "string" ||
    path.length === 0 ||
    path.length > 240 ||
    path.startsWith("/") ||
    path.includes("\\") ||
    path.includes("%") ||
    path.includes(":") ||
    /[\u0000-\u001f\u007f]/.test(path) ||
    !Array.isArray(allowedRoots) ||
    allowedRoots.length === 0
  ) {
    throw new RepositoryPathError();
  }

  const segments = path.split("/");
  if (
    segments.some((segment) =>
      !segment ||
      segment === "." ||
      segment === ".." ||
      segment.startsWith(".") ||
      !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment)
    )
  ) {
    throw new RepositoryPathError();
  }

  const permitted = allowedRoots.some((root) =>
    typeof root === "string" &&
    root.endsWith("/") &&
    path.startsWith(root) &&
    path.length > root.length
  );

  if (!permitted) {
    throw new RepositoryPathError();
  }

  return path;
}

function safeApiUrl(pathname) {
  if (
    typeof pathname !== "string" ||
    !pathname.startsWith("/") ||
    pathname.startsWith("//") ||
    pathname.includes("\\") ||
    pathname.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    throw new RepositoryPathError();
  }

  const url = new URL(pathname, API_ROOT);
  if (
    url.origin !== API_ROOT ||
    !url.pathname.startsWith(REPOSITORY_PATH + "/") ||
    !(
      url.pathname.startsWith(REPOSITORY_PATH + "/contents/") ||
      url.pathname.startsWith(REPOSITORY_PATH + "/git/")
    )
  ) {
    throw new RepositoryPathError();
  }

  return url;
}

export async function githubApiRequest(env, pathname, init = {}, fetcher = fetch) {
  if (typeof env.GITHUB_TOKEN !== "string" || !env.GITHUB_TOKEN.trim()) {
    throw new GitHubConfigurationError();
  }

  const url = safeApiUrl(pathname);
  const headers = new Headers(init.headers);
  headers.set("accept", "application/vnd.github+json");
  headers.set("authorization", "Bearer " + env.GITHUB_TOKEN);
  headers.set("x-github-api-version", "2022-11-28");
  headers.set("user-agent", "chinese-culture-admin-cms");

  let response;
  try {
    response = await fetcher(url.toString(), {
      ...init,
      headers,
      redirect: "error"
    });
  } catch {
    throw new GitHubApiError(503);
  }

  const retryAfterHeader = response.headers.get("retry-after");
  const resetHeader = response.headers.get("x-ratelimit-reset");
  let retryAfterSeconds = null;

  if (retryAfterHeader && /^\d+$/.test(retryAfterHeader)) {
    retryAfterSeconds = Number(retryAfterHeader);
  } else if (resetHeader && /^\d+$/.test(resetHeader)) {
    retryAfterSeconds = Math.max(0, Number(resetHeader) - Math.floor(Date.now() / 1000));
  }

  let body = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    throw new GitHubApiError(response.status, retryAfterSeconds);
  }

  return body;
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function encodeUtf8Base64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index]);
  }
  return btoa(binary);
}

export async function getRepositoryFile(env, path, allowedRoots, branch = "main", fetcher = fetch) {
  const safePath = assertAllowedRepoPath(path, allowedRoots);
  const url = REPOSITORY_PATH + "/contents/" + encodePath(safePath) +
    "?ref=" + encodeURIComponent(branch);
  return githubApiRequest(env, url, { method: "GET" }, fetcher);
}

export async function putRepositoryFile(
  env,
  { path, allowedRoots, content, message, sha, branch = "main" },
  fetcher = fetch
) {
  const safePath = assertAllowedRepoPath(path, allowedRoots);
  if (
    typeof content !== "string" ||
    content.length > 2 * 1024 * 1024 ||
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.length > 180 ||
    (sha !== undefined && (typeof sha !== "string" || !/^[a-f0-9]{40}$/.test(sha))) ||
    typeof branch !== "string" ||
    !/^[A-Za-z0-9._/-]{1,100}$/.test(branch) ||
    branch.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    throw new RepositoryPathError();
  }

  const body = {
    message: message.trim(),
    content: encodeUtf8Base64(content),
    branch
  };
  if (sha) body.sha = sha;

  return githubApiRequest(
    env,
    REPOSITORY_PATH + "/contents/" + encodePath(safePath),
    {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    },
    fetcher
  );
}

export async function deleteRepositoryFile(
  env,
  { path, allowedRoots, sha, message, branch = "main" },
  fetcher = fetch
) {
  const safePath = assertAllowedRepoPath(path, allowedRoots);
  if (
    typeof sha !== "string" ||
    !/^[a-f0-9]{40}$/.test(sha) ||
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.length > 180 ||
    typeof branch !== "string" ||
    !/^[A-Za-z0-9._/-]{1,100}$/.test(branch) ||
    branch.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    throw new RepositoryPathError();
  }

  return githubApiRequest(
    env,
    REPOSITORY_PATH + "/contents/" + encodePath(safePath),
    {
      method: "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        message: message.trim(),
        sha,
        branch
      })
    },
    fetcher
  );
}
