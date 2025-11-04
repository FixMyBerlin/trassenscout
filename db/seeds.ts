import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedMemberships from "./seeds/memberships"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedQualityLevels from "./seeds/qualityLevels"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedSubsectionStatus from "./seeds/subsectionStatus"
import seedSubsubsectionInfra from "./seeds/subsubsectionInfra"
import seedSubsubsectionSpecial from "./seeds/subsubsectionSpecial"
import seedSubsubsectionStatus from "./seeds/subsubsectionStatus"
import seedSubsubsectionTask from "./seeds/subsubsectionTask"
import seedSurveyResponseTopics from "./seeds/surveyresponsetopics"
import seedSurveys from "./seeds/surveys"
import seedUploads from "./seeds/uploads"
import seedUsers from "./seeds/users"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  // Control scope via env var: SEED_ONLY_USERS=1 seeds only users+memberships
  const seedOnlyUsers = process.env.SEED_ONLY_USERS === "1"
  const seedAll = !seedOnlyUsers

  if (seedAll) {
    await seedProjects()
  }

  await seedUsers()
  await seedMemberships()

  if (seedAll) {
    await seedOperators()
    await seedQualityLevels()
    await seedSubsections()
    await seedStakeholdernotes()
    await seedCalendarEntries()
    await seedContacts()
    await seedUploads()
    await seedSurveys()
    await seedSurveyResponseTopics()
    await seedSubsectionStatus()
    await seedSubsubsectionStatus()
    await seedSubsubsectionTask()
    await seedSubsubsectionInfra()
    await seedSubsubsectionSpecial()
  }
}

export default seed
