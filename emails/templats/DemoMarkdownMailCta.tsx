import { MarkdownMail } from "./MarkdownMail"

const demoTextIntroMarkdown = `
# Welcome to the Demo Text

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
`
const demoTextCtaLink = "https://www.openstreetmap.org/"
const demoTextCtaText = "Bearbeiten starten"
const demoTextOutroMarkdown = `
## Features

- **Feature 1**: Lorem ipsum dolor sit amet, [consectetur adipiscing elit](https://example.com).
- **Feature 2**: Vivamus lacinia odio vitae [vestibulum vestibulum](https://example.com).
- **Feature 3**: Cras venenatis euismod malesuada.

## More Information

For more details, visit our [website](https://example.com) or check out our [documentation](https://example.com/docs).

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod malesuada.
`

export const DemoMarkdownMailCta = ({}) => {
  return (
    <MarkdownMail
      introMarkdown={demoTextIntroMarkdown}
      ctaLink={demoTextCtaLink}
      ctaText={demoTextCtaText}
      outroMarkdown={demoTextOutroMarkdown}
    />
  )
}

export default DemoMarkdownMailCta
