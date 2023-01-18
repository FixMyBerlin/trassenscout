import { Section } from "@prisma/client"
import clsx from "clsx"

type Props = {
  section: Section
  className?: string
}

export const SectionPanel: React.FC<Props> = ({ section, className }) => {
  return (
    <div className={clsx(className, "overflow-hidden rounded-md bg-white drop-shadow-sm")}>
      <div className="overflow-auto border-t-[10px] border-[#979797] py-4 px-2">
        <h2 className="my-4 text-center text-[30px] font-semibold leading-[36px]">
          {section.title}
        </h2>
        <p className="mb-4">
          <strong>{section.subTitle}</strong>
        </p>
        {/* <p>Status: {section.status}</p>
        <p>Segments: {section.subsections.length}</p> */}
      </div>
    </div>
  )
}
