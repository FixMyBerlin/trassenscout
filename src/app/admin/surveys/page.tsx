import { invoke } from "@/src/blitz-server"
import { Link } from "@/src/core/components/links"
import { StatusLabel } from "@/src/core/components/Status/StatusLabel"
import { allowedSurveySlugs } from "@/src/survey-public/utils/allowedSurveySlugs"
import getAdminSurveys from "@/src/surveys/queries/getAdminSurveys"
import { Metadata } from "next"
import "server-only"
import { Breadcrumb } from "../_components/Breadcrumb"
import { HeaderWrapper } from "../_components/HeaderWrapper"

export const metadata: Metadata = { title: "Beteiligungen" }

export default async function AdminSurveysPage() {
  const { surveys } = await invoke(getAdminSurveys, {})

  return (
    <>
      <HeaderWrapper>
        <Breadcrumb pages={[{ href: "/admin", name: "Dashboard" }, { name: "Beteiligungen" }]} />
      </HeaderWrapper>

      <ul>
        {surveys.map((survey) => {
          return (
            <li key={survey.id}>
              <div className="flex items-center justify-between">
                <h2>{survey.slug}</h2>
                {allowedSurveySlugs.includes(survey.slug) ? (
                  <StatusLabel label="Ist konfiguriert" colorClass="bg-green-200" />
                ) : (
                  <StatusLabel label="NICHT konfiguriert" colorClass="bg-red-700 text-white" />
                )}
              </div>
              <div className="space-x-3">
                <Link button href={`/admin/surveys/${survey.id}/edit`}>
                  Bearbeiten
                </Link>
                <Link button href={`/admin/surveys/${survey.id}/responses`}>
                  Antworten
                </Link>
              </div>
              <pre>{JSON.stringify(survey, undefined, 2)}</pre>
            </li>
          )
        })}
      </ul>
    </>
  )
}
