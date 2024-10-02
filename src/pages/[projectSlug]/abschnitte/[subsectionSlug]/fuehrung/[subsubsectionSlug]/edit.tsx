import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import {
  FORM_ERROR,
  SubsubsectionForm,
} from "@/src/pagesComponents/subsubsections/SubsubsectionForm"
import { M2MFieldsType, m2mFields } from "@/src/server/subsubsections/m2mFields"
import deleteSubsubsection from "@/src/server/subsubsections/mutations/deleteSubsubsection"
import updateSubsubsection from "@/src/server/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "@/src/server/subsubsections/queries/getSubsubsection"
import { SubsubsectionFormSchema } from "@/src/server/subsubsections/schema"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsubsection = () => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    {
      projectSlug,
      subsectionSlug: subsectionSlug!,
      subsubsectionSlug: subsubsectionSlug!,
    },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionMutation] = useMutation(updateSubsubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation({
        ...values,
        id: subsubsection.id,
        projectSlug,
        trafficLoadDate: values.trafficLoadDate === "" ? null : new Date(values.trafficLoadDate),
        estimatedCompletionDate:
          values.estimatedCompletionDate === "" ? null : new Date(values.estimatedCompletionDate),
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsubsectionDashboardPage({
          projectSlug,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: updated.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsubsection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ projectSlug, id: subsubsection.id })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug,
          subsectionSlug: subsectionSlug!,
        }),
      )
    }
  }

  const m2mFieldsInitialValues: Record<M2MFieldsType | string, string[]> = {}
  m2mFields.forEach((fieldName) => {
    if (fieldName in subsubsection) {
      m2mFieldsInitialValues[fieldName] = Array.from(
        // @ts-expect-error
        subsubsection[fieldName].values(),
        // @ts-expect-error
        (obj) => String(obj.id),
      )
    }
  })

  return (
    <>
      <MetaTags noindex title={seoEditTitleSlug(subsubsection.slug)} />
      <PageHeader title="Führung bearbeiten" className="mt-12" />

      <SubsubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsubsectionFormSchema}
        // @ts-expect-error some null<>undefined missmatch
        initialValues={{
          ...subsubsection,
          ...m2mFieldsInitialValues,
          trafficLoadDate: subsubsection.trafficLoadDate
            ? getDate(subsubsection.trafficLoadDate)
            : "",
          estimatedCompletionDate: subsubsection.estimatedCompletionDate
            ? getDate(subsubsection.estimatedCompletionDate)
            : "",
        }}
        onSubmit={handleSubmit}
      />

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <SuperAdminLogData data={subsubsection} />
    </>
  )
}

const EditSubsubsectionPage = () => {
  const subsectionSlug = useSlug("subsectionSlug")
  const subsubsectionSlug = useSlug("subsubsectionSlug")
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.SubsubsectionDashboardPage({
            projectSlug,
            subsectionSlug: subsectionSlug!,
            subsubsectionSlug: subsubsectionSlug!,
          })}
        >
          Zurück zur Führung
        </Link>
      </p>
    </LayoutRs>
  )
}

EditSubsubsectionPage.authenticate = true

export default EditSubsubsectionPage
