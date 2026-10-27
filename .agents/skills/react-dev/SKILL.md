---
name: react-dev
description: >-
  React 19 + TypeScript for FMC TanStack Start apps: typed components, events,
  generics, ref-as-prop, Compiler-first memoization, and useEffect discipline
  (naming, when not to use Effect, alternatives). Use when typing React
  components/hooks/events, or writing/reviewing useEffect, useEffectEvent,
  derived state, data-fetch effects, or oxlint React Compiler / Rules of React effect rules.
  Not for routing/server boundaries (see tanstack-start-* skills).
---

**LLM reference:** [react.dev/llms.txt](https://react.dev/llms.txt) · [tanstack.com/llms.txt](https://tanstack.com/llms.txt) · Key effect page: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)

# React + TypeScript (FMC)

FMC conventions for React typing and **useEffect discipline** (naming, scope, when to skip). Routing and server I/O live in sibling skills (below).

## FMC stack (required)

| Requirement        | Rule                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React 19**       | Target 19.x; no `forwardRef` / `useFormState` / `useActionState` in new code; forms: TanStack Form                                                   |
| **React Compiler** | Enabled in the app build — auto-memoization is the default                                                                                           |
| **Lint**           | **Oxlint** `react` plugin — native Compiler rules on by default, plus `'react/unsupported-syntax': 'error'`; no `eslint-plugin-react-hooks` jsPlugin |
| **Memoization**    | Do **not** add `useMemo` / `useCallback` / `memo` by default; add only when profiling or a lint rule requires it                                     |
| **TanStack Start** | Server I/O and mutations → `tanstack-start-conventions` (this skill covers component typing only)                                                    |
| **Data fetching**  | Route loaders + React Query — not `useEffect` fetch (see `tanstack-router-conventions`)                                                              |

Docs: [React Compiler](https://react.dev/learn/react-compiler.md) · [Rules of React](https://react.dev/reference/rules.md) · [Oxc React Compiler Support](https://oxc.rs/blog/2026-08-18-react-compiler-support)

## Related skills

| Topic                                 | Skill                                                                 |
| ------------------------------------- | --------------------------------------------------------------------- |
| Routes, loaders, `validateSearch`     | `tanstack-router-conventions`                                         |
| URL state (prefer router search)      | `tanstack-router-conventions`                                         |
| SSR, server functions, Start layout   | `tanstack-start-conventions`                                          |
| Folder layout, thin routes (Start)    | skill `tanstack-start-conventions` → `references/app-structure.md`    |
| `createServerFn`, server mutations    | skill `tanstack-start-conventions` → `references/server-functions.md` |
| Client stores (not context + reducer) | `zustand-state-management`                                            |
| Semantic HTML (div/span leftovers)    | skill `unslop-code` → `references/semantic-html.md`                   |

## Typing notes

- **Props:** extend native elements with `React.ComponentPropsWithoutRef<'button'>` (ref excluded); `children: React.ReactNode`, never `JSX.Element`.
- **Variant props:** discriminated unions (`{ variant: 'link'; href: string } | { variant: 'button'; onClick: () => void }`) and narrow on the discriminant.
- **ref:** normal prop in React 19, no new `forwardRef` → [react-19-patterns.md](references/react-19-patterns.md).
- **Events:** specific `React.*Event<HTMLElement>` types so `currentTarget` is typed; never `any` → [event-handlers.md](references/event-handlers.md).
- **Hooks:** explicit `useState<User | null>(null)` for `null`, `[]`, unions; `useRef<HTMLInputElement>(null)` + `?.` for DOM, `useRef(0)` for mutable box; discriminated union for `useReducer` actions; `createContext<T | null>(null)` + throwing custom hook. External store: `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)`.
- **Route hooks:** `Route.useParams()` / `Route.useSearch()` inside `createFileRoute` components; `validateSearch` lives in the route file → [tanstack-router.md](references/tanstack-router.md).

## useEffect — naming, scope, and when to skip

Effects are an escape hatch for synchronizing with **external systems** (non-React widgets, browser APIs, map SDKs, subscriptions, analytics). If no external system is involved, you usually should not use an Effect.

### Name every useEffect

**Always** pass a **named function expression** to `useEffect`, not an anonymous arrow. Default style for new and edited code, including effects inside custom hooks. Name non-trivial cleanups too.

```tsx
useEffect(
  function updateDocumentTitle() {
    document.title = `${count} items`
  },
  [count],
)

useEffect(function pollServerForUpdates() {
  const intervalId = setInterval(/* ... */, 5000);
  return function stopPollingServer() {
    clearInterval(intervalId);
  };
}, [serverId]);
```

### Indicators from naming

Naming is a design review at the keyboard. Details: [effects.md](references/effects.md).

| Signal                                                                                                            | Meaning                              | Fix                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Name needs **"and"** / **"also"**                                                                                 | Unrelated concerns in one effect     | Split into separate effects, each with one name                                                                                     |
| **`syncDerivedValue`**, **`updateStateFromState`**, **`setXBasedOnY`**                                            | Derived state or state-to-state sync | Derive during render                                                                                                                |
| **`notifyParentOfChange`**, **`reportStateToParent`**                                                             | Parent updates driven by child state | Call in the event handler, lift data up, or make the component controlled                                                           |
| **`resetFormOnSubmitFlag`**                                                                                       | User intent expressed via state hop  | Handle in the event handler                                                                                                         |
| **`persistOnClose`**, **`syncWhenClosed`**, **`saveDraftOnDismiss`**                                              | Side effect on dismiss/open UI state | Handler, not Effect on `isOpen` ([effects.md §3](references/effects.md#persist-or-sync-on-gesture-not-on-isopen--transition-flags)) |
| Clear **external** verbs: `connectTo…`, `subscribeTo…`, `initialize…`, `synchronize…` (browser, network, map SDK) | Often legitimate Effect territory    | Still name them; add cleanup when needed                                                                                            |

If the honest name sounds like internal React bookkeeping, the code belongs in render, an event handler, or a different pattern.

### Quick reference

| Situation                      | DON'T                          | DO                                                                |
| ------------------------------ | ------------------------------ | ----------------------------------------------------------------- |
| Derived state from props/state | `useState` + `useEffect`       | Calculate during render (no `useMemo` by default, Compiler is on) |
| Reset state on prop change     | `useEffect` with `setState`    | `key` prop                                                        |
| User event responses           | `useEffect` watching state     | Event handler directly                                            |
| Persist/sync on dismiss        | `useEffect` on `isOpen`        | Dismiss handler (or `onCloseComplete`)                            |
| Notify parent of changes       | `useEffect` calling `onChange` | Call in event handler, or controlled component                    |
| Data from child to parent      | Effect calling `onFetched`     | Parent fetches, passes down                                       |
| External store                 | Effect + `useState`            | `useSyncExternalStore`                                            |
| Fetch data                     | `useEffect`                    | Route loaders + React Query                                       |

**Strict Mode (dev):** effects run setup twice on mount. Add teardown for subscriptions and timers; guard one-time init (module-level `didInit` guard, see [effects.md §6](references/effects.md#6-app-initialization)).

### Effects and React Compiler / lint

- Compiler does not replace Effects for **external** synchronization. Changed memoization can change when effects re-run — fix effect design (deps, splits, `useEffectEvent`) rather than disabling the compiler.
- Lint: Oxlint native React Compiler rules (`react/set-state-in-effect`, `react/immutability`, …).

### `useEffectEvent`

For effects that must stay subscribed (connection, interval, listener) while part of the callback reads **latest** props/state. Example: [effects.md §7](references/effects.md#7-useeffectevent-for-non-reactive-effect-logic).

- Name like user-visible events: `onConnected`, `onTick` — not `onMount` / `onUpdate`.
- Call only from Effects (or other Effect Events in the same component); never during render, in event handlers, or as props to children.
- Omit from the dependency array (enforced by lint); never use it to hide dependencies that should re-trigger the Effect.

## React 19 APIs (pointers)

| API              | Use                                  | Docs                                                                  |
| ---------------- | ------------------------------------ | --------------------------------------------------------------------- |
| `use()`          | Unwrap promise/context (can suspend) | [use](https://react.dev/reference/react/use.md)                       |
| `useOptimistic`  | Optimistic UI                        | [useOptimistic](https://react.dev/reference/react/useOptimistic.md)   |
| `useTransition`  | Non-urgent updates                   | [useTransition](https://react.dev/reference/react/useTransition.md)   |
| `useEffectEvent` | Stable callback inside effects       | [useEffectEvent](https://react.dev/reference/react/useEffectEvent.md) |

## Rules

**Always**

- Named `useEffect` functions; React Compiler on; oxlint native `react/*` compiler rules
- Prefer semantic HTML over generic `div`/`span` — skill `unslop-code` → `references/semantic-html.md`
- `ref` as prop in React 19

**Never**

- New `forwardRef` / `useFormState` / `useActionState` (forms: TanStack Form)
- Default `useMemo` / `useCallback` / `memo` without cause
- `useEffect` for app data fetching (use loaders/Query)
- Await a promise you pass to `use()` for streaming handoff

## References

- [effects.md](references/effects.md) — read when writing or reviewing a `useEffect`, or an effect name hits the smell table above (reset with `key`, persist-on-gesture, parent data flow, init guard, `useEffectEvent` example)
- [event-handlers.md](references/event-handlers.md) — read when typing event handlers beyond click/submit/change, or forwarding events via props
- [react-19-patterns.md](references/react-19-patterns.md) — read when typing `ref` as prop, `use()`, or migrating a legacy codebase to React 19
- [generic-components.md](examples/generic-components.md) — read when writing generic components (constrained `T extends HasId`, `Select<T>` with accessors)
- [tanstack-router.md](references/tanstack-router.md) — read when typing route hooks (canonical: `tanstack-router-conventions` → `router-typescript.md`)
- Neciu Dan — [Start naming your useEffect functions](https://neciudan.dev/name-your-effects)
