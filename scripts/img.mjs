#!/usr/bin/env node
/**
 * @purpose Process one blog MDX file's local/remote images into hashed WebP assets on Cloudflare R2.
 * @role    `pnpm img <slug|mdx path>` CLI that orchestrates compression, upload, ThumbHash, and MDX rewriting.
 * @deps    scripts/lib/process-image.mjs, scripts/lib/r2.mjs, and node fs/path APIs.
 * @gotcha  `--dry-run` never uploads or rewrites; existing <BlogImage> tags and
 *          already-processed covers are idempotent. See docs/topics/blog-images.md.
 */

import { dirname, isAbsolute, join, resolve } from "node:path"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { processImage } from "./lib/process-image.mjs"
import { loadEnv, r2Config, uploadToR2 } from "./lib/r2.mjs"

const CLOUD_IMAGE_DOMAIN = "https://blogassets.4real.ink"
const BLOG_DIR = resolve("apps/web/content/blog")

const args = process.argv.slice(2)
const dryRun = args.includes("--dry-run")
const positional = args.filter((argument) => !argument.startsWith("--"))
const target = positional[0]

if (!target) {
  console.error("用法：pnpm img <slug 或 mdx 路径> [--dry-run]")
  process.exit(1)
}

function resolveMdx(value) {
  if (existsSync(value) && /\.mdx?$/.test(value)) return resolve(value)

  for (const extension of [".mdx", ".md"]) {
    const candidate = join(BLOG_DIR, value + extension)
    if (existsSync(candidate)) return candidate
  }

  return null
}

const mdxPath = resolveMdx(target)
if (!mdxPath) {
  console.error(`找不到文章：${target}（既不是 MDX 文件，也不是 ${BLOG_DIR} 下的 slug）`)
  process.exit(1)
}

let content = readFileSync(mdxPath, "utf8")
const mdxDirectory = dirname(mdxPath)
const markdownImagePattern = /!\[([^\]]*)\]\((?:<([^>]+)>|((?:[^()\n]|\([^()\n]*\))*))\)/g
const matches = [...content.matchAll(markdownImagePattern)]
  .map((match) => ({
    full: match[0],
    alt: match[1],
    src: (match[2] ?? match[3]).trim(),
  }))
  .filter((match) => !/^(data:|\/\/)/i.test(match.src))

const config = dryRun ? null : r2Config(loadEnv())
console.log(
  `处理 ${mdxPath} — 正文 ${matches.length} 张待处理${dryRun ? "（dry-run，不上传）" : ""}`,
)

async function fetchImage(url) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(url, { redirect: "follow" })
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`)

      const contentType = response.headers.get("content-type") || ""
      if (!/^image\//i.test(contentType)) {
        throw new Error(`返回的不是图片（content-type=${contentType || "?"}）`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await new Promise((resolveRetry) => setTimeout(resolveRetry, 600 * attempt))
      }
    }
  }

  throw lastError
}

async function loadImageBytes(rawSource) {
  if (/^https?:/i.test(rawSource)) return fetchImage(rawSource)

  const source = rawSource.replace(/^\.\//, "")
  const candidates = [
    isAbsolute(source) ? source : resolve(mdxDirectory, source),
    resolve("apps/web/public", source.replace(/^\//, "")),
    resolve(source),
  ]
  const localPath = candidates.find((candidate) => existsSync(candidate))

  if (localPath) return readFileSync(localPath)
  if (rawSource.startsWith("/")) return fetchImage(CLOUD_IMAGE_DOMAIN + rawSource)

  throw new Error("找不到本地文件，也无法解析为远程图片")
}

let converted = 0

for (const { full, alt: rawAlt, src: rawSource } of matches) {
  if (config && rawSource.startsWith(`${config.publicBase}/${config.keyPrefix}/`)) {
    console.log(`  · 跳过（已在目标 R2）：${rawSource}`)
    continue
  }

  let imageBytes
  try {
    imageBytes = await loadImageBytes(rawSource)
  } catch (error) {
    console.warn(`  ⚠️ 跳过 ${rawSource}：${error.message}`)
    continue
  }

  const { webpBuffer, width, height, hash, thumbhash } = await processImage(imageBytes)
  const keyPrefix = dryRun ? "<prefix>" : config.keyPrefix
  const key = `${keyPrefix}/${hash}.webp`
  const url = dryRun
    ? `<R2_PUBLIC_BASE>/${key}`
    : await uploadToR2(config, key, webpBuffer, "image/webp")

  console.log(
    `  · ${rawSource} → ${url}  ${width}x${height} ${(webpBuffer.length / 1024).toFixed(0)}KB`,
  )

  const alt = rawAlt.replace(/"/g, "&quot;")
  const component = `<BlogImage src="${url}" alt="${alt}" width={${width}} height={${height}} thumbhash="${thumbhash}" />`
  content = content.replace(full, () => component)
  converted++
}

function setFrontmatterField(frontmatter, key, value) {
  const pattern = new RegExp(`^${key}\\s*:.*$`, "m")
  return pattern.test(frontmatter)
    ? frontmatter.replace(pattern, () => `${key}: ${value}`)
    : `${frontmatter}\n${key}: ${value}`
}

let coverChanged = false
const frontmatterMatch = content.match(/^(---\r?\n)([\s\S]*?)(\r?\n---)/)

if (frontmatterMatch) {
  const frontmatter = frontmatterMatch[2]
  const coverMatch = frontmatter.match(/^cover\s*:\s*["']?([^"'\n]+?)["']?\s*$/m)
  const cover = coverMatch?.[1]?.trim()
  const alreadyOnTarget =
    config && cover && cover.startsWith(`${config.publicBase}/${config.keyPrefix}/`)
  const alreadyProcessed = /^coverThumbhash\s*:/m.test(frontmatter)

  if (cover && !alreadyOnTarget && !alreadyProcessed) {
    try {
      const { webpBuffer, width, height, hash, thumbhash } = await processImage(
        await loadImageBytes(cover),
      )
      const keyPrefix = dryRun ? "<prefix>" : config.keyPrefix
      const key = `${keyPrefix}/${hash}.webp`
      const url = dryRun
        ? `<R2_PUBLIC_BASE>/${key}`
        : await uploadToR2(config, key, webpBuffer, "image/webp")

      console.log(
        `  封面 ${cover} → ${url}  ${width}x${height} ${(webpBuffer.length / 1024).toFixed(0)}KB`,
      )

      let nextFrontmatter = setFrontmatterField(frontmatter, "cover", `"${url}"`)
      nextFrontmatter = setFrontmatterField(nextFrontmatter, "coverWidth", String(width))
      nextFrontmatter = setFrontmatterField(nextFrontmatter, "coverHeight", String(height))
      nextFrontmatter = setFrontmatterField(nextFrontmatter, "coverThumbhash", `"${thumbhash}"`)
      content =
        frontmatterMatch[1] +
        nextFrontmatter +
        frontmatterMatch[3] +
        content.slice(frontmatterMatch[0].length)
      coverChanged = true
    } catch (error) {
      console.warn(`  ⚠️ 封面跳过 ${cover}：${error.message}`)
    }
  } else if (cover && (alreadyOnTarget || alreadyProcessed)) {
    console.log("  封面已处理，跳过")
  }
}

if (converted === 0 && !coverChanged) {
  console.log("无改动（图片都已处理或无法读取），不改写文件。")
  process.exit(0)
}

if (dryRun) {
  console.log(`dry-run：未写回 MDX（正文 ${converted} 张${coverChanged ? " + 封面" : ""}）。`)
  process.exit(0)
}

writeFileSync(mdxPath, content, "utf8")
console.log(`✅ 已改写 ${mdxPath}（正文 ${converted} 张${coverChanged ? " + 封面" : ""}）`)
