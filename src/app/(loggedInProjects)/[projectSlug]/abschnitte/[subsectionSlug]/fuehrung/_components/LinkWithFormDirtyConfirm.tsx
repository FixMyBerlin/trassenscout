import { Link } from "@/src/core/components/links/Link"
import type { FormApi } from "@/src/core/components/forms/types"
import { Route } from "next"
import { usePathname } from "next/navigation"

type Props = {
  form: FormApi<Record<string, unknown>>
  href: Route
  className?: string
  children: React.ReactNode
}

/**
 * A link that warns users about unsaved form changes before navigating.
 * Automatically appends `?from=<currentPath>` to the href for back navigation support.
 */
export const LinkWithFormDirtyConfirm = ({ form, href, className, children }: Props) => {
  const pathname = usePathname()

  const hrefWithFrom = pathname
    ? (`${href}${href.includes("?") ? "&" : "?"}from=${encodeURIComponent(pathname)}` as Route)
    : href

  return (
    <Link
      href={hrefWithFrom}
      className={className}
      onClick={(event) => {
        if (form.state.isDirty) {
          const userConfirmed = confirm(`
Es gibt ungespeicherte Änderungen. \n
Diese gehen verloren, wenn Sie fortfahren. \n
Bitte speichern Sie ggf. zunächst die bestehenden Änderungen, bevor Sie diese Option nutzen. Wählen Sie dafür hier "Abbrechen".`)
          if (!userConfirmed) {
            event.preventDefault()
          }
        }
      }}
    >
      {children}
    </Link>
  )
}
