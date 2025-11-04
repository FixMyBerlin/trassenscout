import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { Spinner } from "@/src/core/components/Spinner"
import { seoNewTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionInfrastructureTypeForm } from "@/src/pagesComponents/subsubsectionInfrastructureType/SubsubsectionInfrastructureTypeForm"
import createSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/createSubsubsectionInfrastructureType"
import { SubsubsectionInfrastructureType } from "@/src/server/subsubsectionInfrastructureType/schema"
import { Routes } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const NewSubsubsectionInfrastructureTypePageWithQuery = () => {
  const router = useRouter()
  const projectSlug = useProjectSlug()
  const [createSubsubsectionInfrastructureTypeMutation] = useMutation(
    createSubsubsectionInfrastructureType,
  )

  type HandleSubmit = Omit<z.infer<typeof SubsubsectionInfrastructureType>, "projectId">
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createSubsubsectionInfrastructureTypeMutation({ ...values, projectSlug })
      await router.push(Routes.SubsubsectionInfrastructureTypesPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <MetaTags noindex title={seoNewTitle("Fördergegenstand")} />
      <PageHeader title="Fördergegenstand hinzufügen" className="mt-12" />

      <SubsubsectionInfrastructureTypeForm
        className="mt-10"
        submitText="Erstellen"
        schema={SubsubsectionInfrastructureType.omit({ projectId: true })}
        onSubmit={handleSubmit}
      />
    </>
  )
}

const NewSubsubsectionInfrastructureTypePage = () => {
  return (
    <LayoutRs>
      <Suspense fallback={<Spinner page />}>
        <NewSubsubsectionInfrastructureTypePageWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

NewSubsubsectionInfrastructureTypePage.authenticate = true

export default NewSubsubsectionInfrastructureTypePage
