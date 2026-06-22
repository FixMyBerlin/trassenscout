# Favicon migration: Next.js → TanStack Start (TILDA pattern)

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app)  
Source: Trassenscout `src/app/`, `public/`, `src/core/layouts/`

Related: [`images.md`](./images.md) (OG/social images in `head()`), [`routes.md`](./routes.md), [`tech-stack-migration.md`](./tech-stack-migration.md)

---

## Executive summary

| Concern                 | Trassenscout today                                                          | TILDA (`tilda-geo/app`)                                    | Target                                     |
| ----------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------ |
| Source of truth         | `public/favicon.svg` + duplicate `src/app/icon.svg` / `src/app/favicon.svg` | `public/favicon.svg` only                                  | **Single** `public/favicon.svg`            |
| Raster / ICO / manifest | **Not generated** — SVG only in `public/`                                   | `scripts/generate-favicons` → committed files in `public/` | **Port TILDA script**; commit outputs      |
| Head links              | Next.js file conventions + legacy `Layout.tsx` `<Head>`                     | `__root.tsx` `head()` `links` array                        | **`__root.tsx` `head()`** (explicit links) |
| App metadata            | `defaultMetadata` + `viewport.themeColor` in root layout                    | `APP_META` in `meta.const.ts`                              | **`meta.const.ts`** shared with generator  |
| Per-route icon          | Survey `generateMetadata({ icons: { icon: logoUrl } })`                     | N/A                                                        | Route-level `head()` override              |
| PWA manifest            | None                                                                        | `manifest.json` + `manifest.webmanifest`                   | **Add** (optional but TILDA-aligned)       |

**Bottom line:** Drop Next.js App Router icon file conventions. Keep one SVG in `public/`, generate raster/ICO/manifest offline (not at build), wire links in `__root.tsx` — same workflow as TILDA.

---

## Trassenscout today (Next.js / Blitz)

### Static files

| Path                  | Role                                                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/favicon.svg`  | Served at `/favicon.svg` — **canonical brand icon** (gold speech-bubble / route motif)                                                                                              |
| `src/app/icon.svg`    | Next.js App Router [file convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons) — auto-injects `<link rel="icon">` (duplicate of `favicon.svg`) |
| `src/app/favicon.svg` | Same convention, alternate filename — **duplicate** of `public/favicon.svg`                                                                                                         |
| `public/`             | **No** `favicon.ico`, PNG sizes, `apple-touch-icon.png`, or `manifest.json`                                                                                                         |

All three SVG copies are byte-identical today. Only `public/favicon.svg` is required for static serving.

### How the icon reaches the browser

1. **Root layout** (`src/app/layout.tsx`) exports `defaultMetadata` and `viewport.themeColor: "#1f2937"`. It does **not** declare favicon links explicitly — Next.js picks up `src/app/icon.svg` / `src/app/favicon.svg` via metadata file conventions.

2. **Legacy Blitz layout** (`src/core/layouts/Layout.tsx`) still injects:

   ```tsx
   <link rel="icon" href="favicon.svg" type="image/svg+xml" />
   ```

   Relative `href` (no leading `/`). Used only by codegen templates (`LayoutArticle`, `LayoutRs`) — **not** by the main App Router tree. Safe to delete with Blitz layout removal.

3. **Legacy MetaTags** (`src/core/layouts/MetaTags/MetaTags.tsx`) sets `theme-color` to `#34d399` — inconsistent with root layout `#1f2937`. No favicon link. Marked for removal with Pages-router templates.

### Per-route favicon (surveys)

`src/app/beteiligung/[surveySlug]/layout.tsx` overrides the default icon per survey:

```ts
icons: {
  icon: logoUrl, // external HTTPS URL from survey config
},
```

Survey configs store partner logos (`logoUrl` in `src/app/beteiligung/_*/config.tsx`) — e.g. `https://radschnellweg-frm7.de/logo.png`, `https://trassenscout.de/radnetz-brandenburg/bb-logo.png`.

This is **metadata-only** (tab icon), separate from the in-page `SurveyHeader` logo.

### External consumers

- **TILDA Geo** references `https://trassenscout.de/favicon.svg` as `externalLogoPath` for a region entry (`tilda-geo/app/src/data/regions.const.ts`). Keep `/favicon.svg` publicly reachable after migration.

### What Next.js conventions we lose

| Next.js feature                    | Trassenscout usage       | TanStack Start                                         |
| ---------------------------------- | ------------------------ | ------------------------------------------------------ |
| `app/icon.svg` / `app/favicon.svg` | Auto `<link rel="icon">` | **No equivalent** — declare in `head()`                |
| `metadata.icons`                   | Survey layouts           | Route `head()` return value                            |
| `viewport.themeColor` export       | Root layout              | `{ name: 'theme-color', content: … }` in `head().meta` |
| Implicit `/favicon.ico`            | Not present              | Serve `public/favicon.ico` after generation            |

---

## TILDA reference (`tilda-geo/app`)

Full operator docs: [`tilda-geo/app/scripts/generate-favicons/README.md`](../../tilda-geo/app/scripts/generate-favicons/README.md).

### Workflow

1. **Source:** `public/favicon.svg` (hand-edited; never overwritten by the script).
2. **Generate once** when the SVG changes (not part of `build`):

   ```bash
   bun scripts/generate-favicons/process.ts
   ```

3. **Commit** generated files in `public/`.
4. **Optional:** Run ImageOptim on PNG/ICO before commit.

### Generator

| Piece       | Location                                                                             |
| ----------- | ------------------------------------------------------------------------------------ |
| Script      | `scripts/generate-favicons/process.ts`                                               |
| npm package | `favicons@7.3.0` (uses `sharp`)                                                      |
| Shared meta | `src/meta.const.ts` → `APP_META` (`title`, `shortName`, `description`, `themeColor`) |
| Knip entry  | `knip.jsonc` lists the script (not dead code)                                        |

**Outputs in `public/`:**

- `favicon.ico`
- `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png`
- `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `manifest.json` (custom post-process in script — includes `favicon.svg` + ICO + android-chrome PNGs)
- `manifest.webmanifest` (from `favicons` package — PWA-oriented subset)

### Head links (`src/routes/__root.tsx`)

```ts
links: [
  { rel: 'stylesheet', href: appCss },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
  { rel: 'icon', href: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
  { rel: 'icon', href: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
  { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
  { rel: 'manifest', href: '/manifest.json' },
],
```

`theme-color` comes from `APP_META.themeColor` in the same `head()` `meta` array.

**Browser behaviour:** SVG preferred where supported; PNG fallbacks for older clients; `favicon.ico` auto-discovered at site root; `apple-touch-icon` for iOS home screen only.

---

## Migration target (Trassenscout on TanStack Start)

### 1. Consolidate source SVG

- [ ] Keep **`public/favicon.svg`** as the only source file.
- [ ] Delete **`src/app/icon.svg`** and **`src/app/favicon.svg`** (Next-only conventions).
- [ ] Remove favicon `<Head>` link from **`src/core/layouts/Layout.tsx`** (or delete layout with Blitz).

### 2. Port `meta.const.ts`

Create `src/meta.const.ts` (mirror TILDA) with Trassenscout values from `defaultMetadata.ts`:

```ts
export const APP_META = {
  title: "Trassenscout",
  shortName: "Trassenscout",
  description:
    "Der Trassenscout unterstützt Kommunen und Regionalverbände bei der Erstellung von Machbarkeitsstudien und Vorplanungen für Radschnellverbindungen und anderen liniengebundenen Bauwerken.",
  themeColor: "#1f2937", // align with current viewport.themeColor in layout.tsx
} as const
```

Use this in `__root.tsx` and the favicon generator. Resolve the legacy `#34d399` in MetaTags — do not carry it forward.

### 3. Port favicon generator

- [ ] Copy `tilda-geo/app/scripts/generate-favicons/` → `scripts/generate-favicons/`
- [ ] Add devDependency `favicons@7.3.0`
- [ ] Point imports at `src/meta.const.ts`
- [ ] Run `bun scripts/generate-favicons/process.ts`
- [ ] Commit all generated `public/` assets
- [ ] Add script to `knip.jsonc` allowlist (when knip is adopted per [`tooling.md`](./tooling.md))

Optional `package.json` script (not in TILDA today, convenient for TS):

```json
"generate-favicons": "bun scripts/generate-favicons/process.ts"
```

### 4. Wire `__root.tsx` `head()`

Port from TILDA `__root.tsx` (see reference above). Combine with metadata migration from `defaultMetadata.ts`:

| `defaultMetadata` field       | TanStack `head()`                                            |
| ----------------------------- | ------------------------------------------------------------ |
| `title` / template            | Root `title` + child routes set title via their own `head()` |
| `description`                 | `{ name: 'description', … }`                                 |
| `openGraph.*` / `twitter.*`   | `meta` entries (see [`images.md`](./images.md))              |
| `robots` (non-prod `noindex`) | Conditional `meta` like TILDA's `VITE_APP_ENV` check         |
| `viewport.themeColor`         | `{ name: 'theme-color', content: APP_META.themeColor }`      |
| favicon                       | `links` array (SVG + PNG + apple-touch + manifest)           |

**Do not** rely on Vite or Nitro to generate icons at build time.

### 5. Per-route favicon (surveys)

Replace `generateMetadata({ icons: { icon: logoUrl } })` with the survey route layout's `head()`:

```ts
head: ({ params }) => {
  const { logoUrl, title } = getConfigBySurveySlug(params.surveySlug, 'meta')
  return {
    meta: [{ title: `${title} ${params.surveySlug.toUpperCase()}` }, /* … */],
    links: [{ rel: 'icon', href: logoUrl }],
  }
},
```

Child `head()` merges with parent; survey routes override the default Trassenscout icon. External `logoUrl` values need no `next/image` domain allowlist — plain URL in `href`.

### 6. Static asset serving

TanStack Start + Vite serves `public/` at the site root (same as TILDA). After migration, these URLs must keep working:

| URL                                        | Purpose                                  |
| ------------------------------------------ | ---------------------------------------- |
| `/favicon.svg`                             | Primary icon; TILDA region external logo |
| `/favicon.ico`                             | Legacy browsers / bookmarks              |
| `/favicon-16x16.png`, `/favicon-32x32.png` | Raster fallbacks                         |
| `/apple-touch-icon.png`                    | iOS                                      |
| `/manifest.json`                           | PWA / install metadata                   |

---

## File checklist

### Remove (Next.js / legacy)

| File                                  | Reason                                     |
| ------------------------------------- | ------------------------------------------ |
| `src/app/icon.svg`                    | Next file convention                       |
| `src/app/favicon.svg`                 | Duplicate of `public/favicon.svg`          |
| `Layout.tsx` favicon `<link>`         | Replaced by `__root.tsx`                   |
| `defaultMetadata` icon-related fields | N/A today — no `icons` in default metadata |

### Add / keep

| File                                                                                  | Action                                   |
| ------------------------------------------------------------------------------------- | ---------------------------------------- |
| `public/favicon.svg`                                                                  | **Keep** — source of truth               |
| `public/favicon.ico`, `favicon-*.png`, `apple-touch-icon.png`, `android-chrome-*.png` | **Generate** and commit                  |
| `public/manifest.json` (+ optional `manifest.webmanifest`)                            | **Generate** and commit                  |
| `src/meta.const.ts`                                                                   | **Add**                                  |
| `scripts/generate-favicons/process.ts`                                                | **Port** from TILDA                      |
| `scripts/generate-favicons/README.md`                                                 | **Port** (update app name / theme color) |
| `src/routes/__root.tsx`                                                               | **Add** favicon `links` + `theme-color`  |

---

## Verification

After migration, confirm in production/staging HTML:

- [ ] `<link rel="icon" href="/favicon.svg" type="image/svg+xml">` present on default routes.
- [ ] PNG fallback links with `sizes` present.
- [ ] `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` present.
- [ ] `<link rel="manifest" href="/manifest.json">` present.
- [ ] `GET /favicon.svg` returns 200 (TILDA external logo dependency).
- [ ] `GET /favicon.ico` returns 200.
- [ ] Survey route shows partner `logoUrl` as tab icon.
- [ ] `theme-color` meta matches `APP_META.themeColor` (`#1f2937`), not legacy `#34d399`.

Quick local check:

```bash
bun run dev
curl -s localhost:3000 | rg 'rel="icon"|apple-touch-icon|manifest|theme-color'
curl -sI localhost:3000/favicon.svg | head -1
```

---

## Differences from TILDA (intentional)

| Topic                     | TILDA                | Trassenscout                                                                                            |
| ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------- |
| `themeColor`              | `#27272a` (zinc)     | `#1f2937` (gray-800) — keep current brand shell                                                         |
| Per-route favicon         | None                 | Survey layouts override with partner logos                                                              |
| `og:image`                | Not in root `head()` | Keep from `defaultMetadata` (see [`images.md`](./images.md))                                            |
| PWA `display: standalone` | Yes in manifest      | Copy generator defaults; Trassenscout is not primarily a PWA — manifest still useful for icons/metadata |

---

## Related migration docs

| Doc                          | Overlap                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| [`images.md`](./images.md)   | OG/Twitter images in `head()`; briefly mentions favicons — **this doc is canonical for favicons** |
| [`routes.md`](./routes.md)   | `__root.tsx` and per-layout `head()`                                                              |
| [`tooling.md`](./tooling.md) | Bun script invocation, knip                                                                       |
