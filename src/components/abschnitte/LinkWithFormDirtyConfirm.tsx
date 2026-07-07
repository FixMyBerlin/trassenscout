import { useLocation } from "@tanstack/react-router"
import { useFormDirty } from "@/src/components/core/components/forms/hooks/useFormDirty"
import { Link } from "@/src/components/core/components/links/Link"

type Props = { to: string; className?: string; blank?: boolean; children: React.ReactNode }

/**
 * A link that warns users about unsaved form changes before navigating.
 * Passes `from=<currentPath>` as route search for back navigation support.
 */
export const LinkWithFormDirtyConfirm = ({ to, className, blank, children }: Props) => {
  const isDirty = useFormDirty()
  const pathname = useLocation().pathname

  return (
    <Link
      to={to}
      blank={blank}
      search={!blank && pathname ? { from: pathname } : undefined}
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
