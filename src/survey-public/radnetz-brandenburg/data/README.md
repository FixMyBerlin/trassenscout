## Data BB Beteiligung

### institutions: names, id and bboxes

- get the csv file from fmc drive
- the csv should not contain any polish (or other non german) special characters
- check if it is utf8 encoded (open with excel or numbers) - in case it is not: export it as utf8 encoded csv
- transform to json - run `node src/survey-public/utils/csvToJson.js src/survey-public/radnetz-brandenburg/data/filename src/survey-public/radnetz-brandenburg/data/institutions_bboxes.json`

### geodata for SurveyMap und SurveyMapLine.tsx

1. Netzentwurf and README here: https://github.com/FixMyBerlin/atlas-static-data/tree/main/geojson/region-bb/bb-ramboll-netzentwurf-2

## Special Features / Clean Up and Refactoring after BB survey;

The survey still works for other configurations but some features are built specifically for the "radnetz-brandenburg"-survey. These parts are partially not dynamiy but hard coded. The comment `todo survey clean up or refactor after survey BB` has been added to the respective parts of the code.
