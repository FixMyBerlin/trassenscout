## Data BB Beteiligung

### institutions: names, id and bboxes

- get the csv file from fmc drive
- the csv should not contain any polish (or other non german) special characters
- check if it is utf8 encoded (open with excel or numbers) - in case it is not: export it as utf8 encoded csv
- transform to json - run `node src/survey-public/utils/csvToJson.js src/survey-public/radnetz-brandenburg/data/filename src/survey-public/radnetz-brandenburg/data/kvdaten_BB_bboxes_TEST.json`

### geodata for SurveyMap und SurveyMapLine.tsx

1. GeoJSON von Ramboll (Download Sharepoint) bereinigen:
- Umwadeln von Geopackage in QGIS in GeoJSON mit Projektion 4326
- Öffnen in Placemark play und alle Spalten löschen außer `fid` und `Verbindungs_ID`
2. `tippecanoe --maximum-zoom=g -rg  --drop-densest-as-needed --extend-zooms-if-still-dropping --layer=default /Users/fmc/Downloads/TS_BB_Netzentwurf.geojson --output /Users/fmc/Downloads/TS_BB_Netzentwurf.mbtiles`
3. Datei austauschen unter https://cloud.maptiler.com/tiles/64022d33-fe65-45c9-b023-bac5e5871e1c/upload
4. Im Kartenstil testen, ob die Daten richtig sind bzw. nach etwas Warten in der Umfrage
