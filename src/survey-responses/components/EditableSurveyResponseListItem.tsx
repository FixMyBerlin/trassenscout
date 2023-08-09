import { Disclosure } from "src/core/components/Disclosure"
import { SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { useRouter } from "next/router"
import { useRouterQuery } from "@blitzjs/next"
import EditableSurveyResponseForm from "./EditableSurveyResponseForm"
import { RadioIcon } from "@heroicons/react/24/solid"
import { LabeledTextField } from "src/core/components/forms"
import { H3 } from "src/core/components/text"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  response: SurveyResponse
  className?: String
  columnWidthClasses: {
    id: string
    status: string
    operator: string
  }
}

const EditableSurveyResponseListItem: React.FC<Props> = ({ response, columnWidthClasses }) => {
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
  const responseDetails = parseInt(String(params.responseDetails))
  const open = response.id === Number(responseDetails)
  return (
    <EditableSurveyResponseForm
      onChangeValues={() => console.log("change success")}
      onSubmit={() => console.log("success")}
    >
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
              <div
                className={clsx(open || "line-clamp-3", "font-medium items-center text-gray-900")}
              >
                {/* @ts-ignore */}
                {JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}
              </div>
            </div>
          </>
        }
      >
        <div className="ml-3 px-3 pb-2 pt-6 sm:ml-64">
          <H3>example</H3>
          <LabeledTextField
            type="email"
            name="email"
            label="E-Mail-Adresse"
            placeholder="name@beispiel.de"
            autoComplete="email"
          />
        </div>
      </Disclosure>
    </EditableSurveyResponseForm>
  )
}

export default EditableSurveyResponseListItem
