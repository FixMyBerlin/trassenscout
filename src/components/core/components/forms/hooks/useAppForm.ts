import { createFormHook } from "@tanstack/react-form"
import { Checkbox } from "@/src/components/core/components/forms/fields/Checkbox"
import { CheckboxGroup } from "@/src/components/core/components/forms/fields/CheckboxGroup"
import { Combobox } from "@/src/components/core/components/forms/fields/Combobox"
import { GeometryField } from "@/src/components/core/components/forms/fields/GeometryField"
import { GeometryFieldPreview } from "@/src/components/core/components/forms/fields/GeometryFieldPreview"
import { HiddenField } from "@/src/components/core/components/forms/fields/HiddenField"
import { MultiCheckbox } from "@/src/components/core/components/forms/fields/MultiCheckbox"
import { NumberField } from "@/src/components/core/components/forms/fields/NumberField"
import { Radiobutton } from "@/src/components/core/components/forms/fields/Radiobutton"
import { RadiobuttonGroup } from "@/src/components/core/components/forms/fields/RadiobuttonGroup"
import { SelectField } from "@/src/components/core/components/forms/fields/SelectField"
import { SubmitButton } from "@/src/components/core/components/forms/fields/SubmitButton"
import { Switch } from "@/src/components/core/components/forms/fields/Switch"
import { TextareaField } from "@/src/components/core/components/forms/fields/TextareaField"
import { TextField } from "@/src/components/core/components/forms/fields/TextField"
import { TextFieldCalculateLength } from "@/src/components/core/components/forms/fields/TextFieldCalculateLength"
import { fieldContext, formContext } from "./formContext"

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    TextareaField,
    SelectField,
    Checkbox,
    CheckboxGroup,
    Radiobutton,
    RadiobuttonGroup,
    Switch,
    Combobox,
    MultiCheckbox,
    HiddenField,
    TextFieldCalculateLength,
    GeometryField,
    GeometryFieldPreview,
  },
  formComponents: {
    SubmitButton,
  },
})
