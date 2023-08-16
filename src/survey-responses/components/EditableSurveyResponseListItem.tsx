import { useRouterQuery } from "@blitzjs/next"
import { useQuery } from "@blitzjs/rpc"
import { SurveyResponse as TSurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { Disclosure } from "src/core/components/Disclosure"
import getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse from "src/survey-response-topics-on-survey-responses/queries/getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
export { FORM_ERROR } from "src/core/components/forms"

export type EditableSurveyResponseListItemProps = {
  response: TSurveyResponse
  className?: String
  columnWidthClasses: {
    id: string
    status: string
    operator: string
  }
  isCurrentItem?: boolean
  subsections: SubsectionWithPosition[]
}

const EditableSurveyResponseListItem: React.FC<EditableSurveyResponseListItemProps> = ({
  response,
  columnWidthClasses,
  isCurrentItem,
  subsections,
}) => {
  const router = useRouter()
  const params = useRouterQuery()
  const [{ surveyResponseTopicsOnSurveyResponses }] = useQuery(
    getSurveyResponseTopicsOnSurveyResponsesBySurveyResponse,
    {
      surveyResponseId: response.id,
    },
  )

  const handleOpen = () => {
    router.query.responseDetails = String(response.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.responseDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
  }

  const responseDetails = parseInt(String(params.responseDetails))
  const open = response.id === Number(responseDetails)

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
      <div className="w-full text-sm">
        {isCurrentItem && (
          <EditableSurveyResponseForm
            initialValues={{
              ...response,
              operatorId: String(response.operatorId),
            }}
            className="flex"
            response={response}
            columnWidthClasses={columnWidthClasses}
            subsections={subsections}
          />
        )}
      </div>
    </Disclosure>
  )
}

export default EditableSurveyResponseListItem
