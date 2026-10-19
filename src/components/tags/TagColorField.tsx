import { Radio, RadioGroup } from "@headlessui/react"
import { twJoin } from "tailwind-merge"
import { FieldLayout } from "@/src/components/core/components/forms/FieldLayout"
import { useFieldContext } from "@/src/components/core/components/forms/hooks/formContext"
import { TAG_COLORS, type TagColor, tagColors } from "./tagColors"

export function TagColorField({ label = "Farbe" }: { label?: string }) {
  const field = useFieldContext<TagColor>()

  return (
    <FieldLayout label={label} errors={field.state.meta.errors}>
      <RadioGroup
        value={field.state.value}
        onChange={field.handleChange}
        aria-label={label}
        className="flex flex-wrap gap-3"
      >
        {TAG_COLORS.map((color) => (
          <Radio
            key={color}
            value={color}
            aria-label={tagColors[color].label}
            title={tagColors[color].label}
            className={twJoin(
              "size-10 cursor-pointer rounded-lg border-2 border-transparent focus:outline-hidden data-checked:border-gray-900 data-focus:ring-2 data-focus:ring-blue-500 data-focus:ring-offset-2",
              tagColors[color].swatch,
            )}
          />
        ))}
      </RadioGroup>
    </FieldLayout>
  )
}
