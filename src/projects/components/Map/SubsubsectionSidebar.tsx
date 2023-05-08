import { Routes } from "@blitzjs/next"
import React from "react"
import { Link } from "src/core/components/links"
import { useSlugs } from "src/core/hooks"

type Props = {
  className?: string | undefined
  subsubsection: any
  onClose: () => void
}

export const SubsubsectionSidebar: React.FC<Props> = ({ className, subsubsection, onClose }) => {
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <div className={className}>
      <button className="absolute right-2 top-2 border-2 border-black p-1" onClick={onClose}>
        <b>close</b>
      </button>
      <code>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </code>
      <Link
        icon="edit"
        className="mt-4"
        href={Routes.EditSubsubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: subsubsectionSlug!,
        })}
      >
        bearbeiten
      </Link>
    </div>
  )
}
