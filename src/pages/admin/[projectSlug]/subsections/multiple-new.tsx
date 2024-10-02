import { SuperAdminBox } from "@/src/core/components/AdminBox"
import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import getProject from "@/src/server/projects/queries/getProject"
import { FORM_ERROR, SubsectionsForm } from "@/src/subsections/components/SubsectionsForm"
import createSubsections from "@/src/subsections/mutations/createSubsections"
import getSubsectionMaxOrder from "@/src/subsections/queries/getSubsectionMaxOrder"
import { SubsectionsFormSchema } from "@/src/subsections/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { Subsection } from "@prisma/client"
import { length, lineString } from "@turf/turf"
import { useRouter } from "next/router"
import { Suspense } from "react"

export const defaultGeometryForMultipleSubsectionForm = [
  [5.98865807458, 47.3024876979],
  [15.0169958839, 54.983104153],
] satisfies [[number, number], [number, number]]

const AdminNewSubsections = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [createSubsectionsMutation] = useMutation(createSubsections)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    const maxOrderSubsections = (await getSubsectionMaxOrder(project.id)) || 0
    const newSubsections: Array<
      { geometry: [number, number][] } & Pick<
        Subsection,
        "projectId" | "labelPos" | "start" | "end" | "slug" | "order" | "lengthKm"
      >
    > = []
    for (let i = 0; i < Number(values.no); i++) {
      newSubsections.push({
        projectId: project.id,
        labelPos: "bottom",
        start: "unbekannt",
        end: "unbekannt",
        slug: `pa${values.prefix}.${maxOrderSubsections + i + 1}`,
        order: maxOrderSubsections + i + 1,
        geometry: defaultGeometryForMultipleSubsectionForm,
        lengthKm: length(lineString(defaultGeometryForMultipleSubsectionForm)),
      })
    }
    try {
      await createSubsectionsMutation({
        projectSlug,
        subsections: newSubsections,
      })
      await router.push(
        Routes.AdminSubsectionsPage({
          projectSlug,
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
          submitText="Erstellen"
          schema={SubsectionsFormSchema}
          onSubmit={handleSubmit}
        />
      </SuperAdminBox>
    </>
  )
}

const AdminNewSubsectionsPage: BlitzPage = () => {
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <AdminNewSubsections />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.ProjectDashboardPage({
            projectSlug,
          })}
        >
          Zurück Übersicht
        </Link>
      </p>
    </LayoutRs>
  )
}

AdminNewSubsectionsPage.authenticate = { role: "ADMIN" }

export default AdminNewSubsectionsPage
