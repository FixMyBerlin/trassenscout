import { projectRecordLegacyMailboxMovedNotificationToSender } from "@/emails/mailers/projectRecordLegacyMailboxMovedNotificationToSender"

const LEGACY_LOCAL_PREFIXES = ["ki", "ki-dev", "ki-staging"] as const
const LEGACY_DOMAIN = "trassenscout.de"

const normalize = (value: string) => value.toLowerCase()

const extractEmailAddresses = (recipientText: string | null | undefined) => {
  if (!recipientText) return []
  const text = normalize(recipientText)
  const matches = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/g)
  return matches || []
}

const isLegacyAddress = (address: string) => {
  const [localPart, domain] = address.split("@")
  if (!localPart || !domain) return false
  if (domain !== LEGACY_DOMAIN) return false

  return LEGACY_LOCAL_PREFIXES.some(
    (prefix) => localPart === prefix || localPart.startsWith(`${prefix}+`),
  )
}

const recipientContainsLegacy = (recipientText: string | null | undefined) => {
  const addresses = extractEmailAddresses(recipientText)
  return addresses.some(isLegacyAddress)
}

export const notifySenderLegacyProtocolMailboxMoved = async ({
  senderEmail,
  to,
  cc,
}: {
  senderEmail: string | null
  to?: string | null
  cc?: string | null
}) => {
  if (!senderEmail) return false
  if (!recipientContainsLegacy(to) && !recipientContainsLegacy(cc)) return false

  try {
    const notification = await projectRecordLegacyMailboxMovedNotificationToSender({ senderEmail })
    await notification.send()
    return true
  } catch (error) {
    console.error("Failed to send legacy mailbox moved notification:", error)
    return false
  }
}
