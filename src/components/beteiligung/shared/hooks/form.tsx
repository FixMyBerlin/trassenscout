import { createFormHook } from "@tanstack/react-form"
import { SurveyCheckbox } from "@/src/components/beteiligung/form/Checkbox"
import { SurveyCheckboxGroup } from "@/src/components/beteiligung/form/CheckboxGroup"
import { SurveyGeoCategoryMapWithLegend } from "@/src/components/beteiligung/form/map/GeoCategoryMapWithLegend"
import { SurveySimpleMapWithLegend } from "@/src/components/beteiligung/form/map/SimpleMapWithLegend"
import { SwitchableMapWithLegend } from "@/src/components/beteiligung/form/map/SwitchableMapWithLegend"
import { SurveyNumberfield } from "@/src/components/beteiligung/form/Numberfield"
import { SurveyPageTitle } from "@/src/components/beteiligung/form/PageTitle"
import { SurveyRadiobuttonGroup } from "@/src/components/beteiligung/form/RadiobuttonGroup"
import { SurveyReadonlyTextfield } from "@/src/components/beteiligung/form/ReadOnlyTextfield"
import { SurveyResponseIdField } from "@/src/components/beteiligung/form/ResponseIdField"
import { SurveySelect } from "@/src/components/beteiligung/form/Select"
import { SubscribeButton } from "@/src/components/beteiligung/form/SubscribeButton"
import { SurveyUploadField } from "@/src/components/beteiligung/form/SurveyUploadField"
import { SurveyTextarea } from "@/src/components/beteiligung/form/Textarea"
import { SurveyTextfield } from "@/src/components/beteiligung/form/Textfield"
import { SurveyVorgangsIdField } from "@/src/components/beteiligung/form/VorgangsIdField"
import { SurveyMarkdown } from "@/src/components/beteiligung/layout/SurveyMarkdown"
import { fieldContext, formContext } from "@/src/components/beteiligung/shared/hooks/form-context"

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
