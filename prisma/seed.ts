import seedAdmin from "./seeds/admin"
import seedContacts from "./seeds/contacts"
import seedEvaluationsPage from "./seeds/evaluationsPage"
import seedMemberships from "./seeds/memberships"
import seedNetworkHierarchies from "./seeds/networkHierarchies"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedQualityLevels from "./seeds/qualityLevels"
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

const seed = async () => {
  // Control scope via env var: SEED_ONLY_USERS=1 seeds only users+memberships
  const seedOnlyUsers = process.env.SEED_ONLY_USERS === "1"
  const seedAll = !seedOnlyUsers

  if (seedAll) {
    await seedProjects()
    await seedEvaluationsPage()
  }

  await seedUsers()
  await seedMemberships()

  if (seedAll) {
    await seedOperators()
    await seedQualityLevels()
    await seedNetworkHierarchies()
    await seedSubsectionStatus()
    await seedSubsections()
    await seedContacts()
    await seedUploads()
    await seedSurveys()
    await seedSurveyResponseTopics()
    await seedSubsubsectionStatus()
    await seedSubsubsectionTask()
    await seedSubsubsectionInfra()
    await seedSubsubsectionSpecial()
    await seedAdmin()
  }
}

export default seed

if (import.meta.main) {
  await seed()
}
