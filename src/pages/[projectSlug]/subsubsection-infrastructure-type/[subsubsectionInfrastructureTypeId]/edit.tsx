import { SuperAdminLogData } from "@/src/core/components/AdminBox/SuperAdminLogData"
import { Spinner } from "@/src/core/components/Spinner"
import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { seoEditTitle } from "@/src/core/components/text"
import { LayoutRs, MetaTags } from "@/src/core/layouts"
import { useProjectSlug } from "@/src/core/routes/usePagesDirectoryProjectSlug"
import { SubsubsectionInfrastructureTypeForm } from "@/src/pagesComponents/subsubsectionInfrastructureType/SubsubsectionInfrastructureTypeForm"
import updateSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/mutations/updateSubsubsectionInfrastructureType"
import getSubsubsectionInfrastructureType from "@/src/server/subsubsectionInfrastructureType/queries/getSubsubsectionInfrastructureType"
import { SubsubsectionInfrastructureType } from "@/src/server/subsubsectionInfrastructureType/schema"
import { BlitzPage, Routes, useParam } from "@blitzjs/next"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useRouter } from "next/router"
import { Suspense } from "react"
import { z } from "zod"

const EditSubsubsectionInfrastructureTypeWithQuery = () => {
  const router = useRouter()
  const subsubsectionInfrastructureTypeId = useParam("subsubsectionInfrastructureTypeId", "number")
  const projectSlug = useProjectSlug()

  const [subsubsectionInfrastructureType, { setQueryData }] = useQuery(
    getSubsubsectionInfrastructureType,
    { projectSlug, id: subsubsectionInfrastructureTypeId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    },
  )
  const [updateSubsubsectionInfrastructureTypeMutation] = useMutation(
    updateSubsubsectionInfrastructureType,
  )

  type HandleSubmit = Omit<z.infer<typeof SubsubsectionInfrastructureType>, "projectId">
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateSubsubsectionInfrastructureTypeMutation({
        id: subsubsectionInfrastructureType.id,
        projectSlug,
        ...values,
      })
      await setQueryData(updated)
      await router.push(Routes.SubsubsectionInfrastructureTypesPage({ projectSlug }))
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["slug"])
    }
  }

  return (
    <>
      <SubsubsectionInfrastructureTypeForm
        className="grow"
        submitText="Speichern"
        schema={SubsubsectionInfrastructureType}
        initialValues={subsubsectionInfrastructureType}
        onSubmit={handleSubmit}
      />

      <p className="mt-5">
        <Link href={Routes.SubsubsectionInfrastructureTypesPage({ projectSlug })}>
          Zurück zur Übersicht
        </Link>
      </p>

      <SuperAdminLogData data={{ subsubsectionInfrastructureType }} />
    </>
  )
}

const EditSubsubsectionInfrastructureTypePage: BlitzPage = () => {
  return (
    <LayoutRs>
      <MetaTags noindex title={seoEditTitle("Fördergegenstand")} />
      <PageHeader title="Fördergegenstand bearbeiten" className="mt-12" />

      <Suspense fallback={<Spinner page />}>
        <EditSubsubsectionInfrastructureTypeWithQuery />
      </Suspense>
    </LayoutRs>
  )
}

EditSubsubsectionInfrastructureTypePage.authenticate = true

export default EditSubsubsectionInfrastructureTypePage
