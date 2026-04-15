import { blueButtonStyles } from "@/src/core/components/links"
import { clsx } from "clsx"
import dompurify from "dompurify"
import { useState } from "react"
import { LabeledTextarea } from "../form/LabeledTextarea"

type Props = {
  commentLabel: string
  commentHelp: string
  createComment: (body: string) => void
}

export const NewCommentForm = ({ commentLabel, commentHelp, createComment }: Props) => {
  const [body, setBody] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const sanitize = (input: string) => (input ? dompurify.sanitize(input) : input)
    const rawBody = sanitize(String(new FormData(event.currentTarget).get("body") ?? ""))
    await createComment(rawBody)
    setBody("")
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <LabeledTextarea
        onChange={handleTextareaChange}
        value={body}
        required
        name="body"
        help={commentHelp}
      />
      <button className={clsx(blueButtonStyles, "mt-2 px-3! py-2.5!")} type="submit">
        {commentLabel} hinzufügen
      </button>
    </form>
  )
}
