# Zod 3 → 4 migration

Analysis date: 2026-06-05  
Reference: [`tilda-geo/app`](../../tilda-geo/app) (`zod@4.4.3`)  
Target: Trassenscout on **TanStack Start** (not Next.js / Blitz)

Related: [`tech-stack-migration.md`](./tech-stack-migration.md) (forms: RHF → `@tanstack/react-form`), [`routes.md`](./routes.md), [`db-migration.md`](./db-migration.md) (Prisma enums).

Official docs:

- [Zod 4 changelog / migration guide](https://zod.dev/v4/changelog)
- [Zod versioning](https://zod.dev/v4/versioning)
- [Error customization (unified `error` param)](https://zod.dev/error-customization)
- [Internationalization (`zod/locales`)](https://zod.dev/error-customization?id=internationalization)

---

## Executive summary

|                         | Trassenscout (today)                          | TILDA (`tilda-geo/app`)                              |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------- |
| Package                 | `zod@^3.25.76`                                | `zod@4.4.3`                                          |
| Files importing `zod`   | **~231** under `src/`                         | ~150+ under `src/`                                   |
| Form validation         | `react-hook-form` + `@hookform/resolvers/zod` | `@tanstack/react-form` — schema as validator         |
| German error messages   | Inline `{ message: "…" }` on schemas          | `z.config(de())` via `src/lib/zodDeLocale.ts`        |
| Server input validation | Blitz resolver `.parse()` in mutations        | `createServerFn().inputValidator()` + `.parse()`     |
| Prisma enums            | `z.nativeEnum(PrismaEnum)`                    | `z.enum(PrismaEnum)`                                 |
| Object composition      | `.merge()` everywhere                         | `.extend()` / `.omit().extend()`                     |
| URL / email             | `z.string().url()` / `.email()`               | `z.url()` / `z.email()`                              |
| Flatten field errors    | Manual / `ZodError` issues                    | `z.flattenError(error).fieldErrors`                  |
| Codegen                 | `zod-prisma` (devDep, mostly unused)          | Hand-written `schema.ts` per domain — **keep that** |

Zod 4 is a **wide blast radius** migration: almost every `src/server/**/schema.ts`, API route, form, and nuqs parser touches Zod. Plan it together with the **TanStack Form** migration — TILDA does not use `@hookform/resolvers` at all.

---

## When to migrate

| Phase | Scope | Notes |
| ----- | ----- | ----- |
| **A** | Bump `zod` + add `zodDeLocale` bootstrap | Do after Vite/Start scaffold exists (`router.tsx`, `db.server.ts`, `test/setup.ts`) |
| **B** | Mechanical API fixes (codemod + grep) | `nativeEnum`, `merge`, `url`, `errorMap`, `invalid_type_error` |
| **C** | Forms layer | Replace `zodResolver` + RHF `Form.tsx` with TILDA `Form.tsx` (`validators: { onChange, onSubmit: schema }`) |
| **D** | Server boundary | Blitz mutations → `createServerFn` + `inputValidator` |

Phase **A+B** can be a dedicated PR. Phase **C** is the largest user-facing change.

---

## Package changes

```bash
# After Bun migration (see tooling.md)
bun remove zod-prisma          # optional — TILDA does not use it; TS schemas are hand-written
bun add zod@4.4.3              # pin to TILDA version initially
# Drop when forms migrate:
bun remove @hookform/resolvers # only used by src/core/components/forms/Form.tsx today
```

**Peer deps:** `@tanstack/react-form@1.32.x` accepts Zod 4 as a Standard Schema validator. Verify `@hookform/resolvers` supports Zod 4 before attempting a partial RHF upgrade — TILDA's answer is to **drop RHF**.

**Automated migration:**

```bash
# Official community codemod (review diff carefully)
npx codemod jssg run zod-3-4
```

Read the full [changelog](https://zod.dev/v4/changelog) — the codemod does not catch custom `errorMap` logic or Prisma enum patterns.

---

## TILDA patterns to copy

### 1. German locale (global)

Import once at app entry points so default Zod messages are German:

```ts
// src/lib/zodDeLocale.ts  (copy from tilda-geo/app)
import { config } from 'zod'
import { de } from 'zod/locales'

config(de())
```

Bootstrap imports (mirror TILDA):

| File | Why |
| ---- | --- |
| `src/router.tsx` | Client + SSR router init |
| `src/server/db.server.ts` | Server-only validation |
| `test/setup.ts` | Vitest |

Per-schema `{ message: "Pflichtfeld." }` strings remain valid (higher precedence than locale).

### 2. Forms — schema as validator (no `zodResolver`)

TILDA [`Form.tsx`](../../tilda-geo/app/src/components/shared/form/Form.tsx):

```ts
const form = useForm({
  defaultValues,
  validators: {
    onChange: schema,
    onSubmit: schema,
  },
  onSubmit: async ({ value }) => { /* … */ },
})
```

Use **`z.input<T>`** (not `z.infer<T>`) when the schema uses `.transform()` — TILDA documents this in `FormProps`.

Error display: [`formatError.ts`](../../tilda-geo/app/src/components/shared/form/formatError.ts) + `uniqueFormattedFormErrors` — no `react-intl` for Zod field errors.

### 3. Server validation + flat field errors

TILDA [`validation.ts`](../../tilda-geo/app/src/server/utils/validation.ts):

```ts
export function validationErrorState(error: z.ZodError) {
  return {
    success: false,
    message: 'Bitte korrigieren Sie die Fehler im Formular',
    errors: z.flattenError(error).fieldErrors,
  }
}
```

API routes use the same helper:

```ts
return Response.json({ info: z.flattenError(parsed.error) }, { status: 400 })
```

Port this to `src/server/utils/validation.ts` during the Start migration.

### 4. `createServerFn` input validation

TILDA [`regions.functions.ts`](../../tilda-geo/app/src/server/regions/regions.functions.ts):

```ts
export const getRegionPageBeforeLoadFn = createServerFn({ method: 'GET' })
  .inputValidator((data: z.infer<typeof RegionPageBeforeLoadInput>) =>
    RegionPageBeforeLoadInput.parse(data),
  )
  .handler(async ({ data }) => { /* … */ })
```

Replace Blitz `resolver.zod(Schema)` + `ctx.session.$authorize()` patterns with explicit `.parse()` inside server functions.

### 5. Prisma enums

```ts
// Trassenscout (Zod 3)
type: z.nativeEnum(GeometryTypeEnum)

// TILDA (Zod 4)
status: z.enum(RegionStatus)
userStatus: z.enum(QaEvaluationStatus)
```

**~16 files** in Trassenscout use `z.nativeEnum` — grep and replace with `z.enum`.

### 6. Object merge → extend

```ts
// Trassenscout — ~116 .merge() call sites
ProjectSlugRequiredSchema.merge(SubsectionBaseSchema)

// TILDA
RegionSchema.omit({ promoted: true }).extend({ promoted: trueOrFalse })
```

`.merge()` still works in Zod 4 but is **deprecated** — prefer `.extend()` or spread `.shape`:

```ts
z.object({ ...BaseSchema.shape, ...AdditionalSchema.shape })
```

---

## Trassenscout inventory (grep-driven)

| Pattern | Approx. count | Action |
| ------- | ------------- | ------ |
| `import { z } from "zod"` | ~231 files | Re-run `tsc` after bump |
| `z.nativeEnum(` | ~16 | → `z.enum(` |
| `.merge(` | ~116 | → `.extend()` / shape spread |
| `z.string().url()` | ~10 | → `z.url()` |
| `z.string().email()` | few | → `z.email()` |
| `{ message: "…" }` | widespread | Still works; migrate to `{ error: "…" }` over time |
| `invalid_type_error` | 1 (`schema-shared.ts`) | → unified `error` callback |
| `errorMap` | 2 (`subsubsections/schema.ts`, `fieldvalidationEnum.ts`) | → `error` callback |
| `z.preprocess(` | 2 (`schema-shared.ts`) | Still works; returns `ZodPipe` in v4 |
| `.passthrough()` | 1 (`useFilters.nuqs.ts`) | Still works; consider `z.looseObject()` for new code |
| `zodResolver` | 1 (`Form.tsx`) | Remove with TanStack Form migration |
| `ZodType<any, any>` | ~15 form wrappers | → `z.ZodTypeAny` |
| `zod-prisma` | devDep only | Remove — keep hand-written schemas |

---

## Breaking changes (highest impact for this repo)

### Unified `error` parameter

Zod 4 drops `invalid_type_error`, `required_error`, and `errorMap`. Use `error`:

```ts
// Zod 3 — src/core/utils/schema-shared.ts
z.number({ invalid_type_error: "Pflichtfeld" })

// Zod 4
z.number({
  error: (issue) =>
    issue.code === 'invalid_type' ? 'Pflichtfeld' : undefined,
})
```

```ts
// Zod 3 — src/server/subsubsections/schema.ts
z.coerce.date({
  errorMap: ({ code }, { defaultError }) => {
    if (code == 'invalid_date') return { message: 'Das Datum ist nicht richtig formatiert.' }
    return { message: defaultError }
  },
})

// Zod 4
z.coerce.date({
  error: (issue) =>
    issue.code === 'invalid_date'
      ? 'Das Datum ist nicht richtig formatiert.'
      : undefined,
})
```

`{ message: "…" }` on `.min()`, `.regex()`, etc. is **deprecated but still supported** — low urgency.

### Top-level string formats

```ts
z.string().url()   // deprecated
z.url()            // TILDA pattern

z.string().email({ message: '…' })  // deprecated
z.email({ error: '…' })             // TILDA pattern
```

### `z.flattenError` replaces `.flatten()` / `.format()`

```ts
// Zod 3
error.flatten().fieldErrors

// Zod 4
z.flattenError(error).fieldErrors
```

Update `FormError.tsx` ZodError rendering if issue shapes change — issues are structurally similar but types moved to `z.core.$ZodIssue*`.

### `z.infer` vs `z.input` in forms

Schemas with `.transform()`, `.preprocess()`, or `.coerce` may have different input/output types. TILDA uses `z.input<T>` for form values and submit handlers.

### `.default()` semantics

Defaults short-circuit on `undefined` and must match **output** type. If Trassenscout relies on old “parse the default through the schema” behaviour, use `.prefault()` (Zod 4).

### Optional fields with inner `.default()`

```ts
z.object({ a: z.string().default('tuna').optional() })
schema.parse({}) // Zod 4: { a: 'tuna' } — was {} in Zod 3
```

Audit schemas that combine `.optional()` + `.default()`.

### `z.coerce.*` input type is `unknown`

Mostly affects generic utilities; runtime behaviour unchanged.

---

## Forms migration (Trassenscout → TILDA)

### Today

[`src/core/components/forms/Form.tsx`](../src/core/components/forms/Form.tsx):

- `react-hook-form` + `zodResolver(schema)`
- `IntlProvider` wrapping form for server error translation (see [`new-i18n.md`](./new-i18n.md))
- Blitz-specific `ZodError` JSON deserialization workaround

~25 files under `src/core/components/forms/` depend on `react-hook-form`.

**Exception:** `src/app/beteiligung/**` already uses `@tanstack/react-form` (`createFormHook`) — align its Zod schemas during the same pass.

### Target

Copy TILDA form stack:

| Trassenscout | TILDA |
| ------------ | ----- |
| `Form.tsx` (RHF) | `src/components/shared/form/Form.tsx` |
| `LabeledTextField.tsx` etc. | TILDA field components or port to TanStack Form `fieldApi` |
| `FormError.tsx` + `react-intl` | `formatError.ts` + inline `role="alert"` |
| `errorMessageTranslations.ts` | Keep as submit-result message map (not Zod) |

Server/database errors (Prisma unique constraint strings) stay as a **message dictionary** — they are not Zod errors.

---

## nuqs + Zod

[`useFilters.nuqs.ts`](../src/app/(loggedInProjects)/[projectSlug]/surveys/[surveyId]/responses/_components/useFilters.nuqs.ts) uses `parseAsJson(filterSchema.parse)`.

After Zod 4:

- `.passthrough()` on `z.object()` still works (deprecated).
- Ensure `filterSchema.parse` error messages remain stable for URL state.

TILDA reference: [`searchParamsParsers.ts`](../../tilda-geo/app/src/components/regionen/pageRegionSlug/hooks/useQueryState/searchParamsParsers.ts), [`zodHelper.ts`](../../tilda-geo/app/src/components/regionen/pageRegionSlug/hooks/useQueryState/utils/zodHelper.ts).

On TanStack Start, prefer route `validateSearch` over nuqs where possible (see `.agents/skills/nuqs/SKILL.md`).

---

## `zod-prisma`

Listed in `devDependencies` but generation is commented out in Prisma schema. **Do not re-enable for Zod 4** unless the generator explicitly supports v4.

TILDA approach: hand-written `src/server/**/schema.ts` next to Prisma models — continue that for Trassenscout.

---

## Migration checklist

### Packages & bootstrap

- [ ] Pin `zod@4.4.3` (match TILDA)
- [ ] Add `src/lib/zodDeLocale.ts` and import from `router.tsx`, `db.server.ts`, `test/setup.ts`
- [ ] Remove `zod-prisma` if not needed
- [ ] Run codemod; commit mechanical diff separately

### Mechanical code updates

- [ ] Replace all `z.nativeEnum(` → `z.enum(`
- [ ] Replace `.merge(` → `.extend(` (or shape spread) in server schemas
- [ ] Replace `z.string().url()` → `z.url()`, `.email()` → `z.email()`
- [ ] Fix `invalid_type_error` in `schema-shared.ts`
- [ ] Fix `errorMap` in `subsubsections/schema.ts` and `fieldvalidationEnum.ts`
- [ ] Replace `ZodType<any, any>` → `z.ZodTypeAny` in form generics
- [ ] Add `src/server/utils/validation.ts` with `z.flattenError`
- [ ] Update API routes to return `z.flattenError` JSON on 400

### Forms (separate PR / phase)

- [ ] Port `Form.tsx` to `@tanstack/react-form` (TILDA pattern)
- [ ] Remove `@hookform/resolvers`, `zodResolver`
- [ ] Port labeled field components to TanStack Form field API
- [ ] Update beteiligung Zod schemas (`errorMap` in `fieldvalidationEnum.ts`)
- [ ] Re-test Blitz RPC ZodError serialization workaround — **delete** once on server functions

### Verification

- [ ] `bun run type-check`
- [ ] `bun run test-run`
- [ ] Manual: login/signup forms (auth schema)
- [ ] Manual: subsection/subsubsection CRUD (enum + date + geometry schemas)
- [ ] Manual: survey filter URL state (nuqs + passthrough object)
- [ ] Manual: API import routes (`subsections/import`, `subsubsections/import`)

---

## Risk notes

1. **Issue path display** — `FormError.tsx` renders `error.path[0]` for Zod errors; verify paths after v4 issue format changes.
2. **UUID validation** — `z.uuid()` is stricter (RFC 9562). Use `z.guid()` if storing legacy UUID-like strings.
3. **Strict TypeScript** — Zod 4 recommends `strict: true`; Trassenscout/TILDA use `strict: false` today — Zod still works, but generics may differ.
4. **Do not upgrade Zod in isolation on Blitz** — Blitz RPC serializes `ZodError` across the wire; migrate Zod 4 together with TanStack Start server functions to avoid double debugging.

---

## Cross-references

| Doc | Overlap |
| --- | ------- |
| [`tech-stack-migration.md`](./tech-stack-migration.md) | Zod 4 row; RHF → TanStack Form |
| [`routes.md`](./routes.md) | `validateSearch` with Zod |
| [`new-i18n.md`](./new-i18n.md) | Form server errors vs Zod field errors |
| [`testing.md`](./testing.md) | Vitest setup imports `zodDeLocale` |
| [`env-check.md`](./env-check.md) | `envSchema.ts` with `z.url()`, `z.enum()` — copy TILDA `envSchema.ts` |
