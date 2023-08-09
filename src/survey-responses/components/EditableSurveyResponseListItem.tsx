import { useRouterQuery } from "@blitzjs/next"
import { useMutation } from "@blitzjs/rpc"
import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { useCallback } from "react"
import { Disclosure } from "src/core/components/Disclosure"
import { LabeledRadiobuttonGroup } from "src/core/components/forms"
import updateSurveyResponse from "../mutations/updateSurveyResponse"
import EditableSurveyResponseForm, { FORM_ERROR } from "./EditableSurveyResponseForm"
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
        // TODO
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
      classNameButton="pl-4 py-4 text-left text-sm text-gray-900 hover:bg-gray-50"
      classNamePanel="pl-4 py-4 flex flex-start"
      button={
        <>
          <div
            className={clsx(
              columnWidthClasses.id,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 text-sm",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">{response.id}</div>
          </div>
          <div
            className={clsx(
              columnWidthClasses.status,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 text-sm",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">{response.status}</div>
          </div>
          <div
            className={clsx(
              columnWidthClasses.operator,
              "flex-shrink-0 h-20 whitespace-nowrap py-4 text-sm",
            )}
          >
            <div className="flex items-center font-medium text-gray-900">
              {response.operatorId || "k.A."}
            </div>
          </div>
          <div className="flex-grow py-4 text-sm">
            <div className={clsx(open || "line-clamp-3", "font-medium items-center text-gray-900")}>
              {/* @ts-ignore */}
              {JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}
            </div>
          </div>
        </>
      }
    >
      <div className="w-full">
        {isCurrentItem && (
          <EditableSurveyResponseForm
            initialValues={{ ...response }}
            onChangeValues={handleSubmit}
            onSubmit={handleSubmit}
            className="flex"
          >
            <div className={clsx(columnWidthClasses.id, "flex-shrink-0")} />
            <LabeledRadiobuttonGroup
              classNameItemWrapper={clsx("flex-shrink-0", columnWidthClasses.status)}
              scope={"status"}
              items={[
                { value: "PENDING", label: "Ausstehend" },
                { value: "ASSIGNED", label: "Zugeordnet" },
                { value: "DONE_PLANING", label: "Erledigt (Planung)" },
                { value: "DONE_FAQ", label: "Erledigt (FAQ)" },
                { value: "IRRELEVANT", label: "Nicht erforderlich" },
              ]}
            />
            <div className={clsx(columnWidthClasses.operator, "flex-shrink-0")} />
            <div className="flex-grow pb-4 space-y-3">
              <div>
                <p className="">Kategorie</p>
                {/* question 21 represents 'Kategorie', TODO getCategoryName(id) */}
                {/* @ts-ignore */}
                <p>{JSON.parse(response.data)["21"]}</p>
              </div>
            </div>
          </EditableSurveyResponseForm>
        )}
      </div>
    </Disclosure>
  )
}

export default EditableSurveyResponseListItem
