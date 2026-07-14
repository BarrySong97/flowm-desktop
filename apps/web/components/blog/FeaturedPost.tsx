/**
 * @purpose Promote the newest article above the grid when the blog becomes busy.
 * @role    Featured list item used once the published-post threshold is reached.
 * @deps    BlogCover and the blog content selector.
 * @gotcha  It is deliberately omitted below the list-page threshold.
 */

import { formatDate, type BlogPost } from "@/lib/blog"
import { BlogCover } from "./BlogCover"

export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <a href={post.permalink} className="group mb-16 grid gap-6 md:grid-cols-2 md:gap-10">
      <BlogCover
        cover={post.cover}
        width={post.coverWidth}
        height={post.coverHeight}
        thumbhash={post.coverThumbhash}
        title={post.title}
        className="aspect-[16/10] w-full rounded-2xl"
        aspectRatio="16 / 10"
      />
      <div className="flex flex-col justify-center">
        <p className="font-lat text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        <h2 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-ink transition-colors group-hover:text-ink/70">
          {post.title}
        </h2>
        <span className="mt-5 text-[13px] font-semibold text-ink/70">阅读文章 →</span>
      </div>
    </a>
  )
}
