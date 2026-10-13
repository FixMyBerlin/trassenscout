import db from "@/src/server/db.server"
import { TAcquisitionAreaSchema } from "@/src/shared/acquisitionAreas/schemas"

type ValidateAcquisitionAreaInput = Pick<
  TAcquisitionAreaSchema,
  "subsubsectionId" | "parcelId" | "acquisitionAreaStatusId"
> & {
  projectSlug: string
}

/** Verhandlungsflächen are derived from the Maßnahme geometry. */
export const assertSubsubsectionHasGeometry = (subsubsection: { type: unknown }) => {
  if (subsubsection.type === null) {
    throw new Error("Für Verhandlungsflächen braucht die Maßnahme eine Geometrie.")
  }
}

export const validateAcquisitionAreaInput = async ({
  projectSlug,
  subsubsectionId,
  parcelId,
  acquisitionAreaStatusId,
}: ValidateAcquisitionAreaInput) => {
  const subsubsection = await db.subsubsection.findFirstOrThrow({
    where: {
      id: subsubsectionId,
      subsection: {
        project: {
          slug: projectSlug,
        },
      },
    },
    select: { id: true, type: true },
  })
  assertSubsubsectionHasGeometry(subsubsection)

  await db.parcel.findFirstOrThrow({
    where: { id: parcelId },
    select: { id: true },
  })

  if (acquisitionAreaStatusId) {
    await db.acquisitionAreaStatus.findFirstOrThrow({
      where: {
        id: acquisitionAreaStatusId,
        project: {
          slug: projectSlug,
        },
      },
      select: { id: true },
    })
  }
}
