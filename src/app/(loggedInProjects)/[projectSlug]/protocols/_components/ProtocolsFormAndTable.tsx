"use client"

import { ProtocolForm } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolForm"
import { ProtocolsTable } from "@/src/app/(loggedInProjects)/[projectSlug]/protocols/_components/ProtocolsTable"
import { Disclosure } from "@/src/core/components/Disclosure"
import { FORM_ERROR } from "@/src/core/components/forms"
import { improveErrorMessage } from "@/src/core/components/forms/improveErrorMessage"
import { H3 } from "@/src/core/components/text"
import { useProjectSlug } from "@/src/core/routes/useProjectSlug"

import { getDate } from "@/src/pagesComponents/calendar-entries/utils/splitStartAt"
import { IfUserCanEdit } from "@/src/pagesComponents/memberships/IfUserCan"

import createProtocol from "@/src/server/protocols/mutations/createProtocol"
import getProtocols from "@/src/server/protocols/queries/getProtocols"
import { useMutation, useQuery } from "@blitzjs/rpc"
import clsx from "clsx"

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
        <Disclosure
          classNameButton="py-4 px-6 text-left bg-gray-100 rounded-t-md"
          classNamePanel="px-6 pb-3 bg-gray-100 rounded-b-md"
          open
          button={
            <div className="flex-auto">
              <H3 className={clsx("pr-10 md:pr-0")}>Neuer Protokolleintrag</H3>
              <small>
                Neuen Protokolleintrag verfassen. Zum Ein- oder Ausklappen auf den Pfeil oben rechts
                klicken.
              </small>
            </div>
          }
        >
          <ProtocolForm
            resetOnSubmit
            onSubmit={handleSubmit}
            submitText="Protokoll speichern"
            initialValues={{ date: getDate(new Date()) }}
          />
        </Disclosure>
      </IfUserCanEdit>
      <ProtocolsTable protocols={protocols} />
    </>
  )
}
