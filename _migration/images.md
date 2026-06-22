# Image migration: Next.js `next/image` → TanStack Start (TILDA pattern)

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app)  
Source: Trassenscout `src/app/`, `src/core/`, `next.config.js`

Related: [`tech-stack-migration.md`](./tech-stack-migration.md), [`routes.md`](./routes.md)

---

## Executive summary

Trassenscout uses **`next/image`** in **9 active components** (plus **2 commented-out** usages). Images fall into four buckets: **bundled static assets**, **external survey/partner URLs**, **S3 upload previews** (via authenticated API proxy), and **legacy nginx `/assets/` proxying** (disabled). **`next.config.js` `images.remotePatterns` / `domains`** exist solely to satisfy `next/image` — there is **no Vite/TanStack equivalent** and **no replacement is required** if we drop `next/image`.

TILDA Geo (already on TanStack Start) uses a thin **`Img`** wrapper (`<img>`), **Vite static imports** for local files, **raw HTTPS URLs** for external logos, and **server-side S3 proxy routes** for dataset delivery — not for UI thumbnails.

| Concern                            | Trassenscout today                              | TILDA pattern                                | Migration action                                                      |
| ---------------------------------- | ----------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| UI component                       | `next/image`                                    | `Img` → native `<img>`                       | Replace 1:1                                                           |
| Local SVG/PNG/JPG                  | Webpack/Next import + `Image`                   | Vite import (URL string) + `Img`             | Same as TILDA                                                         |
| External logos (surveys, partners) | `next/image` + `images.domains`                 | `Img` + raw URL                              | Same as TILDA; delete domains config                                  |
| Upload thumbnails                  | `next/image` + presigned S3 **or** auth API URL | Not applicable in TILDA (no user uploads UI) | **Auth API proxy** — same-origin URL, S3 behind the scenes; see below |
| Legacy project logos               | `getProxyImageSrc` → `/assets/` (nginx)         | N/A                                          | **Drop or redesign** — currently disabled                             |
| OG / social images                 | `generateMetadata` + imported PNG `.src`        | `__root.tsx` `head()` (no og:image today)    | Port metadata; optional og:image                                      |
| S3 allowlist                       | `remotePatterns` for bucket hostname            | N/A                                          | **Delete** with `next.config.js`                                      |

---

## Trassenscout inventory

### 1. `next/image` usages (active)

| File                                                                              | Pattern                                                       | Image source                                                                            |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/app/_components/layouts/navigation/NavigationLoggedOut/TrassenscoutLogo.tsx` | `width` / `height`                                            | Bundled SVG import                                                                      |
| `src/app/auth/_components/layouts/TitleBodyWrapper.tsx`                           | `height` only                                                 | Bundled SVG import                                                                      |
| `src/app/(loggedInGeneral)/dashboard/_components/NoProjectMembershipsYet.tsx`     | `height`                                                      | Bundled SVG import                                                                      |
| `src/app/(marketing)/_components/MarketingPageLinks.tsx`                          | `width` / `height`                                            | Bundled SVG imports (3 icons)                                                           |
| `src/app/(marketing)/_components/MarketingPagePhotos.tsx`                         | `fill` + `sizes`                                              | Bundled JPG imports (5 photos)                                                          |
| `src/app/(content)/kontakt/page.tsx`                                              | `width` / `height` (one SVG), implicit (one SVG)              | Bundled SVG imports                                                                     |
| `src/app/beteiligung/_components/layout/SurveyHeader.tsx`                         | `fill` + `sizes` + `priority`                                 | **External URL** from survey config (`logoUrl`)                                         |
| `src/app/beteiligung/_radnetz-brandenbrug/SurveyBB.tsx`                           | plain `Image` (no dimensions)                                 | Bundled JPG import                                                                      |
| `src/app/(loggedInProjects)/[projectSlug]/uploads/_components/UploadIcon.tsx`     | `width` / `height`, `unoptimized` for SVG, `onError` fallback | **Target:** auth API `/api/{projectSlug}/uploads/{id}/{filename}` (remove presigned S3) |

### 2. `next/image` usages (commented / disabled)

| File                                                                               | Notes                                                                   |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `src/app/_components/layouts/navigation/NavigationLoggedInProject/ProjectLogo.tsx` | Uses `getProxyImageSrc(project.logoSrc)` — returns `null` (issue #2155) |
| `src/app/_components/layouts/footer/FooterLogos.tsx`                               | Same proxy pattern for `partnerLogoSrcs` — disabled                     |

### 3. Static assets without `next/image`

| File                                                            | Role                                                         |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| `src/app/_components/layouts/defaultMetadata.ts`                | OG/Twitter image via imported PNG (`SocialSharingImage.src`) |
| `src/core/layouts/MetaTags/MetaTags.tsx`                        | Legacy Pages-router meta; imported PNG                       |
| `src/app/icon.svg`, `src/app/favicon.svg`, `public/favicon.svg` | App icons                                                    |
| `public/radnetz-brandenburg/`                                   | Static public assets (README only in repo snapshot)          |

### 4. Upload preview pipeline (images in UI, not `next/image`-specific)

**Target architecture:** the browser sees a normal same-origin image URL; the server checks auth, fetches from S3, and streams the bytes back.

```
UploadIcon / UploadPreview
  → Img src={uploadUrl(upload, projectSlug)}
    → GET /api/{projectSlug}/uploads/{id}/{filename}
      → auth (project membership)
      → getObject from S3
      → Response with Content-Type, body
```

**Today (to remove):** list/detail queries attach **`previewImageUrl`** (presigned S3, 10 min) via `withUploadPreviewUrl` — only needed because `next/image` required direct S3 hostnames in `remotePatterns`. Drop this on migration.

- **`isImageUpload`** — `src/core/uploads/isImageUpload.ts` (mime + extension detection); re-exported in uploads UI utils.
- **`uploadUrl`** — `/api/{projectSlug}/uploads/{id}/{filename}` (authenticated S3 proxy via `@better-upload/server` `getObject`).
- **Auth route (migrate)** — `src/app/api/(auth)/[projectSlug]/uploads/[uploadId]/[...rest]/route.ts` → `src/routes/api/$projectSlug/uploads/$uploadId/$.ts`.

Upload list/detail UI: `UploadPreview` → `UploadIcon`. PDFs use `react-pdf` (`UploadPdfViewer`) — separate from image migration but shares the same `uploadUrl` helper.

### 5. `next.config.js` image configuration

```js
images: {
  remotePatterns: [{ protocol: "https", hostname: "{S3_BUCKET}.s3.{region}.amazonaws.com", pathname: "/**" }],
  domains: [
    "tinkering.trassenscout.de", "staging.trassenscout.de", "trassenscout.de",
    "radschnellweg8-lb-wn.de", "develop--frm-7-landingpage.netlify.app",
    "radschnellweg-frm7.de", "www.oberhavel.de",
  ],
}
```

- **`remotePatterns`**: only needed today for presigned S3 URLs in `UploadIcon` — **removed** with presigned previews and `next/image`.
- **`domains`**: required for **survey `logoUrl`** values (external project sites). Overlaps with beteiligung configs under `src/app/beteiligung/_*/config.tsx`.

**Both blocks are deleted with Next.js** — they have no role in Vite/TanStack Start.

### 6. Legacy S3 / nginx proxy — `getProxyImageSrc`

```ts
// src/core/utils/getProxyImageSrc.ts
export const getProxyImageSrc = (logoSrc: string) => {
  const origin = getPrdOrStgDomain()
  return `${origin}/assets/${logoSrc}`
}
```

Comment references `docker/nginx/default.conf.tpl` — **not present in this repo** (likely infra/deploy). Intended for `Project.logoSrc` filenames (e.g. `rsv8-logo.png` on S3, served at `https://trassenscout.de/assets/rsv8-logo.png`). Schema marks `logoSrc` as **UNUSED**; UI is disabled.

---

## TILDA Geo reference (TanStack Start)

### UI images

TILDA uses **`src/components/shared/Img.tsx`** — a typed passthrough to `<img>`:

```tsx
export const Img = ({ src, alt = "", ...props }: ImgProps) => {
  return <img src={src} alt={alt} {...props} />
}
```

**Usage patterns observed:**

| Pattern              | Example                                                       | Vite import result              |
| -------------------- | ------------------------------------------------------------- | ------------------------------- |
| Bundled SVG/PNG/JPG  | `HeaderAppLogo`, `Footer`, `HomePageLive`                     | URL string passed to `src`      |
| External HTTPS logos | `regions.const.ts` → `externalLogoPath`, `HeaderRegionenLogo` | Raw URL, no proxy               |
| OSM user avatar      | `UserLoggedIn`                                                | External URL                    |
| Traffic sign sprites | `TrafficSignImg`                                              | Static path under public/assets |
| Email                | `@react-email/components` `Img`                               | Absolute URL                    |

**No** `next/image`, **no** `remotePatterns`, **no** build-time image optimizer plugin in `vite.config.ts`.

### S3 / proxy (datasets, not UI thumbnails)

TILDA’s upload system serves **GeoJSON/PMTiles** via **`proxyS3Url`** on `GET /api/uploads/{slug}.{format}` — see [`tilda-geo/docs/Uploads.md`](../../tilda-geo/docs/Uploads.md).

- Range requests, ETag/304, optional GeoJSON compression.
- Auth via `guardRegionMembership` for private datasets.
- **Different product concern** from Trassenscout’s per-project document uploads — similar _server proxy_ idea, different routes and auth.

### Document head / favicons

- **`__root.tsx` `head()`**: title, description, theme-color, favicon links from `public/`.
- **`scripts/generate-favicons`**: favicon.ico, PNG sizes, `manifest.json` from source SVG.
- **No `og:image`** in TILDA root meta today (Trassenscout has OG PNG in `defaultMetadata`).

---

## What can migrate the same way as TILDA

### A. Add shared `Img` component

Copy TILDA’s `Img.tsx` to `src/components/shared/Img.tsx` (or equivalent path after route migration). Use it everywhere `next/image` appears.

Optional enhancements (not in TILDA today, low cost):

```tsx
<img src={src} alt={alt} loading="lazy" decoding="async" {...props} />
```

Use `loading="eager"` / omit lazy only for above-the-fold logos (survey header, auth logo) where Trassenscout used `priority`.

### B. Bundled static assets (logos, marketing, kontakt, SurveyBB atlas)

**Before (Next):**

```tsx
import Logo from "./assets/logo.svg"
import Image from "next/image"
;<Image src={Logo} alt="…" height={30} width={84} />
```

**After (TILDA / Vite):**

```tsx
import logo from "./assets/logo.svg"
import { Img } from "@/components/shared/Img"
;<Img src={logo} alt="…" height={30} width={84} className="h-[30px] w-auto" />
```

Vite resolves `.svg`, `.png`, `.jpg` imports to **URL strings** (hashed in production). No `@svgr` in TILDA — SVGs are **not** React components unless we add a plugin later.

**`MarketingPagePhotos` (`fill` + `sizes`):** replace with a positioned container + `Img` + Tailwind, matching TILDA `HomePageLive`:

```tsx
<div className="relative aspect-square w-44 overflow-hidden sm:w-72 …">
  <Img src={image} alt="" className="h-full w-full object-cover" />
</div>
```

### C. External survey logos (`SurveyHeader`)

Survey configs already store absolute URLs (`logoUrl` in `src/app/beteiligung/_*/config.tsx`). TILDA uses the same approach for `externalLogoPath`.

**After:** `Img src={logoSrc}` with fixed-size container (`h-[50px] w-[50px] object-contain`). **Remove** all hostnames from any config — they were only for `next/image`.

### D. Metadata & OG image

Port `defaultMetadata` openGraph/twitter images to TanStack **`head()`** on root or layout routes:

- Import OG PNG via Vite (URL string) or place in `public/` (e.g. `/og-image-default.png`).
- TILDA does not set `og:image` globally; Trassenscout **should keep** OG tags if social sharing matters.

Favicons: align with TILDA — files in `public/`, links in `__root.tsx`, optional `generate-favicons` script.

### E. `isImageUpload` helper

Keep **`src/core/uploads/isImageUpload.ts`** unchanged — framework-agnostic, already used by server and client.

---

## What needs a different solution

### 1. Upload image previews (`UploadIcon`) — main gap vs TILDA

TILDA has **no equivalent** (no authenticated document library with image thumbnails). Trassenscout’s **target path** is an **authenticated API route that proxies S3**: to the UI it behaves like any other image URL; behind the scenes the server verifies project membership, loads the object from S3, and returns it with the correct `Content-Type`.

| Piece              | Target                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Display**        | `Img` with `src={uploadUrl(upload, projectSlug)}` — render like any local/bundled image                                                              |
| **API route**      | `GET /api/{projectSlug}/uploads/{id}/{filename}` → migrate to `src/routes/api/$projectSlug/uploads/$uploadId/$.ts`; same auth + `getObject` as today |
| **Server queries** | Remove `withUploadPreviewUrl` / `getPresignedUploadUrl` / `previewImageUrl` (legacy for `next/image` + `remotePatterns`)                             |
| **Config**         | Delete `remotePatterns`; no S3 hostname allowlist needed                                                                                             |

The browser requests a same-origin URL; session cookies handle auth on `<img>` load. No presigned URLs, no S3 URLs in the DOM, no `next/image`. Same “proxy through app” idea as TILDA’s `proxyS3Url`, but with **project membership** auth instead of region membership.

**SVG uploads:** Today `unoptimized={isSvg}` on `next/image`. With `Img`, no special case — use `object-contain` and keep `onError` → file icon fallback.

### 2. Loss of `next/image` optimization

Next provided automatic resizing, WebP/AVIF, and `srcset` via `sizes`. TILDA accepts native browser behaviour.

| Asset class                   | Risk                       | Mitigation options                                                                                         |
| ----------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Small SVG logos               | None                       | —                                                                                                          |
| Marketing JPGs (~5)           | Moderate (LCP on homepage) | Pre-compress sources; Vite `build.assetsInlineLimit`; optional `vite-plugin-image-optimizer` at build time |
| Upload thumbnails (48–128 px) | Low                        | Served at display size; optional future Lambda/imgproxy                                                    |
| External survey logos         | Low                        | Third-party controls cache/format                                                                          |

**Not recommended initially:** adding `@unpic/react`, Cloudinary, or a self-hosted imgproxy — **~13 UI usages** don’t justify operational cost. Revisit if Lighthouse/LCP regresses.

### 3. Legacy `getProxyImageSrc` / nginx `/assets/`

**Status:** Disabled in UI; `Project.logoSrc` unused; nginx template not in repo.

| Option                                                                                                | When                                                            |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Delete** `getProxyImageSrc`, commented `ProjectLogo` / `FooterLogos` code, and `logoSrc` form field | If partner/project logos stay out of scope                      |
| **Public folder** `public/assets/{filename}`                                                          | If logos are few and static                                     |
| **S3 + auth API route** (same as uploads)                                                             | If logos become dynamic per project again                       |
| **Replicate nginx `/assets/` in Traefik/Nitro**                                                       | Avoid — operational duplication; TILDA doesn’t use this pattern |

Do **not** port `images.domains` or nginx S3 proxy config into Vite — unnecessary with `<img>`.

### 4. `react-pdf` worker (adjacent)

`UploadPdfViewer` uses `/pdf.worker.min.mjs` from `public/`. Not `next/image`, but verify under Vite (TILDA `vite.config` has separate pdfjs notes in Trassenscout `tech-stack-migration.md`). Keep worker in `public/` or import from `pdfjs-dist`.

---

## TILDA solution vs TanStack Start best practices (review)

| TILDA choice                       | Assessment                                                              | Recommendation for Trassenscout                                                           |
| ---------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Thin `Img` wrapper                 | **Good** — no framework lock-in, works with SSR/hydration, easy to test | Adopt as-is                                                                               |
| Vite URL imports for assets        | **Good** — standard Vite behaviour, cache-busted filenames              | Adopt as-is                                                                               |
| Raw external URLs for logos        | **Acceptable** — simple; some hosts block hotlinking                    | Same for survey logos; monitor broken images                                              |
| No global `og:image`               | **Gap** vs Trassenscout                                                 | Keep Trassenscout OG PNG in root `head()`                                                 |
| No `loading` / `decoding` defaults | **Minor gap**                                                           | Add lazy/async on below-fold images                                                       |
| No responsive `srcset`             | **Acceptable** at TILDA scale                                           | Use CSS `object-cover` + fixed containers; pre-size marketing JPGs                        |
| S3 proxy for datasets              | **Good** for caching, Range, CORS                                       | Mirror **auth proxy** pattern for upload downloads/previews, not necessarily same handler |
| Favicon generation script          | **Good**                                                                | Port when moving icons to `public/`                                                       |

TanStack Start docs do not prescribe an image component — **native `<img>` + static imports** is the common Vite/Start approach. TILDA’s pattern is **aligned with current best practice** for apps that don’t need a CDN image pipeline.

---

## Migration checklist

### Phase 1 — Component swap (low risk)

- [ ] Add `src/components/shared/Img.tsx` (from TILDA).
- [ ] Replace `next/image` in 9 active components (see inventory table).
- [ ] Replace `fill`/`sizes` layouts with aspect-ratio containers + `object-cover`.
- [ ] Remove `next/image` types from `next-env.d.ts` / env when Next is removed.

### Phase 2 — Config cleanup

- [ ] Delete `images` block from `next.config.js` (or entire file with Next removal).
- [ ] Remove `getProxyImageSrc` and dead `ProjectLogo` / `FooterLogos` code **or** document re-enable design.
- [ ] Port `defaultMetadata` OG image to `__root.tsx` / `meta.const.ts`.

### Phase 3 — Upload previews (with route migration)

- [ ] Migrate upload download route to TanStack Start API route (`routes.md` mapping).
- [ ] `UploadIcon`: `Img src={uploadUrl(...)}` only — remove `previewImageUrl` and `withUploadPreviewUrl`.
- [ ] Confirm `Img` + `onError` fallback still works for corrupt/missing files.

### Phase 4 — Verify

- [ ] Visual check: marketing, auth, dashboard, kontakt, all survey slugs (external logos).
- [ ] Upload grid/table: JPEG, PNG, SVG, non-image fallback icon.
- [ ] OG tags / favicons in production HTML.
- [ ] No references to `next/image`, `remotePatterns`, or `images.domains`.

---

## File mapping (quick reference)

| Trassenscout                               | Target (TILDA-aligned)                               |
| ------------------------------------------ | ---------------------------------------------------- |
| `import Image from "next/image"`           | `import { Img } from "@/components/shared/Img"`      |
| `next.config.js` → `images.*`              | _(delete)_                                           |
| `getProxyImageSrc`                         | _(delete or replace with API/public asset)_          |
| `withUploadPreviewUrl` / presigned preview | **Remove** — auth API URL only                       |
| `defaultMetadata` OG PNG                   | `__root.tsx` `head()` + Vite import or `public/`     |
| `src/app/api/.../uploads/.../route.ts`     | `src/routes/api/$projectSlug/uploads/$uploadId/$.ts` |

---

## Summary

Most Trassenscout image handling maps **directly to TILDA**: Vite imports + `Img` + external URLs. **`next.config.js` image config disappears entirely.** **Upload thumbnails** use an **authenticated API route** that proxies S3 — the UI treats it like any image `src`; the server handles auth and fetch. Presigned preview URLs go away. **Legacy nginx `/assets/`** should not be recreated; **`getProxyImageSrc`** is obsolete while project logos remain disabled.
