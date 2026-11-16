import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";
const schema=z.object({
 contentId:z.string().uuid(),locale:z.literal("zh-TW"),title:z.string(),description:z.string(),category:z.string(),
 status:z.enum(["draft","published","unpublished"]).default("published"),
 chinese:z.string().optional(),pinyin:z.string().optional(),level:z.string().optional(),order:z.number().optional(),
 readingMinutes:z.number().int().positive().default(5),featured:z.boolean().default(false),
 image:z.string().refine((value)=>value.startsWith("/") ? !value.startsWith("//") : /^https:\/\//.test(value)).optional(),imageAlt:z.string().optional(),imageCredit:z.string().optional(),imageCreditUrl:z.string().url().optional()
});
function fromFolder(name:string){return defineCollection({loader:glob({pattern:"**/*.md",base:"./src/content/zh-tw/"+name}),schema});}
export const collections={lessonsTw:fromFolder("lessons"),cultureTw:fromFolder("culture"),festivalsTw:fromFolder("festivals"),booksTw:fromFolder("books")};
