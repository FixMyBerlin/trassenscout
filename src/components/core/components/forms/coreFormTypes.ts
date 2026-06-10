import type { AppFieldExtendedReactFormApi } from "@tanstack/react-form"
import type { Checkbox } from "@/src/components/core/components/forms/fields/Checkbox"
import type { CheckboxGroup } from "@/src/components/core/components/forms/fields/CheckboxGroup"
import type { Combobox } from "@/src/components/core/components/forms/fields/Combobox"
import type { GeometryField } from "@/src/components/core/components/forms/fields/GeometryField"
import type { GeometryFieldPreview } from "@/src/components/core/components/forms/fields/GeometryFieldPreview"
import type { HiddenField } from "@/src/components/core/components/forms/fields/HiddenField"
import type { MultiCheckbox } from "@/src/components/core/components/forms/fields/MultiCheckbox"
import type { NumberField } from "@/src/components/core/components/forms/fields/NumberField"
import type { Radiobutton } from "@/src/components/core/components/forms/fields/Radiobutton"
import type { RadiobuttonGroup } from "@/src/components/core/components/forms/fields/RadiobuttonGroup"
import type { SelectField } from "@/src/components/core/components/forms/fields/SelectField"
import type { SubmitButton } from "@/src/components/core/components/forms/fields/SubmitButton"
import type { Switch } from "@/src/components/core/components/forms/fields/Switch"
import type { TextareaField } from "@/src/components/core/components/forms/fields/TextareaField"
import type { TextField } from "@/src/components/core/components/forms/fields/TextField"
import type { TextFieldCalculateLength } from "@/src/components/core/components/forms/fields/TextFieldCalculateLength"

type CoreFieldComponents = {
  TextField: typeof TextField
  NumberField: typeof NumberField
  TextareaField: typeof TextareaField
  SelectField: typeof SelectField
  Checkbox: typeof Checkbox
  CheckboxGroup: typeof CheckboxGroup
  Radiobutton: typeof Radiobutton
  RadiobuttonGroup: typeof RadiobuttonGroup
  Switch: typeof Switch
  Combobox: typeof Combobox
  MultiCheckbox: typeof MultiCheckbox
  HiddenField: typeof HiddenField
  TextFieldCalculateLength: typeof TextFieldCalculateLength
  GeometryField: typeof GeometryField
  GeometryFieldPreview: typeof GeometryFieldPreview
}

type CoreFormComponents = {
  SubmitButton: typeof SubmitButton
}

export type CoreAppFormApi<TFormData> = AppFieldExtendedReactFormApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  unknown,
  CoreFieldComponents,
  CoreFormComponents
>
