import { StateKeyEnum } from "@prisma/client"

// for now, we only support the following states (set enabled:true manually):
// - Baden-Württemberg
// - Berlin
// - Brandenburg
// - Hessen
// - Nordrhein-Westfalen

/** WMS background: absent (`url: false`) or URL + layer name together. */
export type AlkisWmsConfig =
  | { url: false }
  | { url: string; layerName: string }

export type AlkisWfsDisabled = { url: false }

export type AlkisWfsEnabled = {
  url: string
  parcelPropertyKey: string
  alkisParcelIdPropertyKey: string | null
  projection: "EPSG:25832" | "EPSG:25833"
  wfsOutputFormat: string | null
  supports4326: boolean
  bboxAxisOrder: "lonlat" | "latlon"
  /** Derived from `wfsOutputFormat` (JSON / GeoJSON MIME). */
  wfsSupportsJson: boolean
}

export type AlkisWfsConfig = AlkisWfsDisabled | AlkisWfsEnabled

export type AlkisStateConfigEntry = {
  label: string
  enabled: boolean
  attribution: string | null
  /** Optional human note (endpoint quirks, audit limitations); not used at runtime. */
  specialCaseNote: string | null
  wms: AlkisWmsConfig
  wfs: AlkisWfsConfig
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
    attribution: null,
    specialCaseNote: "Uses custom nora namespace and flurstueckskennzeichen property naming.",
    wms: { url: false },
    wfs: {
      url: "https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS",
      parcelPropertyKey: "nora:v_al_flurstueck",
      alkisParcelIdPropertyKey: "flurstueckskennzeichen",
      projection: "EPSG:25832",
      wfsOutputFormat: "application/json",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: true,
    },
  },
  // TODO: unverified in latest audit (Verify public WFS endpoint and typename manually.)
  BAYERN: {
    label: "Bayern",
    enabled: false,
    attribution: null,
    specialCaseNote: "No public ALKIS-WFS endpoint currently known.",
    wms: { url: false },
    wfs: { url: false },
  },
  // Raster-WMS layer id (Geoportal) for a future base URL: a_alkis_raster
  BERLIN: {
    label: "Berlin",
    enabled: true,
    attribution: "© Geoportal Berlin / ALKIS",
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://gdi.berlin.de/services/wfs/alkis_flurstuecke",
      parcelPropertyKey: "alkis_flurstuecke:flurstuecke",
      alkisParcelIdPropertyKey: "fsko",
      projection: "EPSG:25833",
      wfsOutputFormat: "application/json",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: true,
    },
  },
  BRANDENBURG: {
    label: "Brandenburg",
    enabled: true,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  BREMEN: {
    label: "Bremen",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Configured WFS differs from spreadsheet direct URL. Bremen uses LGLN host with typename adv:AX_Flurstueck.",
    wms: { url: false },
    wfs: {
      url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf",
      parcelPropertyKey: "adv:AX_Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  HAMBURG: {
    label: "Hamburg",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: false,
    },
  },
  HESSEN: {
    label: "Hessen",
    enabled: true,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  MECKLENBURG_VORPOMMERN: {
    label: "Mecklenburg-Vorpommern",
    enabled: false,
    attribution: "© GeoPortal MV / ALKIS",
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geodaten-mv.de/dienste/alkis_wfs_einfach",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  NIEDERSACHSEN: {
    label: "Niedersachsen",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  NORDRHEIN_WESTFALEN: {
    label: "Nordrhein-Westfalen",
    enabled: true,
    attribution: "© Geobasis NRW / ALKIS",
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  RHEINLAND_PFALZ: {
    label: "Rheinland-Pfalz",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geoportal.rlp.de/registry/wfs/519",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "application/json; subtype=geojson",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: true,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate.)
  SAARLAND: {
    label: "Saarland",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Configured endpoint has intermittent 5xx. Spreadsheet points to INSPIRE endpoint with different schema.",
    wms: { url: false },
    wfs: {
      url: "https://geoportal.saarland.de/registry/wfs/414",
      parcelPropertyKey: "ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck",
      alkisParcelIdPropertyKey: "nationalCadastralReference",
      projection: "EPSG:25832",
      wfsOutputFormat: null,
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  SACHSEN: {
    label: "Sachsen",
    enabled: false,
    attribution: null,
    specialCaseNote:
      "Spreadsheet direct lookup often uses StoredQuery (kennzeichen); this audit uses BBOX GetFeature probes.",
    wms: { url: false },
    wfs: {
      url: "https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25833",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  SACHSEN_ANHALT: {
    label: "Sachsen-Anhalt",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (Capabilities request failed; keep previous config values. | GetFeature probe did not return usable features at test coordinate.)
  SCHLESWIG_HOLSTEIN: {
    label: "Schleswig-Holstein",
    enabled: false,
    attribution: null,
    specialCaseNote: "INSPIRE schema is used (cp:CadastralParcel / nationalCadastralReference).",
    wms: { url: false },
    wfs: {
      url: "https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS",
      parcelPropertyKey: "cp:CadastralParcel",
      alkisParcelIdPropertyKey: "nationalCadastralReference",
      projection: "EPSG:25832",
      wfsOutputFormat: "text/xml; subtype=gml/3.2.1",
      supports4326: true,
      bboxAxisOrder: "lonlat",
      wfsSupportsJson: false,
    },
  },
  // TODO: unverified in latest audit (GetFeature probe did not return usable features at test coordinate. | Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.)
  THUERINGEN: {
    label: "Thüringen",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: {
      url: "https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs",
      parcelPropertyKey: "ave:Flurstueck",
      alkisParcelIdPropertyKey: "flstkennz",
      projection: "EPSG:25832",
      wfsOutputFormat: null,
      supports4326: false,
      bboxAxisOrder: "latlon",
      wfsSupportsJson: false,
    },
  },
  DISABLED: {
    label: "Keine Auswahl",
    enabled: false,
    attribution: null,
    specialCaseNote: null,
    wms: { url: false },
    wfs: { url: false },
  },
}

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
