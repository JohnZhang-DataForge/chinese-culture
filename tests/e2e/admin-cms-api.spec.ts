import { test, expect } from "@playwright/test";
import { assertCmsMutationAllowed, cmsMutationEnabled } from "../helpers/qa-env.mjs";

const baseURL = process.env.QA_BASE_URL || "http://127.0.0.1:4321";
const apiRoot = "/api/admin/v1";
const accessJwt = process.env.QA_ACCESS_JWT;
const prefix = process.env.QA_TEST_CONTENT_PREFIX || "qa-agent6";

function payload(locale, slug, title, description, bodyMarkdown) {
  return {
    locale,
    collection: "culture",
    slug,
    title,
    description,
    seoTitle: `${title} | QA`,
    seoDescription: `SEO: ${description}`,
    category: "QA validation",
    tags: ["qa", "automation"],
    featured: false,
    readingMinutes: 1,
    bodyMarkdown
  };
}

test.describe("Admin CMS API draft lifecycle", () => {
  test("creates, reads, edits, translates, previews, validates media and discards a QA draft", async ({ request }) => {
    test.skip(
      !cmsMutationEnabled(process.env, baseURL),
      "Requires an explicitly authorized, isolated Preview target; CMS mutations are disabled by default."
    );
    assertCmsMutationAllowed(process.env, baseURL);

    const origin = new URL(baseURL).origin;
    const sessionResponse = await request.get(`${apiRoot}/session`, {
      headers: { "Cf-Access-Jwt-Assertion": accessJwt! }
    });
    expect(sessionResponse.status()).toBe(200);
    const session = await sessionResponse.json();
    expect(session.csrfToken).toBeTruthy();

    const mutationHeaders = {
      "Cf-Access-Jwt-Assertion": accessJwt!,
      "X-CSRF-Token": session.csrfToken,
      Origin: origin,
      "Sec-Fetch-Site": "same-origin"
    };
    const slug = `${prefix}-article-${Date.now()}`;
    const contentIdRef = { value: "" };
    const localesCreated = new Set<string>();

    try {
      const createResponse = await request.post(`${apiRoot}/content`, {
        headers: mutationHeaders,
        data: payload("en", slug, "QA Article — English", "Temporary QA article.", "# QA draft\n\nOriginal body.")
      });
      expect(createResponse.status()).toBe(201);
      const created = await createResponse.json();
      expect(created.contentId).toMatch(/^[0-9a-f-]{36}$/i);
      expect(created.status).toBe("draft");
      expect(created.seoTitle).toBe("QA Article — English | QA");
      expect(created.seoDescription).toBe("SEO: Temporary QA article.");
      expect(created.tags).toEqual(["qa", "automation"]);
      expect(created.branch).not.toBe("main");
      contentIdRef.value = created.contentId;
      localesCreated.add("en");

      const itemPath = `${apiRoot}/content/${created.contentId}?locale=en`;
      const readResponse = await request.get(itemPath, {
        headers: { "Cf-Access-Jwt-Assertion": accessJwt! }
      });
      expect(readResponse.status()).toBe(200);
      const readItem = await readResponse.json();
      expect(readItem.title).toBe("QA Article — English");
      expect(readItem.seoTitle).toBe("QA Article — English | QA");
      expect(readItem.tags).toEqual(["qa", "automation"]);
      const etag = readResponse.headers()["etag"];
      expect(etag).toBeTruthy();

      const updatedResponse = await request.put(itemPath, {
        headers: { ...mutationHeaders, "If-Match": etag },
        data: payload("en", slug, "QA Article — Edited", "Updated QA description.", "# QA draft\n\nUpdated body.")
      });
      expect(updatedResponse.status()).toBe(200);
      const updated = await updatedResponse.json();
      expect(updated.title).toBe("QA Article — Edited");
      expect(updated.seoTitle).toBe("QA Article — Edited | QA");
      expect(updated.seoDescription).toBe("SEO: Updated QA description.");

      const translationResponse = await request.post(`${apiRoot}/content/${created.contentId}/translations`, {
        headers: mutationHeaders,
        data: payload("zh-CN", `${slug}-zh`, "质量保证测试文章", "临时 QA 文章。", "# 测试草稿\n\n仅用于自动化测试。")
      });
      expect(translationResponse.status()).toBe(201);
      const translation = await translationResponse.json();
      expect(translation.contentId).toBe(created.contentId);
      expect(translation.locale).toBe("zh-CN");
      expect(translation.seoTitle).toBe("质量保证测试文章 | QA");
      expect(translation.tags).toEqual(["qa", "automation"]);
      localesCreated.add("zh-CN");

      const previewResponse = await request.post(`${apiRoot}/content/${created.contentId}/preview`, {
        headers: mutationHeaders,
        data: {
          content: {
            ...payload("en", slug, "QA Preview", "Preview sanitizer test.", ""),
            bodyMarkdown: "# Safe preview\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))"
          }
        }
      });
      expect(previewResponse.status()).toBe(200);
      const preview = await previewResponse.json();
      expect(preview.html).toContain("Safe preview");
      expect(preview.html).not.toMatch(/<script\b|javascript:/i);

      const latestRead = await request.get(itemPath, {
        headers: { "Cf-Access-Jwt-Assertion": accessJwt! }
      });
      expect(latestRead.status()).toBe(200);
      const latestEtag = latestRead.headers()["etag"];
      expect(latestEtag).toBeTruthy();

      const invalidUpload = await request.post(
        `${apiRoot}/content/${created.contentId}/media?locale=en`,
        {
          headers: { ...mutationHeaders, "If-Match": latestEtag },
          multipart: {
            file: {
              name: "qa-invalid-image.png",
              mimeType: "image/png",
              buffer: Buffer.from("<html><script>alert(1)</script></html>")
            },
            metadata: JSON.stringify({
              src: "/media/qa-invalid-image.png",
              alt: "Invalid QA upload",
              credit: "QA fixture",
              license: "Test only"
            })
          }
        }
      );
      expect([415, 422]).toContain(invalidUpload.status());
    } finally {
      if (contentIdRef.value) {
        for (const locale of localesCreated) {
          await request.delete(
            `${apiRoot}/content/${contentIdRef.value}/draft?locale=${encodeURIComponent(locale)}`,
            { headers: mutationHeaders }
          ).catch(() => undefined);
        }
      }
    }
  });
});
