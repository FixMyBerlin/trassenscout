import { selectLinkStyle } from "@/src/core/components/links"
import { PageHeader } from "@/src/core/components/pages/PageHeader"
import { LayoutMiddleBox, MetaTags } from "@/src/core/layouts"
import { BlitzPage } from "@blitzjs/next"
import { useEffect, useState } from "react"
import { UAParser } from "ua-parser-js"

const BrowserVersionPage: BlitzPage = () => {
  const [mailtoLink, setMailtoLink] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const recipient = params.get("to") || "dev-team@fixmycity.de"

    // Docs: https://github.com/faisalman/ua-parser-js
    const parser = new UAParser(navigator.userAgent)
    const browser = parser.getBrowser()
    const os = parser.getOS()
    const device = parser.getDevice()

    const body = `
Angaben zu meinem Browser und System:
Browser:
- ${browser.name}
- ${browser.version}

Betriebssystem:
- ${os.name}
- ${os.version}
- ${device.vendor} ${device.model}

Bildschirm-Größe:
- ${window.screen.width} x ${window.screen.height}

Browserfenster-Größe:
- ${window.innerWidth} x ${window.innerHeight}
    `
    const subject = "Angaben zum Browser und System"
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setMailtoLink(mailto)
  }, [])

  return (
    <LayoutMiddleBox>
      <MetaTags noindex title="Browser Version übermitteln" />
      <PageHeader title="Browser Version übermitteln" />
      <section className="prose">
        <a className={selectLinkStyle("pink")} href={mailtoLink}>
          E-Mail öffnen…
        </a>
        <p>Die E-Mail enthält Angaben zum Browser und System.</p>
        <p>Bitte senden Sie diese E-Mail an uns ab.</p>
      </section>
    </LayoutMiddleBox>
  )
}

export default BrowserVersionPage
