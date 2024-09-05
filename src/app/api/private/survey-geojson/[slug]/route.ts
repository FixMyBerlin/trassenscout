import db from "db"
import { feedbackDefinition } from "src/survey-public/radnetz-brandenburg/data/feedback"

const categories = Object.fromEntries(
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
  // for debugging - simplify lines to make output more readable
  const simplify = searchParams.has("simplify")

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
            where: { surveyPart: 2 },
            select: {
              id: true,
              data: true,
            },
          },
        },
      },
    },
  })

  if (survey === null) {
    return Response.json({ statusText: "Not Found" }, { status: 404 })
  }

  survey.SurveySession.forEach((session) => {
    session.responses.forEach((response) => {
      // @ts-expect-error
      // prettier-ignore
      const { 20: lineId, 21: lineGeometry, 22: categoryId, 24: location, 25: text } = JSON.parse(response.data)
      const data = {
        lineId,
        lineGeometry,
        category: categories[categoryId],
        location,
        text,
      }
      if (data.lineGeometry) {
        data.lineGeometry = JSON.parse(data.lineGeometry)
        if (simplify) {
          data.lineGeometry = [data.lineGeometry[0], data.lineGeometry.slice(-1)[0]]
        }
      }
      response.data = data as any
    })
    // @ts-expect-error
    session.responses = session.responses.filter((response) => !!response.data.lineGeometry)
  })

  const features = survey.SurveySession.map((session) =>
    // @ts-expect-error
    session.responses.map((response) => ({ reponseId: response.id, ...response.data })),
  )
    .flat()
    .map((data: any) => {
      const { reponseId, lineId, lineGeometry, category, location, text } = data
      const features = [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: lineGeometry,
          },
          id: `line-${reponseId}-${lineId}`,
          properties: {
            id: reponseId,
            Thema: category,
            Hinweis: text,
            geometryType: "line",
            geometryLineId: lineId,
          },
        },
      ]
      if (location) {
        features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [location.lng, location.lat],
          },
          id: `point-${reponseId}-${lineId}`,
          properties: {
            id: reponseId,
            Thema: category,
            Hinweis: text,
            geometryType: "point",
            geometryLineId: lineId,
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
