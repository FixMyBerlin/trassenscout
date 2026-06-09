import { Checkbox } from "@/src/core/components/forms/fields/Checkbox"
import { CheckboxGroup } from "@/src/core/components/forms/fields/CheckboxGroup"
import { Combobox } from "@/src/core/components/forms/fields/Combobox"
import { GeometryField } from "@/src/core/components/forms/fields/GeometryField"
import { GeometryFieldPreview } from "@/src/core/components/forms/fields/GeometryFieldPreview"
import { HiddenField } from "@/src/core/components/forms/fields/HiddenField"
import { MultiCheckbox } from "@/src/core/components/forms/fields/MultiCheckbox"
import { NumberField } from "@/src/core/components/forms/fields/NumberField"
import { Radiobutton } from "@/src/core/components/forms/fields/Radiobutton"
import { RadiobuttonGroup } from "@/src/core/components/forms/fields/RadiobuttonGroup"
import { SelectField } from "@/src/core/components/forms/fields/SelectField"
import { SubmitButton } from "@/src/core/components/forms/fields/SubmitButton"
import { Switch } from "@/src/core/components/forms/fields/Switch"
import { TextField } from "@/src/core/components/forms/fields/TextField"
import { TextFieldCalculateLength } from "@/src/core/components/forms/fields/TextFieldCalculateLength"
import { TextareaField } from "@/src/core/components/forms/fields/TextareaField"
import { createFormHook } from "@tanstack/react-form"
import { fieldContext, formContext } from "./formContext"

export const { useAppForm, withForm, withFieldGroup } = createFormHook({
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
