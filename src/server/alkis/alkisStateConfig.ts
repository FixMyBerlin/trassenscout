/**
 * ALKIS state configuration (types + data + helpers). Narrative docs: `./README.md`.
 */

import { StateKeyEnum } from "@prisma/client"

export type {
  AlkisStateConfigEntry,
  AlkisWfsConfig,
  AlkisWfsDisabled,
  AlkisWfsEnabled,
  AlkisWmsConfig,
} from "./alkisStateConfig.types"

import { alkisStateConfig } from "./alkisStateConfig.data"

export { alkisStateConfig }

export function isAlkisBackgroundAvailableForProject(
  alkisStateKey: StateKeyEnum | null | undefined,
) {
  if (alkisStateKey == null) return false
  const entry = alkisStateConfig[alkisStateKey]
  if (entry.enabled !== true) return false
  const hasWms =
    entry.wms.url !== false && Boolean(entry.wms.url.trim() && entry.wms.layerName.trim())
  const hasWfs =
    entry.wfs.url !== false && Boolean(entry.wfs.url.trim() && entry.wfs.parcelPropertyKey.trim())
  return hasWms || hasWfs
}

export function isAlkisWfsAvailableForProject(alkisStateKey: StateKeyEnum | null | undefined) {
  return isAlkisBackgroundAvailableForProject(alkisStateKey)
}

export function getAlkisAttributionForState(alkisStateKey: StateKeyEnum | null | undefined) {
  if (alkisStateKey == null) return null
  return alkisStateConfig[alkisStateKey].attribution
}

export function getBundeslandSelectOptions() {
  const keys = Object.keys(alkisStateConfig) as StateKeyEnum[]
  const rows = keys.map((key) => {
    const entry = alkisStateConfig[key]
    const disabled = !entry.enabled || key === StateKeyEnum.DISABLED
    let label = entry.label
    if (key === StateKeyEnum.BAYERN) {
      label = `${entry.label} (ALKIS-Hintergrund nicht verfügbar)`
    } else if (key === StateKeyEnum.DISABLED) {
      label = entry.label
    } else if (disabled) {
      label = `${entry.label} (nicht verfügbar)`
    }
    return { key, label, disabled }
  })
  rows.sort((a, b) => a.label.localeCompare(b.label, "de"))
  return [...rows.map((r): [StateKeyEnum, string, boolean] => [r.key, r.label, r.disabled])]
}
