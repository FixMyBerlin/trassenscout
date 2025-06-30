import { SurveyCheckbox } from "@/src/app/beteiligung/_components/form/Checkbox"
import { SurveyCheckboxGroup } from "@/src/app/beteiligung/_components/form/CheckboxGroup"
import { SurveyGeoCategoryMapWithLegend } from "@/src/app/beteiligung/_components/form/map/GeoCategoryMapWithLegend"
import { SurveySimpleMapWithLegend } from "@/src/app/beteiligung/_components/form/map/SimpleMapWithLegend"
import { SurveyPageTitle } from "@/src/app/beteiligung/_components/form/PageTitle"
import { SurveyRadiobuttonGroup } from "@/src/app/beteiligung/_components/form/RadiobuttonGroup"
import { SurveySelect } from "@/src/app/beteiligung/_components/form/Select"
import { SubscribeButton } from "@/src/app/beteiligung/_components/form/SubscribeButton"
import { SurveyTextarea } from "@/src/app/beteiligung/_components/form/Textarea"
import { SurveyTextfield } from "@/src/app/beteiligung/_components/form/Textfield"
import { SurveyMarkdown } from "@/src/app/beteiligung/_components/layout/SurveyMarkdown"

import { fieldContext, formContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { createFormHook } from "@tanstack/react-form"

export const { useAppForm } = createFormHook({
  fieldComponents: {
    SurveyTextfield,
    SurveyTextarea,
    SurveyCheckbox,
    SurveyCheckboxGroup,
    SurveyRadiobuttonGroup,
    SurveySelect,
    SurveySimpleMapWithLegend,
    SurveyGeoCategoryMapWithLegend,
    SurveyMarkdown,
    SurveyPageTitle,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
