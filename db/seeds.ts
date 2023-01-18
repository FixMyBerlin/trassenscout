import seedCalendarEntries from "./seeds/calenderEntries"
import seedContacts from "./seeds/contacts"
import seedProjects from "./seeds/projects"
import seedSections from "./seeds/sections"
import seedStakeholdernotes from "./seeds/stakeholdernotes"
import seedSubsections from "./seeds/subsections"
import seedUsers from "./seeds/users"

/*
 * This seed function is executed when you run `blitz db seed`.
 */
const seed = async () => {
  await seedUsers()
  await seedProjects()
  await seedSections()
  await seedSubsections()
  await seedCalendarEntries()
  await seedContacts()
  await seedStakeholdernotes()
}
export default seed
