import { AllowedSurveySlugs } from "@/src/app/beteiligung-neu/_shared/utils/allowedSurveySlugs"
import { TSingleOrMultiResponseProps } from "../../survey-public/components/types"

export const getSurveyMapProps = (
  options: TSingleOrMultiResponseProps["responses"],
  slug: AllowedSurveySlugs,
) => {
  // todo
  // return
  // isLegacy
  //   ? feedbackDefinition?.pages
  //       .find((page) => page.questions?.some((question) => question.id === locationId))
  //       ?.questions?.find((q) => q.id === locationId)?.props
  //   : feedbackDefinition?.pages
  //       .find((page) => page.fields.some((field) => field.name === "location"))
  //       ?.fields.find((q) => q.name === locationId)!.props
}
