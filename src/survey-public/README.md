## Referencing survey questions / evaluationRefs

in [surveyslug]/data/survey.ts and ...feedback.ts the question and possible responses of the survey are defined.

In the evaluation of the survey and in shared components the following question ids are needed:
  - "feedback-category"
  - "is-feedback-location"
  - "feedback-location"
  - "feedback-usertext-1"
  - "feedback-usertext-2" (optional)

To reference specific questions/responses (that exist in all surveys but might have different ids), the constant '''evaluationRefs''' in[surveyslug]/data/responses-config.ts holds a record of references and question-ids, that we have to keep up to date manually.
