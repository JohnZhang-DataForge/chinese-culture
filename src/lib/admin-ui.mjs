export function filterContent(items, options = {}) {
  const query = String(options.query || "").trim().toLocaleLowerCase();
  const status = options.status || "";
  const language = options.language || "";
  return items.filter((item) => {
    const title = [item.title?.en, item.title?.zh, item.id, item.slug, item.category, ...(item.tags || [])].filter(Boolean).join(" ").toLocaleLowerCase();
    if (query && !title.includes(query)) return false;
    if (status && item.status !== status) return false;
    const translation = translationStatus(item);
    if (language === "complete" && !(translation.en && translation.zh)) return false;
    if (language === "missing-en" && translation.en) return false;
    if (language === "missing-zh" && translation.zh) return false;
    return true;
  });
}

export function paginate(items, page = 1, pageSize = 10) {
  const size = Math.max(1, Number(pageSize) || 10);
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = Math.min(Math.max(1, Number(page) || 1), pages);
  const startIndex = (current - 1) * size;
  return {
    items: items.slice(startIndex, startIndex + size),
    page: current,
    pages,
    total,
    start: total ? startIndex + 1 : 0,
    end: Math.min(startIndex + size, total)
  };
}

export function translationStatus(item) {
  if (Array.isArray(item.translationLocales)) {
    return { en: item.translationLocales.includes("en"), zh: item.translationLocales.includes("zh-CN") || item.translationLocales.includes("zh") };
  }
  const complete = (locale) => Boolean(item.title?.[locale]?.trim() && item.description?.[locale]?.trim() && item.body?.[locale]?.trim());
  return { en: complete("en"), zh: complete("zh") };
}

export function parseTags(value) {
  return [...new Set(String(value || "").split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export function wordCount(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  const cjk = (text.match(/[\u3400-\u9fff]/g) || []).length;
  const latin = text.replace(/[\u3400-\u9fff]/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return cjk + latin;
}
