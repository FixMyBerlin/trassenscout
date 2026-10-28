// IMAP_USER is the mailbox the listener polls; Migadu files +slug mail into the project's folder.
export function projectProtocolMailboxAddress(projectSlug: string) {
  const [localPart, domain, ...rest] = (process.env.IMAP_USER ?? "").trim().split("@")
  if (!localPart || !domain || rest.length > 0) {
    console.warn("Assignment replies are on, but IMAP_USER is no mailbox address: no Reply-To.")
    return null
  }
  return `${localPart.split("+")[0]}+${projectSlug}@${domain}`
}
