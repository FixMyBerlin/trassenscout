import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { SuperAdminLogData } from "src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { Link } from "src/core/components/links"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoEditTitle } from "src/core/components/text"
import { LayoutRs, MetaTags } from "src/core/layouts"
import {
  FORM_ERROR,
  SubsubsectionSpecialForm,
} from "src/subsubsectionSpecial/components/SubsubsectionSpecialForm"
import updateSubsubsectionSpecial from "src/subsubsectionSpecial/mutations/updateSubsubsectionSpecial"
import getSubsubsectionSpecial from "src/subsubsectionSpecial/queries/getSubsubsectionSpecial"
import { SubsubsectionSpecial } from "src/subsubsectionSpecial/schema"

const EditSubsubsectionsSpecialWithQuery = () => {
  const router = useRouter()
  const subsubsectionSpecialId = useParam("subsubsectionSpecialId", "number")
  const projectSlug = useParam("projectSlug", "string")

  const [subsubsectionSpecial, { setQueryData }] = useQuery(
    getSubsubsectionSpecial,
    { id: subsubsectionSpecialId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionSpecialMutation] = useMutation(updateSubsubsectionSpecial)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionSpecialMutation({
        id: subsubsectionSpecial.id,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsubsectionSpecialsPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionSpecialForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionSpecial}
        initialValues={subsubsectionSpecial}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsubsectionSpecialsPage({ projectSlug: projectSlug! })}>
          Zurück zur Übersicht
        </Link>
      </p>

      <SuperAdminLogData data={{ subsubsectionSpecial }} />
    </>
  )
}

const EditSubsubsectionSpecialPage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Besonderheit bearbeiten")} />
      <PageHeader title="Besonderheit bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsubsectionsSpecialWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsubsectionSpecialPage.authenticate = true

export default EditSubsubsectionSpecialPage
