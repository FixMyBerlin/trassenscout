import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoIndexTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { TeamInviteForm } from "@/src/pagesComponents/invites/TeamInviteForm"
import createInvite from "@/src/server/invites/mutations/createInvite"
import { InviteSchema } from "@/src/server/invites/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const TeamInviteWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createInviteMutation] = useMutation(createInvite)

  type HandleSubmit = z.infer<typeof InviteSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createInviteMutation({ ...values, projectSlug })
      await router.push(Routes.ProjectTeamInvitesPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <TeamInviteForm submitText="Einladen" schema={InviteSchema} onSubmit={handleSubmit} />
    </>
  )
}

const NewProjectTeamInvitePage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <MetaTags noindex title={seoIndexTitle("Teammitglied einladen")} />
      <PageHeader title="Neues Teammitglied einladen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <TeamInviteWithQuery />
      </Suspense>

      <p className="mt-5">
        <Link href={Routes.ProjectTeamInvitesPage({ projectSlug })}>
          Zurück zur Liste der Einladungen
        </Link>
      </p>
    </LayoutRs>
  )
}

NewProjectTeamInvitePage.authenticate = true

export default NewProjectTeamInvitePage
