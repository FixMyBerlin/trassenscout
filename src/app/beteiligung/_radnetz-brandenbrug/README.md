## Data BB Beteiligung

### institutions: names, id and bboxes

- get the csv file from fmc drive
- the csv should not contain any polish (or other non german) special characters
- check if it is utf8 encoded (open with excel or numbers) - in case it is not: export it as utf8 encoded csv
- transform to json - run `node src/app/beteiligung/_shared/utils/csvToJson.js src/app/beteiligung/_radnetz-brandenbrug/filename src/app/beteiligung/_radnetz-brandenbrug/institutions_bboxes.json`

Note: This data was needed for names, id and bboxes. The respective form fields for BB (read only field and SurveyMapLine) are not migrated to tanstack form.

### geodata for SurveyMap und SurveyMapLine.tsx

1. Netzentwurf and README here: https://github.com/FixMyBerlin/atlas-static-data/tree/main/geojson/region-bb/bb-ramboll-netzentwurf-2

Note: SurveyMap und SurveyMapLine (for BB) are not migrated to tanstack form.
