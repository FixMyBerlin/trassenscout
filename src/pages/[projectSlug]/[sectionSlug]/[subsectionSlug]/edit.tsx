import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { PageHeader } from "src/core/components/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsectionForm } from "src/subsections/components/SubsectionForm"
import deleteSubsection from "src/subsections/mutations/deleteSubsection"
import updateSubsection from "src/subsections/mutations/updateSubsection"
import getSubsection from "src/subsections/queries/getSubsection"
import { SubsectionSchema } from "src/subsections/schema"
import getProjectUsers from "src/users/queries/getProjectUsers"

const EditSubsection = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const [subsection, { setQueryData }] = useQuery(
    getSubsection,
    { slug: subsectionSlug },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
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

  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsection.id} unwiderruflich l??schen?`)) {
      await deleteSubsectionMutation({ id: subsection.id })
      await router.push(
        Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={`Abschnitt ${subsection.title} bearbeiten`} />

      <PageHeader title={`Abschnitt ${subsection.title}`} subtitle="Abschnitt bearbeiten" />

      <SuperAdminBox>
        <pre>{JSON.stringify(subsection, null, 2)}</pre>
      </SuperAdminBox>

      <SubsectionForm
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={subsection}
        onSubmit={handleSubmit}
        users={users}
      />

      <hr />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        L??schen
      </button>
    </>
  )
}

const EditSubsectionPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

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
          Zur??ck zur Teilstrecke
        </Link>
      </p>
    </LayoutRs>
  )
}

EditSubsectionPage.authenticate = true

export default EditSubsectionPage
