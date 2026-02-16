import db from "@/db"
import { ProjectSlugRequiredSchema } from "@/src/authorization/extractProjectSlug"
import { geometryTypeValidationRefine } from "@/src/server/shared/utils/geometryTypeValidation"
import { Ctx } from "@blitzjs/next"
import { resolver } from "@blitzjs/rpc"
import { length, lineString } from "@turf/turf"
import { z } from "zod"
import { createLogEntry } from "../../logEntries/create/createLogEntry"
import { FeatureCollectionSchema, SubsectionBaseSchema } from "../schema"
import { multilinestringToLinestring } from "../utils/multilinestringToLinestring"

const updateSubsectionsWithPlacemarkSchema = ProjectSlugRequiredSchema.merge(
  z.object({
    subsections: z.array(
      geometryTypeValidationRefine(
        SubsectionBaseSchema.merge(
          z.object({
            id: z.number(),
          }),
        ),
      ),
    ),
    newGeometry: FeatureCollectionSchema,
  }),
)

export default resolver.pipe(
  resolver.zod(updateSubsectionsWithPlacemarkSchema),
  resolver.authorize("ADMIN"),
  async ({ subsections, newGeometry, projectSlug }, ctx: Ctx) => {
    const updatedSubsectionIds: number[] = []
    const placemarkSubsections = newGeometry.features

    //iterate over ts-subsections
    for (const tsSubsection of subsections) {
      // check in placemark-subsections for matching id
      const matchingPlacemarkSubsection = placemarkSubsections.find(
        (s) => s?.properties.subsectionSlug === tsSubsection.slug,
      )
      const noSubsectionFound = !matchingPlacemarkSubsection ? tsSubsection.slug : null
      console.log("noSubsectionFound for slug: ", noSubsectionFound)
      // if ts-subsection-slug matches one of the placemark-subsection-id, update db subsection geometry
      if (matchingPlacemarkSubsection) {
        // placemark data can be a multilinestring, but we need a linestring
        // so we take the first linestring or we concat the multiple lines (in case last point of line a matches first point of line b)
        const newCoordinates =
          matchingPlacemarkSubsection.geometry.type === "MultiLineString"
            ? // @ts-expect-error
              multilinestringToLinestring(matchingPlacemarkSubsection.geometry.coordinates)
            : matchingPlacemarkSubsection.geometry.type === "LineString"
              ? matchingPlacemarkSubsection.geometry.coordinates
              : // if geometry type of matching placemark subsection is not LineString or MultiLineString, we skip this subsection
                tsSubsection.geometry.coordinates
        const updatedSubsection = await db.subsection.update({
          where: { id: tsSubsection.id },
          data: {
            geometry: { type: "LineString", coordinates: newCoordinates },
            lengthM: newCoordinates
              ? Number(
                  // prettier-ignore
                  (length(lineString(newCoordinates), {
                      units: "kilometers",
                    }) * 1000).toFixed(
                    0,
                  ),
                )
              : 0, // in m
          },
        })

        updatedSubsectionIds.push(updatedSubsection.id)
      }
    }
    if (updatedSubsectionIds.length === 0) {
      console.log("No subsections found for placemark data")
    } else {
      await createLogEntry({
        action: "UPDATE",
        message: `Geometrien von ${updatedSubsectionIds.length} Planungsabschnitte aktualisiert`,
        userId: ctx.session.userId,
        projectSlug,
      })
    }

    return updatedSubsectionIds
  },
)
