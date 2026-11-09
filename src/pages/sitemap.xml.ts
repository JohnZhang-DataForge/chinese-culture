import { getCollection } from "astro:content";
import { supportedLocales, localizedSections } from "../i18n/site";
import { isPublishedContent } from "../lib/public-content.mjs";

const SITE = "https://chinese-culture.site";
const STATIC_PAGES = ["", "about/", "accessibility/", "contact/", "editorial-policy/", "privacy/"];

function xmlEscape(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET() {
  const paths = new Set<string>();
  for (const locale of supportedLocales) {
    for (const page of STATIC_PAGES) paths.add("/" + locale + "/" + page);
    for (const section of localizedSections[locale]) {
      paths.add("/" + locale + "/" + section.route + "/");
      if (!section.collection) continue;
      const entries = await getCollection(section.collection as any);
      for (const entry of entries.filter(isPublishedContent)) {
        paths.add("/" + locale + "/" + section.route + "/" + entry.id + "/");
      }
    }
  }
  const body = [...paths].sort().map((path) =>
    "  <url><loc>" + xmlEscape(SITE + path) + "</loc></url>"
  ).join("\n");
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + "\n</urlset>\n",
    { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } }
  );
}
