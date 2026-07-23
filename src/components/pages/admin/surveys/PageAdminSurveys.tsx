import { useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { AdminBadge } from "@/src/components/admin/AdminBadge"
import { adminTableEditButtonClassName } from "@/src/components/admin/adminListClasses"
import { AdminPageHeader } from "@/src/components/admin/AdminPageHeader"
import { adminHeaderActionButtonClassName } from "@/src/components/admin/HeaderWrapper"
import { AllowedSurveySlugsSchema } from "@/src/components/beteiligung/shared/utils/allowedSurveySlugs"
import { Link as CoreLink } from "@/src/components/core/components/links/Link"
import { adminSurveysQueryOptions } from "@/src/server/surveys/surveysQueryOptions"

export function PageAdminSurveys() {
  const { data: surveys } = useSuspenseQuery(adminSurveysQueryOptions())

  return (
    <>
      <AdminPageHeader
        title="Beteiligungen (alle)"
        action={
          <CoreLink
            to="/admin/surveys/new"
            button
            icon="plus"
            className={adminHeaderActionButtonClassName}
          >
            Neue Beteiligung
          </CoreLink>
        }
      />
      <p className="mb-6 text-gray-600">
        Hier verwalten Sie alle Beteiligungen (Umfragen) projektübergreifend: Sie können neue
        Beteiligungen anlegen, bestehende bearbeiten sowie deren Antworten, Testeinträge und
        nicht-abgeschickte Einträge einsehen.
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
                to="/admin/surveys/$surveyId/edit"
                params={{ surveyId: String(survey.id) }}
              >
                Bearbeiten
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/surveys/$surveyId/responses"
                params={{ surveyId: String(survey.id) }}
              >
                Antworten
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/surveys/$surveyId/responses/test"
                params={{ surveyId: String(survey.id) }}
              >
                Testeinträge prüfen und löschen
              </Link>
              <Link
                className={adminTableEditButtonClassName}
                to="/admin/surveys/$surveyId/responses/created"
                params={{ surveyId: String(survey.id) }}
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
