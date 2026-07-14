/**
 * @purpose Compress one image, derive its content-addressed filename, and generate a ThumbHash.
 * @role    Pure image-processing layer used by scripts/img.mjs before R2 upload.
 * @deps    Sharp, thumbhash, and node:crypto.
 * @gotcha  ThumbHash input must be at most 100x100; the BLAKE2b hash is computed
 *          from the final WebP bytes so changed output always receives a new immutable URL.
 */

import { createHash } from "node:crypto"
import sharp from "sharp"
import { rgbaToThumbHash } from "thumbhash"

/**
 * @param {Buffer} inputBuffer
 * @param {{maxWidth?: number, quality?: number}} options
 * @returns {Promise<{webpBuffer: Buffer, width: number, height: number, hash: string, thumbhash: string}>}
 */
export async function processImage(inputBuffer, { maxWidth = 1600, quality = 80 } = {}) {
  const metadata = await sharp(inputBuffer, { failOn: "none" }).metadata()
  const pipeline = sharp(inputBuffer, { failOn: "none" }).rotate()

  if (metadata.width && metadata.width > maxWidth) {
    pipeline.resize({ width: maxWidth })
  }

  const output = await pipeline.webp({ quality }).toBuffer({ resolveWithObject: true })
  const webpBuffer = output.data
  const width = output.info.width
  const height = output.info.height
  const hash = createHash("blake2b512").update(webpBuffer).digest("hex").slice(0, 32)

  const small = await sharp(webpBuffer)
    .resize({ width: 100, height: 100, fit: "inside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const encodedThumbhash = rgbaToThumbHash(small.info.width, small.info.height, small.data)
  const thumbhash = Buffer.from(encodedThumbhash).toString("base64")

  return { webpBuffer, width, height, hash, thumbhash }
}
