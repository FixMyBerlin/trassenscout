import { Routes } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { Spinner } from "src/core/components/Spinner"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { FORM_ERROR, SubsubsectionForm } from "src/subsubsections/components/SubsubsectionForm"
import updateSubsubsection from "src/subsubsections/mutations/updateSubsubsection"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"
import { SubsubsectionSchema } from "src/subsubsections/schema"

const EditSubsubsection = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug, subsectionSlug, subsubsectionSlug } = useSlugs()
  const [subsubsection, { setQueryData }] = useQuery(
    getSubsubsection,
    { slug: subsubsectionSlug! },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSubsubsectionMutation] = useMutation(updateSubsubsection)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionMutation({
        id: subsubsection.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SubsectionDashboardPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionPath: [subsectionSlug!, subsubsection.slug],
        })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  // TODO: Fix delete. Shows this Error ATM:
  //                 Uncaught (in promise) Error:
  //                 Invalid `prisma.subsection.deleteMany()` invocation:
  //                 Foreign key constraint failed on the field: `Subsubsection_subsectionId_fkey (index)`
  // const [deleteSubsectionMutation] = useMutation(deleteSubsubsection)
  // const handleDelete = async () => {
  //   if (window.confirm(`Den Eintrag mit ID ${subsubsection.id} unwiderruflich löschen?`)) {
  //     await deleteSubsectionMutation({ id: subsubsection.id })
  //     await router.push(
  //       Routes.SubsectionDashboardPage({
  //         projectSlug: projectSlug!,
  //         sectionSlug: sectionSlug!,
  //         subsectionPath: [subsectionSlug!],
  //       })
  //     )
  //   }
  // }

  const title = `Teilplanung "${subsubsection.title}" bearbeiten`
  return (
    <>
      <MetaTags noindex title={title} />
      <PageHeader title="Teilplanung bearbeiten" subtitle={subsubsection.title} />

      <SubsubsectionForm
        className="mt-10"
        submitText="Speichern"
        schema={SubsubsectionSchema}
        initialValues={subsubsection}
        onSubmit={handleSubmit}
      />

      {/* <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        Löschen
      </button> */}

      <hr className="my-5" />
    </>
  )
}

const EditSubsubsectionPage = () => {
  const { projectSlug, sectionSlug, subsectionSlug } = useSlugs()

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSubsubsection />
      </Suspense>

      <p>
        <Link
          href={Routes.SubsectionDashboardPage({
            projectSlug: projectSlug!,
            sectionSlug: sectionSlug!,
            subsectionPath: [subsectionSlug!],
          })}
        >
          Zurück zum Abschnitt
        </Link>
      </p>
    </LayoutRs>
  )
}

EditSubsubsectionPage.authenticate = true

export default EditSubsubsectionPage
