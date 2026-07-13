import { Link } from "@/src/components/core/components/links/Link"

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
  subsubsections?: {
    slug: string
    subsection: { slug: string }
  }[]
  acquisitionAreas?: {
    id: number
    subsubsection: {
      slug: string
      subsection: { slug: string }
    }
    parcel: { alkisParcelId: string }
  }[]
  className?: string
  variant?: "default" | "valuesOnly"
  relationType?: "all" | "subsubsections" | "acquisitionAreas"
}

export const ProjectRecordVerknuepfungen = ({
  projectSlug,
  landAcquisitionModuleEnabled,
  subsubsection,
  acquisitionArea,
  subsubsections = [],
  acquisitionAreas = [],
  className,
  variant = "default",
  relationType = "all",
}: Props) => {
  const effectiveSubsubsections =
    subsubsections.length > 0 ? subsubsections : subsubsection ? [subsubsection] : []
  const effectiveAcquisitionAreas =
    acquisitionAreas.length > 0 ? acquisitionAreas : acquisitionArea ? [acquisitionArea] : []

  const hasSubsubsection =
    (relationType === "all" || relationType === "subsubsections") &&
    effectiveSubsubsections.length > 0
  const hasAcquisitionArea =
    (relationType === "all" || relationType === "acquisitionAreas") &&
    effectiveAcquisitionAreas.length > 0 &&
    !!landAcquisitionModuleEnabled

  if (!hasSubsubsection && !hasAcquisitionArea) {
    if (variant === "valuesOnly") return null
    return <p className={className}>Keine Verknüpfungen vorhanden.</p>
  }

  if (variant === "valuesOnly") {
    return (
      <div className={className}>
        {hasSubsubsection && (
          <div className="flex flex-col gap-1">
            {effectiveSubsubsections.map((subsubsection) => (
              <span key={`${subsubsection.subsection.slug}-${subsubsection.slug}`}>
                <Link
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                  params={{
                    projectSlug,
                    subsectionSlug: subsubsection.subsection.slug,
                    subsubsectionSlug: subsubsection.slug,
                  }}
                >
                  {subsubsection.slug}
                </Link>
              </span>
            ))}
          </div>
        )}
        {hasAcquisitionArea && (
          <div className="flex flex-col gap-1">
            {effectiveAcquisitionAreas.map((area) => (
              <span key={area.id}>
                <Link
                  to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                  params={{
                    projectSlug,
                    subsectionSlug: area.subsubsection.subsection.slug,
                    subsubsectionSlug: area.subsubsection.slug,
                  }}
                  search={{ acquisitionAreaId: String(area.id) }}
                >
                  {area.id} ({area.parcel.alkisParcelId})
                </Link>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <section className={className}>
      <ul className="mt-1.5 list-none space-y-0.5">
        {hasSubsubsection &&
          (effectiveSubsubsections.length === 1 ? (
            <li>
              <strong className="font-medium">Maßnahme : </strong>
              <Link
                to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                params={{
                  projectSlug,
                  subsectionSlug: effectiveSubsubsections[0]!.subsection.slug,
                  subsubsectionSlug: effectiveSubsubsections[0]!.slug,
                }}
              >
                {effectiveSubsubsections[0]!.slug}
              </Link>
            </li>
          ) : (
            <li className="flex flex-wrap items-baseline gap-x-2">
              <strong className="font-medium">Maßnahmen: </strong>
              <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                {effectiveSubsubsections.map((subsub, index) => (
                  <li key={`${subsub.subsection.slug}-${subsub.slug}`} className="inline-flex">
                    <Link
                      to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug"
                      params={{
                        projectSlug,
                        subsectionSlug: subsub.subsection.slug,
                        subsubsectionSlug: subsub.slug,
                      }}
                    >
                      {subsub.slug}
                    </Link>
                    {index < effectiveSubsubsections.length - 1 ? <span>,</span> : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        {hasAcquisitionArea &&
          (effectiveAcquisitionAreas.length === 1 ? (
            <li>
              <strong className="font-medium">Verhandlungsfläche: </strong>
              <Link
                to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                params={{
                  projectSlug,
                  subsectionSlug: effectiveAcquisitionAreas[0]!.subsubsection.subsection.slug,
                  subsubsectionSlug: effectiveAcquisitionAreas[0]!.subsubsection.slug,
                }}
                search={{ acquisitionAreaId: String(effectiveAcquisitionAreas[0]!.id) }}
              >
                {effectiveAcquisitionAreas[0]!.id} (
                {effectiveAcquisitionAreas[0]!.parcel.alkisParcelId})
              </Link>
            </li>
          ) : (
            <li className="flex flex-wrap items-baseline gap-x-2">
              <strong className="font-medium">Verhandlungsflächen: </strong>
              <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                {effectiveAcquisitionAreas.map((area, index) => (
                  <li key={area.id} className="inline-flex">
                    <Link
                      to="/$projectSlug/abschnitte/$subsectionSlug/fuehrung/$subsubsectionSlug/land-acquisition"
                      params={{
                        projectSlug,
                        subsectionSlug: area.subsubsection.subsection.slug,
                        subsubsectionSlug: area.subsubsection.slug,
                      }}
                      search={{ acquisitionAreaId: String(area.id) }}
                    >
                      {area.id} ({area.parcel.alkisParcelId})
                    </Link>
                    {index < effectiveAcquisitionAreas.length - 1 ? <span>,</span> : null}
                  </li>
                ))}
              </ul>
            </li>
          ))}
      </ul>
    </section>
  )
}
