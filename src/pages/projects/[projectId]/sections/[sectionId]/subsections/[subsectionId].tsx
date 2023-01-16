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
  const projectId = useParam("projectId", "number")
  const sectionId = useParam("sectionId", "number")
  const subsectionId = useParam("subsectionId", "number")
  const [deleteSubsectionMutation] = useMutation(deleteSubsection)
  const [subsection] = useQuery(getSubsection, { id: subsectionId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsection.id} unwiderruflich löschen?`)) {
      await deleteSubsectionMutation({ id: subsection.id })
      await router.push(Routes.SubsectionsPage({ projectId: projectId!, sectionId: sectionId! }))
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
          projectId: projectId!,
          sectionId: sectionId!,
          subsectionId: subsection.id,
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
  const projectId = useParam("projectId", "number")

  return (
    <LayoutArticle>
      <Suspense fallback={<div>Daten werden geladen…</div>}>
        <Subsection />
      </Suspense>

      <p>
        <Link href={Routes.SectionsPage({ projectId: projectId! })}>Alle Abschnitte</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSubsectionPage.authenticate = true

export default ShowSubsectionPage
