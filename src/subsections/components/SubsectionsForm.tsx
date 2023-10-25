import { Suspense } from "react"
import { Spinner } from "src/core/components/Spinner"
import { Form, FormProps, LabeledTextField } from "src/core/components/forms"
import { z } from "zod"
export { FORM_ERROR } from "src/core/components/forms"

type Props<S extends z.ZodType<any, any>> = FormProps<S>

function SubsectionsFormWithQuery<S extends z.ZodType<any, any>>(props: Props<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField
        type="text"
        name="prefix"
        label="Präfix"
        help="Präfix für die Namen aller im Bulk-Mode erstellten Planungsabschnitte. Ergebnis: Präfix-[Nummer]"
      />
      <LabeledTextField
        type="number"
        step="1"
        name="no"
        label="Anzahl"
        help="Anzahl der im Bulk-Mode erstellten Planungsabschnitte."
      />
    </Form>
  )
}

export function SubsectionsForm<S extends z.ZodType<any, any>>(props: Props<S>) {
  return (
    <Suspense fallback={<Spinner />}>
      <SubsectionsFormWithQuery {...props} />
    </Suspense>
  )
}
