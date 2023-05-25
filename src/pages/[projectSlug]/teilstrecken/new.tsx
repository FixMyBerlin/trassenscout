import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { seoNewTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SectionForm } from "src/sections/components/SectionForm"
import createSection from "src/sections/mutations/createSection"
import { SectionSchema } from "src/sections/schema"
import getProjectUsers from "src/memberships/queries/getProjectUsers"

const NewSectionWithQuery = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [createSectionMutation] = useMutation(createSection)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const section = await createSectionMutation({ ...values, projectSlug: projectSlug! })
      await router.push(
        Routes.SectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: section.slug,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <SectionForm
        submitText="Erstellen"
        schema={SectionSchema}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const NewSectionPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <MetaTags noindex title={seoNewTitle("Teilstrecke")} />
      <PageHeader title="Teilstrecke hinzufügen" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <NewSectionWithQuery />
      </Suspense>

      <p>
        <Link href={Routes.ProjectDashboardPage({ projectSlug: projectSlug! })}>Zum Projekt</Link>
      </p>
    </LayoutRs>
  )
}

NewSectionPage.authenticate = true

export default NewSectionPage
