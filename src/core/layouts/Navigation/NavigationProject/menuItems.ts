import { Routes } from "@blitzjs/next"

type Props = {
  projectSlug: string
  projectName: string | null
}

export const menuItems = ({ projectSlug, projectName }: Props) => {
  return [
    {
      name: `Dashboard ${projectName || ""}`,
      href: Routes.ProjectDashboardPage({ projectSlug: projectSlug! }),
    },
    {
      name: "Kontakte",
      href: Routes.ContactsPage({ projectSlug: projectSlug! }),
      alsoHighlightPathnames: [
        Routes.ProjectTeamPage({ projectSlug: projectSlug! }).pathname,
        Routes.ProjectTeamInvitesPage({ projectSlug: projectSlug! }).pathname,
      ],
    },
    { name: "Termine", href: Routes.CalendarEntriesPage({ projectSlug: projectSlug! }) },
    { name: "Dokumente", href: Routes.UploadsPage({ projectSlug: projectSlug! }) },
    {
      name: "Beteiligung",
      href: Routes.SurveysPage({ projectSlug: projectSlug! }),
      alsoHighlightPathnames: [
        // Any survey page gets highlighted
        Routes.SurveyPage({ projectSlug: projectSlug!, surveyId: 999 }).pathname,
        Routes.SurveyResponsePage({ projectSlug: projectSlug!, surveyId: 999 }).pathname,
        Routes.SurveyResponseWithLocationPage({
          projectSlug: projectSlug!,
          surveyId: 999,
          surveyResponseId: 9999,
        }).pathname,
      ],
    },
  ]
}
