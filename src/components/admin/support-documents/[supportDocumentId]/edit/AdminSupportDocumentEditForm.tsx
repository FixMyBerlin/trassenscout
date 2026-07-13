import { useMutation, useSuspenseQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { DeleteActionBar } from "@/src/components/core/components/forms/DeleteActionBar"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import {
  deleteSupportDocumentFn,
  updateSupportDocumentFn,
} from "@/src/server/supportDocuments/supportDocuments.functions"
import { supportDocumentQueryOptions } from "@/src/server/supportDocuments/supportDocumentsQueryOptions"
import {
  SupportDocumentFormSchema,
  type SupportDocumentFormType,
} from "@/src/shared/supportDocuments/schemas"
import { SupportDocumentForm } from "../../SupportDocumentForm"

type Props = {
  supportDocumentId: number
}

export const AdminSupportDocumentEditForm = ({ supportDocumentId }: Props) => {
  const navigate = useNavigate()
  const { data: supportDocument } = useSuspenseQuery(supportDocumentQueryOptions(supportDocumentId))
  const updateSupportDocumentMutation = useMutation({ mutationFn: updateSupportDocumentFn })
  const deleteSupportDocumentMutation = useMutation({ mutationFn: deleteSupportDocumentFn })

  const handleSubmit = async (values: SupportDocumentFormType) => {
    try {
      await updateSupportDocumentMutation.mutateAsync({
        data: {
          id: supportDocument.id,
          ...values,
        },
      })
      navigate({ to: "/support" })
    } catch (error: unknown) {
      console.error(error)
      return { [FORM_ERROR]: error instanceof Error ? error.message : String(error) }
    }
  }

  return (
    <SupportDocumentForm
      submitText="Speichern"
      schema={SupportDocumentFormSchema}
      initialValues={supportDocument}
      onSubmit={handleSubmit}
      actionBarRight={
        <DeleteActionBar
          itemTitle={supportDocument.title}
          onDelete={() =>
            deleteSupportDocumentMutation.mutateAsync({ data: { id: supportDocument.id } })
          }
          returnPath="/support"
        />
      }
    />
  )
}
