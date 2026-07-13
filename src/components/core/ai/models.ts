import { openai } from "@ai-sdk/openai"

// OpenAI Models
// https://platform.openai.com/docs/models/compare

export const gpt5Mini = openai("gpt-5-mini")
const gpt41Mini = openai("gpt-4.1-mini")
// GPT-4.1 - Smartest non-reasoning model
// tool calling
// no reasoning
// context window

// Default model export for easy usage
export const model = gpt41Mini
