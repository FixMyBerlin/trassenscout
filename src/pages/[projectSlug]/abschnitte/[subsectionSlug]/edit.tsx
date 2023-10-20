import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoEditTitleSlug, shortTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import deleteSubsection from "src/subsections/mutations/deleteSubsection"
import updateSubsection from "src/subsections/mutations/updateSubsection"
import getSubsection from "src/subsections/queries/getSubsection"
import { SubsectionSchema } from "src/subsections/schema"

const EditSubsection = () => {
  const router = useRouter()
  const { projectSlug, subsectionSlug } = useSlugs()
  const [subsection, { setQueryData }] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    subsectionSlug: subsectionSlug!,
  })
  const [updateSubsectionMutation] = useMutation(updateSubsection)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation({
        id: subsection.id,
        ...values,
        // The value="" becomes "0" which we translate to NULL
        operatorId: values.operatorId === 0 ? null : values.operatorId,
        managerId: values.managerId === 0 ? null : values.managerId,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          subsectionSlug: updated.slug,
        }),
      )
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["order", "slug"])
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ id: subsection.id })
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
      <MetaTags noindex title={seoEditTitleSlug(subsection.slug)} />
      <PageHeader title={`${shortTitle(subsection.slug)} bearbeiten`} className="mt-12" />

      <SubsectionForm
        edit={true}
        className="mt-10"
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={subsection}
        onSubmit={handleSubmit}
        users={users}
      />

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button>

      <hr className="my-5" />
    </>
  )
}

const EditSubsectionPage: BlitzPage = () => {
  const { projectSlug, subsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            subsectionSlug: subsectionSlug!,
          })}
        >
          Zurück zum Planungsabschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

EditSubsectionPage.authenticate = true

export default EditSubsectionPage
