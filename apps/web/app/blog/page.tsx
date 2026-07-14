/**
 * @purpose Render the public /blog index of Flowm finance articles.
 * @role    Static App Router list page over Velite-compiled posts.
 * @deps    Blog list components, Flowm Nav/Footer, generated blog selectors, SEO constants.
 * @gotcha  The newest post becomes featured only after FEATURED_THRESHOLD is reached.
 */

import { BlogGrid } from "@/components/blog/BlogGrid"
import { FeaturedPost } from "@/components/blog/FeaturedPost"
import { Footer } from "@/components/Footer"
import { Nav } from "@/components/Nav"
import { publishedPosts } from "@/lib/blog"
import { OG_IMAGE_URL, SITE_NAME } from "@/lib/seo"
import type { Metadata } from "next"

const BLOG_TITLE = "博客"
const BLOG_DESCRIPTION = `来自 ${SITE_NAME} 的个人财务、投资与金钱习惯笔记。`
const FEATURED_THRESHOLD = 6

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    type: "website",
    url: "/blog",
    siteName: SITE_NAME,
    title: `${BLOG_TITLE} · ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    images: [{ url: OG_IMAGE_URL, width: 1200, height: 630, alt: `${SITE_NAME} 博客` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BLOG_TITLE} · ${SITE_NAME}`,
    description: BLOG_DESCRIPTION,
    images: [OG_IMAGE_URL],
  },
}

export default function BlogPage() {
  const posts = publishedPosts
  const isFeaturedLayout = posts.length >= FEATURED_THRESHOLD
  const featured = isFeaturedLayout ? posts[0] : null
  const gridPosts = isFeaturedLayout ? posts.slice(1) : posts

  return (
    <>
      <Nav />
      <div className="bg-surface text-sm">
        <main className="mx-auto max-w-[1320px] px-[22px] pb-16 pt-[50px]">
          <div className="max-w-2xl">
            <p className="font-lat text-[11px] font-semibold uppercase tracking-[0.16em] text-green">
              Blog
            </p>
            <h1 className="mt-3 text-[40px] font-bold leading-tight tracking-tight text-ink">
              关于金钱的写作
            </h1>
            <p className="mt-4 text-[15px] leading-7 text-ink/65">{BLOG_DESCRIPTION}</p>
          </div>

          <div className="mt-12">
            {posts.length === 0 ? (
              <p className="text-[15px] text-ink/55">暂时还没有已发布的文章，稍后再来看看。</p>
            ) : (
              <>
                {featured ? <FeaturedPost post={featured} /> : null}
                <BlogGrid posts={gridPosts} />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
