# Cultural Expansion — Editorial Draft Batch

Prepared 2026-11-15. Five concepts × three locales = 15 complete drafts in English, Simplified Chinese and Spanish.

| Collection | English | 简体中文 | Español |
|---|---|---|---|
| Culture | Chinese Tea Culture | 中国茶文化 | Cultura del té chino |
| Culture | Classical Chinese Gardens | 中国古典园林 | Jardines clásicos chinos |
| Culture | Peking Opera | 京剧 | Ópera de Pekín |
| Festivals | Lantern Festival | 元宵节 | Festival de los Faroles |
| Books | The Dao De Jing | 《道德经》 | Dao De Jing |

Each concept has one immutable `contentId` shared across its locale variants; localized slugs are independent. All variants are `status: draft` and have no `publishedAt`.

## Publication boundary

Production D1 remains the canonical editable content store. This folder is an editorial handoff package only. It is outside `src/content/`, so Astro does not ingest it and it cannot appear on the public site. Do not copy these files into `src/content/` or mark them published to bypass the CMS. After editorial review, create the five concepts and translations through the protected Admin CMS workflow, preserving IDs and localized metadata. Save and read back each D1 draft before submitting a publication PR.

## Editorial notes

- Tea: distinguishes Chinese `hongcha` (红茶, called black tea in English) from `heicha` (黑茶).
- Gardens: UNESCO claims are limited to the Classical Gardens of Suzhou.
- Peking opera: role categories are described as theatrical conventions, not performer identities.
- Lantern Festival: no single legend is presented as a proven origin; regional variation is noted.
- Dao De Jing: authorship and dating are treated as scholarly questions; no translation is called definitive.
- No images are included and no image rights are inferred.

## References

- UNESCO tea heritage: https://ich.unesco.org/en/RL/traditional-tea-processing-techniques-and-associated-social-practices-in-china-01884
- UNESCO Classical Gardens of Suzhou: https://whc.unesco.org/en/list/813/
- UNESCO Peking opera: https://ich.unesco.org/en/RL/peking-opera-00418
- Shanghai Municipal Government Lantern Festival guide: https://english.shanghai.gov.cn/en-KeyDatesAndCustoms/20260122/e6bf3e0801514c808f6b3d1545a88a3c.html
- Stanford Encyclopedia of Philosophy, Laozi: https://plato.stanford.edu/entries/laozi/

## Batch checks

15 article variants; five complete locale triplets; unique contentId/locale pairs; every variant explicitly draft; no production D1 record or public route is changed by this PR.
