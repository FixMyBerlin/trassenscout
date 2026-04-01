import { StateKeyEnum } from "@prisma/client"

export type AlkisBackgroundConfigEntry = {
  label: string
  enabled: boolean
  wmsUrl?: string
  layerName?: string
  /** Spreadsheet column “WFS-URL” (provenance: see `alkisStateConfig` block comment). */
  wfsUrl?: string
  /** WFS feature type / layer id; spreadsheet column “Attributname Flurstücksnummer”. */
  parcelPropertyKey?: string
  projection?: "EPSG:25832" | "EPSG:25833"
  attribution?: string
}

/**
 * Per-state ALKIS metadata for background maps.
 *
 * WFS fields (`wfsUrl`, `parcelPropertyKey`, `projection`) were copied from:
 * https://docs.google.com/spreadsheets/d/1USAB2nfLRXzN9HHuqrUo-H3pdiR44wvA5KXUaUnLm0E/edit?gid=0#gid=0
 * — original plugin: https://www.flurstueckssuche.de/files/Flurstuecksuche_de.zip (Flurstücksuche).
 * Column mapping: “WFS-URL” → `wfsUrl`, “Attributname Flurstücksnummer” → `parcelPropertyKey`,
 * “Projektion” → `projection`.
 *
 * Uncomment `wmsUrl` / `layerName` where marked TODO when WMS endpoints are verified.
 */
export const alkisStateConfig: Record<StateKeyEnum, AlkisBackgroundConfigEntry> = {
  BADEN_WUERTTEMBERG: {
    label: "Baden-Württemberg",
    enabled: true,
    wfsUrl: "https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS",
    parcelPropertyKey: "nora:v_al_flurstueck",
    projection: "EPSG:25832",
  },
  BAYERN: {
    label: "Bayern",
    enabled: false,
  },
  BERLIN: {
    label: "Berlin",
    enabled: true,
    // TODO: verify WMS URL and layer name
    // wmsUrl: "https://gdi.berlin.de/services/wms/alkis",
    // layerName: "a_alkis_raster",
    wfsUrl: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
    parcelPropertyKey: "alkis_flurstuecke:flurstuecke",
    projection: "EPSG:25833",
    attribution: "© Geoportal Berlin / ALKIS",
  },
  BRANDENBURG: {
    label: "Brandenburg",
    enabled: true,
    wfsUrl: "https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
  },
  BREMEN: {
    label: "Bremen",
    enabled: true,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf",
    parcelPropertyKey: "adv:AX_Flurstueck",
    projection: "EPSG:25832",
  },
  HAMBURG: {
    label: "Hamburg",
    enabled: true,
    wfsUrl: "https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  HESSEN: {
    label: "Hessen",
    enabled: true,
    wfsUrl: "https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  MECKLENBURG_VORPOMMERN: {
    label: "Mecklenburg-Vorpommern",
    enabled: true,
    // TODO: verify WMS URL and layer name
    // wmsUrl: "https://www.geodaten-mv.de/dienste/alkis_wms",
    // layerName:
    //   "adv_alkis_flurstuecke,adv_alkis_gebaeude,adv_alkis_verkehr,adv_alkis_tatsaechliche_nutzung",
    wfsUrl: "https://www.geodaten-mv.de/dienste/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
    attribution: "© GeoPortal MV / ALKIS",
  },
  NIEDERSACHSEN: {
    label: "Niedersachsen",
    enabled: true,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  NORDRHEIN_WESTFALEN: {
    label: "Nordrhein-Westfalen",
    enabled: true,
    // TODO: verify WMS URL and layer name
    // wmsUrl: "https://www.wms.nrw.de/geobasis/wms_nw_alkis",
    // layerName:
    //   "adv_alkis_flurstuecke,adv_alkis_gebaeude,adv_alkis_verkehr,adv_alkis_tatsaechliche_nutzung",
    wfsUrl: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: "© Geobasis NRW / ALKIS",
  },
  RHEINLAND_PFALZ: {
    label: "Rheinland-Pfalz",
    enabled: true,
    wfsUrl: "https://www.geoportal.rlp.de/registry/wfs/519",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  SAARLAND: {
    label: "Saarland",
    enabled: true,
    wfsUrl: "https://geoportal.saarland.de/registry/wfs/414",
    parcelPropertyKey: "ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck",
    projection: "EPSG:25832",
  },
  SACHSEN: {
    label: "Sachsen",
    enabled: true,
    wfsUrl: "https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
  },
  SACHSEN_ANHALT: {
    label: "Sachsen-Anhalt",
    enabled: true,
    wfsUrl:
      "https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  SCHLESWIG_HOLSTEIN: {
    label: "Schleswig-Holstein",
    enabled: true,
    wfsUrl: "https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS",
    parcelPropertyKey: "cp:CadastralParcel",
    projection: "EPSG:25832",
  },
  THUERINGEN: {
    label: "Thüringen",
    enabled: true,
    wfsUrl: "https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
  },
  DISABLED: {
    label: "Keine Auswahl",
    enabled: false,
  },
}

export function isAlkisBackgroundAvailableForProject(
  alkisStateKey: StateKeyEnum | null | undefined,
): boolean {
  if (alkisStateKey == null) return false
  const entry = alkisStateConfig[alkisStateKey]
  if (entry.enabled !== true) return false
  const hasWms = Boolean(entry.wmsUrl?.trim() && entry.layerName?.trim())
  const hasWfs = Boolean(entry.wfsUrl?.trim() && entry.parcelPropertyKey?.trim())
  return hasWms || hasWfs
}

/** Options for project state select: `[value, label, disabled?]`. */
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
