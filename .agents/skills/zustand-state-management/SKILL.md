---
name: zustand-state-management
description: |
  FMC conventions for Zustand v5 in React: file naming, custom-hook-only exports, atomic selectors, actions namespace, small focused stores. Use when adding or reviewing client global state, or debugging unnecessary re-renders and SSR/persist hydration issues.

  Not for server/async data (TanStack Query) or URL state (router search params, or nuqs in Vite apps without TanStack Router). For API details, middleware, slices, and migration, use the official llms.txt index below.
---

**LLM reference:** Fetch [llms.txt](https://zustand.docs.pmnd.rs/llms.txt) for the documentation index and latest API. Full docs: [llms-full.txt](https://zustand.docs.pmnd.rs/llms-full.txt). Human-readable docs: [zustand.docs.pmnd.rs](https://zustand.docs.pmnd.rs/).

**Core mental model:** [Working with Zustand](https://tkdodo.eu/blog/working-with-zustand) (Dominik Dorfmeister) — export custom hooks only, atomic selectors, `actions` namespace, event-style actions, many small stores, combine with Query/URL via custom hooks.

**Version:** Zustand **v5**. Pin `zustand@^5` in the app; check [migrating to v5](https://zustand.docs.pmnd.rs/reference/migrations/migrating-to-v5) when upgrading.

---

## When to use Zustand

| Use Zustand for                                                            | Use something else for                                                                                        |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Client UI state shared across components (panels, map tools, wizard steps) | Server data → **TanStack Query**                                                                              |
| Ephemeral client prefs not in the URL                                      | Shareable/URL state → router search params (Vite app without Router: **nuqs**); never duplicate it in Zustand |
| Small, synchronous client state                                            | Auth session → skill `tanstack-start-auth`                                                                    |

Most app state is server or URL state. Add a Zustand store only when you need client-global state that is not already covered.

---

## File and export naming

**One store file = one concern.** Colocate with the feature (see `tanstack-start-conventions` for Start layout; SPA apps: feature folders under `components/` / `shared/`).

| Item                       | Convention                                                            | Example                                          |
| -------------------------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| **File**                   | `{domain}-store.ts` (kebab-case, `-store` suffix)                     | `map-filters-store.ts`                           |
| **Folder**                 | Next to the feature, e.g. `src/features/map/`                         | not a single global `stores/` dump unless shared |
| **State type**             | `{Domain}Store` (PascalCase interface)                                | `MapFiltersStore`                                |
| **Internal `create` hook** | `use{Domain}Store` — **never exported**                               | `useMapFiltersStore`                             |
| **Exported hooks**         | `use{Slice}` for state primitives; `use{Domain}Actions` for `actions` | `useAppliedFilters`, `useMapFiltersActions`      |

**Do not use:** `store.ts`, `state.ts`, `zustand.ts`, or `useMapFiltersStore.ts` (filename must not imply exporting the raw store). Do not put unrelated domains in one file.

**Persist:** unique `name` per store, aligned with the file, e.g. `fmc-map-filters` for `map-filters-store.ts`. **TanStack Start SSR + `persist`:** follow skill `tanstack-start-conventions` and llms.txt → **SSR and Hydration** (hydration gate or official SSR-safe patterns).

---

## Canonical store shape

```typescript
import { create } from "zustand"

interface MapFiltersStore {
  applied: string[]
  actions: {
    addFilter: (filter: string) => void
    clearFilters: () => void
  }
}

const useMapFiltersStore = create<MapFiltersStore>()((set) => ({
  applied: [],
  actions: {
    addFilter: (filter) =>
      set((state) =>
        state.applied.includes(filter) ? state : { applied: [...state.applied, filter] },
      ),
    clearFilters: () => set({ applied: [] }),
  },
}))

export const useAppliedFilters = () => useMapFiltersStore((state) => state.applied)

export const useMapFiltersActions = () => useMapFiltersStore((state) => state.actions)
```

**TypeScript:** always `create<StoreType>()((set) => …)` (double parentheses), even without middleware.

---

## Rules

1. **Only export custom hooks** (`use{Slice}` + `use{Domain}Actions`); keep `use{Domain}Store` private. Never call a store hook without a selector.
2. **Atomic selectors** returning primitives or stable references; one exported hook per slice. Reach for `useShallow` (from `zustand/shallow`) only when two values are rarely needed together, and prefer atomic hooks when practical.
3. **Separate `actions` from state.** The `actions` reference is stable, so `const { addFilter } = useMapFiltersActions()` is fine.
4. **Model actions as events, not setters:** `addFilter`, `closePanel`, not `setApplied` called from components. Business logic stays in the store. For high-frequency inputs (resize, observers), return the previous `state` from `set` when nothing changed.
5. **Many small stores** over one app-wide store. Combine at the edges with custom hooks (e.g. a hook reading `useCredentialsStore` + `useUsersStore`). Avoid the slices pattern unless there is a strong reason (heavy TypeScript; see llms.txt).
6. **Combine with TanStack Query via custom hooks:** filters live in Zustand, the server list in Query (`queryKey: ['todos', filters]`).
7. **No Zustand for server-fetched data.**

---

## Delegate to llms.txt

Do not duplicate full API docs in this skill. Fetch llms.txt for middleware (`persist`, `devtools`, `immer`; `persist` imports from `zustand/middleware`), patterns (slices, reset state, vanilla store, testing), integrations (SSR and Hydration, URL hash, Maps/Sets), and v4 → v5 migration.

---

## Related skills

| Topic                       | Skill                         |
| --------------------------- | ----------------------------- |
| App layout, SSR (Start)     | `tanstack-start-conventions`  |
| URL search (Router)         | `tanstack-router-conventions` |
| URL query state (no Router) | `nuqs`                        |
