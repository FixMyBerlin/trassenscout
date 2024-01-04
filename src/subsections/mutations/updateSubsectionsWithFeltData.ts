import { resolver } from "@blitzjs/rpc"
import db from "db"
import { z } from "zod"
import { multilinestringToLinestring } from "../components/utils/multilinestringToLinestring"
import { FeltApiResponseSchema, SubsectionSchema } from "../schema"
import { length, lineString } from "@turf/turf"

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

    const updatedSeubsectionIds: number[] = []
    if (!projectFeltUrl) return null // todo

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: auth,
      },
    })

    const feltDataRaw = await response.json()

    const feltData = FeltApiResponseSchema.parse(feltDataRaw)

    const feltSubsections = feltData.data.features

    //iterate over ts-subsections
    for (const tsSubsection of subsections) {
      // check in felt-subsections for matching id
      const matchingFeltSubsection = feltSubsections.find(
        (s) => s?.properties["ts_pa_id"] === tsSubsection.slug,
      )
      // if ts-subsection-slug matches one of the felt-subsection-id, update db subsection, fields: start, end, geometry
      if (matchingFeltSubsection && matchingFeltSubsection.geometry.type === "MultiLineString") {
        const updatedSubsection = await db.subsection.update({
          where: { id: tsSubsection.id },
          data: {
            // Felt data is a multilinestring, but we need a linestring
            // in Felt we get multiple lines, if we use the Route tool
            // so we take the first linestring or we concat the multiple lines (in case last point of line a matches first point of line b)
            geometry: matchingFeltSubsection.geometry
              ? multilinestringToLinestring(matchingFeltSubsection?.geometry["coordinates"])
              : tsSubsection.geometry,

            start: matchingFeltSubsection.properties
              ? matchingFeltSubsection.properties["ts_pa_start"]
              : tsSubsection.start,

            end: matchingFeltSubsection.properties
              ? matchingFeltSubsection.properties["ts_pa_end"]
              : tsSubsection.end,
            lengthKm: length(
              lineString(
                // @ts-expect-error
                matchingFeltSubsection.geometry
                  ? multilinestringToLinestring(matchingFeltSubsection?.geometry["coordinates"])
                  : tsSubsection.geometry,
              ),
            ),
          },
        })

        updatedSeubsectionIds.push(updatedSubsection.id)
      }
    }

    return updatedSeubsectionIds
  },
)
