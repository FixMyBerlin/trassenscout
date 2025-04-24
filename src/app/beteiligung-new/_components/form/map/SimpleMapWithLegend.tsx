import { FieldError } from "@/src/app/beteiligung-new/_components/form/FieldErrror"
import { SurveyMapLegend } from "@/src/app/beteiligung-new/_components/form/map/MapLegend"
import { SurveySimpleMap } from "@/src/app/beteiligung-new/_components/form/map/SimpleMap"
import { formClasses } from "@/src/app/beteiligung-new/_components/form/styles"
import { useFieldContext } from "@/src/app/beteiligung-new/_shared/hooks/form-context"
import clsx from "clsx"
import { ComponentProps } from "react"
import { MapProvider } from "react-map-gl/maplibre"

type Props = {
  label: string
  description?: string
  mapProps: ComponentProps<typeof SurveySimpleMap>
  legendProps: ComponentProps<typeof SurveyMapLegend>
}

// tbd like this we lose the state of ismap if we go to another page AND we want to keeop the marker position until the form is submitted but not store it if isMap was set false
// tbd: isLocation causes any problems as a field (type)? should we delete it or could we simply keep it for now?
// move isMap - make it a field and delete on submit to keep the state (as in old version)
// in config: make sure that part2 has all necessary properties (location, description, etc)
// tbd: is surveypart2 too different to use SurveyPart.tsx?

export const SurveySimpleMapWithLegend = ({ mapProps, legendProps, label, description }: Props) => {
  const field = useFieldContext<object>()
  const hasError = field.state.meta.errors.length > 0

  return (
    <MapProvider>
      <div
        className={clsx(
          "m-2 mb-24 w-full p-2",
          hasError && "rounded bg-red-50",
          // className,
        )}
      >
        <p className={formClasses.fieldLabel}>{label}</p>
        {description && (
          <p className={formClasses.fieldDescription} id={`${field.name}-hint`}>
            {description}
          </p>
        )}
        <SurveySimpleMap {...mapProps} />
        <SurveyMapLegend {...legendProps} />
        <FieldError field={field} />
      </div>
    </MapProvider>
  )
}

// ;<div className="mx-auto w-full max-w-md">
//   <p className={formClasses.fieldLabel}>{radioButtons.label}</p>
//   {radioButtons.description && (
//     <p className={formClasses.fieldDescription} id={`isMap-hint`}>
//       {radioButtons.description}
//     </p>
//   )}
//   <div className={clsx("w-full")}>
//     <div className="mx-auto w-full max-w-md">
//       <RadioGroup value={isMap} onChange={setIsMap} aria-label={radioButtons.label}>
//         {[
//           { label: radioButtons.yesLabel, value: true },
//           { label: radioButtons.noLabel, value: false },
//         ].map((option, i) => (
//           <Radio
//             key={i}
//             id="isMap"
//             value={option.value}
//             className="group flex w-full items-start hover:cursor-pointer"
//           >
//             <div className="flex h-full min-h-[2.5rem] items-center">
//               <div
//                 className={clsx(
//                   "relative h-4 w-4 cursor-pointer rounded-full border border-gray-300 focus:ring-0 group-hover:border-gray-400",
//                 )}
//               />
//               <span className="absolute m-[2px] size-4 h-3 w-3 rounded-full border-4 border-[var(--survey-primary-color)] opacity-0 transition group-data-[checked]:opacity-100" />
//             </div>
//             <div className={formClasses.labelItemWrapper}>
//               <p className={clsx(formClasses.fieldItemLabel)}>{option.label}</p>
//             </div>
//           </Radio>
//         ))}
//       </RadioGroup>
//     </div>
//   </div>
// </div>
