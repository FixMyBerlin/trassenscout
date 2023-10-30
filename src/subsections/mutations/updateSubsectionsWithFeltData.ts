import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { SubsectionWithPosition } from "../queries/getSubsection"
import { SubsectionSchema } from "../schema"

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
  resolver.authorize("ADMIN"),
  async ({ subsections, projectFeltUrl }) => {
    const auth = `Bearer ${process.env.FELT_TOKEN}`

    const projectFeltUrlId = projectFeltUrl?.replace("https://felt.com/map/", "")
    const url = `https://felt.com/api/v1/maps/${projectFeltUrlId}/elements`

    const updatedSeubsections: SubsectionWithPosition[] = []
    if (!projectFeltUrl) return null // todo

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
      },
    })

    const feltData = await response.json()

    // @ts-ignore // todo
    const feltSubsections = feltData.data.features

    //iterate over ts-subsections
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
            // todo multilinestring problem
            // felt data is a multilinestring, but we need a inestring - so we take the first linestring
            // this only works when we use the line tool in felt, if we use the Route tool, we only save the first part of the geometry here
            geometry: matchingFeltSubsection.geometry["coordinates"][0],
            start: matchingFeltSubsection.properties["ts_pa_start"],
            end: matchingFeltSubsection.properties["ts_pa_end"],
          },
        })
        // @ts-ignore // todo
        updatedSeubsections.push(updatedSubsection)
      }
    })

    return updatedSeubsections as SubsectionWithPosition[] // Tip: Validate type shape with `satisfies`
  },
)
