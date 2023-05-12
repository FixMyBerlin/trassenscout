import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import deleteSubsection from "src/subsections/mutations/deleteSubsection"
import updateSubsection from "src/subsections/mutations/updateSubsection"
import getSubsection from "src/subsections/queries/getSubsection"
import { SubsectionSchema } from "src/subsections/schema"
import getProjectUsers from "src/users/queries/getProjectUsers"

const EditSubsection = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()
  const [subsection, { setQueryData }] = useQuery(getSubsection, {
    projectSlug: projectSlug!,
    sectionSlug: sectionSlug!,
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
      })
      await setQueryData(updated)
      await router.back()
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ id: subsection.id })
      await router.push(
        Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={`Abschnitt ${subsection.title} bearbeiten`} />
      <PageHeader title="Abschnitt bearbeiten" subtitle={subsection.title} />

      <SubsectionForm
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
  const { projectSlug, sectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsection />
      </Suspense>

      <p>
        <Link
          href={Routes.SectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
          })}
        >
          Zurück zur Teilstrecke
        </Link>
      </p>
    </LayoutRs>
  )
}

EditSubsectionPage.authenticate = true

export default EditSubsectionPage
