import { Container, Head, Hr, Html, Markdown } from "@react-email/components"
import { footerTextMarkdown } from "./footerTextMarkdown"

export const MarkdownMail = ({ markdown = "" }: { markdown: string }) => {
  return (
    <Html lang="de" dir="ltr">
      <Head>
        <title>Trassenscout</title>
      </Head>
      <Container>
        <Markdown
          markdownCustomStyles={{
            p: { margin: "0.3em 0" },
            link: { color: "#020617", fontWeight: "bold" },
          }}
          markdownContainerStyles={{
            padding: "1em",
            lineHeight: "1.25",
            fontFamily: "sans-serif",
          }}
        >
          {markdown}
        </Markdown>
      </Container>
      <Hr />
      <Markdown
        markdownCustomStyles={{
          p: { margin: "0em", color: "#a1a1aa" },
          link: { color: "#a1a1aa" },
        }}
        markdownContainerStyles={{
          padding: "1em",
          lineHeight: "1.25",
          fontFamily: "sans-serif",
        }}
      >
        {footerTextMarkdown}
      </Markdown>
    </Html>
  )
}
export default MarkdownMail
