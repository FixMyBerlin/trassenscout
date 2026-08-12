import { twJoin } from "tailwind-merge"

/** Visual radio indicator for Headless UI `Radio` (expects `group` + `group-data-checked`). */
export function SurveyRadioIndicator() {
  return (
    <span
      aria-hidden="true"
      className={twJoin(
        "flex size-4 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white transition-colors",
        "group-hover:border-gray-400",
        "group-data-checked:border-(--survey-primary-color) group-data-checked:bg-(--survey-primary-color)",
      )}
    >
      <span className="invisible size-1.5 rounded-full bg-white group-data-checked:visible" />
    </span>
  )
}
