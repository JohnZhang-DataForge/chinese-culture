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
