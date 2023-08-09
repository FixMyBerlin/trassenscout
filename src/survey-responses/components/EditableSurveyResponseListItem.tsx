import { Routes, useRouterQuery } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Disclosure } from "src/core/components/Disclosure"
import { LabeledRadiobuttonGroup } from "src/core/components/forms"
import updateSurveyResponse from "../mutations/updateSurveyResponse"
import EditableSurveyResponseForm, { FORM_ERROR } from "./EditableSurveyResponseForm"
import { useCallback } from "react"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  response: SurveyResponse
  className?: String
  columnWidthClasses: {
    id: string
    status: string
    operator: string
  }
  isCurrentItem?: boolean
}

const EditableSurveyResponseListItem: React.FC<Props> = ({
  response,
  columnWidthClasses,
  isCurrentItem,
}) => {
  const router = useRouter()
  const [updateSurveyResponseMutation] = useMutation(updateSurveyResponse)
  type HandleSubmit = any // TODO
  const handleSubmit = useCallback(
    async (values: HandleSubmit) => {
      try {
        const updated = await updateSurveyResponseMutation({
          id: response.id,
          ...values,
        })
        // await setQueryData(updated)
        await console.log(`successfully updated ${response.id}`)
      } catch (error: any) {
        console.error(error)
        return { [FORM_ERROR]: error }
      }
    },
    [response, updateSurveyResponseMutation],
  )
  const handleOpen = () => {
    router.query.responseDetails = String(response.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.responseDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const params = useRouterQuery()
  const responseDetails = parseInt(String(params.responseDetails))
  const open = response.id === Number(responseDetails)
  if (open) console.log(`Item NO ${response.id} is OPEN`)

  return (
    <Disclosure
      open={open}
      onOpen={handleOpen}
      onClose={handleClose}
      classNameButton="py-4 text-left text-sm text-gray-900 hover:bg-gray-50"
      classNamePanel="flex flex-start"
      button={
        <>
          <div
            className={clsx(
              columnWidthClasses.id,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">{response.id}</div>
          </div>
          <div
            className={clsx(
              columnWidthClasses.status,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">{response.status}</div>
          </div>
          <div
            className={clsx(
              columnWidthClasses.operator,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">
              {response.operatorId || "k.A."}
            </div>
          </div>
          <div className="flex-grow py-4 pl-4 pr-3 text-sm sm:pl-6">
            <div className={clsx(open || "line-clamp-3", "font-medium items-center text-gray-900")}>
              {/* @ts-ignore */}
              {JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}
            </div>
          </div>
        </>
      }
    >
      <div className="ml-3 px-3 pb-2 pt-6 sm:ml-64">
        {isCurrentItem && (
          <EditableSurveyResponseForm
            initialValues={{ ...response }}
            onChangeValues={handleSubmit}
            onSubmit={handleSubmit}
          >
            <LabeledRadiobuttonGroup
              scope={"status"}
              items={[
                { value: "PENDING", label: "Ausstehend" },
                { value: "ASSIGNED", label: "Zugeordnet" },
                { value: "DONE_PLANING", label: "Erledigt (Planung)" },
                { value: "DONE_FAQ", label: "Erledigt (FAQ)" },
                { value: "IRRELEVANT", label: "Nicht erforderlich" },
              ]}
            />
          </EditableSurveyResponseForm>
        )}
      </div>
    </Disclosure>
  )
}

export default EditableSurveyResponseListItem
