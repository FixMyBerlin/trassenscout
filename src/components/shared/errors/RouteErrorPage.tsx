import type { ErrorComponentProps } from "@tanstack/react-router"
import { redirect, useRouterState } from "@tanstack/react-router"
import { useEffect } from "react"
import { Link } from "@/src/components/core/components/links/Link"
import { isAuthorizationError, isNotAuthenticatedError } from "@/src/shared/auth/errors"

export function RouteErrorPage({ error }: ErrorComponentProps) {
  const href = useRouterState({ select: (state) => state.location.href })

  useEffect(() => {
    if (!isNotAuthenticatedError(error) && !isAuthorizationError(error)) {
      console.error(error)
    }
  }, [error])

  if (isNotAuthenticatedError(error)) {
    throw redirect({
      to: "/auth/login",
      search: { callbackURL: href },
    })
  }

  if (isAuthorizationError(error)) {
    throw redirect({
      to: "/access-denied",
      search: { from: href },
    })
  }

  return (
    <div className="flex min-h-full grow flex-col bg-white">
      <main className="mx-auto flex w-full max-w-7xl grow flex-col justify-center px-4 sm:px-6 lg:px-8">
        <div className="py-16">
          <div className="text-center">
            <p className="text-base font-semibold text-amber-500">:-(</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Ein Fehler ist aufgetreten
            </h1>
            <p className="mt-2 text-base text-gray-500">Leider ist ein Fehler aufgetreten.</p>
            <div className="mt-6">
              <Link to="/" button>
                Zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
