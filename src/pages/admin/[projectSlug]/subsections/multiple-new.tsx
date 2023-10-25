import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Subsection } from "@prisma/client"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getProject from "src/projects/queries/getProject"
import { FORM_ERROR } from "src/subsections/components/SubsectionForm"
import { SubsectionsForm } from "src/subsections/components/SubsectionsForm"
import createSubsections from "src/subsections/mutations/createSubsections"
import getSubsectionMaxOrder from "src/subsections/queries/getSubsectionMaxOrder"
import { SubsectionSchema, SubsectionsFormSchema, SubsectionsSchema } from "src/subsections/schema"

const AdminNewSubsections = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [project] = useQuery(getProject, { slug: projectSlug! })
  const [createSubsectionsMutation] = useMutation(createSubsections)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const maxOrderSubsections = (await getSubsectionMaxOrder(project.id)) || 0
    const newSubsections: Array<
      { geometry: [number, number][] } & Pick<
        Subsection,
        "projectId" | "labelPos" | "start" | "end" | "slug" | "order"
      >
    > = []
    for (let i = 0; i < Number(values.no); i++) {
      newSubsections.push({
        projectId: project.id,
        labelPos: "bottom",
        start: "unbekannt",
        end: "unbekannt",
        slug: `${values.prefix}-${maxOrderSubsections + i + 1}`,
        order: maxOrderSubsections + i + 1,
        geometry: [
          [5.98865807458, 47.3024876979],
          [15.0169958839, 54.983104153],
        ],
      })
    }

    try {
      const subsections = await createSubsectionsMutation(newSubsections)
      await router.push(
        Routes.AdminSubsectionsPage({
          projectSlug: projectSlug!,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Planungsabschnitt")} />
      <PageHeader title="Planungsabschnitte im Bulk-Mode hinzufügen" className="mt-12" />
      <SuperAdminBox>
        <SubsectionsForm
          initialValues={{ prefix: `${project.slug}-pa` }}
          submitText="Erstellen"
          schema={SubsectionsFormSchema}
          onSubmit={handleSubmit}
        />
      </SuperAdminBox>
    </>
  )
}

const AdminNewSubsectionsPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <AdminNewSubsections />
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

AdminNewSubsectionsPage.authenticate = true

export default AdminNewSubsectionsPage
