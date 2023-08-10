import { Operator, SurveyResponse } from "@prisma/client"
import clsx from "clsx"
import { LabeledRadiobuttonGroup, LabeledTextareaField } from "src/core/components/forms"
import EditableSurveyResponseFormWrapper from "./EditableSurveyResponseFormWrapper"
import { EditableSurveyResponseListItemProps } from "./EditableSurveyResponseListItem"
import getOperatorsWithCount from "src/operators/queries/getOperatorsWithCount"
import { useQuery } from "@blitzjs/rpc"
import { useSlugs } from "src/core/hooks"
export { FORM_ERROR } from "src/core/components/forms"

type Props = {
  columnWidthClasses: EditableSurveyResponseListItemProps["columnWidthClasses"]
  handleSubmit: any
  response: SurveyResponse
}
export const EditableSurveyResponseForm: React.FC<Props> = ({
  response,
  columnWidthClasses,
  handleSubmit,
}) => {
  const { projectSlug } = useSlugs()
  const [{ operators }] = useQuery(getOperatorsWithCount, { projectSlug })
  return (
    <EditableSurveyResponseFormWrapper
      initialValues={{ ...response, operatorId: String(response.operatorId) }}
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
      <div className="flex-grow pb-4 space-y-5">
        <div>
          <p className="font-bold mb-3">Kategorie</p>
          <span className="px-3 py-2 bg-gray-300 rounded">
            {/* question 21 represents 'Kategorie', TODO getCategoryName(id) */}
            {/* @ts-ignore */}
            {JSON.parse(response.data)["21"]}
          </span>
        </div>
        <div>
          <p className="font-bold mb-3">Baulastträger</p>
          <LabeledRadiobuttonGroup
            scope={"operatorId"}
            items={operators.map((operator: Operator) => {
              return { value: String(operator.id), label: operator.title }
            })}
          />
        </div>
        <div>
          <p className="font-bold mb-3">Interne Notiz</p>
          <LabeledTextareaField name={"note"} label={""} />
        </div>
      </div>
    </EditableSurveyResponseFormWrapper>
  )
}

export default EditableSurveyResponseForm
