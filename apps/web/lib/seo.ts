/**
 * @purpose Centralize SEO constants for the Flowm marketing site.
 * @role    Shared source for metadata, robots, sitemap, manifest, and JSON-LD.
 * @gotcha  Keep SITE_URL in sync with the canonical production Cloudflare Pages domain.
 */

export const SITE_URL = "https://flowmoney.pages.dev"
export const SITE_NAME = "Flowm"
export const SITE_TITLE = "Flowm — 本地优先的个人财务与记账工具"
export const SITE_DESCRIPTION =
  "Flowm 是本地优先的个人财务工具，用 AI Agent 导入账单，记录流水、账户余额、订阅与贷款。只呈现，不替你判断；只记录，不强行对账。"
export const GITHUB_URL = "https://github.com/BarrySong97/flowm-desktop"
export const GITHUB_RELEASES_URL = `${GITHUB_URL}/releases`
export const GITHUB_LATEST_RELEASE_URL = `${GITHUB_RELEASES_URL}/latest`
export const DOWNLOAD_URL = GITHUB_LATEST_RELEASE_URL
export const SITE_ICON_URL = "/app-icon.png"
export const OG_IMAGE_URL = "/og-image.png"

export const SEO_KEYWORDS = [
  "Flowm",
  "本地记账",
  "个人财务",
  "账单导入",
  "AI 记账",
  "订阅管理",
  "贷款管理",
  "本地优先",
  "财务仪表盘",
]
