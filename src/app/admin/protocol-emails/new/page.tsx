"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import createProtocolEmail from "@/src/server/protocol-emails/mutations/createProtocolEmail"
import { ProtocolEmailFormSchema } from "@/src/server/protocol-emails/schema"
import { useMutation } from "@blitzjs/rpc"
import { useRouter } from "next/navigation"
import { ProtocolEmailForm } from "../_components/ProtocolEmailForm"

export default function NewProtocolEmailPage() {
  const router = useRouter()
  const [createProtocolEmailMutation] = useMutation(createProtocolEmail)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const protocolEmail = await createProtocolEmailMutation({
        ...values,
      })
      router.push(`/admin/protocol-emails/${protocolEmail.id}`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["body"])
    }
  }

  return (
    <>
      <PageHeader title="Neue Protokoll-E-Mail hinzufügen" className="mt-12" />

      <ProtocolEmailForm
        submitText="E-Mail speichern"
        schema={ProtocolEmailFormSchema}
        onSubmit={handleSubmit}
      />

      <div className="mt-8">
        <Link href="/admin/protocol-emails">← Zurück zur E-Mail-Übersicht</Link>
      </div>
    </>
  )
}
