import { useRouterQuery } from "@blitzjs/next"
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/20/solid"
import { SurveyResponse as TSurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"
import { Transition } from "@headlessui/react"
import { surveyResponseStatus } from "./surveyResponseStatus"
import { useQuery } from "@blitzjs/rpc"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { useSlugs } from "src/core/hooks"
import { Markdown } from "src/core/components/Markdown/Markdown"
import { getSurveyResponseCategoryById } from "src/survey-responses/utils/getSurveyResponseCategoryById"

export type EditableSurveyResponseListItemProps = {
  response: TSurveyResponse
  className?: String
  subsections: SubsectionWithPosition[]
  refetchResponses: () => void
}

const EditableSurveyResponseListItem: React.FC<EditableSurveyResponseListItemProps> = ({
  response,
  subsections,
  refetchResponses,
}) => {
  const router = useRouter()
  const handleOpen = () => {
    router.query.responseDetails = String(response.id)
    void router.push({ query: router.query }, undefined, { scroll: false })
  }
  const handleClose = () => {
    delete router.query.responseDetails
    void router.push({ query: router.query }, undefined, { scroll: false })
  }

  const params = useRouterQuery()
  const open = parseInt(String(params.responseDetails)) === response.id

  const { projectSlug } = useSlugs()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })

  const translatedStatus = response.status ? surveyResponseStatus[response.status] : ""
  const operatorWitFallback = operators.find((o) => o.id === response.operatorId)?.title || "k.A."
  // @ts-expect-error
  const userText = JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]
  // @ts-expect-error
  const userCategory = getSurveyResponseCategoryById(JSON.parse(response.data)["21"])

  return (
    <article data-open={open}>
      <button
        className={clsx(
          "py-4 text-left text-sm text-gray-900 hover:bg-gray-50 group flex w-full items-center justify-between pr-4 focus:outline-none focus-visible:ring focus-visible:ring-gray-500 focus-visible:ring-opacity-75 sm:pr-6",
          open ? "bg-blue-50" : "border-b border-gray-100",
        )}
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        <h3 className="flex grow items-center px-6 pb-2 pt-3 font-semibold text-blue-500">
          #{response.id} — {translatedStatus} — {operatorWitFallback}
        </h3>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-700 group-hover:text-black flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className={clsx("overflow-clip p-6", open ? "border-b border-gray-100" : "")}>
          <div className="flex gap-12 mb-10">
            <blockquote className="border-l-4 border-l-gray-200 pl-2 mb-6">
              <Markdown markdown={userText} />
            </blockquote>
            <div>
              <h4 className="font-bold mb-5">Kategorie</h4>
              <span className="p-3 bg-gray-300 rounded">{userCategory}</span>
            </div>
          </div>
          <EditableSurveyResponseForm
            initialValues={{
              ...response,
              operatorId: response.operatorId === null ? 0 : String(response.operatorId),
            }}
            response={response}
            operators={operators}
            subsections={subsections}
            refetchResponses={refetchResponses}
          />
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
