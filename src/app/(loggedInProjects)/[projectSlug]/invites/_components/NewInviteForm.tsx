"use client"

import { FORM_ERROR } from "@/src/core/components/forms/Form"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import createInvite from "@/src/server/invites/mutations/createInvite"
import { InviteSchema } from "@/src/server/invites/schema"
import { useMutation } from "@blitzjs/rpc"
import { Route } from "next"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { TeamInviteForm } from "./TeamInviteForm"

type Props = {
  projectSlug: string
}

export const NewInviteForm = ({ projectSlug }: Props) => {
  const router = useRouter()
  const [createInviteMutation] = useMutation(createInvite)

  type HandleSubmit = z.infer<typeof InviteSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createInviteMutation({ ...values, projectSlug })
      await router.push(`/${projectSlug}/invites` as Route)
      router.refresh()
    } catch (error: any) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return <TeamInviteForm submitText="Einladen" schema={InviteSchema} onSubmit={handleSubmit} />
}
