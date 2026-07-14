/**
 * @purpose Expose Velite-generated posts in the order and shape used by blog routes.
 * @role    Filtering, lookup, and deterministic Chinese date formatting layer.
 * @deps    Generated ../.velite collection.
 * @gotcha  Drafts never appear in routes, static params, or sitemap entries.
 */

import { posts, type Post } from "../.velite"

export type BlogPost = Post
export type BlogToc = Post["toc"]

export const publishedPosts: BlogPost[] = posts
  .filter((post) => !post.draft)
  .sort((a, b) => b.date.localeCompare(a.date))

export function getPostBySlug(slug: string): BlogPost | undefined {
  return publishedPosts.find((post) => post.slug === slug)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}
