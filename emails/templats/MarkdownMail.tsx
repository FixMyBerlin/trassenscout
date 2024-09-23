import { getPrdOrStgDomain } from "@/src/core/components/links/getDomain"
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Markdown,
  Section,
  Tailwind,
} from "@react-email/components"
import { footerTextMarkdown } from "./footerTextMarkdown"
import { signatureTextMarkdown } from "./signatureTextMarkdown"

interface MarkdownMailProps {
  markdown: string
}

const baseUrl = getPrdOrStgDomain()

const demoTextMarkdown = `
# Welcome to the Demo Text

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.

## Features

- **Feature 1**: Lorem ipsum dolor sit amet, [consectetur adipiscing elit](https://example.com).
- **Feature 2**: Vivamus lacinia odio vitae [vestibulum vestibulum](https://example.com).
- **Feature 3**: Cras venenatis euismod malesuada.

## More Information

For more details, visit our [website](https://example.com) or check out our [documentation](https://example.com/docs).

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
`

export const MarkdownMail = ({ markdown = demoTextMarkdown }: MarkdownMailProps) => {
  return (
    <Tailwind>
      <Html lang="de" dir="ltr">
        <Head>
          <title>Trassenscout</title>
        </Head>
        {/* <Preview>Preview line</Preview> */}
        <Body style={main}>
          <Container style={container}>
            <Section style={coverSection}>
              <Section style={imageSection}>
                <Img
                  src={`${baseUrl}/emails/trassenscout-logo-mail-white.png`}
                  width="134"
                  height="45"
                  alt="Trassenscout Logo"
                />
              </Section>
              <Section style={upperSection}>
                <Markdown
                  markdownCustomStyles={{
                    h1,
                    h2,
                    p: mainText,
                    link,
                    li: list,
                  }}
                >
                  {markdown}
                </Markdown>
                {/* Action section */
                /*
              <Section style={verificationSection}>
                <Text style={verifyText}>Verification code</Text>

                <Text style={codeText}>{verificationCode}</Text>
                <Text style={validityText}>(This code is valid for 10 minutes)</Text>
              </Section>
            */}
              </Section>
              <Hr />
              <Section style={lowerSection}>
                <Markdown
                  markdownCustomStyles={{
                    h1,
                    p: cautionText,
                    link,
                  }}
                >
                  {signatureTextMarkdown}
                </Markdown>
              </Section>
            </Section>
            <Markdown
              markdownCustomStyles={{
                p: footerText,
                link: footerLink,
              }}
              markdownContainerStyles={{ padding: "24px 0" }}
            >
              {footerTextMarkdown}
            </Markdown>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}

export default MarkdownMail

const main = {
  backgroundColor: "#fff",
  color: "#212121",
}

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
}

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0",
}

const h2 = { ...h1, marginTop: "25px", fontSize: "17px" }

const link = {
  color: "#2C62A9", // text-blue-500
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
}

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "10px 0",
  lineHeight: "24px",
}

const imageSection = {
  backgroundColor: "rgb(31 41 55)", // bg-gray-800
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
}

const coverSection = { backgroundColor: "#fff" }

const upperSection = { padding: "25px 35px 10px 35px" }

const lowerSection = { padding: "25px 35px" }

const footerText = {
  ...text,
  fontSize: "12px",
  margin: "0",
  padding: "0 20px",
  lineHeight: "20px",
}
const footerLink = {
  fontSize: "12px",
  color: "#333",
}

// const verifyText = {
//   ...text,
//   margin: 0,
//   fontWeight: "bold",
//   textAlign: "center" as const,
// }

// const codeText = {
//   ...text,
//   fontWeight: "bold",
//   fontSize: "36px",
//   margin: "10px 0",
//   textAlign: "center" as const,
// }

// const validityText = {
//   ...text,
//   margin: "0px",
//   textAlign: "center" as const,
// }

// const verificationSection = {
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
// }

const mainText = { ...text, marginBottom: "14px" }

const list = { ...text, margin: "5px 0" }

const cautionText = { ...text, margin: "0px" }
