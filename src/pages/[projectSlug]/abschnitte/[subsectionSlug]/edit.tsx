import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitleSlug, shortTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { useSlug } from "@/src/core/routes/usePagesDirectorySlug"
import { SubsectionForm } from "@/src/pagesComponents/subsections/SubsectionForm"
import getProject from "@/src/server/projects/queries/getProject"
import deleteSubsection from "@/src/server/subsections/mutations/deleteSubsection"
import updateSubsection from "@/src/server/subsections/mutations/updateSubsection"
import getSubsection from "@/src/server/subsections/queries/getSubsection"
import { SubsectionSchema } from "@/src/server/subsections/schema"
import { BlitzPage, Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { clsx } from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"

const EditSubsection = () => {
  const router = useRouter()
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()
  const [project] = useQuery(getProject, { projectSlug })
  const [subsection, { setQueryData }] = useQuery(getSubsection, {
    projectSlug,
    subsectionSlug: subsectionSlug!,
  })
  const [updateSubsectionMutation] = useMutation(updateSubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsectionMutation({
        ...values,
        id: subsection.id,
        slug: `pa${values.slug}`,
        projectSlug,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug,
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
      try {
        try {
          await deleteSubsectionMutation({ projectSlug, id: subsection.id })
        } catch (error) {
          alert(
            "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
          )
        }
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
      await router.push(Routes.ProjectDashboardPage({ projectSlug }))
    }
  }

  return (
    <>
      <MetaTags noindex title={seoEditTitleSlug(subsection.slug)} />
      <PageHeader title={`${shortTitle(subsection.slug)} bearbeiten`} className="mt-12" />

      <SubsectionForm
        isPlacemarkFieldsReadOnly={Boolean(project?.placemarkUrl)}
        className="mt-10"
        submitText="Speichern"
        schema={SubsectionSchema}
        initialValues={{ ...subsection, slug: subsection.slug.replace(/^pa/, "") }}
        onSubmit={handleSubmit}
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
  const subsectionSlug = useSlug("subsectionSlug")
  const projectSlug = useProjectSlug()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsection />
      </Suspense>

      <hr className="my-5" />
      <p>
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug,
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
