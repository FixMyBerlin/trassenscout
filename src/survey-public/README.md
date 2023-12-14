## Referencing survey questions / evaluationRefs

in [surveyslug]/data/survey.ts and ...feedback.ts the question and possible responses of the survey are defined.

To reference specific questions/responses (that exist in all surveys but might have different ids), the constant '''evaluationRefs''' in [surveyslug]/data/responses-config.ts holds a record of references and question-ids, that we have to keep up to date manually:

evaluationRefs: {
    "feedback-category": 21,
    "is-feedback-location": 22,
    "feedback-location": 23,
    "feedback-usertext-1": 34,
    "feedback-usertext-2": 35 // (optional)
  },
