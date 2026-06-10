import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools"
import { useRouter } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"

function RouterDevtoolsPanel() {
  const router = useRouter()
  return <TanStackRouterDevtoolsPanel router={router} />
}

/** Dev-only TanStack devtools panel (Query, Router, Form). Stripped from production builds. */
export function TanStackAppDevtools() {
  if (!import.meta.env.DEV) return null

  return (
    <TanStackDevtools
      config={{
        hideUntilHover: false,
        position: "bottom-left",
        panelLocation: "bottom",
      }}
      eventBusConfig={{
        connectToServerBus: true,
      }}
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
        },
        {
          name: "TanStack Router",
          render: <RouterDevtoolsPanel />,
        },
        formDevtoolsPlugin(),
      ]}
    />
  )
}
