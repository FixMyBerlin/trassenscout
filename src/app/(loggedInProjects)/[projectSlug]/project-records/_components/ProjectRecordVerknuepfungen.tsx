"use client"

import { Link } from "@/src/core/components/links"
import {
  subsubsectionDashboardRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { Route } from "next"

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  subsubsection?: {
    slug: string
    subsection: { slug: string }
  } | null
  acquisitionArea?: {
    id: number
    subsubsection: {
      slug: string
      subsection: { slug: string }
    }
    parcel: { alkisParcelId: string }
  } | null
  className?: string
}

export const ProjectRecordVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsubsection,
  acquisitionArea,
  className,
}: Props) => {
  const hasSubsubsection = !!subsubsection
  const hasAcquisitionArea = !!acquisitionArea && !!landAcquisitionModuleEnabled

  if (!hasSubsubsection && !hasAcquisitionArea) {
    return <p className={className}>Keine Verknüpfungen vorhanden.</p>
  }

  return (
    <section className={className}>
      <ul className="mt-1.5 list-none space-y-0.5 text-sm">
        {hasSubsubsection && subsubsection && (
          <li>
            <strong className="font-medium">Eintrag: </strong>
            <Link
              href={subsubsectionDashboardRoute(
                projectSlug,
                subsubsection.subsection.slug,
                subsubsection.slug,
              )}
            >
              {subsubsection.slug}
            </Link>
          </li>
        )}
        {hasAcquisitionArea && acquisitionArea && (
          <li>
            <strong className="font-medium">Verhandlungsfläche: </strong>
            <Link
              href={
                `${subsubsectionLandAcquisitionRoute(
                  projectSlug,
                  acquisitionArea.subsubsection.subsection.slug,
                  acquisitionArea.subsubsection.slug,
                )}?acquisitionAreaId=${acquisitionArea.id}` as Route
              }
            >
              {acquisitionArea.id} ({acquisitionArea.parcel.alkisParcelId})
            </Link>
          </li>
        )}
      </ul>
    </section>
  )
}
