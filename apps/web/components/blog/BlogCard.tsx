/**
 * @purpose Render one blog post as a cover, date, and title card.
 * @role    Clickable item in the responsive /blog grid.
 * @deps    BlogCover and the blog content selector.
 * @gotcha  The full card is a single anchor target for reliable static-export navigation.
 */

import { formatDate, type BlogPost } from "@/lib/blog"
import { BlogCover } from "./BlogCover"

export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <a href={post.permalink} className="group flex flex-col">
      <BlogCover
        cover={post.cover}
        width={post.coverWidth}
        height={post.coverHeight}
        thumbhash={post.coverThumbhash}
        title={post.title}
        className="aspect-[16/10] w-full rounded-xl"
        aspectRatio="16 / 10"
      />
      <p className="mt-4 font-lat text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <h3 className="mt-2 text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-ink/70">
        {post.title}
      </h3>
    </a>
  )
}
