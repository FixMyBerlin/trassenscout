"use client"

import { FORM_ERROR } from "@/src/core/components/forms"
import { DeleteActionBar } from "@/src/core/components/forms/DeleteActionBar"
import deleteSupportDocument from "@/src/server/supportDocuments/mutations/deleteSupportDocument"
import updateSupportDocument from "@/src/server/supportDocuments/mutations/updateSupportDocument"
import getSupportDocument from "@/src/server/supportDocuments/queries/getSupportDocument"
import {
  SupportDocumentFormSchema,
  SupportDocumentFormType,
} from "@/src/server/supportDocuments/schema"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useParams, useRouter } from "next/navigation"
import { SupportDocumentForm } from "../../../_components/SupportDocumentForm"

export const AdminSupportDocumentEditForm = () => {
  const router = useRouter()
  const supportDocumentId = Number(useParams()?.supportDocumentId)
  const [supportDocument] = useQuery(getSupportDocument, { id: supportDocumentId })
  const [updateSupportDocumentMutation] = useMutation(updateSupportDocument)
  const [deleteSupportDocumentMutation] = useMutation(deleteSupportDocument)

  const handleSubmit = async (values: SupportDocumentFormType) => {
    try {
      await updateSupportDocumentMutation({
        id: supportDocument.id,
        ...values,
      })
      router.push("/support")
    } catch (error: any) {
      console.error(error)
      return { [FORM_ERROR]: error }
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
          onDelete={() => deleteSupportDocumentMutation({ id: supportDocument.id })}
          returnPath="/support"
        />
      }
    />
  )
}
