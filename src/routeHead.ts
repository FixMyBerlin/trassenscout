import type { AllowedSurveySlugs } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { getConfigBySurveySlug } from "@/src/components/beteiligung/shared/utils/getConfigBySurveySlug"
import { isProduction } from "@/src/components/core/utils/isEnv"
import ogImageUrl from "@/src/components/shared/app/layouts/assets/og-image-default.png"
import { APP_META } from "@/src/meta.const"

const ROBOTS_NOINDEX = { name: "robots", content: "noindex" } as const

export type RouteHeadOptions = {
  /** When false, omit noindex even on private routes. Defaults to true for private/auth/content helpers. */
  noindex?: boolean
}

const NOT_FOUND_TITLE = "Seite nicht gefunden (Fehler 404)"

/** Document head for the root route – default SEO, social, and non-production noindex. */
function rootHead() {
  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: APP_META.themeColor },
      { title: APP_META.title },
      { name: "description", content: APP_META.description },
      { property: "og:title", content: APP_META.title },
      { property: "og:description", content: APP_META.description },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "de_DE" },
      { property: "og:url", content: APP_META.siteUrl },
      { property: "og:image", content: ogImageUrl },
      { property: "og:image:width", content: String(APP_META.ogImage.width) },
      { property: "og:image:height", content: String(APP_META.ogImage.height) },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:creator", content: APP_META.twitterCreator },
      { name: "twitter:image", content: ogImageUrl },
      ...(!isProduction ? [ROBOTS_NOINDEX] : []),
    ],
    links: [...APP_META.faviconLinks],
  }
}

/** 404 pages – ported from the pre-migration `not-found.tsx` metadata. */
function notFoundPageHead() {
  return publicPageHead(NOT_FOUND_TITLE)
}

/** Root `head()` – switches to 404 metadata when the active match is not found. */
export function resolveRootHead(matches: Array<{ status: string }>) {
  if (matches.some((match) => match.status === "notFound")) {
    return notFoundPageHead()
  }
  return rootHead()
}

/** Layout routes for authenticated app areas – always noindex. */
export function privateLayoutHead() {
  return { meta: [ROBOTS_NOINDEX] }
}

/** Admin layout – default title from pre-migration `(admin)/admin/layout` metadata. */
export function adminLayoutHead() {
  return { meta: [{ title: "ADMIN Trassenscout" }, ROBOTS_NOINDEX] }
}

/** Public/auth/content pages using the root title suffix (`%s – Trassenscout`). */
export function publicPageHead(title: string, options?: RouteHeadOptions) {
  return pageHead(`${title} – ${APP_META.title}`, options)
}

export function privateTitleHead(title: string) {
  return { meta: [{ title: `${title} – ${APP_META.privateTitleSuffix}` }] }
}

export function adminTitleHead(title: string) {
  return { meta: [{ title: `ADMIN: ${title} – ${APP_META.privateTitleSuffix}` }] }
}

export function absoluteTitleHead(title: string) {
  return { meta: [{ title }] }
}

function pageHead(title: string, options?: RouteHeadOptions) {
  const noindex = options?.noindex ?? true
  return {
    meta: [{ title }, ...(noindex ? [ROBOTS_NOINDEX] : [])],
  }
}

/** Public survey participation layout – per-survey icon, canonical URL, and noindex. */
export function surveyLayoutHead(surveySlug: AllowedSurveySlugs) {
  const { logoUrl, canonicalUrl, title } = getConfigBySurveySlug(surveySlug, "meta")
  return {
    meta: [
      { title: `${title} ${surveySlug.toUpperCase()}` },
      { name: "description", content: "Beteiligung" },
      ROBOTS_NOINDEX,
      { property: "og:url", content: canonicalUrl },
    ],
    links: [
      { rel: "canonical", href: canonicalUrl },
      { rel: "icon", href: logoUrl },
    ],
  }
}
