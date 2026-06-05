# Tailwind CSS 4 + Vite integration

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app) (`tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`)  
Target: Trassenscout on **TanStack Start** + **Vite** (not Next.js / Blitz)

Related: [`tooling.md`](./tooling.md) (oxfmt `sortTailwindcss`), [`routes.md`](./routes.md) (`__root.tsx` CSS link), [`tech-stack-migration.md`](./tech-stack-migration.md).

Official docs:

- [Tailwind CSS v4 upgrade guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind CSS v4.0 announcement](https://tailwindcss.com/blog/tailwindcss-v4) (`@tailwindcss/vite`)
- [Theme configuration (`@theme`)](https://tailwindcss.com/docs/theme)
- [Detecting classes in source files (`@source`)](https://tailwindcss.com/docs/detecting-classes-in-source-files)

---

## Executive summary

|                    | Trassenscout (today)                                      | TILDA (`tilda-geo/app`)                         |
| ------------------ | --------------------------------------------------------- | ----------------------------------------------- |
| Tailwind version   | `tailwindcss@4.2.1`                                       | `tailwindcss@4.3.0`                             |
| Build integration  | **PostCSS only** (`@tailwindcss/postcss`) via Next/Blitz   | **`@tailwindcss/vite`** in `vite.config.ts`     |
| PostCSS config     | `postcss.config.js`                                       | `postcss.config.cjs` (kept for ancillary tools) |
| `autoprefixer`     | In `package.json` but **not** in PostCSS config           | **Not installed**                               |
| Global CSS         | `src/app/_components/layouts/global.css`                  | `src/components/shared/layouts/global.css`      |
| JS config          | `tailwind.config.js` (typography plugin only)             | **No** `tailwind.config.js` — CSS-first       |
| Theme              | `@theme { … }` in global.css                              | `@theme inline { … }` in global.css             |
| Plugins            | `@plugin` in CSS (`forms`, `typography`)                  | Same                                            |
| Class detection    | `@source "../../.."` (relative from `src/app/…`)          | `@source './src/**/*.{js,jsx,ts,tsx,mdx}'`      |
| CSS in Start root  | Next `layout.tsx` import                                  | `__root.tsx` `head.links` + `?url` import       |
| Class sorting      | `prettier-plugin-tailwindcss`                             | `oxfmt` `sortTailwindcss` → global.css path     |

Trassenscout is **already on Tailwind v4 CSS syntax** — the remaining work is **wiring it through Vite** (TanStack Start), **relocating global CSS**, and **dropping legacy PostCSS/autoprefixer baggage**.

---

## When to migrate

Do this in the **Vite + TanStack Start scaffold PR** (same PR as `vite.config.ts` and `src/routes/__root.tsx`):

1. Add `@tailwindcss/vite` plugin.
2. Move/consolidate `global.css` to the Start layout path.
3. Update `@source` globs for the new `src/` tree.
4. Drop `autoprefixer` and simplify PostCSS (optional: remove entirely like a pure-Vite setup).

Do **not** block the framework migration on re-theming — port existing `@theme` tokens as-is first.

---

## Package changes

```bash
# Target versions (align with TILDA at migration time)
bun add -D tailwindcss@4.3.0 @tailwindcss/vite@4.3.0
bun add -D @tailwindcss/forms@0.5.11 @tailwindcss/typography@0.5.19

# Remove legacy pipeline deps
bun remove autoprefixer
# postcss — keep if other tools need it; TILDA still lists postcss@8.5.x

# Optional: remove @tailwindcss/postcss if nothing else uses PostCSS
# TILDA keeps @tailwindcss/postcss in devDeps + postcss.config.cjs for email preview / tooling
bun remove @tailwindcss/postcss   # only when confirmed unused
```

**Automated upgrade** (run on a branch; review diff):

```bash
npx @tailwindcss/upgrade
```

---

## Vite configuration (TILDA reference)

From [`tilda-geo/app/vite.config.ts`](../../tilda-geo/app/vite.config.ts):

```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    // … nitro, tanstackStart, viteReact, babel …
    tailwindcss(),
  ],
})
```

Plugin order in TILDA: `nitro()` → `tailwindcss()` → `tanstackStart()` → `viteReact()` → `babel()`.

**Why Vite plugin over PostCSS alone?**

- Faster HMR and builds (Tailwind's Rust engine + tight Vite integration).
- Built-in `@import` handling — no `postcss-import`.
- Built-in vendor prefixing — no `autoprefixer`.

Official recommendation: [Using Vite](https://tailwindcss.com/docs/upgrade-guide#using-vite).

---

## Global CSS

### Trassenscout today

[`src/app/_components/layouts/global.css`](../src/app/_components/layouts/global.css):

```css
@import "tailwindcss";

@config "../../../../tailwind.config.js";
@import "../../(loggedInProjects)/[projectSlug]/uploads/_components/upload-progress-animations.css";

@plugin "@tailwindcss/typography";
@plugin "@tailwindcss/forms";

@source "../../..";

@theme {
  /* FMC brand colors, font weights, --font-sans … */
}
```

Also imports route-local CSS (`upload-progress-animations.css`, `stripe-backgrounds.css`).

### TILDA target

[`src/components/shared/layouts/global.css`](../../tilda-geo/app/src/components/shared/layouts/global.css):

```css
@import 'tailwindcss';

@source './src/**/*.{js,jsx,ts,tsx,mdx}';
@source './public/**/*.html';

@plugin '@tailwindcss/forms';
@plugin '@tailwindcss/typography';

@theme inline {
  /* gray scale overrides, radius, etc. */
}

@layer base { … }
@layer components { … }
```

### Migration steps for Trassenscout

1. **Move** to `src/components/shared/layouts/global.css` (or `src/components/layouts/global.css` — pick one path and use it in oxfmt).
2. **Replace `@source`** with explicit globs covering the Start route tree:

   ```css
   @source '../**/*.{js,jsx,ts,tsx}';
   @source '../../routes/**/*.{js,jsx,ts,tsx}';
   @source '../../emails/**/*.{js,jsx,ts,tsx}';
   ```

   Adjust relative paths from the CSS file location. Prefer **absolute-style** `@source` from project root if Tailwind 4.3 supports `@source "../../../src/**/*"` — test after move.

3. **Port `@theme` block** from current global.css (brand colors, `--font-sans`, font-weight resets).
4. **Re-home ancillary CSS** (`upload-progress-animations.css`, `stripe-backgrounds.css`) — keep `@import` in global.css or colocate with components.
5. **Remove `@config`** pointer to `tailwind.config.js` once typography config is in CSS (see below).
6. **Delete** `#__next` base styles in `@layer base` — leftover from Pages Router.

---

## `tailwind.config.js` → CSS

Trassenscout [`tailwind.config.js`](../tailwind.config.js) only configures `@tailwindcss/typography`:

```js
typography: {
  DEFAULT: {
    css: { a: false },  // Link component handles anchor styling
  },
},
```

TILDA equivalent in CSS:

```css
@layer components {
  .prose a {
    color: inherit;
    text-decoration: inherit;
    font-weight: inherit;
  }
}
```

After porting, **delete `tailwind.config.js`** unless a tool still requires it.

---

## Wiring CSS in TanStack Start

TILDA [`__root.tsx`](../../tilda-geo/app/src/routes/__root.tsx):

```ts
import appCss from '@/components/shared/layouts/global.css?url'

export const Route = createRootRouteWithContext()({
  head: () => ({
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: LayoutRoot,
})
```

Remove CSS import from Next `src/app/layout.tsx`.

**Fonts:** Trassenscout uses `@fontsource/red-hat-text` in `fonts.ts` — import font CSS in `LayoutRoot` or `__root.tsx` (TILDA may use a different font strategy; keep Trassenscout fonts unless redesigning).

---

## PostCSS cleanup

### Trassenscout today

[`postcss.config.js`](../postcss.config.js):

```js
module.exports = {
  plugins: { '@tailwindcss/postcss': {} },
}
```

### Options

| Approach | When |
| -------- | ---- |
| **A. Vite plugin only** | Delete `postcss.config.js`; remove `@tailwindcss/postcss` — simplest for Start |
| **B. Keep PostCSS** | TILDA keeps `postcss.config.cjs` for `react-email` preview / non-Vite CSS — mirror if `email dev` needs it |

If keeping PostCSS for email tooling, **do not** run Tailwind twice (Vite plugin + PostCSS on the same entry). Scope PostCSS to the email pipeline only.

---

## oxfmt / class sorting

When adopting oxfmt (see [`tooling.md`](./tooling.md)):

```js
// oxfmt.config.mjs
sortTailwindcss: {
  stylesheet: 'src/components/shared/layouts/global.css',
  functions: ['twMerge', 'twJoin'],
},
```

Update from Prettier's `prettier-plugin-tailwindcss` path (`src/app/_components/layouts/global.css`).

---

## Dependency alignment

| Package | Trassenscout | TILDA target |
| ------- | ------------ | ------------ |
| `tailwindcss` | 4.2.1 | 4.3.0 |
| `@tailwindcss/vite` | — | 4.3.0 |
| `@tailwindcss/postcss` | 4.2.1 (dep) | 4.3.0 (dev, optional) |
| `@tailwindcss/forms` | 0.5.11 | 0.5.11 |
| `@tailwindcss/typography` | 0.5.19 | 0.5.19 |
| `tailwind-merge` | 3.5.0 | 3.6.0 |
| `autoprefixer` | 10.4.27 | **remove** |
| `postcss` | 8.5.8 | 8.5.x (optional) |

---

## v4 behaviour changes to re-test

From the [upgrade guide](https://tailwindcss.com/docs/upgrade-guide) — Trassenscout may already hit these on v4.2; re-verify after Vite integration:

| Area | Change |
| ---- | ------ |
| **Default border color** | `border` uses `currentColor` — explicit `border-gray-200` etc. where needed |
| **Ring defaults** | `ring` width/color defaults changed |
| **Opacity utilities** | `bg-black/50` replaces `bg-opacity-50` |
| **Renamed utilities** | `flex-grow` → `grow`, `flex-shrink` → `shrink`, etc. |
| **`@apply` in CSS** | Still supported in `@layer`; verify custom layers after move |

Run visual smoke tests on: admin tables, map UI, forms, prose/markdown areas, upload progress animations.

---

## `@source` and the route migration

When `src/app/(loggedInProjects)/…` becomes `src/routes/_loggedInProjects/…`, the old `@source "../../.."` from `src/app/_components/layouts/` will **miss classes**.

Use broad globs:

```css
@source '../../../**/*.{js,jsx,ts,tsx}';
```

Or mirror TILDA:

```css
@source './src/**/*.{js,jsx,ts,tsx,mdx}';
```

(if supported from stylesheet path — verify in dev: intentionally add a new utility class and confirm it appears).

**Templates:** Keep `@source` covering `src/core/templates/**` if codegen pages remain.

---

## Migration checklist

### Packages

- [ ] Add `@tailwindcss/vite@4.3.0`, bump `tailwindcss` to 4.3.0
- [ ] Remove `autoprefixer`
- [ ] Decide PostCSS strategy (A or B above)

### Vite / Start

- [ ] Register `tailwindcss()` in `vite.config.ts`
- [ ] Create `src/routes/__root.tsx` with `global.css?url` link
- [ ] Remove CSS import from Next layout

### CSS files

- [ ] Move `global.css` to `src/components/shared/layouts/global.css`
- [ ] Port `@theme` tokens (brand colors, fonts)
- [ ] Port typography `a: false` → `.prose a` component layer
- [ ] Update `@source` globs for `src/routes/**`
- [ ] Migrate `@import` of animation/stripe CSS files
- [ ] Remove `#__next` legacy base styles
- [ ] Delete `tailwind.config.js` after typography port
- [ ] Remove `@config` from global.css

### Tooling

- [ ] Point oxfmt `sortTailwindcss.stylesheet` at new path
- [ ] Remove `prettier-plugin-tailwindcss` when dropping Prettier

### Verification

- [ ] `bun run dev` — HMR updates Tailwind classes
- [ ] `bun run build` — CSS bundle contains theme tokens
- [ ] Visual: header, forms, tables, maps, markdown/prose
- [ ] `email dev` preview (if PostCSS kept) — styles intact
- [ ] Playwright smoke (when E2E exists) — no missing utility classes

---

## Cross-references

| Doc | Overlap |
| --- | ------- |
| [`tooling.md`](./tooling.md) | oxfmt Tailwind sort; drop Prettier Tailwind plugin |
| [`routes.md`](./routes.md) | `__root.tsx` head links |
| [`favicon.md`](./favicon.md) | favicon links beside stylesheet in `head` |
| [`images.md`](./images.md) | static assets in `public/` referenced by `@source` |
