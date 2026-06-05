# i18n: react-intl 7 → 10

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app) (`react-intl@10.1.11`)  
Target: Trassenscout on **TanStack Start** + **React 19** (not Next.js / Blitz)

Related: [`tech-stack-migration.md`](./tech-stack-migration.md) (React 18 → 19), [`new-zod.md`](./new-zod.md) (Zod field errors ≠ react-intl).

Official docs:

- [react-intl documentation](https://formatjs.github.io/docs/react-intl)
- [Upgrade guide 10.x](https://formatjs.github.io/docs/react-intl/upgrade-guide-10.x)
- [Upgrade guide 7.x](https://formatjs.github.io/docs/react-intl/upgrade-guide-7.x)
- [Testing with react-intl](https://formatjs.github.io/docs/guides/testing-with-react-intl)

---

## Executive summary

|                  | Trassenscout (today)                               | TILDA (`tilda-geo/app`)                                |
| ---------------- | -------------------------------------------------- | ------------------------------------------------------ |
| Package          | `react-intl@7.1.14`                                | `react-intl@10.1.11`                                   |
| React            | 18.3.1                                             | 19.2.6 (**required** for react-intl 10)              |
| Usage surface    | **2 files** (`Form.tsx`, `FormError.tsx`)          | **~6 files** — scoped `IntlProvider` in map inspector |
| App locale       | Hard-coded `de`                                    | Hard-coded `de`                                        |
| Message catalogs | `errorMessageTranslations.ts` (server/DB errors)   | `translations.const.ts` per feature (OSM tag labels)   |
| `injectIntl`     | Not used                                           | Not used                                               |
| Root provider    | Per-form `IntlProvider` in `Form.tsx`              | Per-feature `IntlProvider` (not global in `__root`)    |
| Zod errors       | Raw issue text in `FormError`                      | `formatError.ts` — **no** react-intl                   |
| RSC / server     | N/A (client components)                            | `react-intl/server` available; TILDA does not use yet  |

**Good news:** Trassenscout uses react-intl narrowly — mostly for **translating Prisma/server error strings** in forms. The upgrade is small in code volume but **blocked on React 19** and the TanStack Form migration.

---

## When to migrate

| Order | Task |
| ----- | ---- |
| 1 | React 18 → 19 (see `tech-stack-migration.md`) |
| 2 | Bump `react-intl` to `10.1.11` (match TILDA) |
| 3 | Re-test `Form.tsx` / `FormError.tsx` |
| 4 | During TanStack Form migration, **re-evaluate** whether react-intl is still needed for form errors |

i18n is **not** a large standalone migration in Trassenscout — it rides along with React 19 + forms work.

---

## Package changes

```bash
# After React 19
bun add react-intl@10.1.11
```

Peer dependencies (react-intl 10):

| Package | Version |
| ------- | ------- |
| `react` | 19 |
| `@types/react` | 19 |

Run `bun run type-check` — expect `@types/react` alignment with React 19.

---

## Breaking changes (7 → 10)

### `injectIntl` removed (v10)

Not used in Trassenscout or TILDA. If found in templates, migrate to `useIntl()`:

```tsx
// Before
export default injectIntl(MyComponent)

// After
function MyComponent() {
  const intl = useIntl()
  return <div>{intl.formatMessage({ defaultMessage: 'Hello' })}</div>
}
```

Removed types: `WithIntlProps`, `WrappedComponentProps`.

### `IntlProvider` is a function component (v10)

Transparent for normal usage. Breaks only if code used `ref` on `IntlProvider` instance — none in this repo.

### `"use client"` on main entry (v10)

`react-intl` exports are client components. In TanStack Start, import `FormattedMessage` / `IntlProvider` only from client components or leaf UI — same as today with Next client boundaries (but Start has no `"use client"` directive; keep intl in interactive UI).

### `react-intl/server` (v10)

New server entry for RSC-style apps:

```ts
import { createIntl, createIntlCache, defineMessage } from 'react-intl/server'
```

TILDA does **not** use this yet. Trassenscout likely does not need it unless formatting messages in route loaders — prefer plain German strings server-side for emails and API errors.

### Window globals removed (v10)

`window.__REACT_INTL_CONTEXT__` workaround removed — ensure a single `react-intl` version in the bundle (Bun/Vite dedupe).

### Intermediate majors (8.x, 9.x)

Skipped when jumping 7 → 10. Read retroactive guides if stepping through:

- [Upgrade guide 8.x](https://formatjs.github.io/docs/react-intl/upgrade-guide-8.x)
- [Upgrade guide 9.x](https://formatjs.github.io/docs/react-intl/upgrade-guide-9.x)

---

## Trassenscout usage today

### `Form.tsx` — provider wrapper

[`src/core/components/forms/Form.tsx`](../src/core/components/forms/Form.tsx):

```tsx
<IntlProvider messages={errorMessageTranslations} locale="de" defaultLocale="de">
  <FormProvider {...ctx}>
    <form>…</form>
  </FormProvider>
</IntlProvider>
```

Purpose: enable `FormattedMessage` in `FormError` for **server/database** errors keyed by raw error string.

### `FormError.tsx` — message lookup

[`src/core/components/forms/FormError.tsx`](../src/core/components/forms/FormError.tsx):

- **Zod errors:** renders `error.path` + `error.message` directly (no react-intl).
- **Other errors:** `<FormattedMessage id={rawMessage} defaultMessage={rawMessage} />` — uses the raw English/Prisma string as message **id** to look up German text in `errorMessageTranslations`.

### `errorMessageTranslations.ts`

[`src/core/components/forms/errorMessageTranslations.ts`](../src/core/components/forms/errorMessageTranslations.ts) — static map of Prisma unique-constraint strings → German UI text.

This pattern is **not** ICU message catalogs — it is a **dictionary fallback** for untranslated server errors.

---

## TILDA patterns (reference)

TILDA uses react-intl for **domain data presentation** (OSM inspector tags), not forms.

### Scoped `IntlProvider`

Example: [`InspectorFeatureTilda.tsx`](../../tilda-geo/app/src/components/regionen/pageRegionSlug/SidebarInspector/InspectorFeatureTilda.tsx):

```tsx
<IntlProvider messages={translations} locale="de" defaultLocale="de">
  {/* FormattedMessage for tag keys/values */}
</IntlProvider>
```

Messages live in colocated `translations.const.ts` files (large generated maps).

### Components used

| API | Usage |
| --- | ----- |
| `FormattedMessage` | Tag labels and enum values |
| `FormattedNumber` | Numeric inspector values |
| `FormattedDate` | Date attributes |
| `IntlProvider` | Per-inspector subtree |

No root-level provider in `__root.tsx`.

### Forms — no react-intl

TILDA form validation messages come from:

1. Zod schemas (German `{ message: … }` / locale via `zodDeLocale`)
2. `formatError.ts` for client validation display
3. Plain German strings for submit success/failure

See [`new-zod.md`](./new-zod.md).

---

## Target architecture for Trassenscout

Trassenscout is **German-only** (`locale="de"` everywhere). Full i18n infrastructure (extract CLI, PO files, multiple locales) is **out of scope**.

### Recommended end state

| Concern | Approach |
| ------- | -------- |
| Zod / client validation | German strings on schemas + `zodDeLocale` |
| Server function errors | Return German `message` string from `createServerFn` |
| Prisma unique violations | Keep `errorMessageTranslations` map **or** map to known codes server-side |
| Form display | TILDA `formatError.ts` + submit `message` banner |
| react-intl | **Optional** — only if keeping `FormattedMessage` dictionary pattern |

### Option A — Minimal (recommended)

1. Upgrade react-intl 7 → 10 for the two existing files.
2. During TanStack Form migration, port `errorMessageTranslations` to a plain function:

   ```ts
   export function translateServerError(raw: string): string {
     return errorMessageTranslations[raw] ?? raw
   }
   ```

3. Remove `IntlProvider` + `react-intl` dependency entirely if nothing else needs it.

### Option B — Keep react-intl for server errors

1. Upgrade to v10.
2. Move `IntlProvider` to a small `ServerErrorIntlProvider` wrapper used only around form submit error UI.
3. Do not add root-level i18n until a second locale is required.

### Option C — TILDA-style feature providers

Only if Trassenscout gains map/inspector-style translated attribute catalogs (unlikely near-term).

---

## TanStack Start considerations

| Topic | Guidance |
| ----- | -------- |
| SSR | `IntlProvider` in client-hydrated components is fine; messages object must be serializable |
| Loaders | Prefer German strings in loader data; avoid `react-intl` in server-only modules |
| `react-intl/server` | Use only if formatting in route `loader` without client JS — not needed for current scope |
| Emails | `@react-email/components` — separate from react-intl; keep German copy inline in templates |

---

## Testing

Vitest + Testing Library:

```tsx
import { IntlProvider } from 'react-intl'
import { render } from '@testing-library/react'

function renderWithIntl(ui: React.ReactElement, messages = {}) {
  return render(
    <IntlProvider locale="de" messages={messages}>
      {ui}
    </IntlProvider>,
  )
}
```

See [FormatJS testing guide](https://formatjs.github.io/docs/guides/testing-with-react-intl).

After removing react-intl (Option A), delete intl test wrappers.

---

## Migration checklist

### Prerequisites

- [ ] React 19 + `@types/react@19` (see `tech-stack-migration.md`)
- [ ] TanStack Start dev server runs

### Package bump

- [ ] `bun add react-intl@10.1.11`
- [ ] `bun run type-check`

### Code audit

- [ ] Confirm no `injectIntl` / `WithIntlProps` (already clean)
- [ ] Grep `react-intl` — should stay at 2 files unless beteiligung adds usage
- [ ] Verify single react-intl version in lockfile

### Behaviour verification

- [ ] Trigger Prisma unique constraint on invite/contact — German message via `FormattedMessage`
- [ ] Trigger Zod validation error — German field messages (no intl)
- [ ] Generic server error — fallback `defaultMessage` displays

### Forms migration (with `new-zod.md`)

- [ ] Decide Option A vs B for server error translation
- [ ] Port `FormError` to TILDA pattern or `translateServerError()`
- [ ] Remove `IntlProvider` wrapper if dropping react-intl

### Optional cleanup

- [ ] Remove `react-intl` from `package.json` if Option A chosen
- [ ] Update knip/oxlint ignores if any

---

## What Trassenscout does **not** need (yet)

- `react-i18next` / `next-intl` — different stack; TILDA uses react-intl only
- Crowdin / extraction CLI — single locale
- Global `IntlProvider` in `__root.tsx` — TILDA avoids this
- ICU pluralization — minimal `FormattedMessage` usage today

---

## Cross-references

| Doc | Overlap |
| --- | ------- |
| [`tech-stack-migration.md`](./tech-stack-migration.md) | React 19 peer dep |
| [`new-zod.md`](./new-zod.md) | Zod German errors via `zod/locales`, not react-intl |
| [`tooling.md`](./tooling.md) | Bun install, type-check in CI |
| [`routes.md`](./routes.md) | `og:locale` `de_DE` in `__root.tsx` head (metadata, not intl) |
