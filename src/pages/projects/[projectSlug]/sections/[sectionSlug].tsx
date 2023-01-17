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
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const [deleteSectionMutation] = useMutation(deleteSection)
  const [section] = useQuery(getSection, { slug: sectionSlug })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${section.id} unwiderruflich löschen?`)) {
      await deleteSectionMutation({ id: section.id })
      await router.push(Routes.SectionsPage({ projectSlug: projectSlug! }))
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
          projectSlug: projectSlug!,
          sectionSlug: section.slug,
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
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Section />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectSlug: projectSlug! })}>Alle Sections</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSectionPage.authenticate = true

export default ShowSectionPage
