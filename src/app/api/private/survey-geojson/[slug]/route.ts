import db from "@/db"
import { feedbackDefinition } from "@/src/survey-public/radnetz-brandenburg/data/feedback"
import { Feature, LineString, Point, Position } from "@turf/helpers"
import adler32 from "adler-32"

const categories = Object.fromEntries(
  // todo survey clean up after survey BB: remove or find generic way to do this
  // @ts-expect-error
  feedbackDefinition.pages[0]?.questions
    .find((q) => q.id == 22)
    // @ts-expect-error
    .props.responses.map((response) => [response.id, response.text.de]),
)

export async function GET(request: Request, { params }: { params: { slug: string } }) {
  const apiKey = new URL(request.url).searchParams.get("apiKey")
  if (apiKey !== process.env.TS_API_KEY) {
    return Response.json({ statusText: "Unauthorized" }, { status: 401 })
  }

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
      SurveySession: {
        select: {
          responses: {
            select: {
              id: true,
              data: true,
              surveyPart: true,
              surveySessionId: true,
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

  const results = survey.SurveySession.map((session) => {
    return session.responses
      .filter((survey) => survey.surveyPart === 2)
      .map((response) => {
        const rawData: any = JSON.parse(response.data)

        // Some data is stored on part 1 of the survey
        const rawPart1 = session.responses.find(
          (r) => r.surveyPart === 1 && r.surveySessionId === response.surveySessionId,
        )?.data
        const part1: any = rawPart1 ? JSON.parse(rawPart1) : undefined

        // todo survey clean up after survey BB: remove BB specific fields
        return {
          reponseId: response.id,
          sessionCreatedAt: session.createdAt,
          Author: `${part1?.[1]} ${part1?.[2]}` as string,
          Institut: part1?.[5] as string,
          Landkreis: part1?.[6] as string,
          lineId: rawData[20] as string, // "165-89"
          lineGeometry: rawData[21]
            ? (JSON.parse(rawData[21]) as LineString["coordinates"])
            : undefined,
          category: categories[rawData[22]],
          location: rawData[24] as null | { lng: number; lat: number },
          text: rawData[25] as string,
        }
      })
      .filter((d) => d.lineGeometry !== undefined)
  }).flat()

  // return Response.json({ results: results.filter((r) => r.reponseId === 1109) })

  const features = results
    .map(({ lineGeometry, location, ...result }) => {
      if (lineGeometry === undefined) return

      const features: (Feature<LineString> | Feature<Point>)[] = [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: lineGeometry,
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
}
