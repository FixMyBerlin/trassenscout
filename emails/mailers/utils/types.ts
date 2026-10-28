import { MarkdownMailProps } from "@/emails/templats/MarkdownMail"
import { Prettify } from "@/src/components/core/types"

export type MailAddress = {
  Email: string
  Name?: string
}

export type Mail = Prettify<
  {
    From: MailAddress
    To: MailAddress[]
    ReplyTo?: MailAddress
    Subject: string
  } & MarkdownMailProps
>

export type MailMessage = Required<Pick<Mail, "From" | "To" | "Subject">> &
  Pick<Mail, "ReplyTo"> & {
    TextPart: string
    HTMLPart: string
  }
