import { SurveyCheckbox } from "@/src/app/beteiligung/_components/form/Checkbox"
import { SurveyCheckboxGroup } from "@/src/app/beteiligung/_components/form/CheckboxGroup"
import { SurveyGeoCategoryMapWithLegend } from "@/src/app/beteiligung/_components/form/map/GeoCategoryMapWithLegend"
import { SurveySimpleMapWithLegend } from "@/src/app/beteiligung/_components/form/map/SimpleMapWithLegend"
import { SwitchableMapWithLegend } from "@/src/app/beteiligung/_components/form/map/SwitchableMapWithLegend"
import { SurveyNumberfield } from "@/src/app/beteiligung/_components/form/Numberfield"
import { SurveyPageTitle } from "@/src/app/beteiligung/_components/form/PageTitle"
import { SurveyRadiobuttonGroup } from "@/src/app/beteiligung/_components/form/RadiobuttonGroup"
import { SurveyReadonlyTextfield } from "@/src/app/beteiligung/_components/form/ReadOnlyTextfield"
import { SurveyResponseIdField } from "@/src/app/beteiligung/_components/form/ResponseIdField"
import { SurveySelect } from "@/src/app/beteiligung/_components/form/Select"
import { SubscribeButton } from "@/src/app/beteiligung/_components/form/SubscribeButton"
import { SurveyTextarea } from "@/src/app/beteiligung/_components/form/Textarea"
import { SurveyTextfield } from "@/src/app/beteiligung/_components/form/Textfield"
import { SurveyUploadField } from "@/src/app/beteiligung/_components/form/UploadField"
import { SurveyVorgangsIdField } from "@/src/app/beteiligung/_components/form/VorgangsIdField"
import { SurveyMarkdown } from "@/src/app/beteiligung/_components/layout/SurveyMarkdown"

import { fieldContext, formContext } from "@/src/app/beteiligung/_shared/hooks/form-context"
import { createFormHook } from "@tanstack/react-form"

export const { useAppForm } = createFormHook({
  fieldComponents: {
    SurveyTextfield,
    SurveyReadonlyTextfield,
    SurveyResponseIdField,
    SurveyVorgangsIdField,
    SurveyTextarea,
    SurveyNumberfield,
    SurveyCheckbox,
    SurveyCheckboxGroup,
    SurveyRadiobuttonGroup,
    SurveySelect,
    SurveySimpleMapWithLegend,
    SurveyGeoCategoryMapWithLegend,
    SwitchableMapWithLegend,
    SurveyMarkdown,
    SurveyPageTitle,
    SurveyUploadField,
  },
  formComponents: {
    SubscribeButton,
  },
  fieldContext,
  formContext,
})
