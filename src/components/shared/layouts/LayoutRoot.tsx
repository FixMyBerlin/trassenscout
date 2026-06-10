import "@fontsource/red-hat-text/400.css"
import "@fontsource/red-hat-text/500.css"
import "@fontsource/red-hat-text/600.css"
import "@fontsource/red-hat-text/700.css"
import { HeadContent, Outlet, Scripts, useRouteContext } from "@tanstack/react-router"
import { StrictMode, Suspense } from "react"
import { TanStackAppDevtools } from "@/src/components/shared/devtools/TanStackAppDevtools"
import { Provider as TanStackQueryProvider } from "@/src/components/shared/providers/tanstack-query/root-provider"

export function LayoutRoot() {
  const { queryClient } = useRouteContext({ from: "__root__" })

  return (
    <html lang="de" className="h-full scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body className="flex min-h-dvh w-full flex-col bg-white text-gray-800 antialiased">
        <StrictMode>
          <TanStackQueryProvider queryClient={queryClient}>
            <Suspense>
              <div className="flex min-h-dvh w-full flex-col">
                <Outlet />
              </div>
            </Suspense>
            <TanStackAppDevtools />
          </TanStackQueryProvider>
        </StrictMode>
        <div id="headlessui-portal-root" className="contents" />
        <Scripts />
      </body>
    </html>
  )
}
