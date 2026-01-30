// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  blogPosts: create.doc("blogPosts", {"remark-setup.mdx": () => import("../content/blog/remark-setup.mdx?collection=blogPosts"), "remark.mdx": () => import("../content/blog/remark.mdx?collection=blogPosts"), }),
};
export default browserCollections;