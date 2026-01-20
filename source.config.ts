import {
  frontmatterSchema,
  defineCollections,
} from "fumadocs-mdx/config";
import { z } from "zod";

export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    date: z.iso.date().or(z.date()),
  }),
});