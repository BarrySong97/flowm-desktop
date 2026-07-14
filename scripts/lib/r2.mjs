/**
 * @purpose Load local R2 configuration and upload immutable content-addressed image objects.
 * @role    Cloudflare R2/S3 transport used by scripts/img.mjs.
 * @deps    aws4fetch and node:fs.
 * @gotcha  Real credentials belong only in ignored `.env`; uploads use the S3
 *          service with region `auto` and one-year immutable caching.
 */

import { existsSync, readFileSync } from "node:fs"
import { AwsClient } from "aws4fetch"

export function loadEnv(path = ".env") {
  const env = { ...process.env }

  if (existsSync(path)) {
    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
      if (/^\s*#/.test(line) || !line.trim()) continue
      const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!match) continue

      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      env[match[1]] = value
    }
  }

  return env
}

export function r2Config(env) {
  const required = [
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "R2_PUBLIC_BASE",
  ]
  const missing = required.filter((key) => !env[key])

  if (missing.length > 0) {
    throw new Error(`缺少 R2 环境变量：${missing.join(", ")}（复制 .env.example 为 .env 后填写）`)
  }

  return {
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    publicBase: env.R2_PUBLIC_BASE.replace(/\/+$/, ""),
    keyPrefix: (env.R2_KEY_PREFIX || "blog").replace(/^\/+|\/+$/g, ""),
  }
}

export function publicUrl(config, key) {
  return `${config.publicBase}/${key}`
}

export async function uploadToR2(config, key, body, contentType) {
  const client = new AwsClient({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    service: "s3",
    region: "auto",
  })
  const endpoint = `https://${config.accountId}.r2.cloudflarestorage.com/${config.bucket}/${key}`
  const response = await client.fetch(endpoint, {
    method: "PUT",
    body,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })

  if (!response.ok) {
    const responseText = await response.text().catch(() => "")
    throw new Error(`R2 上传失败 ${response.status} ${response.statusText}: ${responseText}`)
  }

  return publicUrl(config, key)
}
