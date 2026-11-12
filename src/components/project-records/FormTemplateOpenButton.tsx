import { DocumentTextIcon } from "@heroicons/react/24/outline"
import type { ReactNode } from "react"
import { whiteButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"

type Props = {
  onClick: () => void
  children: ReactNode
}

export const FormTemplateOpenButton = ({ onClick, children }: Props) => (
  <button type="button" onClick={onClick} className={whiteButtonClassName}>
    <DocumentTextIcon className="size-4 shrink-0" aria-hidden />
    {children}
  </button>
)
