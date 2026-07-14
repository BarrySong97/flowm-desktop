/**
 * @purpose Compile content/blog MDX files into typed, renderable blog data.
 * @role    Velite collection schema and MDX build configuration for apps/web.
 * @deps    Velite and rehype-slug.
 * @gotcha  Heading ids must use the same slugger as s.toc() so TOC links and
 *          rendered article anchors remain aligned.
 */

import rehypeSlug from "rehype-slug"
import { defineCollection, defineConfig, s } from "velite"

const posts = defineCollection({
  name: "Post",
  pattern: "blog/**/*.mdx",
  schema: s
    .object({
      title: s.string(),
      date: s.isodate(),
      excerpt: s.excerpt(),
      cover: s.string().optional(),
      coverWidth: s.number().optional(),
      coverHeight: s.number().optional(),
      coverThumbhash: s.string().optional(),
      author: s.string().default("Barry"),
      draft: s.boolean().default(false),
      path: s.path(),
      metadata: s.metadata(),
      toc: s.toc(),
      code: s.mdx(),
    })
    .transform((data) => {
      const slug = data.path.replace(/^blog\//, "")
      return { ...data, slug, permalink: `/blog/${slug}` }
    }),
})

export default defineConfig({
  root: "content",
  collections: { posts },
  mdx: {
    gfm: true,
    rehypePlugins: [rehypeSlug],
  },
})
