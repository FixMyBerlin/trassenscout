import { resolver } from "@blitzjs/rpc"
import { authorizeProjectAdmin } from "src/authorization"
import { z } from "zod"
import { SubsectionSchema } from "../schema"
import getSubsectionProjectId from "../queries/getSubsectionProjectId"
import db from "db"
import { SubsectionWithPosition } from "../queries/getSubsection"

const UpdateSubsectionsWithFeltDataSchema = z.object({
  subsections: z.array(
    SubsectionSchema.merge(
      z.object({
        id: z.number(),
      }),
    ),
  ),
  projectFeltUrl: z.string().url({ message: "Ungültige Url." }).nullish(),
})

export default resolver.pipe(
  resolver.zod(UpdateSubsectionsWithFeltDataSchema),
  authorizeProjectAdmin(getSubsectionProjectId), // todo authorization pages/db
  async ({ subsections, projectFeltUrl }) => {
    const updatedSeubsections: SubsectionWithPosition[] = []
    if (!projectFeltUrl) return null // todo
    await fetch(projectFeltUrl)
      .then((res) => res.json())
      .then((feltData) => {
        // @ts-ignore // todo
        const feltSubsections = feltData.features
        // iterate over ts-subsections
        subsections.forEach(async (tsSubsection) => {
          // check in felt-subsections for matching id
          const matchingFeltSubsection = feltSubsections.find(
            // @ts-ignore // todo
            (s) => s.properties["ts_pa_id"] === tsSubsection.slug,
          )
          // if ts-subsection-slug matches one of the felt-subsection-id, update db subsection, fields: start, end, geometry
          if (matchingFeltSubsection) {
            const updatedSubsection = await db.subsection.update({
              where: { id: tsSubsection.id },
              data: {
                geometry: matchingFeltSubsection.geometry["coordinates"][0],
                start: matchingFeltSubsection.properties["ts_pa_start"],
                end: matchingFeltSubsection.properties["ts_pa_end"],
              },
            })
            // @ts-ignore // todo
            updatedSeubsections.push(updatedSubsection)
          }
        })
      })

    return updatedSeubsections as SubsectionWithPosition[] // Tip: Validate type shape with `satisfies`
  },
)
