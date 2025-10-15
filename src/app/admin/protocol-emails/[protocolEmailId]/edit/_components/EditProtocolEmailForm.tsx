"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { Link, linkStyles } from "@/src/core/components/links"
import { TGetProjects } from "@/src/server/projects/queries/getProjects"
import deleteProtocolEmail from "@/src/server/protocol-emails/mutations/deleteProtocolEmail"
import updateProtocolEmail from "@/src/server/protocol-emails/mutations/updateProtocolEmail"
import { ProtocolEmailFormSchema } from "@/src/server/protocol-emails/schema"
import { useMutation } from "@blitzjs/rpc"
import clsx from "clsx"
import { useRouter } from "next/navigation"
import { ProtocolEmailForm } from "../../../_components/ProtocolEmailForm"

export const EditProtocolEmailForm = ({
  initialProtocolEmail,
  protocolEmailId,
  projects,
}: {
  initialProtocolEmail: any // TODO: Type this properly
  protocolEmailId: number
  projects: TGetProjects["projects"]
}) => {
  const router = useRouter()
  const [updateProtocolEmailMutation] = useMutation(updateProtocolEmail)
  const [deleteProtocolEmailMutation] = useMutation(deleteProtocolEmail)

  const handleDelete = async () => {
    if (
      window.confirm(`Die E-Mail mit der ID ${initialProtocolEmail.id} unwiderruflich löschen?`)
    ) {
      try {
        await deleteProtocolEmailMutation({ id: initialProtocolEmail.id })
        router.push("/admin/protocol-emails")
      } catch (error) {
        alert(
          "Beim Löschen ist ein Fehler aufgetreten. Eventuell existieren noch verknüpfte Daten.",
        )
      }
    }
  }

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const updated = await updateProtocolEmailMutation({
        ...values,
        id: protocolEmailId,
      })
      router.push(`/admin/protocol-emails/${protocolEmailId}`)
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, [])
    }
  }

  return (
    <>
      <ProtocolEmailForm
        className="grow"
        submitText="E-Mail speichern"
        schema={ProtocolEmailFormSchema}
        initialValues={{
          ...initialProtocolEmail,
        }}
        onSubmit={handleSubmit}
        projects={projects}
      />

      <div className="mt-8">
        <Link href="/admin/protocol-emails">← Zurück zur E-Mail-Übersicht</Link>
      </div>

      <hr className="my-5" />

      <button type="button" onClick={handleDelete} className={clsx(linkStyles, "my-0")}>
        E-Mail löschen
      </button>
    </>
  )
}
