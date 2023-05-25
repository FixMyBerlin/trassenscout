import { Suspense } from "react"
import { useRouter } from "next/router"
import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"

import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"
import updateSubsubsection from "src/subsubsections/mutations/updateSubsubsection"
import deleteSubsubsection from "src/subsubsections/mutations/deleteSubsubsection"
import { SubsubsectionSchema } from "src/subsubsections/schema"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { seoEditTitleSlug, shortTitle } from "src/core/components/text"

const EditSubsubsection = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    {
      projectSlug: projectSlug!,
      sectionSlug: sectionSlug!,
      subsectionSlug: subsectionSlug!,
      subsubsectionSlug: subsubsectionSlug!,
    },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })
  const [updateSubsubsectionMutation] = useMutation(updateSubsubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation({
        id: subsubsection.id,
        ...values,
      })
      await setQueryData(updated)
      await router.back()
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
          sectionSlug: sectionSlug!,
          subsectionSlug: subsectionSlug!,
        })
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
        schema={SubsubsectionSchema}
        initialValues={subsubsection}
        onSubmit={handleSubmit}
        users={users}
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
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <p>
        <Link
          href={Routes.SubsubsectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
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
