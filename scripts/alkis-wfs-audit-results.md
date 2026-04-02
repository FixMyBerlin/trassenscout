# ALKIS WFS GetCapabilities audit

Generated: 2026-04-02T10:34:14.551Z

Request: `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`

This file lists **only verified facts** from successful HTTP responses (2xx) and successfully parsed GetCapabilities XML. Rows with **OK = no** document failed attempts (URL + reason). **Derived** URLs are heuristic attempts from `wmsUrl` and are **not** treated as the official WFS endpoint unless verification succeeded for that exact URL (this script does not write `alkisStateConfig.ts`).

## Summary

Columns **4326** and **3857** are filled only when CRS could be verified from the configured parcel feature type’s DefaultCRS/OtherCRS (or from all feature types when no parcel typename is configured).

| Bundesland | WFS base URL (verified) | HTTP | OK | JSON | 4326 | 3857 | CRS note | Typename match | Parcel DefaultCRS |
|---|---|---:|:---:|:-:|:-:|:-:|:-:|:-:|---|
| Baden-Württemberg | `https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS` (configured) | 200 | yes | yes | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Berlin | `https://gdi.berlin.de/services/wfs/alkis_flurstuecke` (configured) | 200 | yes | yes | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25833 |
| Brandenburg | `https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25833 |
| Bremen | `https://opendata.lgln.niedersachsen.de/doorman/noauth/al…` (configured) | 200 | yes | no | yes | no | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Hamburg | `https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht` (configured) | 200 | yes | no | yes | yes | short | yes | EPSG:25832 |
| Hessen | `https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/v…` (configured) | 200 | yes | no | yes | no | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Mecklenburg-Vorpommern | `https://www.geodaten-mv.de/dienste/alkis_wfs_einfach` (configured) | 200 | yes | no | no | no | short | yes | urn:ogc:def:crs:EPSG::25833 |
| Niedersachsen | `https://opendata.lgln.niedersachsen.de/doorman/noauth/al…` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Nordrhein-Westfalen | `https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Rheinland-Pfalz | `https://www.geoportal.rlp.de/registry/wfs/519` (configured) | 200 | yes | yes | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Saarland | — | 503 | no | — | — | — | — | — | — |
| Sachsen | `https://geodienste.sachsen.de/aaa/public_alkis/vereinf/w…` (configured) | 200 | yes | no | no | no | short | yes | urn:ogc:def:crs:EPSG::25833 |
| Sachsen-Anhalt | `https://www.geodatenportal.sachsen-anhalt.de/wss/service…` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Schleswig-Holstein | `https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |
| Thüringen | `https://www.geoproxy.geoportal-th.de/geoproxy/services/a…` (configured) | 200 | yes | no | yes | yes | urn | yes | urn:ogc:def:crs:EPSG::25832 |

**Verified** WFS URL appears only after a successful GetCapabilities (HTTP 2xx) and parse. **CRS columns** require a parsed CRS list for the parcel feature type (or global feature types if no parcel typename is configured). `yes (900913)` means only EPSG:900913 appears for Web Mercator — equivalent to EPSG:3857 for map bbox / MapLibre.

## States without JSON / GeoJSON-style GetFeature formats (verified in this run)

- **Brandenburg** (`BRANDENBURG`)
- **Bremen** (`BREMEN`)
- **Hamburg** (`HAMBURG`)
- **Hessen** (`HESSEN`)
- **Mecklenburg-Vorpommern** (`MECKLENBURG_VORPOMMERN`)
- **Niedersachsen** (`NIEDERSACHSEN`)
- **Nordrhein-Westfalen** (`NORDRHEIN_WESTFALEN`)
- **Sachsen** (`SACHSEN`)
- **Sachsen-Anhalt** (`SACHSEN_ANHALT`)
- **Schleswig-Holstein** (`SCHLESWIG_HOLSTEIN`)
- **Thüringen** (`THUERINGEN`)

## Not verified / failures

- **Saarland** (`SAARLAND`): last attempt `https://geoportal.saarland.de/registry/wfs/414?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` — HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...

## Details

### Baden-Württemberg (`BADEN_WUERTTEMBERG`)

- **Configured wfsUrl (before audit):** https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** yes
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, GML2, application/gml+xml; version=3.2, gml3, gml32, text/xml; subtype=gml/2.1.2, text/xml; subtype=gml/3.2, SHAPE-ZIP, application/json, json
- **Configured parcel typename:** nora:v_al_flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** nora:v_al_flurstueck, nora:v_al_gebaeude, nora:v_al_grenzpunkt, nora:v_al_sonstiger_punkt, nora:v_al_tatsaechliche_nutzung, nora:v_al_bauwerk_einrichtung_p, nora:v_al_bauwerk_einrichtung_l, nora:v_al_bauwerk_einrichtung_f, nora:v_al_festlegung_recht, nora:v_al_strasse_gewann, nora:v_al_lagebezeichnung, nora:v_al_zuordnung_lagebezeichnung, nora:v_al_grenzlinie, nora:v_al_flur, nora:v_al_gemarkung, nora:v_al_gemeinde, nora:v_al_kreis, nora:v_al_region, nora:v_al_regierungsbezirk, nora:v_al_land, …
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::5649, urn:ogc:def:crs:EPSG::4647, urn:ogc:def:crs:EPSG::5650, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::31466, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::31468, urn:ogc:def:crs:EPSG::25833
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Berlin (`BERLIN`)

- **Configured wfsUrl (before audit):** https://gdi.berlin.de/services/wfs/alkis_flurstuecke
- **wmsUrl used for derivation (if any):** https://gdi.berlin.de/services/wms/alkis_flurstuecke
- **GetCapabilities attempts:**
  - `https://gdi.berlin.de/services/wfs/alkis_flurstuecke?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://gdi.berlin.de/services/wfs/alkis_flurstuecke
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** yes
- **Output formats (sample):** application/gml+xml; version=3.2, GML2, application/json, geopackage, geopkg, gml3, gml32, gpkg, json, text/xml; subtype=gml/2.1.2, text/xml; subtype=gml/3.1.1, text/xml; subtype=gml/3.2
- **Configured parcel typename:** alkis_flurstuecke:flurstuecke
- **Typename in capabilities:** yes
- **Feature types (first 20):** alkis_flurstuecke:flurstuecke
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Brandenburg (`BRANDENBURG`)

- **Configured wfsUrl (before audit):** https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3035, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::4647, urn:ogc:def:crs:EPSG::4839, urn:ogc:def:crs:EPSG::5650
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Bremen (`BREMEN`)

- **Configured wfsUrl (before audit):** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2
- **Configured parcel typename:** adv:AX_Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** adv:AP_Darstellung, adv:AP_FPO, adv:AP_LPO, adv:AP_LTO, adv:AP_PPO, adv:AP_PTO, adv:AX_AndereFestlegungNachStrassenrecht, adv:AX_AndereFestlegungNachWasserrecht, adv:AX_Aufnahmepunkt, adv:AX_Bahnstrecke, adv:AX_Bahnverkehr, adv:AX_Bahnverkehrsanlage, adv:AX_BauRaumOderBodenordnungsrecht, adv:AX_BauRaumOderBodenordnungsrechtGrundbuch, adv:AX_Baublock, adv:AX_Bauteil, adv:AX_BauwerkImGewaesserbereich, adv:AX_BauwerkImVerkehrsbereich, adv:AX_BauwerkOderAnlageFuerIndustrieUndGewerbe, adv:AX_BauwerkOderAnlageFuerSportFreizeitUndErholung, …
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::31466, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::31468, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::995676, urn:ogc:def:crs:EPSG::995677, urn:ogc:def:crs:EPSG::995678, urn:ogc:def:crs:EPSG::995679
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** no
- **CRS notation:** urn

### Hamburg (`HAMBURG`)

- **Configured wfsUrl (before audit):** https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:KatasterBezirk, ave:Flurstueck, ave:GebaeudeBauwerk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** EPSG:25832, EPSG:25833, EPSG:4326, EPSG:4258, EPSG:31467, EPSG:3857, EPSG:3044, EPSG:3034, EPSG:3035
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** short

### Hessen (`HESSEN`)

- **Configured wfsUrl (before audit):** https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** no
- **CRS notation:** urn

### Mecklenburg-Vorpommern (`MECKLENBURG_VORPOMMERN`)

- **Configured wfsUrl (before audit):** https://www.geodaten-mv.de/dienste/alkis_wfs_einfach
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.geodaten-mv.de/dienste/alkis_wfs_einfach?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://www.geodaten-mv.de/dienste/alkis_wfs_einfach
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::5650
- **EPSG:4326 (verified for CRS scope above):** no
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** no
- **CRS notation:** short

### Niedersachsen (`NIEDERSACHSEN`)

- **Configured wfsUrl (before audit):** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilitie…` → HTTP 200
- **Verified WFS base URL:** https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::900913
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Nordrhein-Westfalen (`NORDRHEIN_WESTFALEN`)

- **Configured wfsUrl (before audit):** https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile, application/geopackage+sqlite3
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::25831, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::28992, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3035, urn:ogc:def:crs:EPSG::3043, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045, urn:ogc:def:crs:EPSG::31466, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::4647, urn:ogc:def:crs:EPSG::5649, urn:ogc:def:crs:EPSG::5650, urn:ogc:def:crs:EPSG::5651, urn:ogc:def:crs:EPSG::5652, urn:ogc:def:crs:EPSG::5653
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Rheinland-Pfalz (`RHEINLAND_PFALZ`)

- **Configured wfsUrl (before audit):** https://www.geoportal.rlp.de/registry/wfs/519
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.geoportal.rlp.de/registry/wfs/519?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://www.geoportal.rlp.de/registry/wfs/519
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** yes
- **Output formats (sample):** application/gml+xml; version=3.2, text/xml; subtype=gml/3.2.1, text/xml; subtype=gml/3.1.1, text/xml; subtype=gml/2.1.2, application/x-zip-shapefile, text/csv, application/json; subtype=geojson, application/zip
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:GebaeudeBauwerk, ave:Nutzung
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::25831, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::31466, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::31468, urn:ogc:def:crs:EPSG::31469, urn:ogc:def:crs:EPSG::9935832, urn:ogc:def:crs:EPSG::5651, urn:ogc:def:crs:EPSG::5652, urn:ogc:def:crs:EPSG::5653, urn:ogc:def:crs:EPSG::5649, urn:ogc:def:crs:EPSG::4647, urn:ogc:def:crs:EPSG::5650, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3035, urn:ogc:def:crs:EPSG::3043, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Saarland (`SAARLAND`)

- **Configured wfsUrl (before audit):** https://geoportal.saarland.de/registry/wfs/414
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://geoportal.saarland.de/registry/wfs/414?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **Verified WFS base URL:** —
- **Outcome:** HTTP 503: <h1>Aktuelle St&ouml;rung</h1><p><b>Aufgrund einer St&ouml;rung im Rechenzentrum des Saarlandes sind derzeit die Onlinedienste des LVGL nicht erreichbar.</b><br>Aktuell ist noch nicht absehbar, wann diese Systeme wieder ...
- **HTTP (last successful attempt):** 503
- **Parsed capabilities:** — (not verified)

### Sachsen (`SACHSEN`)

- **Configured wfsUrl (before audit):** https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:FlurstueckPunkt, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:NutzungFlurstueck, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::4258
- **EPSG:4326 (verified for CRS scope above):** no
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** no
- **CRS notation:** short

### Sachsen-Anhalt (`SACHSEN_ANHALT`)

- **Configured wfsUrl (before audit):** https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest?SERVICE=WFS&VERSION=2.0.0&…` → HTTP 200
- **Verified WFS base URL:** https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.1.1, application/gml+xml; version=3.1, text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2, application/x-zip-shapefile
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:GebaeudeBauwerk, ave:Nutzung
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3035, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::4647
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Schleswig-Holstein (`SCHLESWIG_HOLSTEIN`)

- **Configured wfsUrl (before audit):** https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Output formats (sample):** text/xml; subtype=gml/3.2.1, application/gml+xml; version=3.2
- **Configured parcel typename:** cp:CadastralParcel
- **Typename in capabilities:** yes
- **Feature types (first 20):** cp:CadastralParcel, cp:CadastralZoning
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, http://www.opengis.net/def/crs/EPSG/0/25832, http://www.opengis.net/def/crs/EPSG/0/25833, http://www.opengis.net/def/crs/EPSG/0/3034, http://www.opengis.net/def/crs/EPSG/0/3035, http://www.opengis.net/def/crs/EPSG/0/3044, http://www.opengis.net/def/crs/EPSG/0/3045, http://www.opengis.net/def/crs/EPSG/0/31468, http://www.opengis.net/def/crs/EPSG/0/31469, http://www.opengis.net/def/crs/EPSG/0/3857, http://www.opengis.net/def/crs/EPSG/0/4258, http://www.opengis.net/def/crs/EPSG/0/4326, http://www.opengis.net/def/crs/EPSG/0/900913, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::3034, urn:ogc:def:crs:EPSG::3035, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::31468, urn:ogc:def:crs:EPSG::31469, urn:ogc:def:crs:EPSG::3857, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::4647, urn:ogc:def:crs:EPSG::900913
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn

### Thüringen (`THUERINGEN`)

- **Configured wfsUrl (before audit):** https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs
- **wmsUrl used for derivation (if any):** —
- **GetCapabilities attempts:**
  - `https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities` → HTTP 200
- **Verified WFS base URL:** https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs
- **Verification source:** configured
- **HTTP (last successful attempt):** 200
- **GetFeature JSON-ish output formats:** no
- **Configured parcel typename:** ave:Flurstueck
- **Typename in capabilities:** yes
- **Feature types (first 20):** ave:Flurstueck, ave:GebaeudeBauwerk, ave:KatasterBezirk, ave:Nutzung, ave:VerwaltungsEinheit
- **CRS for parcel type (hints):** urn:ogc:def:crs:EPSG::25832, urn:ogc:def:crs:EPSG::4326, urn:ogc:def:crs:EPSG::25833, urn:ogc:def:crs:EPSG::31467, urn:ogc:def:crs:EPSG::31468, urn:ogc:def:crs:EPSG::4258, urn:ogc:def:crs:EPSG::3038, urn:ogc:def:crs:EPSG::3039, urn:ogc:def:crs:EPSG::3040, urn:ogc:def:crs:EPSG::3041, urn:ogc:def:crs:EPSG::3042, urn:ogc:def:crs:EPSG::3043, urn:ogc:def:crs:EPSG::3044, urn:ogc:def:crs:EPSG::3045, urn:ogc:def:crs:EPSG::3046, urn:ogc:def:crs:EPSG::3047, urn:ogc:def:crs:EPSG::3857
- **EPSG:4326 (verified for CRS scope above):** yes
- **EPSG:3857 / Web Mercator (verified for CRS scope above):** yes
- **CRS notation:** urn
