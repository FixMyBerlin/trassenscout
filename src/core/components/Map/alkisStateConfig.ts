import { StateKeyEnum } from "@prisma/client"

export type AlkisBackgroundConfigEntry = {
  label: string
  enabled: boolean
  wmsUrl: string | null
  layerName: string | null
  /** Spreadsheet column “WFS-URL” (provenance: see `alkisStateConfig` block comment). */
  wfsUrl: string | null
  /** WFS feature type / layer id; spreadsheet column “Attributname Flurstücksnummer”. */
  parcelPropertyKey: string | null
  attribution: string | null
  // WFS pojection - verified by current manual GetFeature tests (see conversation history).
  projection: "EPSG:25832" | "EPSG:25833" | null
  /**
   * If set, WFS can return GeoJSON directly (no ogr2ogr).
   * TODO(ALKIS-WFS): Null currently means "request default GML 3.2.1 + ogr2ogr", but not all
   * state services expose that; extend config when a state needs a different OUTPUTFORMAT or pipeline.
   */
  jsonOutputFormat: string | null
  /** Whether GetFeature accepts SRSNAME=EPSG:4326 in the BBOX. If false, BBOX reprojection is required (not implemented yet). */
  supports4326: boolean
  /**
   * BBOX axis order for EPSG:4326 requests.
   * WFS 2.0 spec says lat,lon but many GeoServer instances use lon,lat.
   * Verified per state via manual GetFeature tests (see conversation history).
   */
  bboxAxisOrder: "lonlat" | "latlon"
}

/**
 * Per-state ALKIS metadata for background maps.
 *
 * WFS fields (`wfsUrl`, `parcelPropertyKey`) were copied from:
 * https://docs.google.com/spreadsheets/d/1USAB2nfLRXzN9HHuqrUo-H3pdiR44wvA5KXUaUnLm0E/edit?gid=0#gid=0
 * — original plugin: https://www.flurstueckssuche.de/files/Flurstuecksuche_de.zip (Flurstücksuche).
 * Column mapping: “WFS-URL” → `wfsUrl`, “Attributname Flurstücksnummer” → `parcelPropertyKey`.
 *
 * Uncomment `wmsUrl` / `layerName` where marked TODO when WMS endpoints are verified.
 */
export const alkisStateConfig: Record<StateKeyEnum, AlkisBackgroundConfigEntry> = {
  BADEN_WUERTTEMBERG: {
    label: "Baden-Württemberg",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS",
    parcelPropertyKey: "nora:v_al_flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: "application/json",
    supports4326: true,
    bboxAxisOrder: "lonlat",
  },
  BAYERN: {
    label: "Bayern",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: null,
    parcelPropertyKey: null,
    projection: null,
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  BERLIN: {
    label: "Berlin",
    enabled: true,
    wmsUrl: null,
    layerName: "a_alkis_raster",
    wfsUrl: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
    parcelPropertyKey: "alkis_flurstuecke:flurstuecke",
    projection: "EPSG:25833",
    attribution: "© Geoportal Berlin / ALKIS",
    jsonOutputFormat: "application/json",
    supports4326: true,
    bboxAxisOrder: "lonlat",
  },
  BRANDENBURG: {
    label: "Brandenburg",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  BREMEN: {
    label: "Bremen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf",
    parcelPropertyKey: "adv:AX_Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  HAMBURG: {
    label: "Hamburg",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "lonlat",
  },
  HESSEN: {
    label: "Hessen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  MECKLENBURG_VORPOMMERN: {
    label: "Mecklenburg-Vorpommern",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geodaten-mv.de/dienste/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
    attribution: "© GeoPortal MV / ALKIS",
    jsonOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
  },
  NIEDERSACHSEN: {
    label: "Niedersachsen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  NORDRHEIN_WESTFALEN: {
    label: "Nordrhein-Westfalen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: "© Geobasis NRW / ALKIS",
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  RHEINLAND_PFALZ: {
    label: "Rheinland-Pfalz",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geoportal.rlp.de/registry/wfs/519",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: "application/json; subtype=geojson",
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  SAARLAND: {
    label: "Saarland",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geoportal.saarland.de/registry/wfs/414",
    parcelPropertyKey: "ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  SACHSEN: {
    label: "Sachsen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25833",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
  },
  SACHSEN_ANHALT: {
    label: "Sachsen-Anhalt",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl:
      "https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  SCHLESWIG_HOLSTEIN: {
    label: "Schleswig-Holstein",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS",
    parcelPropertyKey: "cp:CadastralParcel",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
  },
  THUERINGEN: {
    label: "Thüringen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    projection: "EPSG:25832",
    attribution: null,
    jsonOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
  },
  DISABLED: {
    label: "Keine Auswahl",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: null,
    parcelPropertyKey: null,
    projection: null,
    attribution: null,
    jsonOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
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
