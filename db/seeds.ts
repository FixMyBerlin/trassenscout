import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedUploads from "./seeds/uploads"
import seedMemberships from "./seeds/memberships"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedQualityLevels from "./seeds/qualityLevels"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedSurveyResponseTopics from "./seeds/surveyresponsetopics"
import seedSurveys from "./seeds/surveys"
import seedUsers from "./seeds/users"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedProjects()
  await seedUsers()
  await seedMemberships()
  await seedOperators()
  await seedQualityLevels()
  await seedSubsections()
  await seedStakeholdernotes()
  await seedCalendarEntries()
  await seedContacts()
  await seedUploads()
  await seedSurveys()
  await seedSurveyResponseTopics()
}

export default seed
