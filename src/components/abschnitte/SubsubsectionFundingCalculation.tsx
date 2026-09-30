import { Transition } from "@headlessui/react"
import { ArrowPathIcon, InformationCircleIcon } from "@heroicons/react/20/solid"
import { useRef, useState } from "react"
import { twJoin } from "tailwind-merge"
import { primaryButtonClassName } from "@/src/components/core/components/buttons/buttonStyles"
import {
  fieldLayoutControlClassName,
  fieldLayoutLabelClassName,
  fieldLayoutRootClassName,
} from "@/src/components/core/components/forms/fieldLayoutStyles"
import { useCoreAppFormContext } from "@/src/components/core/components/forms/hooks/formContext"
import { formattedEuro } from "@/src/components/core/components/text/formattedProperties"
import {
  calculateSuggestedFunding,
  costStructureFieldNames,
  deviatesFromCalculated,
  GRANT_RATE,
  hasEnteredValue,
  otherFundingFieldNames,
} from "@/src/shared/subsubsections/costAndFundingFields"
import { subsubsectionFieldTranslations } from "@/src/shared/subsubsections/subsubsectionFieldMappings"

export const FundingResultRow = ({ label, value }: { label: string; value: number | null }) => (
  <div
    className={twJoin(fieldLayoutRootClassName, "rounded-md bg-blue-50 px-3 py-2 sm:items-center")}
  >
    <p className={twJoin(fieldLayoutLabelClassName, "mb-0")}>{label}</p>
    <p className={twJoin(fieldLayoutControlClassName, "font-semibold sm:text-sm")}>
      {formattedEuro(value)}
    </p>
  </div>
)

const ManualBadge = () => (
  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-normal text-blue-700">
    <InformationCircleIcon className="size-3.5" aria-hidden />
    Manuell angepasst
  </span>
)

const CalculatedValue = ({ value, explanation }: { value: number; explanation: string }) => (
  <p className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-500">
    <ArrowPathIcon className="size-3.5" aria-hidden />
    Berechneter Wert: <strong className="text-gray-700">{formattedEuro(value)}</strong> (
    {explanation})
  </p>
)

const labelWithBadge = (label: string, isManual: boolean) => (
  <>
    {label} (optional)
    {isManual && (
      <>
        <br />
        <ManualBadge />
      </>
    )}
  </>
)

const calculationBasisFieldNames: readonly string[] = [
  ...costStructureFieldNames,
  ...otherFundingFieldNames,
]

type SuggestedFunding = NonNullable<ReturnType<typeof calculateSuggestedFunding>>
type FundingBaseline = SuggestedFunding | null

const isManualValue = (value: unknown, baselineValue: number | undefined) =>
  hasEnteredValue(value) &&
  (baselineValue === undefined || deviatesFromCalculated(value, baselineValue))

export const useFundingBaseline = (initialValues: Record<string, unknown>) => {
  const [baseline, setBaselineState] = useState<FundingBaseline>(() =>
    calculateSuggestedFunding(initialValues),
  )
  const baselineRef = useRef(baseline)
  const setBaseline = (next: FundingBaseline) => {
    baselineRef.current = next
    setBaselineState(next)
  }
  return { baseline, baselineRef, setBaseline }
}

type FundingFormApi = {
  state: { values: Record<string, unknown> }
  setFieldValue: (name: never, value: never) => void
}

export const recalculateFundingOnBasisBlur = (
  formApi: FundingFormApi,
  blurredField: string,
  {
    baselineRef,
    setBaseline,
  }: Pick<ReturnType<typeof useFundingBaseline>, "baselineRef" | "setBaseline">,
) => {
  if (!calculationBasisFieldNames.includes(blurredField)) return
  const values = formApi.state.values
  const baseline = baselineRef.current
  if (
    isManualValue(values.grantAmount, baseline?.grantAmount) ||
    isManualValue(values.ownFunds, baseline?.ownFunds)
  ) {
    return
  }
  const suggested = calculateSuggestedFunding(values)
  if (!suggested) return
  formApi.setFieldValue("grantAmount" as never, suggested.grantAmount as never)
  formApi.setFieldValue("ownFunds" as never, suggested.ownFunds as never)
  setBaseline(suggested)
}

type Props = {
  baseline: FundingBaseline
  onApply: (suggested: SuggestedFunding) => void
}

/**
 * Zuwendung and Eigenmittel stay editable. A value changed by hand is marked "Manuell angepasst"
 * (not as an error), and the notice offers the calculated values until they are applied.
 */
export const SubsubsectionFundingCalculation = ({ baseline, onApply }: Props) => {
  const form = useCoreAppFormContext()

  return (
    <form.Subscribe
      selector={(state) => ({
        grantAmount: state.values.grantAmount as unknown,
        ownFunds: state.values.ownFunds as unknown,
        suggested: calculateSuggestedFunding(state.values),
      })}
    >
      {({ grantAmount, ownFunds, suggested }) => {
        const hasCalculation = suggested !== null
        const grantIsManual = hasCalculation && isManualValue(grantAmount, baseline?.grantAmount)
        const ownFundsIsManual = hasCalculation && isManualValue(ownFunds, baseline?.ownFunds)
        const showNotice = grantIsManual || ownFundsIsManual

        return (
          <>
            <Transition show={showNotice}>
              <div className="mb-0 grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity,transform] duration-200 ease-out data-closed:-translate-y-1 data-closed:grid-rows-[0fr] data-closed:opacity-0 motion-reduce:transition-none">
                <div className="min-h-0 overflow-hidden">
                  <div className="pb-6">
                    {suggested && (
                      <div className="flex flex-col gap-3 rounded-md bg-amber-50 p-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1 text-sm text-amber-900">
                          <p className="flex items-center gap-1.5 font-semibold">
                            <InformationCircleIcon className="size-4" aria-hidden />
                            Berechnungsgrundlage geändert
                          </p>
                          <p>
                            Zuwendung oder Eigenmittel wurden manuell angepasst.
                            <br />
                            Die aktuellen Werte bleiben erhalten und können weiterhin manuell
                            angepasst werden.
                          </p>
                          <p className="flex flex-wrap gap-2 pt-1">
                            <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs">
                              Zuwendung (Vorschlag):{" "}
                              <strong>{formattedEuro(suggested.grantAmount)}</strong>
                            </span>
                            <span className="rounded-sm bg-amber-100 px-2 py-0.5 text-xs">
                              Eigenmittel (Vorschlag):{" "}
                              <strong>{formattedEuro(suggested.ownFunds)}</strong>
                            </span>
                          </p>
                        </div>
                        <button
                          type="button"
                          className={twJoin(primaryButtonClassName, "shrink-0")}
                          onClick={() => {
                            form.setFieldValue("grantAmount", suggested.grantAmount)
                            form.setFieldValue("ownFunds", suggested.ownFunds)
                            onApply(suggested)
                          }}
                        >
                          Berechnete Werte übernehmen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Transition>
            <form.AppField name="grantAmount">
              {(field) => (
                <field.NumberField
                  inlineLeadingAddon="€"
                  label={labelWithBadge(subsubsectionFieldTranslations.grantAmount, grantIsManual)}
                  note={
                    <>
                      {grantIsManual && suggested && (
                        <CalculatedValue
                          value={suggested.grantAmount}
                          explanation={`${Math.round(GRANT_RATE * 100)} % der zuwendungsfähigen Ausgaben`}
                        />
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        {Math.round(GRANT_RATE * 100)} % der zuwendungsfähigen Ausgaben (Summe
                        Kostenstruktur abzüglich nicht zuwendungsfähiger Ausgaben, anderer
                        Förderprogramme, Erlöse und Beiträge Dritter).
                      </p>
                    </>
                  }
                />
              )}
            </form.AppField>
            <form.AppField name="ownFunds">
              {(field) => (
                <field.NumberField
                  inlineLeadingAddon="€"
                  label={labelWithBadge(subsubsectionFieldTranslations.ownFunds, ownFundsIsManual)}
                  note={
                    ownFundsIsManual && suggested ? (
                      <CalculatedValue
                        value={suggested.ownFunds}
                        explanation="Kostenstruktur abzgl. Zuwendung und Finanzierungen"
                      />
                    ) : undefined
                  }
                />
              )}
            </form.AppField>
          </>
        )
      }}
    </form.Subscribe>
  )
}
