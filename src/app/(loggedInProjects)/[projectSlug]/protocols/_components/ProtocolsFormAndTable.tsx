"use client"

import { ProtocolForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolForm"
import { ProtocolsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolsTable"
import { FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"
import createProtocol from "@/src/server/protocols/mutations/createProtocol"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { useMutation, useQuery } from "@blitzjs/rpc"

export const ProtocolsFormAndTable = ({
  initialProtocols,
}: {
  initialProtocols: Awaited<ReturnType<typeof getProtocols>>
}) => {
  const projectSlug = useProjectSlug()
  const [protocols, { refetch }] = useQuery(
    getProtocols,
    { projectSlug },
    // todo check if this works as expected
    { initialData: initialProtocols },
  )
  const [createProtocolMutation] = useMutation(createProtocol)

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const protocol = await createProtocolMutation({
        ...values,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
      })
      refetch()
    } catch (error: any) {
      // todo ?
      return improveErrorMessage(error, FORM_ERROR, ["email"])
    }
  }

  return (
    <>
      <IfUserCanEdit>
        <ProtocolForm
          resetOnSubmit
          onSubmit={handleSubmit}
          initialValues={{ date: getDate(new Date()) }}
          mode="new"
        />
      </IfUserCanEdit>
      <ProtocolsTable protocols={protocols} />
    </>
  )
}
