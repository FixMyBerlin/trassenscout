import db from "db"

type ValidateAcquisitionAreaScopeInput = {
  projectSlug: string
  acquisitionAreaId: number | null | undefined
  subsectionId?: number | null
  subsubsectionId?: number | null
}

export const validateAcquisitionAreaScope = async ({
  projectSlug,
  acquisitionAreaId,
  subsectionId,
  subsubsectionId,
}: ValidateAcquisitionAreaScopeInput) => {
  if (!acquisitionAreaId) return null

  const acquisitionArea = await db.acquisitionArea.findFirst({
    where: {
      id: acquisitionAreaId,
      subsubsection: {
        subsection: {
          project: {
            slug: projectSlug,
          },
        },
      },
    },
    select: {
      subsubsectionId: true,
      subsubsection: {
        select: {
          subsectionId: true,
        },
      },
    },
  })

  if (!acquisitionArea) {
    throw new Error("Dealfläche nicht gefunden.")
  }
  if (subsubsectionId && subsubsectionId !== acquisitionArea.subsubsectionId) {
    throw new Error("Dealfläche passt nicht zum ausgewählten Eintrag.")
  }
  if (subsectionId && subsectionId !== acquisitionArea.subsubsection.subsectionId) {
    throw new Error("Dealfläche passt nicht zum ausgewählten Planungsabschnitt.")
  }

  return acquisitionArea
}
