import { Link } from "@/src/core/components/links/Link"
import { RouteUrlObject } from "blitz"
import { useFormState } from "react-hook-form"

type Props = { href: RouteUrlObject; className?: string; children: React.ReactNode }

export const LinkWithFormDirtyConfirm = ({ href, className, children }: Props) => {
  const { isDirty } = useFormState()

  return (
    <Link
      href={href}
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
