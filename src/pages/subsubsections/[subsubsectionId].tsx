import { Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { SuperAdminBox } from "src/core/components/AdminBox"
import { Link, linkStyles } from "src/core/components/links"
import { quote } from "src/core/components/text"
import { LayoutArticle, MetaTags } from "src/core/layouts"
import deleteSubsubsection from "src/subsubsections/mutations/deleteSubsubsection"
import getSubsubsection from "src/subsubsections/queries/getSubsubsection"

export const Subsubsection = () => {
  const router = useRouter()
  const subsubsectionId = useParam("subsubsectionId", "number")
  const [deleteSubsubsectionMutation] = useMutation(deleteSubsubsection)
  const [subsubsection] = useQuery(getSubsubsection, { id: subsubsectionId })

  const handleDelete = async () => {
    if (window.confirm(`Den Eintrag mit ID ${subsubsection.id} unwiderruflich löschen?`)) {
      await deleteSubsubsectionMutation({ id: subsubsection.id })
      await router.push(Routes.SubsubsectionsPage())
    }
  }

  return (
    <>
      <MetaTags noindex title={`Subsubsection ${quote(subsubsection.title)}`} />

      <h1>Subsubsection {quote(subsubsection.title)}</h1>
      <SuperAdminBox>
        <pre>{JSON.stringify(subsubsection, null, 2)}</pre>
      </SuperAdminBox>

      <Link href={Routes.EditSubsubsectionPage({ subsubsectionId: subsubsection.id })}>
        Bearbeiten
      </Link>

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "ml-2")}>
        Löschen
      </button>
    </>
  )
}

const ShowSubsubsectionPage = () => {
  return (
    <LayoutArticle>
      <Suspense fallback={<Spinner page />}>
        <Subsubsection />
      </Suspense>

      <p>
        <Link href={Routes.SubsubsectionsPage()}>Alle Subsubsections</Link>
      </p>
    </LayoutArticle>
  )
}

ShowSubsubsectionPage.authenticate = true

export default ShowSubsubsectionPage
