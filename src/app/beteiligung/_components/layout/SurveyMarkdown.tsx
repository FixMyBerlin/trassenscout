import { SurveyLink } from "@/src/app/beteiligung/_components/links/SurveyLink"
import { proseClasses } from "@/src/core/components/text"
import { clsx } from "clsx"
import { Remark } from "react-remark"

type Props = {
  markdown?: string | null
  className?: string
}

const MdH4 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH5 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH6 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdA = (props: any) => <SurveyLink blank href={props.href} {...props} />

const components = {
  h4: MdH4,
  h5: MdH5,
  h6: MdH6,
  a: MdA,
}

const proseClassesSurvey = clsx(
  "prose-p:text-base prose-p:text-gray-700",
  "prose-h2:mb-4 prose-h2:mt-8 prose-h2:text-lg prose-h2:font-bold prose-h2:text-gray-900 prose-ol:text-base prose-h2:sm:text-xl prose-ol:sm:text-lg",
)

export const SurveyMarkdown = ({ markdown, className }: Props) => {
  if (!markdown) return null

  return (
    <div className={clsx(proseClasses, proseClassesSurvey, className)}>
      <Remark
        remarkToRehypeOptions={{ allowDangerousHtml: true }}
        rehypeReactOptions={{ components }}
      >
        {markdown}
      </Remark>
    </div>
  )
}
