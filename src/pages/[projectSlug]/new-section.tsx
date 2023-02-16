import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SectionForm } from "src/sections/components/SectionForm"
import createSection from "src/sections/mutations/createSection"
import { SectionSchema } from "src/sections/schema"
import getUsers from "src/users/queries/getUsers"

const NewSectionWithQuery = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const [createSectionMutation] = useMutation(createSection)
  const [{ users }] = useQuery(getUsers, {})

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
      <MetaTags noindex title="Neue Teilstrecke erstellen" />

      <SectionForm
        submitText="Erstellen"
        schema={SectionSchema.omit({ projectSlug: true })}
        // initialValues={}
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
      <PageHeader title="Neue Teilstrecke erstellen" />
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
