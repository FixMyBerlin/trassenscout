import { projectRecordLegacyMailboxMovedNotificationToSender } from "@/emails/mailers/projectRecordLegacyMailboxMovedNotificationToSender"

const LEGACY_RECIPIENTS = ["ki@trassenscout.de", "ki-staging@trassenscout.de"]

const normalize = (value: string) => value.toLowerCase()

const recipientContainsLegacy = (recipientText: string | null | undefined) => {
  if (!recipientText) return false
  const text = normalize(recipientText)
  return LEGACY_RECIPIENTS.some((legacy) => text.includes(legacy))
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
  if (!senderEmail) return
  if (!recipientContainsLegacy(to) && !recipientContainsLegacy(cc)) return

  const notification = await projectRecordLegacyMailboxMovedNotificationToSender({ senderEmail })
  await notification.send()
}
