import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedFiles from "./seeds/files"
import seedProjects from "./seeds/projects"
import seedSections from "./seeds/sections"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedUsers from "./seeds/users"
import seedMemberships from "./seeds/memberships"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedUsers()
  await seedProjects()
  await seedMemberships()
  await seedSections()
  await seedSubsections()
  await seedCalendarEntries()
  await seedContacts()
  await seedStakeholdernotes()
  await seedFiles()
}

export default seed
