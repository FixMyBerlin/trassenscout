import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedMemberships from "./seeds/memberships"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedQualityLevels from "./seeds/qualityLevels"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedSubsubsectionStatus from "./seeds/subsubsectionStatus"
import seedSubsubsectionTask from "./seeds/subsubsectionTask"
import seedSubsubsectionInfra from "./seeds/subsubsectionInfra"
import seedSubsubsectionSpecial from "./seeds/subsubsectionSpecial"
import seedSurveyResponseTopics from "./seeds/surveyresponsetopics"
import seedSurveys from "./seeds/surveys"
import seedUploads from "./seeds/uploads"
import seedUsers from "./seeds/users"
import seedDevData from "./seeds/devData"

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
  await seedSubsubsectionStatus()
  await seedSubsubsectionTask()
  await seedSubsubsectionInfra()
  await seedSubsubsectionSpecial()
  await seedDevData()
}

export default seed
