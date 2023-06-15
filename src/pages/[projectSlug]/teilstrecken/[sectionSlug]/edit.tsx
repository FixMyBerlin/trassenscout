import { BlitzPage, Routes, useParam } from "@blitzjs/next"
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
import getProjectUsers from "src/memberships/queries/getProjectUsers"
import { FORM_ERROR, SectionForm } from "src/sections/components/SectionForm"
import deleteSection from "src/sections/mutations/deleteSection"
import updateSection from "src/sections/mutations/updateSection"
import getSection from "src/sections/queries/getSection"
import { SectionSchema } from "src/sections/schema"

const EditSectionWithQuery = () => {
  const router = useRouter()
  const { projectSlug, sectionSlug } = useSlugs()
  const [section, { setQueryData }] = useQuery(
    getSection,
    { projectSlug: projectSlug!, sectionSlug: sectionSlug! },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateSectionMutation] = useMutation(updateSection)
  const [users] = useQuery(getProjectUsers, { projectSlug: projectSlug! })

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSectionMutation({
        id: section.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(
        Routes.SectionDashboardPage({ projectSlug: projectSlug!, sectionSlug: updated.slug })
      )
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
    }
  }

  const [deleteSectionMutation] = useMutation(deleteSection)
  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${section.id} unwiderruflich löschen?`)) {
      await deleteSectionMutation({ id: section.id })
      await router.push(Routes.ProjectDashboardPage({ projectSlug: projectSlug! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={seoEditTitleSlug(section.slug)} />
      <PageHeader title="Teilstrecke bearbeiten" className="mt-12" />

      <SectionForm
        submitText="Speichern"
        schema={SectionSchema}
        initialValues={section}
        onSubmit={handleSubmit}
        users={users}
      />

      <hr />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles)}>
        Löschen
      </button>

      <SuperAdminLogData data={section} />
    </>
  )
}

const EditSectionPage: BlitzPage = () => {
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")

  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <EditSectionWithQuery />
      </Suspense>

      <hr className="my-5" />
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

EditSectionPage.authenticate = true

export default EditSectionPage
