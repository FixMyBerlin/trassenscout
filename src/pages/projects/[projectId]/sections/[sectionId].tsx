import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import deleteSection from "src/sections/mutations/deleteSection"
import getSection from "src/sections/queries/getSection"

export const Section = () => {
  const router = useRouter()
  const sectionId = useParam("sectionId", "number")
  const projectId = useParam("projectId", "number")
  const [deleteSectionMutation] = useMutation(deleteSection)
  const [section] = useQuery(getSection, { id: sectionId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${section.id} unwiderruflich löschen?`)) {
      await deleteSectionMutation({ id: section.id })
      await router.push(Routes.SectionsPage({ projectId: projectId! }))
    }
  }

  return (
    <>
      <MetaTags noindex title={`Section ${quote(section.name)}`} />

      <h1>Section {quote(section.name)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(section, null, 2)}</pre>
      </SuperAdminBox>

      <Link
        href={Routes.EditSectionPage({
          projectId: projectId!,
          sectionId: section.id,
        })}
      >
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowSectionPage = () => {
  const projectId = useParam("projectId", "number")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Section />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectId: projectId! })}>Alle Sections</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSectionPage.authenticate = true

export default ShowSectionPage
