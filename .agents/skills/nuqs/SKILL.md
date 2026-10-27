---
name: nuqs
description: nuqs (type-safe URL query state) for Vite React apps WITHOUT TanStack Router. Use when writing or reviewing useQueryState, useQueryStates, parseAsInteger/parseAsString/parseAsJson and other parseAs* parsers, NuqsAdapter setup, or NuqsTestingAdapter tests. Not for TanStack Router or Start apps — use route validateSearch there.
---

**LLM reference:** Fetch [llms.txt](https://nuqs.dev/llms.txt) for the documentation index and latest API. Full docs in one file: [llms-full.txt](https://nuqs.dev/llms-full.txt). Human-readable docs: [nuqs.dev/docs](https://nuqs.dev/docs).

Do **not** duplicate upstream API reference in this skill — use `llms.txt` / `llms-full.txt` for parsers, options, testing adapter, and troubleshooting.

---

## URL state rule (FMC)

| App                                    | URL state                                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| Uses TanStack Router (SPA or Start)    | Router search params: `validateSearch` — skill `tanstack-router-conventions`. **Never nuqs.** |
| Vite React app WITHOUT TanStack Router | nuqs                                                                                          |

On TanStack Router use `validateSearch` instead (`tanstack-router-conventions` → `references/params-search-ui-routes.md`).

---

## Setup (Vite, no router)

Upstream detail: [Installation](https://nuqs.dev/docs/installation.md) · [Adapters](https://nuqs.dev/docs/adapters.md).

```tsx
import { NuqsAdapter } from "nuqs/adapters/react"

createRoot(root).render(
  <NuqsAdapter>
    <App />
  </NuqsAdapter>,
)
```

Adapter export verified in nuqs 2.9.5: `NuqsAdapter` from `nuqs/adapters/react`. Tests: `NuqsTestingAdapter` from `nuqs/adapters/testing` (see upstream [Testing](https://nuqs.dev/docs/testing.md)).

**State split:** URL-shareable state → nuqs; ephemeral UI → Zustand (`zustand-state-management`).

---

## High-impact gotchas

1. **`clearOnDefault`** — defaults to `true` (value equal to the default is removed from the URL). Set `false` only if the param must stay visible at its default.
2. **History and shallow** — default history is `replace` (pass `history: 'push'` when back-button entries are wanted); `shallow` defaults to `true`.
3. **`parseAsJson`** — requires a runtime validator (e.g. Zod schema) in v2+.
4. **Debug** — `localStorage.debug = 'nuqs'`.
5. **Package** — ESM-only; the `nuqs/parsers` entry was removed in v2, import parsers from `nuqs`.
6. **`useQueryStates`** — batch related params (filters, lat/lng/zoom) into one URL update.

---

## Related FMC skills

| Skill                         | Role                                                   |
| ----------------------------- | ------------------------------------------------------ |
| `tanstack-router-conventions` | `validateSearch` for apps with TanStack Router         |
| `zustand-state-management`    | Ephemeral client state that does not belong in the URL |
