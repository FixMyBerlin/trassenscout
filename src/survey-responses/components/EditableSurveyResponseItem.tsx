import { Disclosure } from "src/core/components/Disclosure"
import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  response: SurveyResponse
  columnWidthClasses: {
    id: string
    status: string
    operator: string
  }
}

const EditableSurveyResponseItem: React.FC<Props> = ({ response, columnWidthClasses }) => {
  return (
    <Disclosure
      // open={open}
      // onOpen={handleOpen}
      // onClose={handleClose}
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
            <div className="font-medium items-center text-gray-900 line-clamp-3">
              {/* @ts-ignore */}
              {JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}
            </div>
          </div>
        </>
      }
    >
      <div className="ml-3 px-3 pb-2 pt-6 sm:ml-64">TODO</div>
    </Disclosure>
  )
}

export default EditableSurveyResponseItem
