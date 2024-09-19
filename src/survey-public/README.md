## Referencing survey questions / evaluationRefs

in `src/survey-public/[surveyslug]/data/survey.ts` and ...feedback.ts the question and possible responses of the survey are defined.

To reference specific questions/responses (that exist in all surveys but might have different ids), the constant '''evaluationRefs''' in `src/survey-public/[surveyslug]/data/responses-config.ts` holds a record of references and question-ids, that we have to keep up to date manually:

evaluationRefs: {
    "feedback-category": 21,
    "is-feedback-location": 22,
    "feedback-location": 23,
    "feedback-usertext-1": 34,
    "feedback-usertext-2": 35 // (optional)
  },

## Configurable TS-"Backend"

`src/survey-public/[surveyslug]/data/response-config.ts` holds the configuration object for the internal TS UI `trassenscout.de/surveys/[surveyId]/responses`

It defines:
- the status enum,
- the labels of note, status, operator, topics, category, location,
- additional filters for survey specific fields which are stored in the survey result itself (not in the DB)

In `src/survey-public/utils/backend-config-defaults.ts` defines the defaults for the `response-config.ts` files. It can be used as a copy template. If no labels are set in the config file, the survey will take them from this file.

The configuration of status must not be changed to be sure that status in the DB always matches the status configuration.
