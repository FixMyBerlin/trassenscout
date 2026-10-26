# TanStack devtools panel (Query, Router, Form)

**Canonical FMC pattern** for the unified TanStack debug panel (Vite SPA or TanStack Start). Reference: [trassenscout `TanStackAppDevtools.tsx`](https://github.com/FixMyBerlin/trassenscout/blob/main/src/components/shared/devtools/TanStackAppDevtools.tsx). Docs: [TanStack Devtools](https://tanstack.com/devtools/latest).

## Packages (devDependencies)

`@tanstack/devtools-vite`, `@tanstack/react-devtools`, `@tanstack/react-form-devtools`, `@tanstack/react-query-devtools`, `@tanstack/react-router-devtools`. Versions: see the app's `package.json`.

## Vite plugin

Add `@tanstack/devtools-vite` **first** in `plugins`. It strips `<TanStackDevtools>` and its panel imports from production builds.

```ts
import { devtools } from "@tanstack/devtools-vite"

export default defineConfig({
  plugins: [
    devtools({
      // react-map-gl spreads all props into map.addSource/addLayer; devtools source attrs break Maplibre validation.
      injectSource: { enabled: true, ignore: { components: ["Source", "Layer"] } },
    }),
    // …tanstackRouter / tanstackStart, viteReact, etc.
  ],
})
```

Skip the `injectSource.ignore` block when the app has no `react-map-gl` `Source` / `Layer`.

## Component (`components/shared/devtools/TanStackAppDevtools.tsx`)

Dedicated component, mounted once from the root layout inside `QueryClientProvider` (`<TanStackAppDevtools />`). Do not inline `<TanStackDevtools>` in the layout file.

```tsx
import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { ClientOnly } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

export function TanStackAppDevtools() {
  return (
    <ClientOnly fallback={null}>
      <TanStackDevtools
        config={{ hideUntilHover: false, position: "bottom-left", panelLocation: "bottom" }}
        eventBusConfig={{
          // Default false (no server bus). TanStack Start: set true to see server events.
          connectToServerBus: false,
        }}
        plugins={[
          { name: "TanStack Query", render: <ReactQueryDevtoolsPanel /> },
          { name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> },
          formDevtoolsPlugin(),
        ]}
      />
    </ClientOnly>
  )
}
```

`<ClientOnly>` is fine without SSR; on Start it avoids rendering the overlay during SSR.

## Rules

- Wrap in `<ClientOnly fallback={null}>`; no `import.meta.env.DEV` guard (the Vite plugin strips prod).
- Reference panels **inline** in `plugins`; local wrapper components (e.g. `useRouter()` wrappers) stop the strip plugin from removing their imports.
- Use `ReactQueryDevtoolsPanel` inside the unified panel, not a standalone `<ReactQueryDevtools />`.
- Use `TanStackRouterDevtoolsPanel` without passing `router`; it resolves it from context.

Migrating older layouts: extract this component, switch to `ReactQueryDevtoolsPanel`, add `<ClientOnly>`, drop DEV guards, put `devtools()` first in the Vite plugins.
