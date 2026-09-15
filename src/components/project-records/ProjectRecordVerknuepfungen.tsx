import {
  AcquisitionAreaRelationLink,
  acquisitionAreaRelationKey,
  type AcquisitionAreaRelation,
  SubsubsectionRelationLink,
  subsubsectionRelationKey,
  type SubsubsectionRelation,
} from "@/src/components/project-records/ProjectRelationLinks"

type Props = {
  projectSlug: string
  landAcquisitionModuleEnabled?: boolean
  subsubsection?: SubsubsectionRelation | null
  acquisitionArea?: AcquisitionAreaRelation | null
  subsubsections?: SubsubsectionRelation[]
  acquisitionAreas?: AcquisitionAreaRelation[]
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
              <span key={subsubsectionRelationKey(subsubsection)}>
                <SubsubsectionRelationLink
                  projectSlug={projectSlug}
                  subsubsection={subsubsection}
                />
              </span>
            ))}
          </div>
        )}
        {hasAcquisitionArea && (
          <div className="flex flex-col gap-1">
            {effectiveAcquisitionAreas.map((area) => (
              <span key={acquisitionAreaRelationKey(area)}>
                <AcquisitionAreaRelationLink projectSlug={projectSlug} acquisitionArea={area} />
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
              <strong className="font-medium">Maßnahme: </strong>
              <SubsubsectionRelationLink
                projectSlug={projectSlug}
                subsubsection={effectiveSubsubsections[0]!}
              />
            </li>
          ) : (
            <li className="flex flex-wrap items-baseline gap-x-1">
              <strong className="font-medium">Maßnahmen: </strong>
              <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                {effectiveSubsubsections.map((subsub, index) => (
                  <li key={subsubsectionRelationKey(subsub)} className="inline-flex">
                    <SubsubsectionRelationLink projectSlug={projectSlug} subsubsection={subsub} />
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
              <AcquisitionAreaRelationLink
                projectSlug={projectSlug}
                acquisitionArea={effectiveAcquisitionAreas[0]!}
              />
            </li>
          ) : (
            <li className="flex flex-wrap items-baseline gap-x-1">
              <strong className="font-medium">Verhandlungsflächen: </strong>
              <ul className="mt-0.5 flex list-none flex-wrap gap-x-2 pl-0">
                {effectiveAcquisitionAreas.map((area, index) => (
                  <li key={acquisitionAreaRelationKey(area)} className="inline-flex">
                    <AcquisitionAreaRelationLink projectSlug={projectSlug} acquisitionArea={area} />
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
