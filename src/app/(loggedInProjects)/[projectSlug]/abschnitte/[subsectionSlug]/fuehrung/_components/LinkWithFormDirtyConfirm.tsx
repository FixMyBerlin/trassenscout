import { Link } from "@/src/core/components/links/Link"
import { Route } from "next"
import { usePathname } from "next/navigation"
import { useFormState } from "react-hook-form"

type Props = { href: Route; className?: string; children: React.ReactNode }

/**
 * A link that warns users about unsaved form changes before navigating.
 * Automatically appends `?from=<currentPath>` to the href for back navigation support.
 */
export const LinkWithFormDirtyConfirm = ({ href, className, children }: Props) => {
  const { isDirty } = useFormState()
  const pathname = usePathname()

  // Append ?from= param with current path for back navigation (only if pathname is available)
  const hrefWithFrom = pathname
    ? (`${href}${href.includes("?") ? "&" : "?"}from=${encodeURIComponent(pathname)}` as Route)
    : href

  return (
    <Link
      href={hrefWithFrom}
      className={className}
      onClick={(event) => {
        if (isDirty) {
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
