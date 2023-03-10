import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { quote } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getSection from "src/sections/queries/getSection"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import createSubsection from "src/subsections/mutations/createSubsection"
import { SubsectionSchema } from "src/subsections/schema"
import getProjectUsers from "src/users/queries/getProjectUsers"

const NewSubsection = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [section] = useQuery(getSection, { sectionSlug, projectSlug })
  const [createSubsectionMutation] = useMutation(createSubsection)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation({ ...values, sectionId: section.id! })
      await router.push(
        Routes.SectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  return (
    <>
      <MetaTags noindex title="Neuen Abschnitt erstellen" />
      <PageHeader
        title="Neuen Abschnitt erstellen"
        subtitle={`In Teilstrecke ${quote(section.title)}`}
      />

      <SubsectionForm
        submitText="Erstellen"
        schema={SubsectionSchema.omit({ sectionId: true })}
        // initialValues={} // Use only when custom initial values are needed
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const NewSubsectionPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsection />
      </Suspense>

      <p>
        <Link
          href={Routes.SectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
          })}
        >
          Zur??ck zur Teilstrecke
        </Link>
      </p>
    </LayoutRs>
  )
}

NewSubsectionPage.authenticate = true

export default NewSubsectionPage
