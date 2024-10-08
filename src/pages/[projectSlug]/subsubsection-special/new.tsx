import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionSpecialForm } from "@/src/pagesComponents/subsubsectionSpecial/SubsubsectionSpecialForm"
import createSubsubsectionSpecial from "@/src/server/subsubsectionSpecial/mutations/createSubsubsectionSpecial"
import { SubsubsectionSpecial } from "@/src/server/subsubsectionSpecial/schema"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"

const NewSubsubsectionSpecialPageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsubsectionSpecialMutation] = useMutation(createSubsubsectionSpecial)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionSpecialMutation({ ...values, projectSlug })
      await router.push(Routes.SubsubsectionSpecialsPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Besonderheit")} />
      <PageHeader title="Besonderheit hinzufügen" className="mt-12" />

      <SubsubsectionSpecialForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsubsectionSpecial.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionSpecialPage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsectionSpecialPageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionSpecialPage.authenticate = true

export default NewSubsubsectionSpecialPage
