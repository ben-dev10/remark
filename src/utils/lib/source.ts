import { toFumadocsSource } from "fumadocs-mdx/runtime/server";
import { loader } from 'fumadocs-core/source';
import { blogPosts } from "@/.source";

export const blog = loader({
  baseUrl: "/blog",
  source: toFumadocsSource(blogPosts, []),
});