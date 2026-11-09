export function isPublishedContent(entry) {
  return (entry?.data?.status ?? "published") === "published";
}

export function buildPublicArticleUrls(groups) {
  return groups.flatMap(({ locale, section, entries }) =>
    entries.filter(isPublishedContent).map((entry) =>
      "/" + locale + "/" + section + "/" + entry.id + "/"
    )
  );
}

export function missingTranslations(alternateUrls, locales = ["en", "zh-cn", "es"]) {
  if (!alternateUrls || Object.keys(alternateUrls).length === 0) return [];
  return locales.filter((locale) => !alternateUrls[locale]);
}
