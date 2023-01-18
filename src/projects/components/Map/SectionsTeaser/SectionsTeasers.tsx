import { Section } from "@prisma/client"
import { SectionsTeaser } from "./SectionsTeaser"
type Props = {
  sections: Section[]
}

export const SectionsTeasers: React.FC<Props> = ({ sections }) => {
  return (
    <div className="my-5 flex w-full flex-col gap-4 md:flex-row">
      {sections.map((section) => {
        return <SectionsTeaser key={section.id} section={section} />
      })}
    </div>
  )
}
