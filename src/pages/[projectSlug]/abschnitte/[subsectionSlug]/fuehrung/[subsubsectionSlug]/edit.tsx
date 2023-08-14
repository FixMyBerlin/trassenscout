import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "src/core/components/Spinner"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoEditTitleSlug } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import deleteSubsubsection from "src/subsubsections/mutations/deleteSubsubsection"
import updateSubsubsection from "src/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"
import { SubsubsectionSchemaForm } from "src/subsubsections/schema"

const EditSubsubsection = () => {
  const router = useRouter()
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    {
      projectSlug: projectSlug!,
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
        id: subsubsection.id,
        ...values,
        // The value="" becomes "0" which we translate to NULL
        managerId: values.managerId === 0 ? null : values.managerId,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
          subsubsectionSlug: updated.slug,
        }),
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsubsection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ id: subsubsection.id })
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: subsectionSlug!,
        }),
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={seoEditTitleSlug(subsubsection.slug)} />
      <PageHeader title="Führung bearbeiten" className="mt-12" />

      <SubsubsectionForm
        className="mt-10"
        submitText="Speichern"
        initialValues={subsubsection}
        schema={SubsubsectionSchemaForm}
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
  const { projectSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.SubsubsectionDashboardPage({
            projectSlug: projectSlug!,
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
