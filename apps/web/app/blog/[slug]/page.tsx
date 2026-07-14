/**
 * @purpose Render one statically-exported MDX article with SEO and a right-gutter TOC.
 * @role    Dynamic App Router detail route backed by generated static params.
 * @deps    Velite blog selectors, MDX/TOC components, Flowm Nav/Footer, SEO constants.
 * @gotcha  Unknown slugs must 404 because output:"export" only emits generated params.
 */

import { BlogCover } from "@/components/blog/BlogCover"
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents"
import { MDXContent } from "@/components/blog/MDXContent"
import { Footer } from "@/components/Footer"
import { Nav } from "@/components/Nav"
import { formatDate, getPostBySlug, publishedPosts, type BlogPost } from "@/lib/blog"
import { OG_IMAGE_URL, SITE_ICON_URL, SITE_NAME, SITE_URL } from "@/lib/seo"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamicParams = false

export function generateStaticParams() {
  return publishedPosts.map((post) => ({ slug: post.slug }))
}

function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString()
}

function coverUrl(post: BlogPost): string {
  return absoluteUrl(post.cover ?? OG_IMAGE_URL)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const image = coverUrl(post)

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.permalink },
    openGraph: {
      type: "article",
      url: post.permalink,
      siteName: SITE_NAME,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      authors: [post.author],
      images: [{ url: image, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [image],
    },
  }
}

function ArticleJsonLd({ post }: { post: BlogPost }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: [coverUrl(post)],
    author: { "@type": "Person", name: post.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: absoluteUrl(SITE_ICON_URL) },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(post.permalink) },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  return (
    <>
      <Nav />
      <div className="bg-surface text-sm">
        <ArticleJsonLd post={post} />
        <main className="pb-24 pt-[50px]">
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl">
              <a href="/blog" className="text-[13px] text-ink/55 transition-colors hover:text-ink">
                ← 所有文章
              </a>

              <header className="mt-8">
                <p className="font-lat text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                </p>
                <h1 className="mt-3 text-[34px] font-bold leading-tight tracking-tight text-ink">
                  {post.title}
                </h1>
                <p className="mt-3 text-[13px] text-ink/50">
                  {post.author} · 阅读 {post.metadata.readingTime} 分钟
                </p>
              </header>

              {post.cover ? (
                <BlogCover
                  cover={post.cover}
                  width={post.coverWidth}
                  height={post.coverHeight}
                  thumbhash={post.coverThumbhash}
                  title={post.title}
                  className="mt-8 aspect-[16/9] w-full rounded-2xl"
                  aspectRatio="16 / 9"
                  zoomable
                />
              ) : null}

              <article className="prose prose-neutral mt-10 max-w-none prose-headings:scroll-mt-[120px] prose-a:text-ink">
                <MDXContent code={post.code} />
              </article>
            </div>

            <aside className="absolute inset-y-0 right-2 hidden w-52 xl:block">
              <div className="sticky top-[112px]">
                <BlogTableOfContents toc={post.toc} />
              </div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>
    </>
  )
}
