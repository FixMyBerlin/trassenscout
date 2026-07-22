import type { NotFoundRouteComponent } from "@tanstack/react-router"
import { Link } from "@/src/components/core/components/links/Link"
import { FooterMinimal } from "@/src/components/shared/app/layouts/footer/FooterMinimal"
import { appMainClassName, appShellClassName } from "@/src/components/shared/layouts/layoutClasses"

/** Global 404 page – ported from the pre-migration `src/app/not-found.tsx`. */
export const RouteNotFoundPage: NotFoundRouteComponent = () => {
  return (
    <div className={appShellClassName}>
      <main className={`${appMainClassName} justify-center px-4 sm:px-6 lg:px-8`}>
        <div className="py-16">
          <div className="text-center">
            <p className="text-base font-semibold text-yellow-500">404</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Seite nicht gefunden
            </h1>
            <p className="mt-2 text-base text-gray-500">
              Leider konnten wir diese Seite nicht finden.
            </p>
            <div className="mt-6">
              <Link to="/">
                Zur Startseite
                <span aria-hidden="true"> &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <FooterMinimal />
    </div>
  )
}

/** Compact 404 for layout routes that keep parent chrome (project nav, survey header, etc.). */
export const RouteScopedNotFoundPage: NotFoundRouteComponent = () => {
  return (
    <div className="py-16 text-center">
      <p className="text-base font-semibold text-yellow-500">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">Seite nicht gefunden</h1>
      <p className="mt-2 text-base text-gray-500">Leider konnten wir diese Seite nicht finden.</p>
      <div className="mt-6">
        <Link to="/">
          Zur Startseite
          <span aria-hidden="true"> &rarr;</span>
        </Link>
      </div>
    </div>
  )
}
