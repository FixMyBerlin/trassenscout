import { Remark } from "react-remark"
import clsx from "clsx"
import { Link } from "../links/Link"
import { proseClasses } from "../text"

type Props = {
  markdown?: string | null
  className?: string
}

const MdH1 = (props: any) => (
  <p className="text-base">
    <strong {...props} />
  </p>
)
const MdH2 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
const MdH3 = (props: any) => (
  <p className="text-sm">
    <strong {...props} />
  </p>
)
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
const MdA = (props: any) => <Link blank to={props.href} {...props} />

const components = {
  h1: MdH1,
  h2: MdH2,
  h3: MdH3,
  h4: MdH4,
  h5: MdH5,
  h6: MdH6,
  a: MdA,
}

export const Markdown: React.FC<Props> = ({ markdown, className }) => {
  // regex matches Links of pattern - except for links preceded by '(' / '['
  const regexLink =
    /(?<!\[|\()(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g
  const createMarkdownLink = (link: string) => {
    return ` [${link}](${link})`
  }

  if (!markdown) return null

  return (
    <div className={clsx(proseClasses, className)}>
      <Remark
        remarkToRehypeOptions={{ allowDangerousHtml: true }}
        rehypeReactOptions={{ components }}
      >
        {markdown.replaceAll(regexLink, createMarkdownLink)}
      </Remark>
    </div>
  )
}
