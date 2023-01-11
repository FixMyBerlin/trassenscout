import { Remark } from "react-remark"
import clsx from "clsx"
import { Link } from "../links/Link"

type Props = {
  markdown: string
  className?: string
}

// via className prop: configuration of HTML rendered from Markdown with Tailwind CSS Typography plugin: https://tailwindcss.com/docs/typography-plugin

export const Markdown: React.FC<Props> = ({ markdown, className }) => {
  // regex matches Links of pattern - except for links preceded by '(' / '['
  const regexLink =
    // eslint-disable-next-line no-useless-escape
    /(?<!\[|\()(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g
  const createMarkdownLink = (link: string) => {
    return ` [${link}](${link})`
  }

  return (
    <div className={clsx("prose", className)}>
      <Remark
        remarkToRehypeOptions={{ allowDangerousHtml: true }}
        rehypeReactOptions={{
          components: {
            // eslint-disable-next-line react/no-unstable-nested-components
            h1: (props: any) => (
              <p className="text-base">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components
            h2: (props: any) => (
              <p className="text-sm">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components
            h3: (props: any) => (
              <p className="text-sm">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components
            h4: (props: any) => (
              <p className="text-sm">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components
            h5: (props: any) => (
              <p className="text-sm">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components
            h6: (props: any) => (
              <p className="text-sm">
                <strong {...props} />
              </p>
            ),
            // eslint-disable-next-line react/no-unstable-nested-components, jsx-a11y/anchor-has-content
            // a: (props: any) => <a target="_blank" {...props} />,
            // eslint-disable-next-line react/no-unstable-nested-components
            a: (props: any) => <Link blank to={props.href} {...props} />,
          },
        }}
      >
        {markdown.replaceAll(regexLink, createMarkdownLink)}
      </Remark>
    </div>
  )
}
