import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { improveErrorMessage } from "@/src/components/core/components/forms/improveErrorMessage"
import { FORM_ERROR } from "@/src/components/core/components/forms/utils/formSubmitResult"
import { createInviteFn } from "@/src/server/invites/invites.functions"
import { InviteSchema } from "@/src/shared/invites/schemas"
import { TeamInviteForm } from "./TeamInviteForm"

type Props = {
  projectSlug: string
  onSuccess?: () => void
  layout?: "default" | "drawer"
}

export const NewInviteForm = ({ projectSlug, onSuccess, layout }: Props) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const createInviteMutation = useMutation({ mutationFn: createInviteFn })

  type HandleSubmit = z.infer<typeof InviteSchema>
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      await createInviteMutation.mutateAsync({ data: { ...values, projectSlug } })
      await queryClient.invalidateQueries({ queryKey: ["invites", { projectSlug }] })
      if (onSuccess) {
        onSuccess()
        return
      }
      void navigate({ to: `/${projectSlug}/invites` })
    } catch (error: unknown) {
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <TeamInviteForm
      submitText="Einladen"
      schema={InviteSchema}
      onSubmit={handleSubmit}
      layout={layout}
    />
  )
}
