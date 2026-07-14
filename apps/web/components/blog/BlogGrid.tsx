/**
 * @purpose Lay out blog cards in a responsive one- or two-column grid.
 * @role    List wrapper for the /blog route.
 * @deps    BlogCard and the generated BlogPost type.
 * @gotcha  The design intentionally stops at two columns to preserve the reference rhythm.
 */

import type { BlogPost } from "@/lib/blog"
import { BlogCard } from "./BlogCard"

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2">
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  )
}
