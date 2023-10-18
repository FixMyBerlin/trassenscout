import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getProject from "src/projects/queries/getProject"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import createSubsection from "src/subsections/mutations/createSubsection"
import { SubsectionSchema } from "src/subsections/schema"

const AdminNewSubsection = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [createSubsectionMutation] = useMutation(createSubsection)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const subsection = await createSubsectionMutation({
        ...values,
        // The value="" becomes "0" which we translate to NULL
        managerId: values.managerId === 0 ? null : values.managerId,
        operatorId: values.operatorId === 0 ? null : values.operatorId,
        projectId: project.id!,
      })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsection.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Planungsabschnitt")} />
      <PageHeader title="Planungsabschitt hinzufügen" className="mt-12" />

      <SubsectionForm
        initialValues={{ labelPos: "bottom" }}
        submitText="Erstellen"
        schema={SubsectionSchema.omit({ projectId: true })}
        onSubmit={handleSubmit}
        users={users}
      />
    </>
  )
}

const AdminNewSubsectionPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <AdminNewSubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.ProjectDashboardPage({
            projectSlug: projectSlug!,
          })}
        >
          Zurück Übersicht
        </Link>
      </p>
    </LayoutRs>
  )
}

AdminNewSubsectionPage.authenticate = true

export default AdminNewSubsectionPage
