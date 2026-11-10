# Simplified Chinese Editorial Style Guide

**Status:** Editorial guidance for the Chinese-language edition.  
**Applies to:** The `zh-CN` locale in the approved CC-CONTENT-001 v1.2.0 content contract.  
**Audience:** Native and fluent Simplified Chinese readers, including families and international learners.

This guide supplements the approved content schema and routing contract. It does not redefine content IDs, locale identifiers, route structure, publication state, revision behavior, or CMS APIs. When a technical contract conflicts with an editorial convention here, follow the technical contract and raise the editorial issue for review.

## Voice and tone

- Write natural, contemporary Simplified Chinese. Avoid word-for-word English syntax and generic machine-translation phrasing.
- Preserve the site's welcoming, curious, calm, precise, and respectful voice.
- Prefer clear explanations over promotional language, sweeping generalizations, or grand claims.
- Do not assume one custom, region, family practice, or historical interpretation represents all Chinese people.
- Preserve the source article's teaching intent, structure, meaningful examples, caveats, questions, references, and learning exercises.
- Translate only claims supported by the source. Do not add historical details, dates, etymologies, or cultural interpretations without reliable evidence.
- If the English source is ambiguous or appears to overstate a fact, flag it for editorial review rather than silently strengthening or weakening the claim.

## Preferred terminology

Use these terms consistently unless the specific context requires a more precise explanation.

| English | Preferred Simplified Chinese | Pinyin / editorial note |
|---|---|---|
| Chinese culture | 中国文化 | zhōngguó wénhuà |
| culture | 文化 | wénhuà |
| Chinese characters | 汉字 | Hànzì |
| Pinyin | 汉语拼音 | Hànyǔ Pīnyīn |
| Standard Mandarin | 普通话 | pǔtōnghuà; do not conflate with all Chinese language varieties |
| simplified characters | 简体字 | Preferred general reader-facing term |
| traditional characters | 繁体字 | Preserve traditional forms when relevant |
| lunisolar calendar | 阴阳合历（农历） | Explain on first use; use 农历 thereafter where clear |
| Spring Festival | 春节 | Chūnjié |
| Dragon Boat Festival | 端午节 | Duānwǔ Jié |
| Mid-Autumn Festival | 中秋节 | Zhōngqiū Jié |
| zongzi | 粽子 | zòngzi |
| mooncake | 月饼 | yuèbǐng |
| red envelope | 红包 | hóngbāo |
| Qu Yuan | 屈原 | Qū Yuán |
| Chang'e | 嫦娥 | Cháng'é |
| Nian (mythical creature) | 年兽 | niánshòu; identify as a traditional tale |
| calligraphy | 书法 | shūfǎ |
| brush and ink | 笔墨 | bǐmò |
| handscroll | 手卷 | shǒujuàn |
| seal script | 篆书 | zhuànshū |
| clerical script | 隶书 | lìshū |
| standard script | 楷书 | kǎishū |
| running script | 行书 | xíngshū |
| cursive script | 草书 | cǎoshū |
| Journey to the West | 《西游记》 | Xīyóu Jì |
| Sun Wukong / Monkey King | 孙悟空 / 美猴王 | Sūn Wùkōng / Měi Hóuwáng |
| The Analects | 《论语》 | Lúnyǔ |
| Confucius | 孔子 | Kǒngzǐ |

Treat this as a preferred terminology list, not a substitute for context-sensitive editorial judgment. Add new terms only when they recur or need consistent treatment across articles.

## Names, Pinyin, and typography

1. Use Simplified Chinese for the `zh-CN` edition.
2. Use Chinese book-title brackets `《》` for named books and literary works.
3. Include tone-mark Pinyin when first introducing an educational term or name if it helps readers pronounce or understand it. Do not add Pinyin mechanically to every repeated occurrence.
4. Preserve Chinese-character examples in the English source, including traditional forms when the comparison is the point (for example, `书 / 書`).
5. Keep personal and place names consistent across the site. Do not invent Chinese names for people or institutions that the source does not identify.
6. Use Chinese punctuation in Chinese prose. Retain official organization names and source URLs as published.
7. Keep dates and calendar explanations faithful to the source. Do not add a Gregorian festival date unless a specific year and authoritative source are supplied.
8. Keep locale-specific titles, descriptions, and other metadata consistent with the approved content contract; do not use translated metadata as a reason to alter the source locale's metadata.

## Cultural and historical accuracy

- Distinguish historical evidence, traditional narrative, folklore, contemporary practice, and editorial interpretation.
- Preserve uncertainty and scope markers such as “one widely told tradition”, “in some communities”, “may”, “often”, and “not every family”.
- Never convert a legend into a factual origin story.
- Keep regional, generational, family, religious, and diaspora variation visible where the source supports it.
- Do not present Mandarin as the only Chinese language variety.
- Do not imply that simplified and traditional character forms map neatly to separate identities or that either form is universal.
- Do not turn an evergreen festival guide into an announcement for a particular year's event.
- Preserve source attribution and further-reading links. Do not fabricate citations or translate source titles in ways that make the original sources difficult to identify.
- Flag culturally sensitive, disputed, or inadequately sourced claims for a human editor.

## Translation review checklist

- [ ] Every source paragraph, heading, list item, question, callout, caption, and meaningful UI string has an appropriate Chinese counterpart where in scope.
- [ ] The Chinese text reads naturally without consulting the English source.
- [ ] No historical or cultural claim has been added, removed, or strengthened without evidence.
- [ ] Regional variation and uncertainty are preserved.
- [ ] Names, Chinese characters, Pinyin, and book titles are consistent.
- [ ] Dates, quantities, and factual details match the source.
- [ ] Internal links and source links resolve to the intended locale or original source.
- [ ] Chinese title, description, and locale-specific SEO metadata are complete.
- [ ] No placeholder, untranslated sentence, or machine-translation note remains.
- [ ] Draft content remains unpublished until it passes the normal human editorial and publication workflow.
- [ ] Ambiguous or unsupported claims are recorded for editorial review.

## Editorial workflow and scope

- Use the CMS's existing content identity and locale relationships; do not create a second translation identity scheme.
- Preserve revision history and use the normal draft, review, and publication process. This guide does not authorize direct production D1 edits or bypassing a publication PR.
- Keep editorial review separate from technical validation: a passing schema/build test does not establish cultural accuracy or translation quality.
- The English source remains the factual reference for translation, but corrections to an inaccurate English source should be proposed and reviewed rather than copied mechanically.
- This guide is editorial guidance only. It does not define frontmatter, file layout, content IDs, localized routes, publication-state semantics, revision rules, or the shared API schema.
