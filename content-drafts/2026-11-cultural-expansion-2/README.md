# Cultural Expansion — Editorial Draft Batch 2

**Prepared:** 2026-11-15  
**Scope:** Five additional concepts × three locales = 15 complete article drafts  
**Locales:** `en`, `zh-CN`, `es`  
**Publication state:** Draft only; outside the Astro content loader.

| Collection | English | 简体中文 | Español |
|---|---|---|---|
| Culture | Chinese Paper-Cutting | 中国剪纸 | Recorte de papel chino |
| Culture | Chinese Shadow Puppetry | 中国皮影戏 | Teatro chino de sombras |
| Culture | Chinese Porcelain / Jingdezhen | 中国瓷器与景德镇 | Porcelana china / Jingdezhen |
| Festivals | Qingming Festival | 清明节 | Festival Qingming |
| Books | Romance of the Three Kingdoms | 《三国演义》 | Romance de los Tres Reinos |

Each concept has one immutable `contentId`, shared across its three locale variants. Locale-specific slugs, titles, descriptions and category labels are maintained independently. Each file follows CC-CONTENT-001 v1.2.0 draft metadata and includes a `sources` array. All variants are `status: draft`; none has `publishedAt`.

## Source-of-truth and release boundary

Cloudflare D1 remains the canonical editable content store. This directory is an editorial handoff package only. It is outside `src/content/`, so Astro does not ingest these files and they do not create public routes or sitemap entries.

Do not copy these files into `src/content/` or directly write production D1 to bypass the CMS. After native-language editorial review, create the five conceptual items and their locale variants through the protected Admin CMS workflow, preserving each shared `contentId`, locale-specific slug and metadata. Save and read back each D1 draft before submitting any review or publication PR.

## Editorial review notes

- Paper-cutting: describes regional variation and contemporary practice; avoids implying a single motif or meaning is universal.
- Shadow puppetry: distinguishes materials, manipulation, music and transmission practices; avoids treating one regional form as the only form.
- Porcelain: uses Smithsonian sources for production stages and Jingdezhen's role; avoids implying all porcelain recipes or production centers are identical.
- Qingming: distinguishes the solar term from family and regional customs; avoids asserting a fixed Gregorian date or universal ritual.
- Three Kingdoms: distinguishes historical setting from literary invention and uses “traditionally attributed to Luo Guanzhong” rather than overstating authorship.
- No images are included; no image rights or credits are inferred.

## References

- UNESCO, Chinese paper-cut: https://ich.unesco.org/en/RL/chinese-paper-cut-00219
- UNESCO, Chinese shadow puppetry: https://ich.unesco.org/en/RL/chinese-shadow-puppetry-00421
- Smithsonian National Museum of Asian Art, Porcelain: https://asia-archive.si.edu/learn/for-educators/teaching-china-with-the-smithsonian/videos/porcelain/
- Smithsonian National Museum of Asian Art, Porcelain Production at Jingdezhen: https://asia-archive.si.edu/exhibition/porcelain-production-jingdezhen/
- Shanghai Municipal Government, Spring outing for Qingming: https://english.shanghai.gov.cn/en-FestivalsCelebrations/20260403/39ae207f71e64c479638651f9c03a8a3.html
- China Culture, Qingming: https://en.chinaculture.org/focus/focus/2013cdgjfyj/2011-05/25/content_463862.htm
- University of California Press, Three Kingdoms: A Historical Novel: https://www.ucpress.edu/book/9780520225039/three-kingdoms-a-historical-novel
- University of North Georgia, World Literature I: The Romance of the Three Kingdoms: https://ung.edu/university-press/_uploads/files/World-Lit-Part-2.pdf

## Batch validation

- Five unique concepts and fifteen locale variants.
- Five complete `en` / `zh-CN` / `es` triplets.
- Unique `contentId` / locale pairs and localized file paths.
- Required contract metadata, source references and non-empty article bodies.
- All variants are drafts; no production D1 record, published snapshot or public route is changed by this PR.
