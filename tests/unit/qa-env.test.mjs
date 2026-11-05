import test from "node:test";
import assert from "node:assert/strict";
import { assertCmsMutationAllowed, cmsMutationEnabled } from "../helpers/qa-env.mjs";

const validEnv = {
  QA_ENABLE_CMS_MUTATIONS: "true",
  QA_ENVIRONMENT: "preview",
  QA_ACCESS_COOKIE: "CF_Authorization=test-only-owner-cookie",
  QA_TEST_CONTENT_PREFIX: "qa-agent6"
};

test("CMS mutation gate accepts an explicitly authorized preview target", () => {
  assert.equal(cmsMutationEnabled(validEnv, "https://pr-123.chinese-culture-79h.pages.dev"), true);
  assert.equal(assertCmsMutationAllowed(validEnv, "https://pr-123.chinese-culture-79h.pages.dev").hostname,
    "pr-123.chinese-culture-79h.pages.dev");
});

test("CMS mutation gate rejects the production apex even when all flags are set", () => {
  assert.equal(cmsMutationEnabled(validEnv, "https://chinese-culture.site"), false);
  assert.throws(() => assertCmsMutationAllowed(validEnv, "https://chinese-culture.site"), /mutations are disabled/i);
});

test("CMS mutation gate rejects canonical and main/production Pages aliases", () => {
  for (const host of [
    "chinese-culture-79h.pages.dev",
    "main.chinese-culture-79h.pages.dev",
    "production.chinese-culture-79h.pages.dev"
  ]) {
    assert.equal(cmsMutationEnabled(validEnv, `https://${host}`), false);
  }
});

test("CMS mutation gate requires explicit preview and owner authorization", () => {
  assert.equal(cmsMutationEnabled({ ...validEnv, QA_ENVIRONMENT: "production" }, "https://pr-123.chinese-culture-79h.pages.dev"), false);
  assert.equal(cmsMutationEnabled({ ...validEnv, QA_ACCESS_COOKIE: "" }, "https://pr-123.chinese-culture-79h.pages.dev"), false);
  assert.equal(cmsMutationEnabled({ ...validEnv, QA_ENABLE_CMS_MUTATIONS: "false" }, "https://pr-123.chinese-culture-79h.pages.dev"), false);
});

test("CMS mutation gate requires a clearly prefixed QA content namespace", () => {
  assert.equal(cmsMutationEnabled({ ...validEnv, QA_TEST_CONTENT_PREFIX: "production-content" }, "https://pr-123.chinese-culture-79h.pages.dev"), false);
});
