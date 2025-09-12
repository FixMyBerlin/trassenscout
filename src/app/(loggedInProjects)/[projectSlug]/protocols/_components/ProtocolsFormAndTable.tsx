"use client"

import { FilteredProtocols } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/FilteredProtocols"
import { ProtocolForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolForm"
import { IfUserCanEdit } from "@/src/app/_components/memberships/IfUserCan"
import { FORM_ERROR } from "@/src/core/components/forms"
import { FormSuccess } from "@/src/core/components/forms/FormSuccess"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"
import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import createProtocol from "@/src/server/protocols/mutations/createProtocol"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { useMutation, useQuery } from "@blitzjs/rpc"
import { useEffect, useState } from "react"

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
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProtocolId, setCreatedProtocolId] = useState<null | number>(null)

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timeout = setTimeout(() => {
        setShowSuccess(false)
        setCreatedProtocolId(null)
      }, 4000)
      return () => clearTimeout(timeout)
    }
  }, [showSuccess])

  const scrollToElement = (elementId: string) => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }

  type HandleSubmit = any // TODO
  const handleSubmit = async (values: HandleSubmit) => {
    try {
      const protocol = await createProtocolMutation({
        ...values,
        date: values.date ? new Date(values.date) : null,
        projectSlug,
      })
      refetch()
      setShowSuccess(true)
      setCreatedProtocolId(protocol.id)
      scrollToElement("toast")
    } catch (error: any) {
      // todo ?
      return improveErrorMessage(error, FORM_ERROR, [])
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
        <div className="mb-4 pt-4" id="toast">
          <FormSuccess message="Neues Protokoll erstellt" show={showSuccess} />
        </div>
      </IfUserCanEdit>
      <FilteredProtocols highlightId={createdProtocolId} protocols={protocols} />
    </>
  )
}
