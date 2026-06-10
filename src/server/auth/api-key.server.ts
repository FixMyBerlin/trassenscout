import { timingSafeEqual } from "node:crypto"

export function compareApiKeyTimingSafe(
  actual: string | null | undefined,
  expected: string | undefined,
) {
  if (!actual || !expected) return false

  const actualBuffer = Buffer.from(actual)
  const expectedBuffer = Buffer.from(expected)

  if (actualBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(actualBuffer, expectedBuffer)
}
