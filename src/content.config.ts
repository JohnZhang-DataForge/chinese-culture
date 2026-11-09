import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const schema = z.object({
  contentId: z.string().uuid(),
  locale: z.enum(["en", "zh-CN", "es"]),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  // Existing published Markdown predates this field; new CMS snapshots set it explicitly.
  status: z.enum(["draft", "published", "unpublished"]).default("published"),
  chinese: z.string().optional(),
  pinyin: z.string().optional(),
  level: z.string().optional(),
  order: z.number().optional(),
  readingMinutes: z.number().int().positive().default(5),
  featured: z.boolean().default(false),
  image: z.string().url().optional(),
  imageAlt: z.string().optional()
});
function fromFolder(name: string) {
  return defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/" + name }),
    schema
  });
}
export const collections = {
  lessons: fromFolder("lessons"),
  culture: fromFolder("culture"),
  festivals: fromFolder("festivals"),
  books: fromFolder("books"),
  lessonsZh: fromFolder("zh-cn/lessons"),
  cultureZh: fromFolder("zh-cn/culture"),
  festivalsZh: fromFolder("zh-cn/festivals"),
  booksZh: fromFolder("zh-cn/books"),
  lessonsEs: fromFolder("es/lessons"),
  cultureEs: fromFolder("es/culture"),
  festivalsEs: fromFolder("es/festivals"),
  booksEs: fromFolder("es/books")
};
