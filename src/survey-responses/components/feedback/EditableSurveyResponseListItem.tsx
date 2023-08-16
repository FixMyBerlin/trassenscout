import { useRouterQuery } from "@blitzjs/next"
import { SurveyResponse as TSurveyResponse } from "@prisma/client"
import { useRouter } from "next/router"
import { SubsectionWithPosition } from "src/subsections/queries/getSubsection"
import { EditableSurveyResponseForm } from "./EditableSurveyResponseForm"

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

  return (
    <article data-open={open} className="w-full text-sm">
      <button
        className="border p-4 hover:bg-blue-100"
        onClick={() => (open ? handleClose() : handleOpen())}
      >
        {response.id} — {response.status} — {response.operatorId || "k.A."}
      </button>

      {open && (
        <div className="block border p-4 border-gray-200">
          <ul>
            <li>{response.id}</li>
            <li>{response.status}</li>
            <li>{response.operatorId || "k.A."}</li>
            {/* @ts-expect-errors */}
            <li>{JSON.parse(response.data)["34"] || JSON.parse(response.data)["35"]}</li>
          </ul>
          <EditableSurveyResponseForm
            initialValues={{
              ...response,
              operatorId: response.operatorId === null ? 0 : String(response.operatorId),
            }}
            className="flex"
            response={response}
            subsections={subsections}
            refetchResponses={refetchResponses}
          />
        </div>
      )}
    </article>
  )
}

export default EditableSurveyResponseListItem
