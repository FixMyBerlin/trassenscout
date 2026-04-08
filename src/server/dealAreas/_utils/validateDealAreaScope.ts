import db from "db"

type ValidateDealAreaScopeInput = {
  projectSlug: string
  dealAreaId: number | null | undefined
  subsectionId?: number | null
  subsubsectionId?: number | null
}

export const validateDealAreaScope = async ({
  projectSlug,
  dealAreaId,
  subsectionId,
  subsubsectionId,
}: ValidateDealAreaScopeInput) => {
  if (!dealAreaId) return null

  const dealArea = await db.dealArea.findFirst({
    where: {
      id: dealAreaId,
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

  if (!dealArea) {
    throw new Error("Dealfläche nicht gefunden.")
  }
  if (subsubsectionId && subsubsectionId !== dealArea.subsubsectionId) {
    throw new Error("Dealfläche passt nicht zum ausgewählten Eintrag.")
  }
  if (subsectionId && subsectionId !== dealArea.subsubsection.subsectionId) {
    throw new Error("Dealfläche passt nicht zum ausgewählten Planungsabschnitt.")
  }

  return dealArea
}
