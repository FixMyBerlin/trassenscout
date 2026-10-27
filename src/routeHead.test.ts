import { readFileSync } from "node:fs"
import { describe, expect, test } from "vitest"
import { allowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { surveyLayoutHead } from "@/src/routeHead"

describe("surveyLayoutHead favicon", () => {
  test("uses the yellow icon for KMP without changing the header logo", () => {
    const meta = getConfigBySurveySlug("kmp-messwerte", "meta")
    const head = surveyLayoutHead("kmp-messwerte")

    expect(meta.logoUrl).toBe("https://trassenscout.de/emails/trassenscout-logo-mail-black.png")
    expect(meta.faviconUrl).toBe("/favicon.svg")
    expect(head.links).toContainEqual({
      rel: "icon",
      href: "/favicon.svg",
      type: "image/svg+xml",
    })
    expect(head.links).toContainEqual({ rel: "canonical", href: meta.canonicalUrl })
  })

  test("uses an existing yellow SVG image mark without lettering", () => {
    const svg = readFileSync(new URL("../public/favicon.svg", import.meta.url), "utf8")

    expect(svg).toContain("<svg")
    expect(svg).toContain("#e0ad1e")
    expect(svg).not.toMatch(/<text\b/i)
  })

  test.each(allowedSurveySlugs.filter((slug) => slug !== "kmp-messwerte"))(
    "keeps the existing logo fallback for %s",
    (slug) => {
      const meta = getConfigBySurveySlug(slug, "meta")
      const head = surveyLayoutHead(slug)

      expect(meta.faviconUrl).toBeUndefined()
      expect(head.links.find((link) => link.rel === "icon")?.href).toBe(meta.logoUrl)
    },
  )
})
