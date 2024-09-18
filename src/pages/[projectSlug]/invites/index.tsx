import { statusTranslations, TeamInvitesTable } from "@/src/contacts/components/TeamInvitesTable"
import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { Tabs } from "@/src/core/components/Tabs/Tabs"
import { Link } from "@/src/core/components/links"
import { ButtonWrapper } from "@/src/core/components/links/ButtonWrapper"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { quote } from "@/src/core/components/text"
import { useSlugs } from "@/src/core/hooks"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { BlitzPage, Routes } from "@blitzjs/next"
import { InformationCircleIcon } from "@heroicons/react/24/outline"
import { Suspense } from "react"

export const TeamInvitesWithQuery = () => {
  const { projectSlug } = useSlugs()

  return (
    <>
      <Tabs
        className="mt-7"
        tabs={[
          { name: "Externe Kontakte", href: Routes.ContactsPage({ projectSlug: projectSlug! }) },
          { name: "Projektteam", href: Routes.ProjectTeamPage({ projectSlug: projectSlug! }) },
        ]}
      />

      <TeamInvitesTable />

      <ButtonWrapper className="mt-6">
        <Link
          button="blue"
          icon="plus"
          href={Routes.NewProjectTeamInvitePage({ projectSlug: projectSlug! })}
        >
          Mitwirkende einladen
        </Link>
      </ButtonWrapper>

      <div className="items-top prose my-10 flex gap-3">
        <InformationCircleIcon className="size-11 flex-none text-blue-500" />
        <div>
          <h2 className="mt-1.5">So funktioniert der Einladungs-Prozess</h2>
          <ul>
            <li>Jeder mit Editor-Rechten kann Nutzer:innen einladen.</li>
            <li>
              Mit der Einladung werden die E-Mail-Adresse, die zukünftige Rolle sowie die Person,
              die einlädt, gespeichert. Alle erfahren, wer eingeladen hat.
            </li>
            <li>
              Wenn eine neue Einladung erzeugt wird, bekommen alle Mitarbeiter dieses Projekts, die
              Editor-Rechte haben, eine Hinweis-E-Mail dazu.
            </li>
            <li>
              Die eingeladene Person bekommt eine E-Mail mit einem speziellen Link. Über diesen Link
              kann sie sich registrieren oder anmelden. Dabei kann die E-Mail-Adresse nicht mehr
              geändert werden, da sie fest mit der Einladung verbunden ist.
            </li>
            <li>
              Wenn eine Einladung angenommen wurde, bekommen alle Mitarbeiter dieses Projekts, die
              Editor-Rechte haben, eine Hinweis-E-Mail dazu.
            </li>
            <li>
              Nach 5 Tagen werden die Einladungen ungültig und erhalten den Status{" "}
              {quote(statusTranslations.EXPIRED)}.
            </li>
            <li>Nach 30 Tagen werden Einladungen aus der Liste gelöscht.</li>
          </ul>
        </div>
      </div>

      <SuperAdminBox>
        <Link button="blue" href={Routes.AdminMembershipsPage()}>
          Rechte verwalten
        </Link>
      </SuperAdminBox>
    </>
  )
}

const ProjectTeamInvitesPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title="Einladungen" />
      <PageHeader
        title="Einladungen"
        description="Übersich der Einladungen zur Mitarbeit im Projekt."
        className="mt-12"
      />

      <Suspense fallback={<Spinner page />}>
        <TeamInvitesWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

ProjectTeamInvitesPage.authenticate = true

export default ProjectTeamInvitesPage
