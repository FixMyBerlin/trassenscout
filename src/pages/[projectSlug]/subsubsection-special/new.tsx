import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { improveErrorMessage } from "src/core/components/forms/improveErrorMessage"
import { PageHeader } from "src/core/components/pages/PageHeader"
import { seoNewTitle } from "src/core/components/text"
import { useSlugs } from "src/core/hooks"
import { LayoutRs, MetaTags } from "src/core/layouts"
import { SubsubsectionSpecialForm } from "src/subsubsectionSpecial/components/SubsubsectionSpecialForm"
import createSubsubsectionSpecial from "src/subsubsectionSpecial/mutations/createSubsubsectionSpecial"
import { SubsubsectionSpecial } from "src/subsubsectionSpecial/schema"
import { FORM_ERROR } from "src/subsubsections/components/SubsubsectionForm"

const NewSubsubsectionSpecialPageWithQuery = () => {
  const router = useRouter()
  const { projectSlug } = useSlugs()
  const [createSubsubsectionSpecialMutation] = useMutation(createSubsubsectionSpecial)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionSpecialMutation({ ...values, projectSlug: projectSlug! })
      await router.push(Routes.SubsubsectionSpecialsPage({ projectSlug: projectSlug! }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Besonderheit hinzufügen")} />
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
