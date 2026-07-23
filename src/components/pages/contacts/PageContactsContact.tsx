import { useSuspenseQuery } from "@tanstack/react-query"
import { getRouteApi } from "@tanstack/react-router"
import { ContactDeleteActionBar } from "@/src/components/contacts/ContactDeleteActionBar"
import { ContactSingle } from "@/src/components/contacts/ContactSingle"
import { SuperAdminBox } from "@/src/components/core/components/AdminBox/SuperAdminBox"
import { ActionBar } from "@/src/components/core/components/forms/ActionBar"
import { BackLink } from "@/src/components/core/components/forms/BackLink"
import { BackLinkSection } from "@/src/components/core/components/forms/BackLinkSection"
import { Link } from "@/src/components/core/components/links/Link"
import { pageContentPaddingClassName } from "@/src/components/core/components/PageHeader/pageContentPadding"
import { PageHeader } from "@/src/components/core/components/PageHeader/PageHeader"
import { getFullname } from "@/src/components/core/users/getFullname"
import { ProjectPageBreadcrumb } from "@/src/components/projects/ProjectPageBreadcrumb"
import { IfUserCanEdit } from "@/src/components/shared/app/memberships/IfUserCan"
import { contactQueryOptions } from "@/src/server/contacts/contactQueryOptions"

const routeApi = getRouteApi("/_loggedInProjects/$projectSlug/contacts/$contactId/")

export function PageContactsContact() {
  const { projectSlug, contactId } = routeApi.useParams()
  const { data: contact } = useSuspenseQuery(
    contactQueryOptions({ projectSlug, id: Number(contactId) }),
  )

  return (
    <>
      <PageHeader
        breadcrumb={
          <ProjectPageBreadcrumb
            section="Externe Kontakte"
            sectionTo="/$projectSlug/contacts"
            current={`Kontakt von ${getFullname(contact)}`}
          />
        }
      />
      <IfUserCanEdit>
        <ActionBar
          className="mb-10"
          left={
            <Link to={`/${projectSlug}/contacts/${contactId}/edit`} button>
              Eintrag bearbeiten
            </Link>
          }
          right={
            <ContactDeleteActionBar
              contactId={contact.id}
              projectSlug={projectSlug}
              contactTitle={getFullname(contact) || "Kontakt"}
              returnPath={`/${projectSlug}/contacts`}
            />
          }
        />
      </IfUserCanEdit>
      <div className={pageContentPaddingClassName}>
        <ContactSingle contact={contact} />
        <SuperAdminBox>
          <pre>{JSON.stringify(contact, null, 2)}</pre>
        </SuperAdminBox>
      </div>
      <BackLinkSection>
        <BackLink to={`/${projectSlug}/contacts`} text="Zurück zur Kontaktliste" />
      </BackLinkSection>
    </>
  )
}
