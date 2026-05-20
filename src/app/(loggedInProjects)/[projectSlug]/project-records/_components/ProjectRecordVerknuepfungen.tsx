"use client"

import { Link } from "@/src/core/components/links"
import {
  subsubsectionDashboardRoute,
  subsubsectionLandAcquisitionRoute,
} from "@/src/core/routes/subsectionRoutes"
import { uploadEditRouteForProjectRecord } from "@/src/core/routes/uploadRoutes"
import { formatBerlinTime } from "@/src/core/utils/formatBerlinTime"
import { Route } from "next"

type Props = {
  projectSlug: string
  projectRecordId: number
  returnTo?: string
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
  uploads?: {
    id: number
    title: string
    createdAt: Date
  }[]
  className?: string
}

export const ProjectRecordVerknuepfungen = ({
  projectSlug,
  projectRecordId,
  returnTo,
  landAcquisitionModuleEnabled,
  subsubsection,
  acquisitionArea,
  uploads = [],
  className,
}: Props) => {
  const hasSubsubsection = !!subsubsection
  const hasAcquisitionArea = !!acquisitionArea && !!landAcquisitionModuleEnabled
  const hasUploads = uploads.length > 0

  if (!hasSubsubsection && !hasAcquisitionArea && !hasUploads) {
    return <p className={className}>Keine Verknüpfungen vorhanden.</p>
  }

  return (
    <section className={className}>
      <ul className="mt-1.5 list-none space-y-0.5 pl-4 text-sm">
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
        {hasUploads && (
          <li>
            <strong className="font-medium">Dokumente: </strong>
            <ul className="mt-0.5 list-inside list-disc space-y-0.5 pl-2">
              {uploads.map((upload) => (
                <li key={upload.id}>
                  <Link
                    href={uploadEditRouteForProjectRecord(projectSlug, upload.id, projectRecordId, {
                      returnTo,
                    })}
                    scroll={false}
                  >
                    {upload.title}
                    {upload.createdAt && <> ({formatBerlinTime(upload.createdAt, "P")})</>}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </section>
  )
}
