import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi, Link } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { adminTableEditButtonClassName } from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { shortTitle } from "@/src/components/core/components/text/titles"
import { adminSurveysByProjectQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

const routeApi = getRouteApi("/admin/projects/$projectSlug/surveys/")

export function PageAdminSurveys() {
  const { projectSlug } = routeApi.useParams()
  const { data: surveys } = useSuspenseQuery(adminSurveysByProjectQueryOptions(projectSlug))

  return (
    <>
      <AdminPageHeader
        title={`Beteiligungen: ${shortTitle(projectSlug)}`}
        action={
          <CoreLink
            to="/admin/projects/$projectSlug/surveys/new"
            params={{ projectSlug }}
            button
            icon="plus"
            className={adminHeaderActionButtonClassName}
          >
            Neue Beteiligung
          </CoreLink>
        }
      />
      <p className="mb-6 text-gray-600">
        Beteiligungen (Umfragen) für dieses Projekt verwalten: anlegen, bearbeiten sowie Antworten,
        Testeinträge und nicht-abgeschickte Einträge einsehen.
      </p>
      <ul className="list-none space-y-8 pl-0">
        {surveys.map((survey) => (
          <li key={survey.id}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{survey.slug}</h2>
              {AllowedSurveySlugsSchema.safeParse(survey).success ? (
                <AdminBadge variant="green">Ist konfiguriert</AdminBadge>
              ) : (
                <AdminBadge variant="red">NICHT konfiguriert</AdminBadge>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/projects/$projectSlug/surveys/$surveyId/edit"
                params={{ projectSlug, surveyId: String(survey.id) }}
              >
                Bearbeiten
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/projects/$projectSlug/surveys/$surveyId/responses"
                params={{ projectSlug, surveyId: String(survey.id) }}
              >
                Antworten
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/projects/$projectSlug/surveys/$surveyId/responses/test"
                params={{ projectSlug, surveyId: String(survey.id) }}
              >
                Testeinträge prüfen und löschen
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/projects/$projectSlug/surveys/$surveyId/responses/created"
                params={{ projectSlug, surveyId: String(survey.id) }}
              >
                Nicht-abgeschickte Einträge
              </Link>
            </div>
            <pre className="mt-4 text-sm">{JSON.stringify(survey, undefined, 2)}</pre>
          </li>
        ))}
      </ul>
    </>
  )
}
