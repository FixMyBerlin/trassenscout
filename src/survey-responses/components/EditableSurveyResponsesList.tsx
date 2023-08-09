import { useRouterQuery } from "@blitzjs/next"
import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useEffect, useRef } from "react"
import EditableSurveyResponseListItem from "./EditableSurveyResponseListItem"
export { FORM_ERROR } from "src/core/components/forms"

const columnWidthClasses = {
  id: "w-20",
  status: "w-48",
  operator: "w-32",
}

type Props = {
  responses: SurveyResponse[]
}

const EditableSurveyResponsesList: React.FC<Props> = ({ responses }) => {
  const params = useRouterQuery()
  const disclosureRefs = useRef<Array<HTMLDivElement | null>>([])

  const paramsResponseDetails = parseInt(String(params.responseDetails))

  useEffect(() => {
    if (paramsResponseDetails) {
      const currentRef = disclosureRefs.current?.at(paramsResponseDetails)
      currentRef?.scrollIntoView({ behavior: "smooth" })
    }
  }, [paramsResponseDetails])

  return (
    <div className="not-prose overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <div className="flex border-b border-gray-100 text-xs uppercase text-gray-500">
        <div className={clsx(columnWidthClasses.id, "pb-2 pt-3 opacity-0")}>ID</div>
        <div className={clsx(columnWidthClasses.status, "pb-2 pt-3")}>Status</div>
        <div className={clsx(columnWidthClasses.operator, "pb-2 pt-3")}>Baulastträger</div>
        <div className="flex-grow pb-2 pt-3"> Kommentare</div>
      </div>

      <div className="flex flex-col">
        {responses.map((response) => (
          <div
            className={clsx("scroll-m-0")}
            key={response.id}
            ref={(element) => (disclosureRefs.current[response.id] = element)}
          >
            <EditableSurveyResponseListItem
              columnWidthClasses={columnWidthClasses}
              response={response}
              isCurrentItem={response.id === paramsResponseDetails}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditableSurveyResponsesList
