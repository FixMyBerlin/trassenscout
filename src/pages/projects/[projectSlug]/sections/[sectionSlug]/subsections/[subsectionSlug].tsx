import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import deleteSubsection from "src/subsections/mutations/deleteSubsection"
import getSubsection from "src/subsections/queries/getSubsection"

export const Subsection = () => {
  const router = useRouter()
  const projectSlug = useParam("projectSlug", "string")
  const sectionSlug = useParam("sectionSlug", "string")
  const subsectionSlug = useParam("subsectionSlug", "string")
  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const [subsection] = useQuery(getSubsection, { slug: subsectionSlug })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ id: subsection.id })
      await router.push(
        Routes.SubsectionsPage({ projectSlug: projectSlug!, sectionSlug: sectionSlug! })
      )
    }
  }

  return (
    <>
      <MetaTags noindex title={`Abschnitt ${quote(subsection.name)}`} />

      <h1>Abschnitt {quote(subsection.name)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(subsection, null, 2)}</pre>
      </SuperAdminBox>

      <Link
        href={Routes.EditSubsectionPage({
          projectSlug: projectSlug!,
          sectionSlug: sectionSlug!,
          subsectionSlug: subsection.slug,
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

const ShowSubsectionPage = () => {
  const projectSlug = useParam("projectSlug", "string")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Subsection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectSlug: projectSlug! })}>Alle Abschnitte</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSubsectionPage.authenticate = true

export default ShowSubsectionPage
