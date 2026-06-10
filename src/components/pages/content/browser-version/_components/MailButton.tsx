import { useMemo } from "react"
import { UAParser } from "ua-parser-js"
import { selectLinkStyle } from "@/src/components/core/components/links/styles"

function buildMailtoLink() {
  const params = new URLSearchParams(window.location.search)
  const recipient = params.get("to") || "dev-team@fixmycity.de"

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
  return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export const MailButton = () => {
  const mailtoLink = useMemo(() => buildMailtoLink(), [])

  return (
    <a className={selectLinkStyle("pink")} href={mailtoLink}>
      E-Mail öffnen…
    </a>
  )
}
