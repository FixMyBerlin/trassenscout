import { Section } from "@prisma/client"
import { SectionsTeaser } from "./SectionsTeaser"
type Props = {
  sections: Section[]
}

export const SectionsTeasers: React.FC<Props> = ({ sections }) => {
  return (
    <div className="my-12 grid w-full grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
      {sections.map((section) => {
        return <SectionsTeaser key={section.id} section={section} />
      })}
    </div>
  )
}
