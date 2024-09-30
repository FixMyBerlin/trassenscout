import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedDevData from "./seeds/devData"
import seedMemberships from "./seeds/memberships"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedQualityLevels from "./seeds/qualityLevels"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
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
  // It looks like we cannot set ENV variables as prefix to a call in npm run.
  // But we can hack around this like this…
  const seedAll = !process.env.npm_lifecycle_script?.includes("SEED_USER_ONLY")

  if (seedAll) {
    await seedProjects()
  }

  // When we use `npm run db:restoreDump` we want to seed our test uses
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
    await seedSubsubsectionStatus()
    await seedSubsubsectionTask()
    await seedSubsubsectionInfra()
    await seedSubsubsectionSpecial()
    await seedDevData()
  }
}

export default seed
