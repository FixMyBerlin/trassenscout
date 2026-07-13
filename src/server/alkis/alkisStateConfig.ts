/**
 * ALKIS state configuration (types + data + helpers). Narrative docs: `./README.md`.
 */

import { StateKeyEnum } from "@/src/prisma/generated/browser"
import { alkisStateConfig } from "./alkisStateConfig.data"

export { alkisStateConfig }

export function getBundeslandSelectOptions(): Array<[StateKeyEnum, string, boolean]> {
  const keys = Object.keys(alkisStateConfig) as StateKeyEnum[]
  const rows = keys.map((key) => {
    const entry = alkisStateConfig[key]
    const disabled = key === StateKeyEnum.DISABLED ? false : !entry.enabled
    let label = entry.label
    if (key === StateKeyEnum.BAYERN) {
      label = `${entry.label} (ALKIS-Hintergrund nicht verfügbar)`
    } else if (key === StateKeyEnum.DISABLED) {
      label = "Keine Auswahl"
    } else if (disabled) {
      label = `${entry.label} (nicht verfügbar)`
    }
    return { key, label, disabled }
  })

  const defaultOption = rows.find((row) => row.key === StateKeyEnum.DISABLED)
  const stateRows = rows.filter((row) => row.key !== StateKeyEnum.DISABLED)
  stateRows.sort((a, b) => a.label.localeCompare(b.label, "de"))

  if (!defaultOption) {
    return stateRows.map(
      (row) => [row.key, row.label, row.disabled] as [StateKeyEnum, string, boolean],
    )
  }

  return [
    [defaultOption.key, defaultOption.label, defaultOption.disabled] as [
      StateKeyEnum,
      string,
      boolean,
    ],
    ...stateRows.map(
      (row) => [row.key, row.label, row.disabled] as [StateKeyEnum, string, boolean],
    ),
  ]
}
