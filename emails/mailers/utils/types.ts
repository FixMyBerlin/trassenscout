import { MarkdownMailProps } from "@/emails/templats/MarkdownMail"
import { Prettify } from "@/src/core/types"

export type MailAddress = {
  Email: string
  Name?: string
}

export type Mail = Prettify<
  {
    From: MailAddress
    To: MailAddress[]
    Subject: string
  } & MarkdownMailProps
>

export type MailMessage = Required<Pick<Mail, "From" | "To" | "Subject">> & {
  TextPart: string
  HTMLPart: string
}
