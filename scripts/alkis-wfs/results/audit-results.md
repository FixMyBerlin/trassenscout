# ALKIS WFS audit

Generated: 2026-04-13T09:30:03.985Z

This report combines `GetCapabilities` verification with a small `GetFeature` probe.

## Summary

| Bundesland             | Capabilities | Probe | Suggested parcel id key    | Suggested axis order | Suggested supports4326 | TODOs |
| ---------------------- | :----------: | :---: | -------------------------- | -------------------- | :--------------------: | ----- |
| Baden-Württemberg      |      ok      |  ok   | flurstueckskennzeichen     | lonlat               |          yes           | 0     |
| Bayern                 |     fail     | fail  | —                          | latlon               |          yes           | 1     |
| Berlin                 |      ok      |  ok   | fsko                       | lonlat               |          yes           | 0     |
| Brandenburg            |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Bremen                 |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Hamburg                |      ok      |  ok   | flstkennz                  | lonlat               |          yes           | 0     |
| Hessen                 |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Mecklenburg-Vorpommern |      ok      | fail  | flstkennz                  | latlon               |           no           | 2     |
| Niedersachsen          |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Nordrhein-Westfalen    |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Rheinland-Pfalz        |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Saarland               |      ok      | fail  | nationalCadastralReference | latlon               |          yes           | 1     |
| Sachsen                |      ok      | fail  | flstkennz                  | latlon               |           no           | 2     |
| Sachsen-Anhalt         |      ok      |  ok   | flstkennz                  | latlon               |          yes           | 0     |
| Schleswig-Holstein     |     fail     | fail  | nationalCadastralReference | lonlat               |          yes           | 2     |
| Thüringen              |      ok      | fail  | flstkennz                  | latlon               |           no           | 2     |

## Details

### Baden-Württemberg (`BADEN_WUERTTEMBERG`)

- Verified: yes
- Capabilities URL: `https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Suggested config: `{"wfsUrl":"https://owsproxy.lgl-bw.de/owsproxy/wfs/WFS_LGL-BW_ALKIS","parcelPropertyKey":"nora:v_al_flurstueck","alkisParcelIdPropertyKey":"flurstueckskennzeichen","projection":"EPSG:25832","wfsOutputFormat":"application/json","supports4326":true,"bboxAxisOrder":"lonlat"}`
- Special case: Uses custom nora namespace and flurstueckskennzeichen property naming.

### Bayern (`BAYERN`)

- Verified: no
- Capabilities URL: ``
- Capabilities status: — (fail)
- Capabilities error: Missing configured wfsUrl or parcelPropertyKey.
- Probe status: — (fail)
- Probe error: Skipped because required config fields are missing.
- Suggested config: `{"wfsUrl":null,"parcelPropertyKey":null,"alkisParcelIdPropertyKey":null,"projection":null,"wfsOutputFormat":null,"supports4326":true,"bboxAxisOrder":"latlon"}`
- Special case: No public ALKIS-WFS endpoint currently known.
- TODOs:
  - Verify public WFS endpoint and typename manually.

### Berlin (`BERLIN`)

- Verified: yes
- Capabilities URL: `https://gdi.berlin.de/services/wfs/alkis_flurstuecke?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Suggested config: `{"wfsUrl":"https://gdi.berlin.de/services/wfs/alkis_flurstuecke","parcelPropertyKey":"alkis_flurstuecke:flurstuecke","alkisParcelIdPropertyKey":"fsko","projection":"EPSG:25833","wfsOutputFormat":"application/json","supports4326":true,"bboxAxisOrder":"lonlat"}`

### Brandenburg (`BRANDENBURG`)

- Verified: yes
- Capabilities URL: `https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://isk.geobasis-bb.de/ows/alkis_vereinf_wfs","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25833","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`

### Bremen (`BREMEN`)

- Verified: yes
- Capabilities URL: `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://opendata.lgln.niedersachsen.de/doorman/noauth/alkishb_wfs_sf","parcelPropertyKey":"adv:AX_Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`
- Special case: Configured WFS differs from spreadsheet direct URL. Bremen uses LGLN host with typename adv:AX_Flurstueck.

### Hamburg (`HAMBURG`)

- Verified: yes
- Capabilities URL: `https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: Server returned valid empty WFS FeatureCollection for 4326/lonlat/text/xml; subtype=gml/3.2.1. | Server returned valid empty WFS FeatureCollection for 4326/lonlat/text/xml; subtype=gml/3.2.1. | Server returned valid empty WFS FeatureCollection for 4326/latlon/text/xml; subtype=gml/3.2.1. | Server returned valid empty WFS FeatureCollection for 4326/latlon/text/xml; subtype=gml/3.2.1. | No features at test coordinate after trying output formats, bbox axis orders, and deltas; keeping configured bboxAxisOrder.
- Suggested config: `{"wfsUrl":"https://geodienste.hamburg.de/WFS_HH_ALKIS_vereinfacht","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"lonlat"}`

### Hessen (`HESSEN`)

- Verified: yes
- Capabilities URL: `https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://www.gds.hessen.de/wfs2/aaa-suite/cgi-bin/alkis/vereinf/wfs","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`

### Mecklenburg-Vorpommern (`MECKLENBURG_VORPOMMERN`)

- Verified: no
- Capabilities URL: `https://www.geodaten-mv.de/dienste/alkis_wfs_einfach?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: — (fail)
- Probe error: Configured supports4326=false. Route currently returns 501 for such states; probe skipped by design.
- Suggested config: `{"wfsUrl":"https://www.geodaten-mv.de/dienste/alkis_wfs_einfach","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25833","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":false,"bboxAxisOrder":"latlon"}`
- TODOs:
  - GetFeature probe did not return usable features at test coordinate.
  - Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.

### Niedersachsen (`NIEDERSACHSEN`)

- Verified: yes
- Capabilities URL: `https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wfs_einfach","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`

### Nordrhein-Westfalen (`NORDRHEIN_WESTFALEN`)

- Verified: yes
- Capabilities URL: `https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://www.wfs.nrw.de/geobasis/wfs_nw_alkis_vereinfacht","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`

### Rheinland-Pfalz (`RHEINLAND_PFALZ`)

- Verified: yes
- Capabilities URL: `https://www.geoportal.rlp.de/registry/wfs/519?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Suggested config: `{"wfsUrl":"https://www.geoportal.rlp.de/registry/wfs/519","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"application/json; subtype=geojson","supports4326":true,"bboxAxisOrder":"latlon"}`

### Saarland (`SAARLAND`)

- Verified: no
- Capabilities URL: `https://geoportal.saarland.de/registry/wfs/414?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (fail)
- Probe error: OGC ExceptionReport (4326, lonlat, delta=0.02)
- Suggested config: `{"wfsUrl":"https://geoportal.saarland.de/registry/wfs/414","parcelPropertyKey":"ALKIS_ALKIS_WFS_ohne_Eig:Flurstueck","alkisParcelIdPropertyKey":"nationalCadastralReference","projection":"EPSG:25832","wfsOutputFormat":null,"supports4326":true,"bboxAxisOrder":"latlon"}`
- Special case: Configured endpoint has intermittent 5xx. Spreadsheet points to INSPIRE endpoint with different schema.
- TODOs:
  - GetFeature probe did not return usable features at test coordinate.

### Sachsen (`SACHSEN`)

- Verified: no
- Capabilities URL: `https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: — (fail)
- Probe error: Configured supports4326=false. Route currently returns 501 for such states; probe skipped by design.
- Suggested config: `{"wfsUrl":"https://geodienste.sachsen.de/aaa/public_alkis/vereinf/wfs","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25833","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":false,"bboxAxisOrder":"latlon"}`
- Special case: Spreadsheet direct lookup often uses StoredQuery (kennzeichen); this audit uses BBOX GetFeature probes.
- TODOs:
  - GetFeature probe did not return usable features at test coordinate.
  - Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.

### Sachsen-Anhalt (`SACHSEN_ANHALT`)

- Verified: yes
- Capabilities URL: `https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: 200 (ok)
- Probe notes: WFS reports numberReturned=25 for 4326/latlon/text/xml; subtype=gml/3.2.1 but GeoJSON conversion failed; bbox axis order still accepted.
- Suggested config: `{"wfsUrl":"https://www.geodatenportal.sachsen-anhalt.de/wss/service/ST_LVermGeo_ALKIS_WFS_OpenData/guest","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"latlon"}`

### Schleswig-Holstein (`SCHLESWIG_HOLSTEIN`)

- Verified: no
- Capabilities URL: `https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 500 (fail)
- Capabilities error: HTTP 500: <?xml version="1.0" encoding="utf-8" ?> <ExceptionReport version="2.0.0" xmlns="http://www.opengis.net/ows/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/ows/1.1 htt...
- Probe status: 500 (fail)
- Probe error: Probe skipped because capabilities did not verify.
- Suggested config: `{"wfsUrl":"https://service.gdi-sh.de/SH_INSPIREDOWNLOAD_AI_CP_ALKIS","parcelPropertyKey":"cp:CadastralParcel","alkisParcelIdPropertyKey":"nationalCadastralReference","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":true,"bboxAxisOrder":"lonlat"}`
- Special case: INSPIRE schema is used (cp:CadastralParcel / nationalCadastralReference).
- TODOs:
  - Capabilities request failed; keep previous config values.
  - GetFeature probe did not return usable features at test coordinate.

### Thüringen (`THUERINGEN`)

- Verified: no
- Capabilities URL: `https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetCapabilities`
- Capabilities status: 200 (ok)
- Probe status: — (fail)
- Probe error: Configured supports4326=false. Route currently returns 501 for such states; probe skipped by design.
- Suggested config: `{"wfsUrl":"https://www.geoproxy.geoportal-th.de/geoproxy/services/adv_alkis_wfs","parcelPropertyKey":"ave:Flurstueck","alkisParcelIdPropertyKey":"flstkennz","projection":"EPSG:25832","wfsOutputFormat":"text/xml; subtype=gml/3.2.1","supports4326":false,"bboxAxisOrder":"latlon"}`
- TODOs:
  - GetFeature probe did not return usable features at test coordinate.
  - Route currently returns 501 for supports4326=false; 4326 reprojection not implemented yet.
