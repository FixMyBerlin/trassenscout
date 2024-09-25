import { MarkdownMailProps } from "@/emails/templats/MarkdownMail"
import { Prettify } from "@/src/core/types"
import type { SendEmailV3_1 } from "node-mailjet"

// Format: https://github.com/mailjet/mailjet-apiv3-nodejs?tab=readme-ov-file#send-email-example
export type Mail = Prettify<
  Required<Pick<SendEmailV3_1.Body["Messages"][number], "From" | "To" | "Subject">> &
    MarkdownMailProps
>

export type MailjetMessage = Required<
  Pick<SendEmailV3_1.Body["Messages"][number], "From" | "To" | "Subject" | "TextPart" | "HTMLPart">
>
