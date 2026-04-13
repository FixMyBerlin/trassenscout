import { StateKeyEnum } from "@prisma/client"

// for now, we only support the following states (set enabled:true manually):
// - Baden-Württemberg
// - Berlin
// - Brandenburg
// - Hessen
// - Nordrhein-Westfalen

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  wmsUrl: string | null
  layerName: string | null
  wfsUrl: string | null
  parcelPropertyKey: string | null
  alkisParcelIdPropertyKey: string | null
  attribution: string | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  projection: "EPSG:25832" | "EPSG:25833" | null
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
  wfsSupportsJson: boolean
}

/**
 * Auto-generated via `bun scripts/alkis-wfs/update-config.ts`.
 * Source data: `scripts/alkis-wfs/results/audit-results.json`.
 * Generated at: 2026-04-13T10:02:23.342Z
 */
export const alkisStateConfig: Record<StateKeyEnum, AlkisStateConfigEntry> = {
  BADEN_WUERTTEMBERG: {
    label: "Baden-Württemberg",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS",
    parcelPropertyKey: "nora:v_al_flurstueck",
    alkisParcelIdPropertyKey: "flurstueckskennzeichen",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: "Uses custom nora namespace and flurstueckskennzeichen property naming.",
    wfsOutputFormat: "application/json",
    supports4326: true,
    bboxAxisOrder: "lonlat",
    wfsSupportsJson: true,
  },
  // TODO: unverified in latest audit (Verify public WFS endpoint and typename manually.)
  BAYERN: {
    label: "Bayern",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: null,
    parcelPropertyKey: null,
    alkisParcelIdPropertyKey: null,
    projection: null,
    attribution: null,
    specialCaseNote: "No public ALKIS-WFS endpoint currently known.",
    wfsOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  BERLIN: {
    label: "Berlin",
    enabled: true,
    wmsUrl: null,
    layerName: "a_alkis_raster",
    wfsUrl: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
    parcelPropertyKey: "alkis_flurstuecke:flurstuecke",
    alkisParcelIdPropertyKey: "fsko",
    projection: "EPSG:25833",
    attribution: "© Geoportal Berlin / ALKIS",
    specialCaseNote: null,
    wfsOutputFormat: "application/json",
    supports4326: true,
    bboxAxisOrder: "lonlat",
    wfsSupportsJson: true,
  },
  BRANDENBURG: {
    label: "Brandenburg",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25833",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  BREMEN: {
    label: "Bremen",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf",
    parcelPropertyKey: "adv:AX_Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote:
      "Configured WFS differs from spreadsheet direct URL. Bremen uses LGLN host with typename adv:AX_Flurstueck.",
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  HAMBURG: {
    label: "Hamburg",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "lonlat",
    wfsSupportsJson: false,
  },
  HESSEN: {
    label: "Hessen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  MECKLENBURG_VORPOMMERN: {
    label: "Mecklenburg-Vorpommern",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geodaten-mv.de/dienste/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25833",
    attribution: "© GeoPortal MV / ALKIS",
    specialCaseNote: null,
    wfsOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  NIEDERSACHSEN: {
    label: "Niedersachsen",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  NORDRHEIN_WESTFALEN: {
    label: "Nordrhein-Westfalen",
    enabled: true,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: "© Geobasis NRW / ALKIS",
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  RHEINLAND_PFALZ: {
    label: "Rheinland-Pfalz",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geoportal.rlp.de/registry/wfs/519",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "application/json; subtype=geojson",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: true,
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate.)
  SAARLAND: {
    label: "Saarland",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geoportal.saarland.de/registry/wfs/414",
    parcelPropertyKey: "ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck",
    alkisParcelIdPropertyKey: "nationalCadastralReference",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote:
      "Configured endpoint has intermittent 5xx. Spreadsheet points to INSPIRE endpoint with different schema.",
    wfsOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  SACHSEN: {
    label: "Sachsen",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25833",
    attribution: null,
    specialCaseNote:
      "Spreadsheet direct lookup often uses StoredQuery (kennzeichen); this audit uses BBOX GetFeature probes.",
    wfsOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  SACHSEN_ANHALT: {
    label: "Sachsen-Anhalt",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl:
      "https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  // TODO: unverified in latest audit (Capabilities request failed; keep previous config values. | GetFeature probe did not return usable features at test coordinate.)
  SCHLESWIG_HOLSTEIN: {
    label: "Schleswig-Holstein",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS",
    parcelPropertyKey: "cp:CadastralParcel",
    alkisParcelIdPropertyKey: "nationalCadastralReference",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: "INSPIRE schema is used (cp:CadastralParcel / nationalCadastralReference).",
    wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
    supports4326: true,
    bboxAxisOrder: "lonlat",
    wfsSupportsJson: false,
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  THUERINGEN: {
    label: "Thüringen",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: "https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs",
    parcelPropertyKey: "ave:Flurstueck",
    alkisParcelIdPropertyKey: "flstkennz",
    projection: "EPSG:25832",
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: null,
    supports4326: false,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
  DISABLED: {
    label: "Keine Auswahl",
    enabled: false,
    wmsUrl: null,
    layerName: null,
    wfsUrl: null,
    parcelPropertyKey: null,
    alkisParcelIdPropertyKey: null,
    projection: null,
    attribution: null,
    specialCaseNote: null,
    wfsOutputFormat: null,
    supports4326: true,
    bboxAxisOrder: "latlon",
    wfsSupportsJson: false,
  },
}

export function isAlkisBackgroundAvailableForProject(
  alkisStateKey: StateKeyEnum | null | undefined,
) {
  if (alkisStateKey == null) return false
  const entry = alkisStateConfig[alkisStateKey]
  if (entry.enabled !== true) return false
  const hasWms = Boolean(entry.wmsUrl?.trim() && entry.layerName?.trim())
  const hasWfs = Boolean(entry.wfsUrl?.trim() && entry.parcelPropertyKey?.trim())
  return hasWms || hasWfs
}

export function isAlkisWfsAvailableForProject(alkisStateKey: StateKeyEnum | null | undefined) {
  return isAlkisBackgroundAvailableForProject(alkisStateKey)
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
