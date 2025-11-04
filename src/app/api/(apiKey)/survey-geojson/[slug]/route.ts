import db from "@/db"
import { toLineGeometry } from "@/src/app/api/_utils/inferLineGeometryType"
import { getConfigBySurveySlug } from "@/src/app/beteiligung/_shared/utils/getConfigBySurveySlug"
import adler32 from "adler-32"
import type { Feature, LineString, MultiLineString, Point, Position } from "geojson"
import { withApiKey } from "../../_utils/withApiKey"

// READ THIS:
// This API is custom made for BB.
// There is more on how we use this in TILDA at `app/scripts/StaticDatasets/geojson/region-bb/_bb-trassenscout-beteiligung/README.md`
// If we ever use this again, we need to come up with a plan on how to make the API response more stable for different clients.
// Because depending on the usage, we want the `Author` (commented out ATM) … or not (privacy).
// One idea would be, do define an `keys` param with an allowed list of the fields listed below.
// And allow the consumers to specify the list of fields that they need.
// This requires the API response to always be server-to-server, which it has to be anyways due to the `apiKey` param.

const feedbackDefinition = getConfigBySurveySlug("radnetz-brandenburg", "part2")

const categories = Object.fromEntries(
  // @ts-expect-error
  feedbackDefinition.pages[0]?.fields
    // todo survey clean up or refactor after survey BB
    // the category ref is hard coded
    .find((q) => String(q.name) == "22")
    // @ts-expect-error
    .props.options.map((option) => [option.key, option.label]),
)

export const GET = withApiKey(
  async ({ request, params }: { request: Request; params: { slug: string } }) => {
    const { slug } = params
    const searchParams = new URL(request.url).searchParams
    // to not return geojson but debugging data
    const debug = searchParams.has("debug")

    if (slug !== "radnetz-brandenburg") {
      // for any other survey than 'radnetz-brandenburg' this route will not work
      return Response.json({ statusText: "I'm a teapot" }, { status: 417 })
    }

    const survey = await db.survey.findFirst({
      where: { slug },
      include: {
        surveySessions: {
          select: {
            responses: {
              select: {
                id: true,
                data: true,
                surveyPart: true,
                surveySessionId: true,
                status: true,
                surveyResponseTopics: { select: { title: true } },
                note: true,
              },
            },
            createdAt: true,
          },
        },
      },
    })

    if (survey === null) {
      return Response.json({ statusText: "Not Found" }, { status: 404 })
    }

    const results = survey.surveySessions
      .map((session) => {
        return session.responses
          .filter((survey) => survey.surveyPart === 2)
          .map((response) => {
            const rawData: any = JSON.parse(response.data)

            // Some data is stored on part 1 of the survey
            const rawPart1 = session.responses.find(
              (r) => r.surveyPart === 1 && r.surveySessionId === response.surveySessionId,
            )?.data
            const part1: any = rawPart1 ? JSON.parse(rawPart1) : undefined

            // ignore all test entries for this API
            if (part1?.[5] === "FixMyCity") return

            return {
              reponseId: response.id,
              sessionCreatedAt: session.createdAt,
              // Author: `${part1?.[1]} ${part1?.[2]}` as string,
              Institut: part1?.[5] as string,
              Landkreis: part1?.[6] as string,
              lineId: rawData[20] as string, // "165-89"
              lineGeometry: rawData[21]
                ? (JSON.parse(rawData[21]) as
                    | LineString["coordinates"]
                    | MultiLineString["coordinates"])
                : undefined,
              category: categories[rawData[22]],
              location: rawData[24] as null | { lng: number; lat: number },
              text: rawData[25] as string,
              note: response.note,
              status: response.status,
              topics: response.surveyResponseTopics.map((t) => t.title),
            }
          })
          .filter(Boolean)
          .filter((d) => d.lineGeometry !== undefined)
      })
      .flat()

    const features = results
      .map(({ lineGeometry, location, ...result }) => {
        if (lineGeometry === undefined) return

        const features: (Feature<LineString | MultiLineString> | Feature<Point>)[] = [
          {
            type: "Feature",
            geometry: {
              ...toLineGeometry(lineGeometry),
            },
            // Maplibre GL JS requires the feature.id ot be an integer.
            // If not, the hover/select process fails in Atlas.
            // Plan B would be to set source.promoteId which can also be a string.
            // Docs: https://maplibre.org/maplibre-style-spec/expressions/#feature-state
            // The method we use here is the same we use in atlas `transformFile.ts`
            id: new Uint32Array([adler32.str(`line-${result.reponseId}-${result.lineId}`)])[0]!,
            properties: {
              ...result,
              precision: location ? "point" : "line",
              geometryType: "line",
            },
          },
        ]
        // Each feedback is stored on the line geometry, to make it easy to select all at once in Atlas.
        // Point data is added in addition to see the precise location.
        if (location) {
          features.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [location.lng, location.lat] as Position,
            },
            id: new Uint32Array([adler32.str(`point-${result.reponseId}-${result.lineId}`)])[0]!,
            properties: {
              ...result,
              precision: location ? "point" : "line",
              geometryType: "point",
            },
          })
        }
        return features
      })
      .flat()

    if (debug) {
      return Response.json({
        survey,
      })
    } else {
      return Response.json({
        type: "FeatureCollection",
        name: "Survey",
        features,
      })
    }
  },
)
