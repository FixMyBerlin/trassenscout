import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedFiles from "./seeds/files"
import seedMemberships from "./seeds/memberships"
import seedOperators from "./seeds/operators"
import seedProjects from "./seeds/projects"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedUsers from "./seeds/users"
import seedSurveys from "./seeds/surveys"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedProjects()
  await seedUsers()
  await seedMemberships()
  await seedOperators()
  await seedSubsections()
  await seedStakeholdernotes()
  await seedCalendarEntries()
  await seedContacts()
  await seedFiles()
  await seedSurveys()
}

export default seed
