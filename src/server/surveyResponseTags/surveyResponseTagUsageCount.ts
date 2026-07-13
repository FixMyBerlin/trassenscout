import db from "@/src/server/db.server"

export async function getSurveyResponseTagUsageCount(projectSlug: string, tagId: number) {
  return db.surveyResponse.count({
    where: {
      surveyResponseTags: { some: { id: tagId } },
      surveySession: { survey: { project: { slug: projectSlug } } },
    },
  })
}
